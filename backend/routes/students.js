const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

function isMissingTableError(err) {
  return err && err.code === 'ER_NO_SUCH_TABLE';
}

function normalizeDateInput(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  return trimmed;
}

function generateDefaultPassword(lastName, birthDate) {
  const initial = (typeof lastName === 'string' && lastName.trim())
    ? lastName.trim().charAt(0).toUpperCase()
    : 'X';
  return `${initial}${birthDate}`;
}

function generateStudentTempPasswords(student) {
  const birthDate = normalizeDateInput(student && student.birth_date);
  if (!birthDate) return new Set();

  const middleInitial = (student && typeof student.middle_name === 'string' && student.middle_name.trim())
    ? student.middle_name.trim().charAt(0).toUpperCase()
    : 'X';
  const lastInitial = (student && typeof student.last_name === 'string' && student.last_name.trim())
    ? student.last_name.trim().charAt(0).toUpperCase()
    : 'X';

  return new Set([
    `${lastInitial}${birthDate}`,
    `${middleInitial}${birthDate}`,
  ]);
}

function isBlank(value) {
  return value == null || (typeof value === 'string' && value.trim() === '');
}

function normalizeOptionalString(value, { toLower = false } = {}) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return toLower ? trimmed.toLowerCase() : trimmed;
}

function normalizeCourseCode(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase();
  return normalized || null;
}

function normalizeCourseCodes(courseCodes) {
  if (!Array.isArray(courseCodes)) return [];
  const unique = new Set();
  for (const rawCode of courseCodes) {
    const normalized = normalizeCourseCode(rawCode);
    if (normalized) unique.add(normalized);
  }
  return Array.from(unique);
}

function parsePrerequisiteCodes(prerequisiteValue) {
  if (typeof prerequisiteValue !== 'string' || !prerequisiteValue.trim()) return [];

  const normalized = prerequisiteValue
    .toUpperCase()
    .replace(/\bAND\b/g, ',')
    .replace(/\bOR\b/g, ',')
    .replace(/[;/|]/g, ',');

  const matches = normalized.match(/[A-Z]{2,}\d{2,}/g);
  if (!matches) return [];
  return Array.from(new Set(matches));
}

