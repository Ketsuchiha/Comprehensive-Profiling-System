const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await pool.query('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);

    const { password_hash, ...userInfo } = user;
    res.json({ message: 'Login successful', user: userInfo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /register
router.post('/register', async (req, res) => {
  try {
    const { ref_id, user_type, username, password } = req.body;
    if (!username || !password || !user_type) {
      return res.status(400).json({ error: 'username, password, and user_type are required' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (ref_id, user_type, username, password_hash) VALUES (?, ?, ?, ?)',
      [ref_id || null, user_type, username, password_hash]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: { user_id: result.insertId, ref_id, user_type, username, is_active: 1 }
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Username or ref_id already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
