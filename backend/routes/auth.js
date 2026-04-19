const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/db');

function isDatabaseConnectionError(err) {
  if (!err) return false;
  const message = String(err.message || '').toLowerCase();
  return (
    err.code === 'ECONNREFUSED' ||
    err.code === 'PROTOCOL_CONNECTION_LOST' ||
    message.includes('econnrefused') ||
    message.includes('connection lost')
  );
}

function normalizeUserType(userType) {
  if (!userType) return null;
  const normalized = String(userType).trim().toLowerCase();
  if (normalized === 'teacher') return 'Faculty';
  if (normalized === 'faculty') return 'Faculty';
  if (normalized === 'student') return 'Student';
  if (normalized === 'admin') return 'Admin';
  return null;
}

function generateRefId(userType) {
  const normalizedType = normalizeUserType(userType) || 'Admin';
  const prefix = String(normalizedType).slice(0, 3).toUpperCase();
  const randomPart = crypto.randomBytes(2).toString('hex');
  return `${prefix}-${Date.now().toString(36)}-${randomPart}`.slice(0, 20);
}

function formatDateAsLocalYYYYMMDD(value) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateStudentTempPasswords(student) {
  const birthDate = formatDateAsLocalYYYYMMDD(student && student.birth_date);
  const middleInitial = (student && typeof student.middle_name === 'string' && student.middle_name.trim())
    ? student.middle_name.trim().charAt(0).toUpperCase()
    : 'X';
  const lastInitial = (student && typeof student.last_name === 'string' && student.last_name.trim())
    ? student.last_name.trim().charAt(0).toUpperCase()
    : 'X';

  return new Set([
    `${lastInitial}${birthDate}`,
    `${middleInitial}${birthDate}`,
  ]);
}

function isStrongEnoughPassword(password) {
  return typeof password === 'string' && password.length >= 8;
}

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const normalizedUsername = String(username).trim().toLowerCase();

    const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(TRIM(username)) = ?', [normalizedUsername]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    let isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch && user.user_type === 'Student') {
      const [studentRows] = await pool.query(
        'SELECT birth_date, middle_name, last_name FROM students WHERE student_id = ? LIMIT 1',
        [user.ref_id]
      );

      if (studentRows.length > 0) {
        const validTempPasswords = generateStudentTempPasswords(studentRows[0]);
        if (validTempPasswords.has(password)) {
          const salt = await bcrypt.genSalt(10);
          const password_hash = await bcrypt.hash(password, salt);
          await pool.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [password_hash, user.user_id]);
          isMatch = true;
        }
      }
    }

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await pool.query('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);

    let displayName = user.username;
    if (user.user_type === 'Faculty') {
      const [facultyRows] = await pool.query(
        'SELECT first_name, middle_name, last_name FROM faculty WHERE faculty_id = ? LIMIT 1',
        [user.ref_id]
      );
      if (facultyRows.length > 0) {
        const faculty = facultyRows[0];
        displayName = [faculty.first_name, faculty.middle_name, faculty.last_name]
          .filter(Boolean)
          .join(' ')
          .trim() || displayName;
      }
    } else if (user.user_type === 'Student') {
      const [studentRows] = await pool.query(
        'SELECT first_name, middle_name, last_name FROM students WHERE student_id = ? LIMIT 1',
        [user.ref_id]
      );
      if (studentRows.length > 0) {
        const student = studentRows[0];
        displayName = [student.first_name, student.middle_name, student.last_name]
          .filter(Boolean)
          .join(' ')
          .trim() || displayName;
      }
    }

    const { password_hash, ...userInfo } = user;
    res.json({
      message: 'Login successful',
      user: {
        ...userInfo,
        display_name: displayName,
      },
    });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return res.status(503).json({ error: 'Database is currently unavailable. Please try again in a moment.' });
    }
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
    if (!resolvedUserType) {
      return res.status(400).json({ error: 'user_type must be Admin, Teacher, Faculty, or Student' });
    }

    const providedRefId = typeof ref_id === 'string' ? ref_id.trim() : '';
    const resolvedRefId = providedRefId || generateRefId(resolvedUserType);
    if (resolvedRefId.length > 20) {
      return res.status(400).json({ error: 'ref_id must be 20 characters or fewer' });
    }

    const normalizedUsername = String(username).trim().toLowerCase();

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (ref_id, user_type, username, password_hash) VALUES (?, ?, ?, ?)',
      [resolvedRefId, resolvedUserType, normalizedUsername, password_hash]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: { user_id: result.insertId, ref_id: resolvedRefId, user_type: resolvedUserType, username: normalizedUsername, is_active: 1 }
    });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return res.status(503).json({ error: 'Database is currently unavailable. Please try again in a moment.' });
    }
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

// POST /change-password
router.post('/change-password', async (req, res) => {
  try {
    const { ref_id, current_password, new_password, user_type } = req.body;

    if (!ref_id || !current_password || !new_password) {
      return res.status(400).json({ error: 'ref_id, current_password, and new_password are required' });
    }

    if (!isStrongEnoughPassword(new_password)) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    if (current_password === new_password) {
      return res.status(400).json({ error: 'New password must be different from current password' });
    }

    const normalizedRefId = String(ref_id).trim();
    const expectedUserType = user_type ? normalizeUserType(user_type) : null;

    const [rows] = await pool.query('SELECT * FROM users WHERE ref_id = ? LIMIT 1', [normalizedRefId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User account not found' });
    }

    const user = rows[0];
    if (expectedUserType && user.user_type !== expectedUserType) {
      return res.status(403).json({ error: 'User account type mismatch' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    let currentPasswordMatches = await bcrypt.compare(current_password, user.password_hash);

    // Keep support for first-login student temp passwords, then promote to hashed password.
    if (!currentPasswordMatches && user.user_type === 'Student') {
      const [studentRows] = await pool.query(
        'SELECT birth_date, middle_name, last_name FROM students WHERE student_id = ? LIMIT 1',
        [user.ref_id]
      );

      if (studentRows.length > 0) {
        const validTempPasswords = generateStudentTempPasswords(studentRows[0]);
        currentPasswordMatches = validTempPasswords.has(current_password);
      }
    }

    if (!currentPasswordMatches) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(new_password, salt);
    await pool.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [password_hash, user.user_id]);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    if (isDatabaseConnectionError(err)) {
      return res.status(503).json({ error: 'Database is currently unavailable. Please try again in a moment.' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