async function validateStudentCourseAssignments({
  studentId,
  courseCodes,
  requestedProgram,
  requestedYearLevel,
  includeCurrentAssignments = true,
}) {
  const normalizedCourseCodes = normalizeCourseCodes(courseCodes);
  if (normalizedCourseCodes.length === 0) {
    return { normalizedCourseCodes, errors: [] };
  }

  const coursePlaceholders = normalizedCourseCodes.map(() => '?').join(', ');

  const [subjectRows] = await pool.query(
    `SELECT subject_code FROM subjects WHERE subject_code IN (${coursePlaceholders})`,
    normalizedCourseCodes
  );
  const validSubjectCodes = new Set(subjectRows.map((row) => row.subject_code));
  const missingSubjectCodes = normalizedCourseCodes.filter((code) => !validSubjectCodes.has(code));

  if (missingSubjectCodes.length > 0) {
    return {
      normalizedCourseCodes,
      errors: [`Unknown subject code(s): ${missingSubjectCodes.join(', ')}`],
    };
  }

  let program = normalizeOptionalString(requestedProgram);
  let yearLevel = Number.isFinite(Number(requestedYearLevel)) ? Number(requestedYearLevel) : null;

  if (studentId && (!program || !yearLevel)) {
    const [academicRows] = await pool.query(
      'SELECT program, year_level FROM student_academic WHERE student_id = ? LIMIT 1',
      [studentId]
    );
    if (academicRows.length > 0) {
      if (!program) {
        program = normalizeOptionalString(academicRows[0].program);
      }
      if (!yearLevel && Number.isFinite(Number(academicRows[0].year_level))) {
        yearLevel = Number(academicRows[0].year_level);
      }
    }
  }

  let curriculumRows = [];
  if (program) {
    const [programRows] = await pool.query(
      `SELECT cs.subject_code, cs.year_level, cs.prerequisite
       FROM curriculum_subjects cs
       INNER JOIN curriculum c ON c.curriculum_id = cs.curriculum_id
       WHERE c.is_active = 1
         AND c.program = ?
         AND cs.subject_code IN (${coursePlaceholders})`,
      [program, ...normalizedCourseCodes]
    );
    curriculumRows = programRows;
  }

  if (curriculumRows.length === 0) {
    const [fallbackRows] = await pool.query(
      `SELECT cs.subject_code, cs.year_level, cs.prerequisite
       FROM curriculum_subjects cs
       INNER JOIN curriculum c ON c.curriculum_id = cs.curriculum_id
       WHERE c.is_active = 1
         AND cs.subject_code IN (${coursePlaceholders})`,
      normalizedCourseCodes
    );
    curriculumRows = fallbackRows;
  }

  const curriculumBySubject = new Map();
  for (const row of curriculumRows) {
    if (!curriculumBySubject.has(row.subject_code)) {
      curriculumBySubject.set(row.subject_code, row);
    }
  }

  const errors = [];

  if (yearLevel) {
    const yearRestrictedSubjects = normalizedCourseCodes.filter((code) => {
      const curriculumEntry = curriculumBySubject.get(code);
      return curriculumEntry && curriculumEntry.year_level && Number(curriculumEntry.year_level) > yearLevel;
    });

    if (yearRestrictedSubjects.length > 0) {
      errors.push(`Student year level ${yearLevel} cannot take yet: ${yearRestrictedSubjects.join(', ')}`);
    }
  }

  const prerequisiteChecks = normalizedCourseCodes
    .map((code) => ({ code, prerequisites: parsePrerequisiteCodes(curriculumBySubject.get(code)?.prerequisite) }))
    .filter((entry) => entry.prerequisites.length > 0);

  if (prerequisiteChecks.length > 0) {
    const satisfiedSubjects = new Set(normalizedCourseCodes);

    if (studentId) {
      const [gradeRows] = await pool.query(
        `SELECT DISTINCT subject_code
         FROM student_grades
         WHERE student_id = ?
           AND (
             remarks = 'Passed'
             OR (remarks IS NULL AND final_grade IS NOT NULL)
           )`,
        [studentId]
      );
      for (const row of gradeRows) {
        satisfiedSubjects.add(row.subject_code);
      }

      if (includeCurrentAssignments) {
        try {
          const [assignmentRows] = await pool.query(
            'SELECT subject_code FROM student_course_assignments WHERE student_id = ?',
            [studentId]
          );
          for (const row of assignmentRows) {
            satisfiedSubjects.add(row.subject_code);
          }
        } catch (err) {
          if (!isMissingTableError(err)) throw err;
        }
      }
    }

    const prerequisiteFailures = [];
    for (const check of prerequisiteChecks) {
      const missing = check.prerequisites.filter((code) => !satisfiedSubjects.has(code));
      if (missing.length > 0) {
        prerequisiteFailures.push(`${check.code} (missing: ${missing.join(', ')})`);
      }
    }

    if (prerequisiteFailures.length > 0) {
      errors.push(`Prerequisite not satisfied: ${prerequisiteFailures.join('; ')}`);
    }
  }

  return { normalizedCourseCodes, errors };
}

let hasSkillsColumnCache = null;
let hasPasswordColumnCache = null;
let hasViolationsTableCache = null;

async function hasStudentSkillsColumn() {
  if (typeof hasSkillsColumnCache === 'boolean') {
    return hasSkillsColumnCache;
  }

  try {
    const [rows] = await pool.query(
      `SELECT 1
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'students'
         AND COLUMN_NAME = 'skills'
       LIMIT 1`
    );
    hasSkillsColumnCache = rows.length > 0;
  } catch {
    hasSkillsColumnCache = false;
  }

  return hasSkillsColumnCache;
}

async function hasStudentPasswordColumn() {
  if (typeof hasPasswordColumnCache === 'boolean') {
    return hasPasswordColumnCache;
  }

  try {
    const [rows] = await pool.query(
      `SELECT 1
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'students'
         AND COLUMN_NAME = 'password'
       LIMIT 1`
    );
    hasPasswordColumnCache = rows.length > 0;
  } catch {
    hasPasswordColumnCache = false;
  }

  return hasPasswordColumnCache;
}

async function hasStudentViolationsTable() {
  if (typeof hasViolationsTableCache === 'boolean') {
    return hasViolationsTableCache;
  }

  try {
    const [rows] = await pool.query("SHOW TABLES LIKE 'student_violations'");
    hasViolationsTableCache = rows.length > 0;
  } catch {
    hasViolationsTableCache = false;
  }

  return hasViolationsTableCache;
}

