const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { isFacultyQualifiedForSubject } = require('../utils/expertiseMatch');

function isBlank(value) {
  return value == null || (typeof value === 'string' && value.trim() === '');
}

function isMissingTableError(err) {
  return err && err.code === 'ER_NO_SUCH_TABLE';
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

async function getFacultyExpertiseValues(facultyId, specialization) {
  const expertiseValues = [];
  if (typeof specialization === 'string' && specialization.trim()) {
    expertiseValues.push(specialization.trim());
  }

  try {
    const [rows] = await pool.query(
      'SELECT expertise FROM faculty_expertise_certifications WHERE faculty_id = ?',
      [facultyId]
    );
    rows.forEach((row) => {
      if (typeof row.expertise === 'string' && row.expertise.trim()) {
        expertiseValues.push(row.expertise.trim());
      }
    });
  } catch (err) {
    if (!isMissingTableError(err)) throw err;
  }

  return expertiseValues;
}

async function assertFacultyExpertiseMatch(facultyId, subjectCode, subjectName, specialization) {
  const expertiseValues = await getFacultyExpertiseValues(facultyId, specialization);
  if (expertiseValues.length === 0) {
    const err = new Error('Selected faculty has no specialization/expertise record. Add specialization or upload expertise certificates first.');
    err.statusCode = 400;
    throw err;
  }

  if (!isFacultyQualifiedForSubject(subjectName, expertiseValues)) {
    const err = new Error(`Faculty expertise does not match subject ${subjectCode} (${subjectName}). Please select a faculty member with matching expertise.`);
    err.statusCode = 400;
    throw err;
  }
}

// GET / - List all schedules with joined info
router.get('/', async (req, res) => {
  try {
    const pagination = parsePagination(req.query || {});

    const conditions = [];
    const params = [];

    const day = typeof req.query.day === 'string' ? req.query.day.trim() : '';
    if (day && day.toLowerCase() !== 'all') {
      conditions.push('sc.day_of_week LIKE ?');
      params.push(`%${day}%`);
    }

    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    if (search) {
      const pattern = `%${search}%`;
      conditions.push("(sc.subject_code LIKE ? OR COALESCE(s.subject_name, '') LIKE ? OR COALESCE(sc.section, '') LIKE ?)");
      params.push(pattern, pattern, pattern);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    if (!pagination) {
      const [rows] = await pool.query(
        `SELECT sc.*, s.subject_name, f.first_name AS faculty_first_name, f.last_name AS faculty_last_name,
          r.room_name, r.building,
          (
            SELECT COUNT(DISTINCT sca.student_id)
            FROM student_course_assignments sca
            INNER JOIN students st2 ON st2.student_id = sca.student_id
            LEFT JOIN student_academic sa2 ON sa2.student_id = st2.student_id
            WHERE sca.subject_code = sc.subject_code
              AND (
                COALESCE(NULLIF(sc.section, ''), '__ALL__') = '__ALL__'
                OR COALESCE(NULLIF(st2.section, ''), sa2.section) = sc.section
              )
          ) AS student_count
         FROM schedules sc
         LEFT JOIN subjects s ON sc.subject_code = s.subject_code
         LEFT JOIN faculty f ON sc.faculty_id = f.faculty_id
         LEFT JOIN rooms r ON sc.room_id = r.room_id
         ${whereClause}
         ORDER BY sc.day_of_week, sc.start_time`,
        params
      );
      return res.json(rows);
    }

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM schedules sc
       LEFT JOIN subjects s ON sc.subject_code = s.subject_code
       ${whereClause}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT sc.*, s.subject_name, f.first_name AS faculty_first_name, f.last_name AS faculty_last_name,
        r.room_name, r.building,
        (
          SELECT COUNT(DISTINCT sca.student_id)
          FROM student_course_assignments sca
          INNER JOIN students st2 ON st2.student_id = sca.student_id
          LEFT JOIN student_academic sa2 ON sa2.student_id = st2.student_id
          WHERE sca.subject_code = sc.subject_code
            AND (
              COALESCE(NULLIF(sc.section, ''), '__ALL__') = '__ALL__'
              OR COALESCE(NULLIF(st2.section, ''), sa2.section) = sc.section
            )
        ) AS student_count
       FROM schedules sc
       LEFT JOIN subjects s ON sc.subject_code = s.subject_code
       LEFT JOIN faculty f ON sc.faculty_id = f.faculty_id
       LEFT JOIN rooms r ON sc.room_id = r.room_id
       ${whereClause}
       ORDER BY sc.day_of_week, sc.start_time
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

// GET /calendar - Lightweight schedule rows for calendar rendering
router.get('/calendar', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sc.schedule_id, sc.subject_code, s.subject_name, sc.section,
              sc.day_of_week, sc.start_time, sc.end_time,
              f.first_name AS faculty_first_name, f.last_name AS faculty_last_name,
              r.room_name,
              (
                SELECT COUNT(DISTINCT sca.student_id)
                FROM student_course_assignments sca
                INNER JOIN students st2 ON st2.student_id = sca.student_id
                LEFT JOIN student_academic sa2 ON sa2.student_id = st2.student_id
                WHERE sca.subject_code = sc.subject_code
                  AND (
                    COALESCE(NULLIF(sc.section, ''), '__ALL__') = '__ALL__'
                    OR COALESCE(NULLIF(st2.section, ''), sa2.section) = sc.section
                  )
              ) AS student_count
       FROM schedules sc
       LEFT JOIN subjects s ON sc.subject_code = s.subject_code
       LEFT JOIN faculty f ON sc.faculty_id = f.faculty_id
       LEFT JOIN rooms r ON sc.room_id = r.room_id
       ORDER BY day_of_week, start_time`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - Get single schedule
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sc.*, s.subject_name, f.first_name AS faculty_first_name, f.last_name AS faculty_last_name,
        r.room_name, r.building,
        (
          SELECT COUNT(DISTINCT sca.student_id)
          FROM student_course_assignments sca
          INNER JOIN students st2 ON st2.student_id = sca.student_id
          LEFT JOIN student_academic sa2 ON sa2.student_id = st2.student_id
          WHERE sca.subject_code = sc.subject_code
            AND (
              COALESCE(NULLIF(sc.section, ''), '__ALL__') = '__ALL__'
              OR COALESCE(NULLIF(st2.section, ''), sa2.section) = sc.section
            )
        ) AS student_count
       FROM schedules sc
       LEFT JOIN subjects s ON sc.subject_code = s.subject_code
       LEFT JOIN faculty f ON sc.faculty_id = f.faculty_id
       LEFT JOIN rooms r ON sc.room_id = r.room_id
       WHERE sc.schedule_id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Schedule not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - Create schedule
router.post('/', async (req, res) => {
  try {
    const { subject_code, section, faculty_id, room_id, semester, academic_year, day_of_week, start_time, end_time, schedule_type } = req.body;
    if (!subject_code) return res.status(400).json({ error: 'subject_code is required' });

    const [subjectRows] = await pool.query(
      'SELECT subject_code, subject_name FROM subjects WHERE subject_code = ? LIMIT 1',
      [subject_code]
    );
    if (subjectRows.length === 0) {
      return res.status(400).json({ error: 'Subject code does not exist. Create/select a valid subject first.' });
    }

    const normalizedFacultyId = typeof faculty_id === 'string' && faculty_id.trim() ? faculty_id.trim() : null;
    let resolvedSection = typeof section === 'string' && section.trim() ? section.trim() : null;
    if (faculty_id) {
      const [facultyRows] = await pool.query(
        `SELECT f.faculty_id, f.specialization, fe.assigned_section
         FROM faculty f
         LEFT JOIN faculty_employment fe ON fe.faculty_id = f.faculty_id
         WHERE f.faculty_id = ?
         LIMIT 1`,
        [normalizedFacultyId]
      );
      if (facultyRows.length === 0) {
        return res.status(400).json({ error: 'Faculty ID does not exist.' });
      }

      if (!resolvedSection && facultyRows[0].assigned_section) {
        resolvedSection = facultyRows[0].assigned_section;
      }

      await assertFacultyExpertiseMatch(
        normalizedFacultyId,
        subjectRows[0].subject_code,
        subjectRows[0].subject_name,
        facultyRows[0].specialization || ''
      );
    }

    if (room_id) {
      const [roomRows] = await pool.query('SELECT room_id FROM rooms WHERE room_id = ?', [room_id]);
      if (roomRows.length === 0) {
        return res.status(400).json({ error: 'Room ID does not exist.' });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO schedules (subject_code, section, faculty_id, room_id, semester, academic_year, day_of_week, start_time, end_time, schedule_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [subject_code, resolvedSection, normalizedFacultyId, room_id || null, semester || null,
       academic_year || null, day_of_week || null, start_time || null, end_time || null, schedule_type || null]
    );

    res.status(201).json({ message: 'Schedule created successfully', schedule_id: result.insertId });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Related record not found. Verify subject, faculty, and room values.' });
    }
    if (err.code === 'ER_TRUNCATED_WRONG_VALUE' || err.code === 'ER_WRONG_VALUE_FOR_TYPE') {
      return res.status(400).json({ error: 'Invalid time or enum value in schedule data.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - Update schedule
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_code, section, faculty_id, room_id, semester, academic_year, day_of_week, start_time, end_time, schedule_type } = req.body;

    const [existingRows] = await pool.query(
      'SELECT subject_code, faculty_id, section FROM schedules WHERE schedule_id = ? LIMIT 1',
      [id]
    );
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const normalizedSubjectCode = isBlank(subject_code) ? existingRows[0].subject_code : subject_code;
    const normalizedFacultyId = isBlank(faculty_id) ? existingRows[0].faculty_id : faculty_id;

    const [subjectRows] = await pool.query(
      'SELECT subject_code, subject_name FROM subjects WHERE subject_code = ? LIMIT 1',
      [normalizedSubjectCode]
    );
    if (subjectRows.length === 0) {
      return res.status(400).json({ error: 'Subject code does not exist. Create/select a valid subject first.' });
    }

    let resolvedSection = section;
    if (!isBlank(normalizedFacultyId)) {
      const [facultyRows] = await pool.query(
        `SELECT f.faculty_id, f.specialization, fe.assigned_section
         FROM faculty f
         LEFT JOIN faculty_employment fe ON fe.faculty_id = f.faculty_id
         WHERE f.faculty_id = ?
         LIMIT 1`,
        [normalizedFacultyId]
      );
      if (facultyRows.length === 0) {
        return res.status(400).json({ error: 'Faculty ID does not exist.' });
      }

      if (isBlank(section) && isBlank(existingRows[0].section) && facultyRows[0].assigned_section) {
        resolvedSection = facultyRows[0].assigned_section;
      }

      await assertFacultyExpertiseMatch(
        normalizedFacultyId,
        subjectRows[0].subject_code,
        subjectRows[0].subject_name,
        facultyRows[0].specialization || ''
      );
    }

    const [result] = await pool.query(
      `UPDATE schedules SET subject_code = COALESCE(?, subject_code), section = COALESCE(?, section),
        faculty_id = COALESCE(?, faculty_id), room_id = COALESCE(?, room_id),
        semester = COALESCE(?, semester), academic_year = COALESCE(?, academic_year),
        day_of_week = COALESCE(?, day_of_week), start_time = COALESCE(?, start_time),
        end_time = COALESCE(?, end_time), schedule_type = COALESCE(?, schedule_type)
       WHERE schedule_id = ?`,
      [
        subject_code,
        isBlank(resolvedSection) ? null : resolvedSection,
        isBlank(faculty_id) ? null : faculty_id,
        room_id,
        semester,
        academic_year,
        day_of_week,
        start_time,
        end_time,
        schedule_type,
        id,
      ]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Schedule not found' });
    res.json({ message: 'Schedule updated successfully' });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - Delete schedule
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM schedules WHERE schedule_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Schedule not found' });
    res.json({ message: 'Schedule deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
