const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET / - List all schedules with joined info
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sc.*, s.subject_name, f.first_name AS faculty_first_name, f.last_name AS faculty_last_name,
        r.room_name, r.building
       FROM schedules sc
       LEFT JOIN subjects s ON sc.subject_code = s.subject_code
       LEFT JOIN faculty f ON sc.faculty_id = f.faculty_id
       LEFT JOIN rooms r ON sc.room_id = r.room_id
       ORDER BY sc.day_of_week, sc.start_time`
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
        r.room_name, r.building
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

    const [result] = await pool.query(
      `INSERT INTO schedules (subject_code, section, faculty_id, room_id, semester, academic_year, day_of_week, start_time, end_time, schedule_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [subject_code, section || null, faculty_id || null, room_id || null, semester || null,
       academic_year || null, day_of_week || null, start_time || null, end_time || null, schedule_type || null]
    );

    res.status(201).json({ message: 'Schedule created successfully', schedule_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - Update schedule
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_code, section, faculty_id, room_id, semester, academic_year, day_of_week, start_time, end_time, schedule_type } = req.body;

    const [result] = await pool.query(
      `UPDATE schedules SET subject_code = COALESCE(?, subject_code), section = COALESCE(?, section),
        faculty_id = COALESCE(?, faculty_id), room_id = COALESCE(?, room_id),
        semester = COALESCE(?, semester), academic_year = COALESCE(?, academic_year),
        day_of_week = COALESCE(?, day_of_week), start_time = COALESCE(?, start_time),
        end_time = COALESCE(?, end_time), schedule_type = COALESCE(?, schedule_type)
       WHERE schedule_id = ?`,
      [subject_code, section, faculty_id, room_id, semester, academic_year, day_of_week, start_time, end_time, schedule_type, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Schedule not found' });
    res.json({ message: 'Schedule updated successfully' });
  } catch (err) {
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
