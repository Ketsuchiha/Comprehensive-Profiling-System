const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ─── STUDENTS CRUD ──────────────────────────────────────────────

// GET / - List all students with academic info
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, sa.program, sa.year_level, sa.section, sa.enrollment_status
       FROM students s
       LEFT JOIN student_academic sa ON s.student_id = sa.student_id
       ORDER BY s.last_name, s.first_name`
    );
    res.json(rows);
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

    res.json({
      ...student[0],
      academic: academic[0] || null,
      documents,
      grades,
      internships,
      orgs
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

    res.json({
      student: student[0],
      summary: {
        total_subjects: gradeSummary[0].total_subjects,
        average_final_grade: gradeSummary[0].average_final_grade,
        total_schedules: scheduleSummary[0].total_schedules,
        registered_events: eventSummary[0].registered_events
      }
    });
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
      emergency_contact_num, profile_photo, nationality, religion,
      academic
    } = req.body;

    if (!student_id || !first_name || !last_name) {
      return res.status(400).json({ error: 'student_id, first_name, and last_name are required' });
    }

    await pool.query(
      `INSERT INTO students (student_id, first_name, middle_name, last_name, birth_date, sex,
        civil_status, contact_number, email, address, emergency_contact,
        emergency_contact_num, profile_photo, nationality, religion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [student_id, first_name, middle_name || null, last_name, birth_date || null, sex || null,
       civil_status || null, contact_number || null, email || null, address || null,
       emergency_contact || null, emergency_contact_num || null, profile_photo || null,
       nationality || null, religion || null]
    );

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

    res.status(201).json({ message: 'Student created successfully', student_id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Student ID or email already exists' });
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
      profile_photo, nationality, religion
    } = req.body;

    const [result] = await pool.query(
      `UPDATE students SET first_name = COALESCE(?, first_name), middle_name = COALESCE(?, middle_name),
        last_name = COALESCE(?, last_name), birth_date = COALESCE(?, birth_date), sex = COALESCE(?, sex),
        civil_status = COALESCE(?, civil_status), contact_number = COALESCE(?, contact_number),
        email = COALESCE(?, email), address = COALESCE(?, address),
        emergency_contact = COALESCE(?, emergency_contact),
        emergency_contact_num = COALESCE(?, emergency_contact_num),
        profile_photo = COALESCE(?, profile_photo), nationality = COALESCE(?, nationality),
        religion = COALESCE(?, religion), updated_at = NOW()
       WHERE student_id = ?`,
      [first_name, middle_name, last_name, birth_date, sex, civil_status,
       contact_number, email, address, emergency_contact, emergency_contact_num,
       profile_photo, nationality, religion, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student updated successfully' });
  } catch (err) {
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
