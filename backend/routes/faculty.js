const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

function decodeBase64File(data) {
  if (!data || typeof data !== 'string') return null;
  const base64 = data.includes(',') ? data.split(',')[1] : data;
  return Buffer.from(base64, 'base64');
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

async function hasFacultyCertificationTable() {
  const [rows] = await pool.query("SHOW TABLES LIKE 'faculty_expertise_certifications'");
  return rows.length > 0;
}

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
      employment, rank, certification
    } = req.body;

    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'first_name, last_name, and email are required' });
    }

    const normalizedBirthDate = normalizeDateInput(birth_date);
    if (!normalizedBirthDate) {
      return res.status(400).json({ error: 'A valid birth_date is required' });
    }

    let generatedFacultyId = faculty_id || `F${crypto.randomUUID().replace(/-/g, '').slice(0, 19)}`;
    if (!faculty_id) {
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const [existing] = await pool.query('SELECT faculty_id FROM faculty WHERE faculty_id = ? LIMIT 1', [generatedFacultyId]);
        if (existing.length === 0) break;
        generatedFacultyId = `F${crypto.randomUUID().replace(/-/g, '').slice(0, 19)}`;
      }
    }
    const resolvedRank = rank ?? employment?.rank ?? null;

    await pool.query(
      `INSERT INTO faculty (faculty_id, first_name, middle_name, last_name, birth_date, gender,
        email, contact_no, address, profile_photo, specialization)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [generatedFacultyId, first_name, middle_name || null, last_name, normalizedBirthDate, gender || 'Unknown',
       email, contact_no || '', address || '', profile_photo || null, specialization || null]
    );

    try {
      const username = email.trim().toLowerCase();
      const generatedPassword = generateDefaultPassword(last_name, normalizedBirthDate);
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(generatedPassword, salt);

      await pool.query(
        `INSERT INTO users (ref_id, user_type, username, password_hash)
         VALUES (?, 'Faculty', ?, ?)
         ON DUPLICATE KEY UPDATE
           user_type = VALUES(user_type),
           username = VALUES(username),
           password_hash = VALUES(password_hash),
           is_active = 1`,
        [generatedFacultyId, username, password_hash]
      );
    } catch (userErr) {
      await pool.query('DELETE FROM faculty WHERE faculty_id = ?', [generatedFacultyId]);
      throw new Error(`Faculty record rollback: failed to create user credentials (${userErr.message})`);
    }

    if (employment || resolvedRank) {
      await pool.query(
        `INSERT INTO faculty_employment (faculty_id, employment_status, \`rank\`, department_id, date_hired, tenure_status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          generatedFacultyId,
          employment?.employment_status || null,
          resolvedRank,
          employment?.department_id || null,
          employment?.date_hired || null,
          employment?.tenure_status || null
        ]
      );
    }

    let warning;
    if (certification?.file_data_base64 && certification?.file_name && certification?.expertise) {
      const hasCertTable = await hasFacultyCertificationTable();
      if (!hasCertTable) {
        warning = 'faculty_expertise_certifications table not found. Apply SQL migration before saving certificates.';
      } else {
        const fileBuffer = decodeBase64File(certification.file_data_base64);
        if (!fileBuffer) {
          return res.status(400).json({ error: 'Invalid certification file data' });
        }

        const uploadsDir = path.join(__dirname, '..', 'uploads', 'faculty-certificates');
        fs.mkdirSync(uploadsDir, { recursive: true });

        const ext = path.extname(certification.file_name).toLowerCase() || '.pdf';
        const safeExt = ext === '.pdf' ? ext : '.pdf';
        const storedFilename = `${generatedFacultyId}-${Date.now()}${safeExt}`;
        const filePath = path.join(uploadsDir, storedFilename);
        fs.writeFileSync(filePath, fileBuffer);

        await pool.query(
          `INSERT INTO faculty_expertise_certifications (faculty_id, expertise, certificate_file, mime_type)
           VALUES (?, ?, ?, ?)`,
          [
            generatedFacultyId,
            certification.expertise,
            `/uploads/faculty-certificates/${storedFilename}`,
            certification.mime_type || 'application/pdf',
          ]
        );
      }
    }

    res.status(201).json({ message: 'Faculty created successfully', faculty_id: generatedFacultyId, warning });
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

// GET /:id/certifications
router.get('/:id/certifications', async (req, res) => {
  try {
    const hasCertTable = await hasFacultyCertificationTable();
    if (!hasCertTable) return res.json([]);

    const [rows] = await pool.query(
      `SELECT cert_id, faculty_id, expertise, certificate_file, mime_type, uploaded_at
       FROM faculty_expertise_certifications
       WHERE faculty_id = ?
       ORDER BY uploaded_at DESC`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/certifications
router.post('/:id/certifications', async (req, res) => {
  try {
    const { id } = req.params;
    const { expertise, file_name, file_data_base64, mime_type } = req.body;
    if (!expertise || !file_name || !file_data_base64) {
      return res.status(400).json({ error: 'expertise, file_name, and file_data_base64 are required' });
    }

    const hasCertTable = await hasFacultyCertificationTable();
    if (!hasCertTable) {
      return res.status(500).json({ error: 'faculty_expertise_certifications table not found. Apply SQL migration first.' });
    }

    const fileBuffer = decodeBase64File(file_data_base64);
    if (!fileBuffer) return res.status(400).json({ error: 'Invalid certification file data' });

    const uploadsDir = path.join(__dirname, '..', 'uploads', 'faculty-certificates');
    fs.mkdirSync(uploadsDir, { recursive: true });

    const ext = path.extname(file_name).toLowerCase() || '.pdf';
    const safeExt = ext === '.pdf' ? ext : '.pdf';
    const storedFilename = `${id}-${Date.now()}${safeExt}`;
    fs.writeFileSync(path.join(uploadsDir, storedFilename), fileBuffer);

    const [result] = await pool.query(
      `INSERT INTO faculty_expertise_certifications (faculty_id, expertise, certificate_file, mime_type)
       VALUES (?, ?, ?, ?)`,
      [id, expertise, `/uploads/faculty-certificates/${storedFilename}`, mime_type || 'application/pdf']
    );

    res.status(201).json({ message: 'Certification uploaded', cert_id: result.insertId });
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
