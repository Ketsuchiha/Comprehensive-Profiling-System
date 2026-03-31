const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/db');

function normalizeUserType(userType) {
  if (!userType) return 'Admin';
  const normalized = String(userType).trim().toLowerCase();
  if (normalized === 'teacher') return 'Faculty';
  if (normalized === 'faculty') return 'Faculty';
  if (normalized === 'student') return 'Student';
  return 'Admin';
}

function generateRefId(userType) {
  const prefix = String(userType || 'Admin').slice(0, 3).toUpperCase();
  const randomPart = crypto.randomBytes(2).toString('hex');
  return `${prefix}-${Date.now().toString(36)}-${randomPart}`.slice(0, 20);
}

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
    const resolvedUserType = normalizeUserType(user_type);

    const providedRefId = typeof ref_id === 'string' ? ref_id.trim() : '';
    const resolvedRefId = providedRefId || generateRefId(resolvedUserType);
    if (resolvedRefId.length > 20) {
      return res.status(400).json({ error: 'ref_id must be 20 characters or fewer' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (ref_id, user_type, username, password_hash) VALUES (?, ?, ?, ?)',
      [resolvedRefId, resolvedUserType, username, password_hash]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: { user_id: result.insertId, ref_id: resolvedRefId, user_type: resolvedUserType, username, is_active: 1 }
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      if (err.sqlMessage && err.sqlMessage.includes("'username'")) {
        return res.status(409).json({ error: 'Email already exists' });
      }
      if (err.sqlMessage && err.sqlMessage.includes("'ref_id'")) {
        return res.status(409).json({ error: 'Reference ID already exists' });
      }
      return res.status(409).json({ error: 'Account already exists' });
    }
    if (err.code === 'ER_BAD_NULL_ERROR' || err.code === 'ER_DATA_TOO_LONG') {
      return res.status(400).json({ error: 'Invalid registration data' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
