const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET / - List all rooms
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM rooms ORDER BY building, room_name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - Get single room
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM rooms WHERE room_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Room not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - Create room
router.post('/', async (req, res) => {
  try {
    const { room_name, building, capacity, room_type } = req.body;
    if (!room_name) return res.status(400).json({ error: 'room_name is required' });

    const [result] = await pool.query(
      'INSERT INTO rooms (room_name, building, capacity, room_type) VALUES (?, ?, ?, ?)',
      [room_name, building || null, capacity || null, room_type || null]
    );

    res.status(201).json({ message: 'Room created successfully', room_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - Update room
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { room_name, building, capacity, room_type } = req.body;

    const [result] = await pool.query(
      `UPDATE rooms SET room_name = COALESCE(?, room_name), building = COALESCE(?, building),
        capacity = COALESCE(?, capacity), room_type = COALESCE(?, room_type)
       WHERE room_id = ?`,
      [room_name, building, capacity, room_type, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Room not found' });
    res.json({ message: 'Room updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - Delete room
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM rooms WHERE room_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Room not found' });
    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
