const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ─── RESEARCH PROJECTS CRUD ─────────────────────────────────────

// GET / - List all research projects with member count and department name
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT rp.*, d.dept_name, COUNT(rm.member_id) AS member_count
       FROM research_projects rp
       LEFT JOIN departments d ON rp.department_id = d.dept_id
       LEFT JOIN research_members rm ON rp.project_id = rm.project_id
       GROUP BY rp.project_id
       ORDER BY rp.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - Get single project with members, documents, presentations
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [project] = await pool.query(
      `SELECT rp.*, d.dept_name FROM research_projects rp
       LEFT JOIN departments d ON rp.department_id = d.dept_id
       WHERE rp.project_id = ?`, [id]
    );
    if (project.length === 0) return res.status(404).json({ error: 'Research project not found' });

    const [members] = await pool.query('SELECT * FROM research_members WHERE project_id = ?', [id]);
    const [documents] = await pool.query('SELECT * FROM research_documents WHERE project_id = ?', [id]);
    const [presentations] = await pool.query('SELECT * FROM research_presentations WHERE project_id = ?', [id]);

    res.json({ ...project[0], members, documents, presentations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - Create project
router.post('/', async (req, res) => {
  try {
    const { title, abstract, research_type, status, start_date, end_date, funding_source, budget, department_id } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const [result] = await pool.query(
      `INSERT INTO research_projects (title, abstract, research_type, status, start_date, end_date, funding_source, budget, department_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, abstract || null, research_type || null, status || null, start_date || null,
       end_date || null, funding_source || null, budget || null, department_id || null]
    );

    res.status(201).json({ message: 'Research project created', project_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - Update project
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, abstract, research_type, status, start_date, end_date, funding_source, budget, department_id } = req.body;

    const [result] = await pool.query(
      `UPDATE research_projects SET title = COALESCE(?, title), abstract = COALESCE(?, abstract),
        research_type = COALESCE(?, research_type), status = COALESCE(?, status),
        start_date = COALESCE(?, start_date), end_date = COALESCE(?, end_date),
        funding_source = COALESCE(?, funding_source), budget = COALESCE(?, budget),
        department_id = COALESCE(?, department_id)
       WHERE project_id = ?`,
      [title, abstract, research_type, status, start_date, end_date, funding_source, budget, department_id, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Research project not found' });
    res.json({ message: 'Research project updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - Delete project and related records
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM research_members WHERE project_id = ?', [id]);
    await pool.query('DELETE FROM research_documents WHERE project_id = ?', [id]);
    await pool.query('DELETE FROM research_presentations WHERE project_id = ?', [id]);
    const [result] = await pool.query('DELETE FROM research_projects WHERE project_id = ?', [id]);

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Research project not found' });
    res.json({ message: 'Research project deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── MEMBERS ────────────────────────────────────────────────────

// POST /:id/members - Add member
router.post('/:id/members', async (req, res) => {
  try {
    const { id } = req.params;
    const { member_ref, member_type, role } = req.body;

    const [result] = await pool.query(
      'INSERT INTO research_members (project_id, member_ref, member_type, role) VALUES (?, ?, ?, ?)',
      [id, member_ref, member_type || null, role || null]
    );

    res.status(201).json({ message: 'Member added', member_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /members/:memberId - Update member
router.put('/members/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;
    const { member_ref, member_type, role } = req.body;

    const [result] = await pool.query(
      `UPDATE research_members SET member_ref = COALESCE(?, member_ref),
        member_type = COALESCE(?, member_type), role = COALESCE(?, role)
       WHERE member_id = ?`,
      [member_ref, member_type, role, memberId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Member not found' });
    res.json({ message: 'Member updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /members/:memberId - Delete member
router.delete('/members/:memberId', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM research_members WHERE member_id = ?', [req.params.memberId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Member not found' });
    res.json({ message: 'Member deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DOCUMENTS ──────────────────────────────────────────────────

// POST /:id/documents - Add document
router.post('/:id/documents', async (req, res) => {
  try {
    const { id } = req.params;
    const { doc_label, file_path } = req.body;

    const [result] = await pool.query(
      'INSERT INTO research_documents (project_id, doc_label, file_path) VALUES (?, ?, ?)',
      [id, doc_label, file_path]
    );

    res.status(201).json({ message: 'Document added', rdoc_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /documents/:rdocId - Delete document
router.delete('/documents/:rdocId', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM research_documents WHERE rdoc_id = ?', [req.params.rdocId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Document not found' });
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PRESENTATIONS ──────────────────────────────────────────────

// POST /:id/presentations - Add presentation
router.post('/:id/presentations', async (req, res) => {
  try {
    const { id } = req.params;
    const { event_name, venue, presentation_date, award } = req.body;

    const [result] = await pool.query(
      'INSERT INTO research_presentations (project_id, event_name, venue, presentation_date, award) VALUES (?, ?, ?, ?, ?)',
      [id, event_name, venue || null, presentation_date || null, award || null]
    );

    res.status(201).json({ message: 'Presentation added', presentation_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /presentations/:presentationId - Update presentation
router.put('/presentations/:presentationId', async (req, res) => {
  try {
    const { presentationId } = req.params;
    const { event_name, venue, presentation_date, award } = req.body;

    const [result] = await pool.query(
      `UPDATE research_presentations SET event_name = COALESCE(?, event_name),
        venue = COALESCE(?, venue), presentation_date = COALESCE(?, presentation_date),
        award = COALESCE(?, award)
       WHERE presentation_id = ?`,
      [event_name, venue, presentation_date, award, presentationId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Presentation not found' });
    res.json({ message: 'Presentation updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /presentations/:presentationId - Delete presentation
router.delete('/presentations/:presentationId', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM research_presentations WHERE presentation_id = ?', [req.params.presentationId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Presentation not found' });
    res.json({ message: 'Presentation deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