function parsePagination(query) {
  const hasPagination = query.page !== undefined || query.limit !== undefined;
  if (!hasPagination) return null;

  const pageValue = Number.parseInt(String(query.page || '1'), 10);
  const limitValue = Number.parseInt(String(query.limit || '10'), 10);

  const page = Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1;
  const limit = Number.isFinite(limitValue) && limitValue > 0
    ? Math.min(limitValue, 10)
    : 10;

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

// ─── STUDENTS CRUD ──────────────────────────────────────────────

// GET / - List all students with academic info
router.get('/', async (req, res) => {
  try {
    const pagination = parsePagination(req.query || {});

    const conditions = [];
    const params = [];

    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    if (search) {
      const pattern = `%${search}%`;
      conditions.push("(CONCAT_WS(' ', s.first_name, s.middle_name, s.last_name) LIKE ? OR s.student_id LIKE ? OR COALESCE(s.email, '') LIKE ?)");
      params.push(pattern, pattern, pattern);
    }

    const skill = typeof req.query.skill === 'string' ? req.query.skill.trim().toLowerCase() : '';
    if (skill) {
      conditions.push("LOWER(COALESCE(s.skills, '')) LIKE ?");
      params.push(`%${skill}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    if (!pagination) {
      const [rows] = await pool.query(
        `SELECT s.*, sa.program, sa.year_level, sa.section, sa.enrollment_status
         FROM students s
         LEFT JOIN student_academic sa ON s.student_id = sa.student_id
         ${whereClause}
         ORDER BY s.last_name, s.first_name`,
        params
      );
      return res.json(rows);
    }

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM students s
       LEFT JOIN student_academic sa ON s.student_id = sa.student_id
       ${whereClause}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT s.*, sa.program, sa.year_level, sa.section, sa.enrollment_status
       FROM students s
       LEFT JOIN student_academic sa ON s.student_id = sa.student_id
       ${whereClause}
       ORDER BY s.last_name, s.first_name
       LIMIT ${pagination.limit} OFFSET ${pagination.offset}`,
      params
    );

    const total = Number(countRows[0]?.total || 0);
    const totalPages = total === 0 ? 1 : Math.ceil(total / pagination.limit);

    res.json({
      data: rows,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - Get single student with all related data
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [student] = await pool.query('SELECT * FROM students WHERE student_id = ?', [id]);
    if (student.length === 0) return res.status(404).json({ error: 'Student not found' });

    const [academic] = await pool.query('SELECT * FROM student_academic WHERE student_id = ?', [id]);
    const [documents] = await pool.query('SELECT * FROM student_documents WHERE student_id = ?', [id]);
    const [grades] = await pool.query('SELECT * FROM student_grades WHERE student_id = ?', [id]);
    const [internships] = await pool.query('SELECT * FROM student_internship WHERE student_id = ?', [id]);
    const [orgs] = await pool.query('SELECT * FROM student_orgs WHERE student_id = ?', [id]);
    let courses = [];
    try {
      const [courseRows] = await pool.query(
        `SELECT sca.subject_code, s.subject_name
         FROM student_course_assignments sca
         LEFT JOIN subjects s ON s.subject_code = sca.subject_code
         WHERE sca.student_id = ?
         ORDER BY sca.subject_code`,
        [id]
      );
      courses = courseRows;
    } catch (coursesErr) {
      if (!isMissingTableError(coursesErr)) throw coursesErr;
    }

    res.json({
      ...student[0],
      academic: academic[0] || null,
      documents,
      grades,
      internships,
      orgs,
      courses
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id/dashboard - Student portal dashboard summary
router.get('/:id/dashboard', async (req, res) => {
  try {
    const { id } = req.params;

    const [student] = await pool.query(
      `SELECT s.student_id, s.first_name, s.last_name, sa.program, sa.year_level, sa.section
       FROM students s
       LEFT JOIN student_academic sa ON s.student_id = sa.student_id
       WHERE s.student_id = ?`,
      [id]
    );
    if (student.length === 0) return res.status(404).json({ error: 'Student not found' });

    const [gradeSummary] = await pool.query(
      `SELECT COUNT(*) AS total_subjects, ROUND(AVG(final_grade), 2) AS average_final_grade
       FROM student_grades
       WHERE student_id = ?`,
      [id]
    );

    const [scheduleSummary] = await pool.query(
      `SELECT COUNT(*) AS total_schedules
       FROM schedules sc
       INNER JOIN student_academic sa ON sa.student_id = ?
       WHERE sc.section = sa.section`,
      [id]
    );

    const [eventSummary] = await pool.query(
      `SELECT COUNT(*) AS registered_events
       FROM event_participants
       WHERE participant_id = ? AND participant_type = 'Student'`,
      [id]
    );

    let activeViolationCount = 0;
    if (await hasStudentViolationsTable()) {
      const [violationSummary] = await pool.query(
        `SELECT COUNT(*) AS active_violations
         FROM student_violations
         WHERE student_id = ? AND status = 'Active'`,
        [id]
      );
      activeViolationCount = Number(violationSummary[0]?.active_violations || 0);
    }

    res.json({
      student: student[0],
      summary: {
        total_subjects: gradeSummary[0].total_subjects,
        average_final_grade: gradeSummary[0].average_final_grade,
        total_schedules: scheduleSummary[0].total_schedules,
        registered_events: eventSummary[0].registered_events,
        active_violations: activeViolationCount
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/change-password - Student self-service password change
router.post('/:id/change-password', async (req, res) => {
  try {
    const { id } = req.params;
    const { current_password, new_password } = req.body;

    if (isBlank(current_password) || isBlank(new_password)) {
      return res.status(400).json({ error: 'current_password and new_password are required' });
    }

    if (typeof new_password !== 'string' || new_password.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    if (String(current_password) === String(new_password)) {
      return res.status(400).json({ error: 'New password must be different from current password' });
    }

    const [userRows] = await pool.query(
      `SELECT user_id, password_hash
       FROM users
       WHERE ref_id = ? AND user_type = 'Student' AND is_active = 1
       LIMIT 1`,
      [id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Student user account not found' });
    }

    const user = userRows[0];
    let isMatch = await bcrypt.compare(String(current_password), user.password_hash);

    // Support existing temporary password combinations for first-time change.
    if (!isMatch) {
      const [studentRows] = await pool.query(
        'SELECT birth_date, middle_name, last_name FROM students WHERE student_id = ? LIMIT 1',
        [id]
      );

      if (studentRows.length > 0) {
        const validTempPasswords = generateStudentTempPasswords(studentRows[0]);
        isMatch = validTempPasswords.has(String(current_password));
      }
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(String(new_password), salt);
    await pool.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [password_hash, user.user_id]);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - Create student
router.post('/', async (req, res) => {
  try {
    const {
      student_id, first_name, middle_name, last_name, birth_date, sex,
      civil_status, contact_number, email, address, emergency_contact,
      emergency_contact_num, profile_photo, nationality, religion, skills,
      academic, course_codes
    } = req.body;

    if (course_codes !== undefined && !Array.isArray(course_codes)) {
      return res.status(400).json({ error: 'course_codes must be an array when provided' });
    }

    const {
      normalizedCourseCodes,
      errors: courseValidationErrors,
    } = await validateStudentCourseAssignments({
      studentId: null,
      courseCodes: Array.isArray(course_codes) ? course_codes : [],
      requestedProgram: academic?.program,
      requestedYearLevel: academic?.year_level,
      includeCurrentAssignments: false,
    });

    if (courseValidationErrors.length > 0) {
      return res.status(400).json({ error: courseValidationErrors.join(' | ') });
    }

    const missingRequired = [];
    if (isBlank(student_id)) missingRequired.push('student_id');
    if (isBlank(first_name)) missingRequired.push('first_name');
    if (isBlank(last_name)) missingRequired.push('last_name');
    if (isBlank(birth_date)) missingRequired.push('birth_date');
    if (isBlank(sex)) missingRequired.push('sex');
    if (isBlank(contact_number)) missingRequired.push('contact_number');
    if (isBlank(email)) missingRequired.push('email');
    if (isBlank(address)) missingRequired.push('address');
    if (isBlank(emergency_contact)) missingRequired.push('emergency_contact');
    if (isBlank(emergency_contact_num)) missingRequired.push('emergency_contact_num');

    if (missingRequired.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missingRequired.join(', ')}` });
    }

    const normalizedBirthDate = normalizeDateInput(birth_date);
    if (!normalizedBirthDate) {
      return res.status(400).json({ error: 'A valid birth_date is required' });
    }

    const generatedPassword = generateDefaultPassword(last_name, normalizedBirthDate);

    const includeSkillsColumn = await hasStudentSkillsColumn();
    const includePasswordColumn = await hasStudentPasswordColumn();
    const studentColumns = [
      'student_id',
      'first_name',
      'middle_name',
      'last_name',
      'birth_date',
      'sex',
      'civil_status',
      'contact_number',
      'email',
      'address',
      'emergency_contact',
      'emergency_contact_num',
      'profile_photo',
      'nationality',
      'religion',
    ];
    const studentValues = [
      student_id.trim(),
      first_name.trim(),
      normalizeOptionalString(middle_name),
      last_name.trim(),
      normalizedBirthDate,
      sex.trim(),
      normalizeOptionalString(civil_status),
      contact_number.trim(),
      normalizeOptionalString(email, { toLower: true }),
      address.trim(),
      emergency_contact.trim(),
      emergency_contact_num.trim(),
      normalizeOptionalString(profile_photo),
      normalizeOptionalString(nationality),
      normalizeOptionalString(religion),
    ];

    if (includeSkillsColumn) {
      studentColumns.push('skills');
      studentValues.push(normalizeOptionalString(skills));
    }

    if (includePasswordColumn) {
      studentColumns.push('password');
      studentValues.push(generatedPassword);
    }

    const placeholders = studentColumns.map(() => '?').join(', ');
    await pool.query(
      `INSERT INTO students (${studentColumns.join(', ')}) VALUES (${placeholders})`,
      studentValues
    );

    try {
      const username = normalizeOptionalString(email, { toLower: true }) || student_id.trim();
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(generatedPassword, salt);

      await pool.query(
        `INSERT INTO users (ref_id, user_type, username, password_hash)
         VALUES (?, 'Student', ?, ?)
         ON DUPLICATE KEY UPDATE
           user_type = VALUES(user_type),
           username = VALUES(username),
           password_hash = VALUES(password_hash),
           is_active = 1`,
        [student_id, username, password_hash]
      );
    } catch (userErr) {
      await pool.query('DELETE FROM students WHERE student_id = ?', [student_id]);
      throw new Error(`Student record rollback: failed to create user credentials (${userErr.message})`);
    }

    if (academic) {
      await pool.query(
        `INSERT INTO student_academic (student_id, program, major, track, year_level, section,
          admission_type, enrollment_status, scholarship_type, admission_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [student_id, academic.program || null, academic.major || null, academic.track || null,
         academic.year_level || null, academic.section || null, academic.admission_type || null,
         academic.enrollment_status || null, academic.scholarship_type || null, academic.admission_date || null]
      );
    }

    if (normalizedCourseCodes.length > 0) {
      try {
        const values = normalizedCourseCodes.map((subjectCode) => [student_id, subjectCode]);
        await pool.query(
          'INSERT INTO student_course_assignments (student_id, subject_code) VALUES ? ON DUPLICATE KEY UPDATE subject_code = VALUES(subject_code)',
          [values]
        );
      } catch (courseErr) {
        if (!isMissingTableError(courseErr)) throw courseErr;
      }
    }

    res.status(201).json({ message: 'Student created successfully', student_id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Student ID or email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// GET /:id/courses
router.get('/:id/courses', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sca.subject_code, s.subject_name
       FROM student_course_assignments sca
       LEFT JOIN subjects s ON s.subject_code = sca.subject_code
       WHERE sca.student_id = ?
       ORDER BY sca.subject_code`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    if (isMissingTableError(err)) {
      return res.status(500).json({ error: 'student_course_assignments table not found. Apply SQL migration first.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id/courses
router.put('/:id/courses', async (req, res) => {
  try {
    const { id } = req.params;
    const { course_codes } = req.body;

    if (!Array.isArray(course_codes)) {
      return res.status(400).json({ error: 'course_codes must be an array' });
    }

    const {
      normalizedCourseCodes,
      errors: courseValidationErrors,
    } = await validateStudentCourseAssignments({
      studentId: id,
      courseCodes: course_codes,
      includeCurrentAssignments: true,
    });

    if (courseValidationErrors.length > 0) {
      return res.status(400).json({ error: courseValidationErrors.join(' | ') });
    }

    await pool.query('DELETE FROM student_course_assignments WHERE student_id = ?', [id]);
    if (normalizedCourseCodes.length > 0) {
      const values = normalizedCourseCodes.map((subjectCode) => [id, subjectCode]);
      await pool.query('INSERT INTO student_course_assignments (student_id, subject_code) VALUES ?', [values]);
    }

    res.json({ message: 'Student course assignments updated successfully' });
  } catch (err) {
    if (isMissingTableError(err)) {
      return res.status(500).json({ error: 'student_course_assignments table not found. Apply SQL migration first.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - Update student personal info
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name, middle_name, last_name, birth_date, sex, civil_status,
      contact_number, email, address, emergency_contact, emergency_contact_num,
      profile_photo, nationality, religion, skills
    } = req.body;

    const blankRequiredOnUpdate = [];
    if (first_name !== undefined && isBlank(first_name)) blankRequiredOnUpdate.push('first_name');
    if (last_name !== undefined && isBlank(last_name)) blankRequiredOnUpdate.push('last_name');
    if (sex !== undefined && isBlank(sex)) blankRequiredOnUpdate.push('sex');
    if (contact_number !== undefined && isBlank(contact_number)) blankRequiredOnUpdate.push('contact_number');
    if (email !== undefined && isBlank(email)) blankRequiredOnUpdate.push('email');
    if (address !== undefined && isBlank(address)) blankRequiredOnUpdate.push('address');
    if (emergency_contact !== undefined && isBlank(emergency_contact)) blankRequiredOnUpdate.push('emergency_contact');
    if (emergency_contact_num !== undefined && isBlank(emergency_contact_num)) blankRequiredOnUpdate.push('emergency_contact_num');

    if (blankRequiredOnUpdate.length > 0) {
      return res.status(400).json({ error: `These fields cannot be empty: ${blankRequiredOnUpdate.join(', ')}` });
    }

    let normalizedBirthDate = birth_date;
    if (birth_date !== undefined && birth_date !== null) {
      normalizedBirthDate = normalizeDateInput(birth_date);
      if (!normalizedBirthDate) {
        return res.status(400).json({ error: 'birth_date must be in YYYY-MM-DD format' });
      }
    }

    const includeSkillsColumn = await hasStudentSkillsColumn();
    const updateClauses = [
      'first_name = COALESCE(?, first_name)',
      'middle_name = COALESCE(?, middle_name)',
      'last_name = COALESCE(?, last_name)',
      'birth_date = COALESCE(?, birth_date)',
      'sex = COALESCE(?, sex)',
      'civil_status = COALESCE(?, civil_status)',
      'contact_number = COALESCE(?, contact_number)',
      'email = COALESCE(?, email)',
      'address = COALESCE(?, address)',
      'emergency_contact = COALESCE(?, emergency_contact)',
      'emergency_contact_num = COALESCE(?, emergency_contact_num)',
      'profile_photo = COALESCE(?, profile_photo)',
      'nationality = COALESCE(?, nationality)',
      'religion = COALESCE(?, religion)',
    ];
    const updateValues = [
      typeof first_name === 'string' ? first_name.trim() : first_name,
      typeof middle_name === 'string' ? middle_name.trim() : middle_name,
      typeof last_name === 'string' ? last_name.trim() : last_name,
      normalizedBirthDate,
      typeof sex === 'string' ? sex.trim() : sex,
      typeof civil_status === 'string' ? civil_status.trim() : civil_status,
      typeof contact_number === 'string' ? contact_number.trim() : contact_number,
      typeof email === 'string' ? email.trim().toLowerCase() : email,
      typeof address === 'string' ? address.trim() : address,
      typeof emergency_contact === 'string' ? emergency_contact.trim() : emergency_contact,
      typeof emergency_contact_num === 'string' ? emergency_contact_num.trim() : emergency_contact_num,
      typeof profile_photo === 'string' ? profile_photo.trim() : profile_photo,
      typeof nationality === 'string' ? nationality.trim() : nationality,
      typeof religion === 'string' ? religion.trim() : religion,
    ];

    if (includeSkillsColumn) {
      updateClauses.push('skills = COALESCE(?, skills)');
      updateValues.push(typeof skills === 'string' ? skills.trim() : skills);
    }

    updateClauses.push('updated_at = NOW()');
    updateValues.push(id);

    const [result] = await pool.query(
      `UPDATE students SET ${updateClauses.join(', ')} WHERE student_id = ?`,
      updateValues
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Student not found' });

    // Keep student portal login in sync when admin updates the student email.
    const [studentRows] = await pool.query(
      'SELECT email FROM students WHERE student_id = ? LIMIT 1',
      [id]
    );
    if (studentRows.length > 0) {
      const normalizedEmail = normalizeOptionalString(studentRows[0].email, { toLower: true });
      const resolvedUsername = normalizedEmail || id;
      await pool.query(
        `UPDATE users
         SET username = ?, is_active = 1
         WHERE ref_id = ? AND user_type = 'Student'`,
        [resolvedUsername, id]
      );
    }

    res.json({ message: 'Student updated successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Email is already linked to another account' });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - Delete student and all related records
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM student_grades WHERE student_id = ?', [id]);
    await pool.query('DELETE FROM student_documents WHERE student_id = ?', [id]);
    await pool.query('DELETE FROM student_internship WHERE student_id = ?', [id]);
    await pool.query('DELETE FROM student_orgs WHERE student_id = ?', [id]);
    if (await hasStudentViolationsTable()) {
      await pool.query('DELETE FROM student_violations WHERE student_id = ?', [id]);
    }
    await pool.query('DELETE FROM student_academic WHERE student_id = ?', [id]);
    const [result] = await pool.query('DELETE FROM students WHERE student_id = ?', [id]);

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ACADEMIC ───────────────────────────────────────────────────

// GET /:id/academic
router.get('/:id/academic', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM student_academic WHERE student_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Academic record not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id/academic
router.put('/:id/academic', async (req, res) => {
  try {
    const { id } = req.params;
    const { program, major, track, year_level, section, admission_type, enrollment_status, scholarship_type, admission_date } = req.body;

    // Upsert: insert if not exists, update if exists
    const [existing] = await pool.query('SELECT student_id FROM student_academic WHERE student_id = ?', [id]);
    if (existing.length === 0) {
      await pool.query(
        `INSERT INTO student_academic (student_id, program, major, track, year_level, section,
          admission_type, enrollment_status, scholarship_type, admission_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, program || null, major || null, track || null, year_level || null, section || null,
         admission_type || null, enrollment_status || null, scholarship_type || null, admission_date || null]
      );
    } else {
      await pool.query(
        `UPDATE student_academic SET program = COALESCE(?, program), major = COALESCE(?, major),
          track = COALESCE(?, track), year_level = COALESCE(?, year_level), section = COALESCE(?, section),
          admission_type = COALESCE(?, admission_type), enrollment_status = COALESCE(?, enrollment_status),
          scholarship_type = COALESCE(?, scholarship_type), admission_date = COALESCE(?, admission_date)
         WHERE student_id = ?`,
        [program, major, track, year_level, section, admission_type, enrollment_status, scholarship_type, admission_date, id]
      );
    }
    res.json({ message: 'Academic record updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GRADES ─────────────────────────────────────────────────────

// GET /:id/grades
router.get('/:id/grades', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sg.*, s.subject_name
       FROM student_grades sg
       LEFT JOIN subjects s ON sg.subject_code = s.subject_code
       WHERE sg.student_id = ?
       ORDER BY sg.academic_year DESC, sg.semester DESC, sg.subject_code`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/grades
router.post('/:id/grades', async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_code, semester, academic_year, midterm_grade, final_grade, gpa, remarks } = req.body;

    const [result] = await pool.query(
      `INSERT INTO student_grades (student_id, subject_code, semester, academic_year, midterm_grade, final_grade, gpa, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, subject_code, semester, academic_year, midterm_grade || null, final_grade || null, gpa || null, remarks || null]
    );

    res.status(201).json({ message: 'Grade added', grade_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /grades/:gradeId
router.put('/grades/:gradeId', async (req, res) => {
  try {
    const { gradeId } = req.params;
    const { subject_code, semester, academic_year, midterm_grade, final_grade, gpa, remarks } = req.body;

    const [result] = await pool.query(
      `UPDATE student_grades SET subject_code = COALESCE(?, subject_code), semester = COALESCE(?, semester),
        academic_year = COALESCE(?, academic_year), midterm_grade = COALESCE(?, midterm_grade),
        final_grade = COALESCE(?, final_grade), gpa = COALESCE(?, gpa), remarks = COALESCE(?, remarks)
       WHERE grade_id = ?`,
      [subject_code, semester, academic_year, midterm_grade, final_grade, gpa, remarks, gradeId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Grade not found' });
    res.json({ message: 'Grade updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /grades/:gradeId
router.delete('/grades/:gradeId', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM student_grades WHERE grade_id = ?', [req.params.gradeId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Grade not found' });
    res.json({ message: 'Grade deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DOCUMENTS ──────────────────────────────────────────────────

// GET /:id/schedules - Student class schedules based on section
router.get('/:id/schedules', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sc.*, s.subject_name, f.first_name AS faculty_first_name, f.last_name AS faculty_last_name,
         r.room_name, r.building
       FROM student_academic sa
       INNER JOIN schedules sc ON sc.section = sa.section
       LEFT JOIN subjects s ON sc.subject_code = s.subject_code
       LEFT JOIN faculty f ON sc.faculty_id = f.faculty_id
       LEFT JOIN rooms r ON sc.room_id = r.room_id
       WHERE sa.student_id = ?
       ORDER BY sc.day_of_week, sc.start_time`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id/events - Student event records with attendance
router.get('/:id/events', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, ep.participation_id, ep.attendance
       FROM event_participants ep
       INNER JOIN events e ON ep.event_id = e.event_id
       WHERE ep.participant_id = ? AND ep.participant_type = 'Student'
       ORDER BY e.start_date DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id/violations - Student violation records
router.get('/:id/violations', async (req, res) => {
  try {
    if (!(await hasStudentViolationsTable())) {
      return res.json([]);
    }

    const [rows] = await pool.query(
      `SELECT violation_id, student_id, violation_type, subject_context, description, severity, status, incident_date, reported_by, created_at
       FROM student_violations
       WHERE student_id = ?
       ORDER BY incident_date DESC, violation_id DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/events/:eventId - Register student to event
router.post('/:id/events/:eventId', async (req, res) => {
  try {
    const { id, eventId } = req.params;

    const [existing] = await pool.query(
      `SELECT participation_id FROM event_participants
       WHERE event_id = ? AND participant_id = ? AND participant_type = 'Student'`,
      [eventId, id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Student is already registered for this event' });
    }

    const [result] = await pool.query(
      `INSERT INTO event_participants (event_id, participant_id, participant_type, attendance)
       VALUES (?, ?, 'Student', 'Registered')`,
      [eventId, id]
    );

    res.status(201).json({ message: 'Student registered to event', participation_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id/documents
router.get('/:id/documents', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM student_documents WHERE student_id = ?', [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/documents
router.post('/:id/documents', async (req, res) => {
  try {
    const { id } = req.params;
    const { doc_type, file_path } = req.body;

    const [result] = await pool.query(
      'INSERT INTO student_documents (student_id, doc_type, file_path) VALUES (?, ?, ?)',
      [id, doc_type, file_path]
    );

    res.status(201).json({ message: 'Document added', doc_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /documents/:docId
router.delete('/documents/:docId', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM student_documents WHERE doc_id = ?', [req.params.docId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Document not found' });
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── INTERNSHIPS ────────────────────────────────────────────────

// GET /:id/internships
router.get('/:id/internships', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM student_internship WHERE student_id = ?', [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/internships
router.post('/:id/internships', async (req, res) => {
  try {
    const { id } = req.params;
    const { company_name, supervisor, start_date, end_date, hours_rendered, eval_grade } = req.body;

    const [result] = await pool.query(
      `INSERT INTO student_internship (student_id, company_name, supervisor, start_date, end_date, hours_rendered, eval_grade)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, company_name, supervisor || null, start_date || null, end_date || null, hours_rendered || null, eval_grade || null]
    );

    res.status(201).json({ message: 'Internship added', internship_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /internships/:internshipId
router.put('/internships/:internshipId', async (req, res) => {
  try {
    const { internshipId } = req.params;
    const { company_name, supervisor, start_date, end_date, hours_rendered, eval_grade } = req.body;

    const [result] = await pool.query(
      `UPDATE student_internship SET company_name = COALESCE(?, company_name), supervisor = COALESCE(?, supervisor),
        start_date = COALESCE(?, start_date), end_date = COALESCE(?, end_date),
        hours_rendered = COALESCE(?, hours_rendered), eval_grade = COALESCE(?, eval_grade)
       WHERE internship_id = ?`,
      [company_name, supervisor, start_date, end_date, hours_rendered, eval_grade, internshipId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Internship not found' });
    res.json({ message: 'Internship updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /internships/:internshipId
router.delete('/internships/:internshipId', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM student_internship WHERE internship_id = ?', [req.params.internshipId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Internship not found' });
    res.json({ message: 'Internship deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ORGANIZATIONS ──────────────────────────────────────────────

// GET /:id/orgs
router.get('/:id/orgs', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM student_orgs WHERE student_id = ?', [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/orgs
router.post('/:id/orgs', async (req, res) => {
  try {
    const { id } = req.params;
    const { organization_name, position, academic_year } = req.body;

    const [result] = await pool.query(
      'INSERT INTO student_orgs (student_id, organization_name, position, academic_year) VALUES (?, ?, ?, ?)',
      [id, organization_name, position || null, academic_year || null]
    );

    res.status(201).json({ message: 'Organization added', org_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /orgs/:orgId
router.put('/orgs/:orgId', async (req, res) => {
  try {
    const { orgId } = req.params;
    const { organization_name, position, academic_year } = req.body;

    const [result] = await pool.query(
      `UPDATE student_orgs SET organization_name = COALESCE(?, organization_name),
        position = COALESCE(?, position), academic_year = COALESCE(?, academic_year)
       WHERE org_id = ?`,
      [organization_name, position, academic_year, orgId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Organization not found' });
    res.json({ message: 'Organization updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /orgs/:orgId
router.delete('/orgs/:orgId', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM student_orgs WHERE org_id = ?', [req.params.orgId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Organization not found' });
    res.json({ message: 'Organization deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
