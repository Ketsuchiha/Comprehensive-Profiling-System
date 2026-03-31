const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET / - List all departments
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM departments ORDER BY dept_name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - Get single department
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM departments WHERE dept_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Department not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - Create department
router.post('/', async (req, res) => {
  try {
    const { dept_name } = req.body;
    if (!dept_name) return res.status(400).json({ error: 'dept_name is required' });

    const [result] = await pool.query('INSERT INTO departments (dept_name) VALUES (?)', [dept_name]);
    res.status(201).json({ message: 'Department created successfully', dept_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - Update department
router.put('/:id', async (req, res) => {
  try {
    const { dept_name } = req.body;
    const [result] = await pool.query('UPDATE departments SET dept_name = ? WHERE dept_id = ?', [dept_name, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Department not found' });
    res.json({ message: 'Department updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - Delete department
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM departments WHERE dept_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Department not found' });
    res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
