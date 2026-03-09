const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET / - List all curricula
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM curriculum ORDER BY effectivity_year DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - Get curriculum with its subjects
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [curriculum] = await pool.query('SELECT * FROM curriculum WHERE curriculum_id = ?', [id]);
    if (curriculum.length === 0) return res.status(404).json({ error: 'Curriculum not found' });

    const [subjects] = await pool.query(
      `SELECT cs.*, s.subject_name, s.units, s.lec_hours, s.lab_hours, s.subject_type
       FROM curriculum_subjects cs
       LEFT JOIN subjects s ON cs.subject_code = s.subject_code
       WHERE cs.curriculum_id = ?
       ORDER BY cs.year_level, cs.semester`,
      [id]
    );

    res.json({ ...curriculum[0], subjects });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - Create curriculum
router.post('/', async (req, res) => {
  try {
    const { program, version, cmo_reference, effectivity_year, is_active, description } = req.body;
    if (!program) {
      return res.status(400).json({ error: 'program is required' });
    }

    const [result] = await pool.query(
      'INSERT INTO curriculum (program, version, cmo_reference, effectivity_year, is_active, description) VALUES (?, ?, ?, ?, ?, ?)',
      [program, version || null, cmo_reference || null, effectivity_year || null, is_active != null ? is_active : 1, description || null]
    );

    res.status(201).json({ message: 'Curriculum created successfully', curriculum_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - Update curriculum
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { program, version, cmo_reference, effectivity_year, is_active, description } = req.body;

    const [result] = await pool.query(
      `UPDATE curriculum SET program = COALESCE(?, program), version = COALESCE(?, version),
        cmo_reference = COALESCE(?, cmo_reference), effectivity_year = COALESCE(?, effectivity_year),
        is_active = COALESCE(?, is_active), description = COALESCE(?, description)
       WHERE curriculum_id = ?`,
      [program, version, cmo_reference, effectivity_year, is_active, description, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Curriculum not found' });
    res.json({ message: 'Curriculum updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - Delete curriculum
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM curriculum_subjects WHERE curriculum_id = ?', [id]);
    const [result] = await pool.query('DELETE FROM curriculum WHERE curriculum_id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Curriculum not found' });
    res.json({ message: 'Curriculum deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /:id/subjects - Add subject to curriculum
router.post('/:id/subjects', async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_code, year_level, semester, prerequisite } = req.body;

    const [result] = await pool.query(
      'INSERT INTO curriculum_subjects (curriculum_id, subject_code, year_level, semester, prerequisite) VALUES (?, ?, ?, ?, ?)',
      [id, subject_code, year_level || null, semester || null, prerequisite || null]
    );

    res.status(201).json({ message: 'Subject added to curriculum', cs_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id/subjects/:csId - Remove subject from curriculum
router.delete('/:id/subjects/:csId', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM curriculum_subjects WHERE cs_id = ? AND curriculum_id = ?',
      [req.params.csId, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Curriculum subject not found' });
    res.json({ message: 'Subject removed from curriculum' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
