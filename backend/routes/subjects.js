const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET / - List all subjects
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM subjects ORDER BY subject_code');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:code - Get single subject
router.get('/:code', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM subjects WHERE subject_code = ?', [req.params.code]);
    if (rows.length === 0) return res.status(404).json({ error: 'Subject not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - Create subject
router.post('/', async (req, res) => {
  try {
    const { subject_code, subject_name, units, lec_hours, lab_hours, subject_type } = req.body;
    if (!subject_code || !subject_name) {
      return res.status(400).json({ error: 'subject_code and subject_name are required' });
    }

    await pool.query(
      'INSERT INTO subjects (subject_code, subject_name, units, lec_hours, lab_hours, subject_type) VALUES (?, ?, ?, ?, ?, ?)',
      [subject_code, subject_name, units || 3, lec_hours || null, lab_hours || null, subject_type || null]
    );

    res.status(201).json({ message: 'Subject created successfully', subject_code });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Subject code already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /:code - Update subject
router.put('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { subject_name, units, lec_hours, lab_hours, subject_type } = req.body;

    const [result] = await pool.query(
      `UPDATE subjects SET subject_name = COALESCE(?, subject_name), units = COALESCE(?, units),
        lec_hours = COALESCE(?, lec_hours), lab_hours = COALESCE(?, lab_hours),
        subject_type = COALESCE(?, subject_type)
       WHERE subject_code = ?`,
      [subject_name, units, lec_hours, lab_hours, subject_type, code]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Subject not found' });
    res.json({ message: 'Subject updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:code - Delete subject
router.delete('/:code', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM subjects WHERE subject_code = ?', [req.params.code]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Subject not found' });
    res.json({ message: 'Subject deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
