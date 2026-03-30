const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ─── FACULTY CRUD ───────────────────────────────────────────────

// GET / - List all faculty with employment info
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT f.*, fe.employment_status, fe.rank, fe.department_id, d.dept_name
       FROM faculty f
       LEFT JOIN faculty_employment fe ON f.faculty_id = fe.faculty_id
       LEFT JOIN departments d ON fe.department_id = d.dept_id
       ORDER BY f.last_name, f.first_name`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - Get single faculty with all related data
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [faculty] = await pool.query('SELECT * FROM faculty WHERE faculty_id = ?', [id]);
    if (faculty.length === 0) return res.status(404).json({ error: 'Faculty not found' });

    const [education] = await pool.query('SELECT * FROM faculty_education WHERE faculty_id = ?', [id]);
    const [employment] = await pool.query(
      `SELECT fe.*, d.dept_name FROM faculty_employment fe
       LEFT JOIN departments d ON fe.department_id = d.dept_id
       WHERE fe.faculty_id = ?`, [id]
    );
    const [evaluations] = await pool.query('SELECT * FROM faculty_evaluation WHERE faculty_id = ?', [id]);
    const [load] = await pool.query(
      `SELECT fl.*, s.subject_name FROM faculty_load fl
       LEFT JOIN subjects s ON fl.subject_code = s.subject_code
       WHERE fl.faculty_id = ?`, [id]
    );
    const [research] = await pool.query('SELECT * FROM faculty_research WHERE faculty_id = ?', [id]);

    res.json({
      ...faculty[0],
      education,
      employment: employment[0] || null,
      evaluations,
      load,
      research
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id/dashboard - Teacher portal dashboard summary
router.get('/:id/dashboard', async (req, res) => {
  try {
    const { id } = req.params;
    const [faculty] = await pool.query(
      'SELECT faculty_id, first_name, last_name, specialization FROM faculty WHERE faculty_id = ?',
      [id]
    );
    if (faculty.length === 0) return res.status(404).json({ error: 'Faculty not found' });

    const [loadSummary] = await pool.query(
      `SELECT COUNT(*) AS assigned_classes, COALESCE(SUM(teaching_units), 0) AS total_teaching_units
       FROM faculty_load
       WHERE faculty_id = ?`,
      [id]
    );

    const [researchSummary] = await pool.query(
      `SELECT COUNT(*) AS research_outputs
       FROM faculty_research
       WHERE faculty_id = ?`,
      [id]
    );

    const [syllabusSummary] = await pool.query(
      `SELECT COUNT(*) AS authored_syllabi
       FROM syllabus
       WHERE faculty_id = ?`,
      [id]
    );

    res.json({
      faculty: faculty[0],
      summary: {
        assigned_classes: loadSummary[0].assigned_classes,
        total_teaching_units: loadSummary[0].total_teaching_units,
        research_outputs: researchSummary[0].research_outputs,
        authored_syllabi: syllabusSummary[0].authored_syllabi
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - Create faculty
router.post('/', async (req, res) => {
  try {
    const {
      faculty_id, first_name, middle_name, last_name, birth_date, gender,
      email, contact_no, address, profile_photo, specialization,
      employment, rank
    } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'first_name, last_name, and email are required' });
    }

    const generatedFacultyId = faculty_id || `F${Date.now()}`.slice(0, 20);

    await pool.query(
      `INSERT INTO faculty (faculty_id, first_name, middle_name, last_name, birth_date, gender,
        email, contact_no, address, profile_photo, specialization)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [generatedFacultyId, first_name, middle_name || null, last_name, birth_date || '1970-01-01', gender || 'N/A',
       email, contact_no || 'N/A', address || 'N/A', profile_photo || null, specialization || null]
    );

    if (employment || rank) {
      await pool.query(
        `INSERT INTO faculty_employment (faculty_id, employment_status, \`rank\`, department_id, date_hired, tenure_status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          generatedFacultyId,
          employment?.employment_status || null,
          employment?.rank || rank || null,
          employment?.department_id || null,
          employment?.date_hired || null,
          employment?.tenure_status || null
        ]
      );
    }

    res.status(201).json({ message: 'Faculty created successfully', faculty_id: generatedFacultyId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Faculty ID or email already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - Update faculty personal info
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name, middle_name, last_name, birth_date, gender,
      email, contact_no, address, profile_photo, specialization
    } = req.body;

    const [result] = await pool.query(
      `UPDATE faculty SET first_name = COALESCE(?, first_name), middle_name = COALESCE(?, middle_name),
        last_name = COALESCE(?, last_name), birth_date = COALESCE(?, birth_date), gender = COALESCE(?, gender),
        email = COALESCE(?, email), contact_no = COALESCE(?, contact_no), address = COALESCE(?, address),
        profile_photo = COALESCE(?, profile_photo), specialization = COALESCE(?, specialization),
        updated_at = NOW()
       WHERE faculty_id = ?`,
      [first_name, middle_name, last_name, birth_date, gender, email, contact_no, address,
       profile_photo, specialization, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Faculty not found' });
    res.json({ message: 'Faculty updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - Delete faculty and all related records
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM faculty_education WHERE faculty_id = ?', [id]);
    await pool.query('DELETE FROM faculty_evaluation WHERE faculty_id = ?', [id]);
    await pool.query('DELETE FROM faculty_load WHERE faculty_id = ?', [id]);
    await pool.query('DELETE FROM faculty_research WHERE faculty_id = ?', [id]);
    await pool.query('DELETE FROM faculty_employment WHERE faculty_id = ?', [id]);
    const [result] = await pool.query('DELETE FROM faculty WHERE faculty_id = ?', [id]);

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Faculty not found' });
    res.json({ message: 'Faculty deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── EDUCATION ──────────────────────────────────────────────────

// GET /:id/education
router.get('/:id/education', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM faculty_education WHERE faculty_id = ?', [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/education
router.post('/:id/education', async (req, res) => {
  try {
    const { id } = req.params;
    const { degree, institution, year_graduated } = req.body;

    const [result] = await pool.query(
      'INSERT INTO faculty_education (faculty_id, degree, institution, year_graduated) VALUES (?, ?, ?, ?)',
      [id, degree, institution || null, year_graduated || null]
    );

    res.status(201).json({ message: 'Education added', edu_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /education/:eduId
router.put('/education/:eduId', async (req, res) => {
  try {
    const { eduId } = req.params;
    const { degree, institution, year_graduated } = req.body;

    const [result] = await pool.query(
      `UPDATE faculty_education SET degree = COALESCE(?, degree), institution = COALESCE(?, institution),
        year_graduated = COALESCE(?, year_graduated)
       WHERE edu_id = ?`,
      [degree, institution, year_graduated, eduId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Education record not found' });
    res.json({ message: 'Education updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /education/:eduId
router.delete('/education/:eduId', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM faculty_education WHERE edu_id = ?', [req.params.eduId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Education record not found' });
    res.json({ message: 'Education deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── EMPLOYMENT ─────────────────────────────────────────────────

// GET /:id/employment
router.get('/:id/employment', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT fe.*, d.dept_name FROM faculty_employment fe
       LEFT JOIN departments d ON fe.department_id = d.dept_id
       WHERE fe.faculty_id = ?`, [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Employment record not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id/employment
router.put('/:id/employment', async (req, res) => {
  try {
    const { id } = req.params;
    const { employment_status, rank, department_id, date_hired, tenure_status } = req.body;

    const [existing] = await pool.query('SELECT faculty_id FROM faculty_employment WHERE faculty_id = ?', [id]);
    if (existing.length === 0) {
      await pool.query(
        'INSERT INTO faculty_employment (faculty_id, employment_status, `rank`, department_id, date_hired, tenure_status) VALUES (?, ?, ?, ?, ?, ?)',
        [id, employment_status || null, rank || null, department_id || null, date_hired || null, tenure_status || null]
      );
    } else {
      await pool.query(
        `UPDATE faculty_employment SET employment_status = COALESCE(?, employment_status),
          \`rank\` = COALESCE(?, \`rank\`), department_id = COALESCE(?, department_id),
          date_hired = COALESCE(?, date_hired), tenure_status = COALESCE(?, tenure_status)
         WHERE faculty_id = ?`,
        [employment_status, rank, department_id, date_hired, tenure_status, id]
      );
    }
    res.json({ message: 'Employment updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── EVALUATIONS ────────────────────────────────────────────────

// GET /:id/evaluations
router.get('/:id/evaluations', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM faculty_evaluation WHERE faculty_id = ?', [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/evaluations
router.post('/:id/evaluations', async (req, res) => {
  try {
    const { id } = req.params;
    const { semester, academic_year, student_eval_score, peer_eval_score, self_eval_score, overall_rating } = req.body;

    const [result] = await pool.query(
      `INSERT INTO faculty_evaluation (faculty_id, semester, academic_year, student_eval_score,
        peer_eval_score, self_eval_score, overall_rating)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, semester, academic_year, student_eval_score || null, peer_eval_score || null,
       self_eval_score || null, overall_rating || null]
    );

    res.status(201).json({ message: 'Evaluation added', eval_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /evaluations/:evalId
router.put('/evaluations/:evalId', async (req, res) => {
  try {
    const { evalId } = req.params;
    const { semester, academic_year, student_eval_score, peer_eval_score, self_eval_score, overall_rating } = req.body;

    const [result] = await pool.query(
      `UPDATE faculty_evaluation SET semester = COALESCE(?, semester), academic_year = COALESCE(?, academic_year),
        student_eval_score = COALESCE(?, student_eval_score), peer_eval_score = COALESCE(?, peer_eval_score),
        self_eval_score = COALESCE(?, self_eval_score), overall_rating = COALESCE(?, overall_rating)
       WHERE eval_id = ?`,
      [semester, academic_year, student_eval_score, peer_eval_score, self_eval_score, overall_rating, evalId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Evaluation not found' });
    res.json({ message: 'Evaluation updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /evaluations/:evalId
router.delete('/evaluations/:evalId', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM faculty_evaluation WHERE eval_id = ?', [req.params.evalId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Evaluation not found' });
    res.json({ message: 'Evaluation deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── LOAD ───────────────────────────────────────────────────────

// GET /:id/load
router.get('/:id/load', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT fl.*, s.subject_name FROM faculty_load fl
       LEFT JOIN subjects s ON fl.subject_code = s.subject_code
       WHERE fl.faculty_id = ?`, [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id/schedules - Teacher schedules
router.get('/:id/schedules', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sc.*, s.subject_name, r.room_name, r.building
       FROM schedules sc
       LEFT JOIN subjects s ON sc.subject_code = s.subject_code
       LEFT JOIN rooms r ON sc.room_id = r.room_id
       WHERE sc.faculty_id = ?
       ORDER BY sc.day_of_week, sc.start_time`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id/students - Students handled by teacher based on schedule section
router.get('/:id/students', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT s.student_id, s.first_name, s.middle_name, s.last_name, sa.program, sa.year_level, sa.section
       FROM schedules sc
       INNER JOIN student_academic sa ON sa.section = sc.section
       INNER JOIN students s ON s.student_id = sa.student_id
       WHERE sc.faculty_id = ?
       ORDER BY s.last_name, s.first_name`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id/events - Faculty event records with attendance
router.get('/:id/events', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT e.*, ep.participation_id, ep.attendance
       FROM event_participants ep
       INNER JOIN events e ON ep.event_id = e.event_id
       WHERE ep.participant_id = ? AND ep.participant_type = 'Faculty'
       ORDER BY e.start_date DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/events/:eventId - Register faculty to event
router.post('/:id/events/:eventId', async (req, res) => {
  try {
    const { id, eventId } = req.params;

    const [existing] = await pool.query(
      `SELECT participation_id FROM event_participants
       WHERE event_id = ? AND participant_id = ? AND participant_type = 'Faculty'`,
      [eventId, id]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Faculty is already registered for this event' });
    }

    const [result] = await pool.query(
      `INSERT INTO event_participants (event_id, participant_id, participant_type, attendance)
       VALUES (?, ?, 'Faculty', 'Registered')`,
      [eventId, id]
    );

    res.status(201).json({ message: 'Faculty registered to event', participation_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/load
router.post('/:id/load', async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_code, section, semester, academic_year, teaching_units } = req.body;

    const [result] = await pool.query(
      `INSERT INTO faculty_load (faculty_id, subject_code, section, semester, academic_year, teaching_units)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, subject_code, section || null, semester, academic_year, teaching_units || null]
    );

    res.status(201).json({ message: 'Load added', load_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /load/:loadId
router.put('/load/:loadId', async (req, res) => {
  try {
    const { loadId } = req.params;
    const { subject_code, section, semester, academic_year, teaching_units } = req.body;

    const [result] = await pool.query(
      `UPDATE faculty_load SET subject_code = COALESCE(?, subject_code), section = COALESCE(?, section),
        semester = COALESCE(?, semester), academic_year = COALESCE(?, academic_year),
        teaching_units = COALESCE(?, teaching_units)
       WHERE load_id = ?`,
      [subject_code, section, semester, academic_year, teaching_units, loadId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Load not found' });
    res.json({ message: 'Load updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /load/:loadId
router.delete('/load/:loadId', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM faculty_load WHERE load_id = ?', [req.params.loadId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Load not found' });
    res.json({ message: 'Load deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── RESEARCH ───────────────────────────────────────────────────

// GET /:id/research
router.get('/:id/research', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM faculty_research WHERE faculty_id = ?', [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/research
router.post('/:id/research', async (req, res) => {
  try {
    const { id } = req.params;
    const { research_title, publication_type, year_published, status } = req.body;

    const [result] = await pool.query(
      `INSERT INTO faculty_research (faculty_id, research_title, publication_type, year_published, status)
       VALUES (?, ?, ?, ?, ?)`,
      [id, research_title, publication_type || null, year_published || null, status || null]
    );

    res.status(201).json({ message: 'Research added', research_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /research/:researchId
router.put('/research/:researchId', async (req, res) => {
  try {
    const { researchId } = req.params;
    const { research_title, publication_type, year_published, status } = req.body;

    const [result] = await pool.query(
      `UPDATE faculty_research SET research_title = COALESCE(?, research_title),
        publication_type = COALESCE(?, publication_type), year_published = COALESCE(?, year_published),
        status = COALESCE(?, status)
       WHERE research_id = ?`,
      [research_title, publication_type, year_published, status, researchId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Research not found' });
    res.json({ message: 'Research updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /research/:researchId
router.delete('/research/:researchId', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM faculty_research WHERE research_id = ?', [req.params.researchId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Research not found' });
    res.json({ message: 'Research deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
