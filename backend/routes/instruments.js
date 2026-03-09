const express = require('express');
const router = express.Router();
const pool = require('../config/db');

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
    const { subject_code, faculty_id, semester, academic_year, course_description, course_outcomes, grading_system, references_biblio, approved_by, is_approved } = req.body;
    if (!subject_code) return res.status(400).json({ error: 'subject_code is required' });

    const [result] = await pool.query(
      `INSERT INTO syllabus (subject_code, faculty_id, semester, academic_year, course_description,
        course_outcomes, grading_system, references_biblio, approved_by, is_approved)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [subject_code, faculty_id || null, semester || null, academic_year || null,
       course_description || null, course_outcomes || null, grading_system || null,
       references_biblio || null, approved_by || null, is_approved || 0]
    );

    res.status(201).json({ message: 'Syllabus created successfully', syllabus_id: result.insertId });
  } catch (err) {
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
      `SELECT l.*, st.topic_title, st.syllabus_id
       FROM lessons l
       LEFT JOIN syllabus_topics st ON l.topic_id = st.topic_id
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
    const { topic_id, title, content_type, file_path, external_url, is_published } = req.body;
    if (!topic_id || !title) return res.status(400).json({ error: 'topic_id and title are required' });

    const [result] = await pool.query(
      `INSERT INTO lessons (topic_id, title, content_type, file_path, external_url, is_published, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [topic_id, title, content_type || null, file_path || null, external_url || null,
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
