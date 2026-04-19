const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

function decodeBase64File(data) {
  if (!data || typeof data !== 'string') return null;
  const base64 = data.includes(',') ? data.split(',')[1] : data;
  return Buffer.from(base64, 'base64');
}

function extensionFromMimeType(mimeType) {
  if (!mimeType || typeof mimeType !== 'string') return '';
  const normalized = mimeType.toLowerCase();
  if (normalized.includes('pdf')) return '.pdf';
  if (normalized.includes('word') && normalized.includes('document')) return '.docx';
  if (normalized === 'application/msword') return '.doc';
  return '';
}

function saveInstrumentFile(fileDataBase64, fileName, mimeType) {
  const fileBuffer = decodeBase64File(fileDataBase64);
  if (!fileBuffer) return null;

  const uploadsDir = path.join(__dirname, '..', 'uploads', 'instruments');
  fs.mkdirSync(uploadsDir, { recursive: true });

  const originalExt = path.extname(fileName || '').toLowerCase();
  const mimeExt = extensionFromMimeType(mimeType);
  const safeExt = ['.pdf', '.doc', '.docx'].includes(originalExt)
    ? originalExt
    : (['.pdf', '.doc', '.docx'].includes(mimeExt) ? mimeExt : '.bin');
  const storedFileName = `instrument-${Date.now()}-${Math.floor(Math.random() * 100000)}${safeExt}`;
  fs.writeFileSync(path.join(uploadsDir, storedFileName), fileBuffer);

  return `/uploads/instruments/${storedFileName}`;
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

const INSTRUMENTS_UNION_QUERY = `
  SELECT
    sy.syllabus_id AS item_id,
    'syllabus' AS item_type,
    CONCAT(COALESCE(s.subject_name, sy.subject_code, 'Untitled'), ' Syllabus') AS title,
    sy.subject_code,
    f.first_name AS faculty_first_name,
    f.last_name AS faculty_last_name,
    sy.created_at,
    sy.references_biblio AS file_url
  FROM syllabus sy
  LEFT JOIN subjects s ON sy.subject_code = s.subject_code
  LEFT JOIN faculty f ON sy.faculty_id = f.faculty_id

  UNION ALL

  SELECT
    l.lesson_id AS item_id,
    'lesson' AS item_type,
    COALESCE(l.title, CONCAT('Lesson ', l.lesson_id)) AS title,
    sy.subject_code,
    f.first_name AS faculty_first_name,
    f.last_name AS faculty_last_name,
    l.created_at,
    COALESCE(l.file_path, l.external_url) AS file_url
  FROM lessons l
  LEFT JOIN syllabus_topics st ON l.topic_id = st.topic_id
  LEFT JOIN syllabus sy ON st.syllabus_id = sy.syllabus_id
  LEFT JOIN faculty f ON sy.faculty_id = f.faculty_id
`;

// GET / - List combined instruments (syllabus + lesson), supports pagination
router.get('/', async (req, res) => {
  try {
    const pagination = parsePagination(req.query || {});

    const conditions = [];
    const params = [];

    const type = typeof req.query.type === 'string' ? req.query.type.trim().toLowerCase() : '';
    if (type && type !== 'all') {
      conditions.push('q.item_type = ?');
      params.push(type);
    }

    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    if (search) {
      const pattern = `%${search}%`;
      conditions.push("(q.title LIKE ? OR COALESCE(q.subject_code, '') LIKE ? OR CONCAT(COALESCE(q.faculty_first_name, ''), ' ', COALESCE(q.faculty_last_name, '')) LIKE ?)");
      params.push(pattern, pattern, pattern);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    if (!pagination) {
      const [rows] = await pool.query(
        `SELECT *
         FROM (${INSTRUMENTS_UNION_QUERY}) AS q
         ${whereClause}
         ORDER BY q.created_at DESC`,
        params
      );
      return res.json(rows);
    }

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM (${INSTRUMENTS_UNION_QUERY}) AS q
       ${whereClause}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT *
       FROM (${INSTRUMENTS_UNION_QUERY}) AS q
       ${whereClause}
       ORDER BY q.created_at DESC
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

// ─── SYLLABUS CRUD ──────────────────────────────────────────────

// GET /syllabus - List all syllabi
router.get('/syllabus', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sy.*, s.subject_name, f.first_name AS faculty_first_name, f.last_name AS faculty_last_name
       FROM syllabus sy
       LEFT JOIN subjects s ON sy.subject_code = s.subject_code
       LEFT JOIN faculty f ON sy.faculty_id = f.faculty_id
       ORDER BY sy.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /syllabus/:id - Get syllabus with topics
router.get('/syllabus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [syllabus] = await pool.query(
      `SELECT sy.*, s.subject_name, f.first_name AS faculty_first_name, f.last_name AS faculty_last_name
       FROM syllabus sy
       LEFT JOIN subjects s ON sy.subject_code = s.subject_code
       LEFT JOIN faculty f ON sy.faculty_id = f.faculty_id
       WHERE sy.syllabus_id = ?`, [id]
    );
    if (syllabus.length === 0) return res.status(404).json({ error: 'Syllabus not found' });

    const [topics] = await pool.query(
      'SELECT * FROM syllabus_topics WHERE syllabus_id = ? ORDER BY week_number', [id]
    );

    res.json({ ...syllabus[0], topics });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /syllabus - Create syllabus
router.post('/syllabus', async (req, res) => {
  try {
    const {
      subject_code,
      subject_name,
      title,
      faculty_id,
      semester,
      academic_year,
      course_description,
      course_outcomes,
      grading_system,
      references_biblio,
      approved_by,
      is_approved,
      file_name,
      file_data_base64,
      mime_type,
    } = req.body;
    const normalizedSubjectCode = typeof subject_code === 'string' ? subject_code.trim().toUpperCase() : '';
    if (!normalizedSubjectCode) {
      return res.status(400).json({ error: 'subject_code is required' });
    }

    const [subjectRows] = await pool.query('SELECT subject_code FROM subjects WHERE subject_code = ?', [normalizedSubjectCode]);
    if (subjectRows.length === 0) {
      const fallbackSubjectName =
        (typeof subject_name === 'string' && subject_name.trim()) ||
        (typeof title === 'string' && title.trim()) ||
        normalizedSubjectCode;

      await pool.query(
        `INSERT INTO subjects (subject_code, subject_name, units, lec_hours, lab_hours, subject_type)
         VALUES (?, ?, 3, 3, 0, 'Professional')`,
        [normalizedSubjectCode, fallbackSubjectName]
      );
    }

    if (faculty_id) {
      const [facultyRows] = await pool.query('SELECT faculty_id FROM faculty WHERE faculty_id = ?', [faculty_id]);
      if (facultyRows.length === 0) {
        return res.status(400).json({ error: 'Invalid faculty_id' });
      }
    }

    const uploadedFilePath = saveInstrumentFile(file_data_base64, file_name, mime_type);
    const resolvedReferences = uploadedFilePath || references_biblio || null;

    const [result] = await pool.query(
      `INSERT INTO syllabus (subject_code, faculty_id, semester, academic_year, course_description,
        course_outcomes, grading_system, references_biblio, approved_by, is_approved)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [normalizedSubjectCode, faculty_id || null, semester || null, academic_year || null,
       course_description || null, course_outcomes || null, grading_system || null,
       resolvedReferences, approved_by || null, is_approved || 0]
    );

    res.status(201).json({ message: 'Syllabus created successfully', syllabus_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Syllabus/subject duplicate conflict' });
    }
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Invalid subject_code or faculty_id' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /syllabus/:id - Update syllabus
router.put('/syllabus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_code, faculty_id, semester, academic_year, course_description, course_outcomes, grading_system, references_biblio, approved_by, is_approved } = req.body;

    const [result] = await pool.query(
      `UPDATE syllabus SET subject_code = COALESCE(?, subject_code), faculty_id = COALESCE(?, faculty_id),
        semester = COALESCE(?, semester), academic_year = COALESCE(?, academic_year),
        course_description = COALESCE(?, course_description), course_outcomes = COALESCE(?, course_outcomes),
        grading_system = COALESCE(?, grading_system), references_biblio = COALESCE(?, references_biblio),
        approved_by = COALESCE(?, approved_by), is_approved = COALESCE(?, is_approved)
       WHERE syllabus_id = ?`,
      [subject_code, faculty_id, semester, academic_year, course_description, course_outcomes,
       grading_system, references_biblio, approved_by, is_approved, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Syllabus not found' });
    res.json({ message: 'Syllabus updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /syllabus/:id - Delete syllabus and related topics/lessons
router.delete('/syllabus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Get topic IDs for deleting lessons
    const [topics] = await pool.query('SELECT topic_id FROM syllabus_topics WHERE syllabus_id = ?', [id]);
    for (const topic of topics) {
      await pool.query('DELETE FROM lessons WHERE topic_id = ?', [topic.topic_id]);
    }
    await pool.query('DELETE FROM syllabus_topics WHERE syllabus_id = ?', [id]);
    const [result] = await pool.query('DELETE FROM syllabus WHERE syllabus_id = ?', [id]);

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Syllabus not found' });
    res.json({ message: 'Syllabus deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── TOPICS ─────────────────────────────────────────────────────

// POST /syllabus/:id/topics - Add topic to syllabus
router.post('/syllabus/:id/topics', async (req, res) => {
  try {
    const { id } = req.params;
    const { week_number, topic_title, description, teaching_method, assessment } = req.body;

    const [result] = await pool.query(
      `INSERT INTO syllabus_topics (syllabus_id, week_number, topic_title, description, teaching_method, assessment)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, week_number || null, topic_title, description || null, teaching_method || null, assessment || null]
    );

    res.status(201).json({ message: 'Topic added', topic_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /topics/:topicId - Update topic
router.put('/topics/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;
    const { week_number, topic_title, description, teaching_method, assessment } = req.body;

    const [result] = await pool.query(
      `UPDATE syllabus_topics SET week_number = COALESCE(?, week_number), topic_title = COALESCE(?, topic_title),
        description = COALESCE(?, description), teaching_method = COALESCE(?, teaching_method),
        assessment = COALESCE(?, assessment)
       WHERE topic_id = ?`,
      [week_number, topic_title, description, teaching_method, assessment, topicId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Topic not found' });
    res.json({ message: 'Topic updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /topics/:topicId - Delete topic and its lessons
router.delete('/topics/:topicId', async (req, res) => {
  try {
    const { topicId } = req.params;
    await pool.query('DELETE FROM lessons WHERE topic_id = ?', [topicId]);
    const [result] = await pool.query('DELETE FROM syllabus_topics WHERE topic_id = ?', [topicId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Topic not found' });
    res.json({ message: 'Topic deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── LESSONS CRUD ───────────────────────────────────────────────

// GET /lessons - List all lessons
router.get('/lessons', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT l.*, st.topic_title, st.syllabus_id, sy.subject_code
       FROM lessons l
       LEFT JOIN syllabus_topics st ON l.topic_id = st.topic_id
       LEFT JOIN syllabus sy ON st.syllabus_id = sy.syllabus_id
       ORDER BY l.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /lessons/:id - Get single lesson
router.get('/lessons/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT l.*, st.topic_title, st.syllabus_id
       FROM lessons l
       LEFT JOIN syllabus_topics st ON l.topic_id = st.topic_id
       WHERE l.lesson_id = ?`, [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Lesson not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /lessons - Create lesson
router.post('/lessons', async (req, res) => {
  try {
    const { topic_id, title, content_type, file_path, external_url, is_published, file_name, file_data_base64, mime_type } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const uploadedFilePath = saveInstrumentFile(file_data_base64, file_name, mime_type);
    const resolvedFilePath = uploadedFilePath || file_path || null;

    const [result] = await pool.query(
      `INSERT INTO lessons (topic_id, title, content_type, file_path, external_url, is_published, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [topic_id || null, title, content_type || null, resolvedFilePath, external_url || null,
       is_published || 0, is_published ? new Date() : null]
    );

    res.status(201).json({ message: 'Lesson created successfully', lesson_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /lessons/:id - Update lesson
router.put('/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { topic_id, title, content_type, file_path, external_url, is_published } = req.body;

    const [result] = await pool.query(
      `UPDATE lessons SET topic_id = COALESCE(?, topic_id), title = COALESCE(?, title),
        content_type = COALESCE(?, content_type), file_path = COALESCE(?, file_path),
        external_url = COALESCE(?, external_url), is_published = COALESCE(?, is_published),
        published_at = CASE WHEN ? = 1 AND is_published = 0 THEN NOW() ELSE published_at END
       WHERE lesson_id = ?`,
      [topic_id, title, content_type, file_path, external_url, is_published, is_published, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Lesson not found' });
    res.json({ message: 'Lesson updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /lessons/:id - Delete lesson
router.delete('/lessons/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM lessons WHERE lesson_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Lesson not found' });
    res.json({ message: 'Lesson deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
