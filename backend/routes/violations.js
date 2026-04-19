const express = require('express');
const router = express.Router();
const pool = require('../config/db');

function normalizeOptionalText(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function normalizeRequiredText(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function normalizeDateInput(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

function normalizeSeverity(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (!normalized) return null;
  const allowed = new Set(['Minor', 'Warning', 'Serious', 'Major']);
  return allowed.has(normalized) ? normalized : null;
}

function normalizeStatus(value) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (!normalized) return null;
  const allowed = new Set(['Active', 'Resolved', 'Dismissed']);
  return allowed.has(normalized) ? normalized : null;
}

// GET / - List violations (optional filters: student_id, status)
router.get('/', async (req, res) => {
  try {
    const { student_id, status, limit } = req.query;
    const clauses = [];
    const params = [];

    if (student_id) {
      clauses.push('sv.student_id = ?');
      params.push(String(student_id).trim());
    }

    const normalizedStatus = normalizeStatus(status);
    if (status && !normalizedStatus) {
      return res.status(400).json({ error: 'status must be Active, Resolved, or Dismissed' });
    }
    if (normalizedStatus) {
      clauses.push('sv.status = ?');
      params.push(normalizedStatus);
    }

    let sql =
      `SELECT sv.*, s.first_name, s.last_name
       FROM student_violations sv
       LEFT JOIN students s ON s.student_id = sv.student_id`;

    if (clauses.length > 0) {
      sql += ` WHERE ${clauses.join(' AND ')}`;
    }

    sql += ' ORDER BY sv.incident_date DESC, sv.violation_id DESC';

    const parsedLimit = Number(limit);
    if (Number.isInteger(parsedLimit) && parsedLimit > 0 && parsedLimit <= 200) {
      sql += ' LIMIT ?';
      params.push(parsedLimit);
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /student/:studentId - List one student's violations
router.get('/student/:studentId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT *
       FROM student_violations
       WHERE student_id = ?
       ORDER BY incident_date DESC, violation_id DESC`,
      [req.params.studentId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - Get single violation
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM student_violations WHERE violation_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Violation not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - Create violation
router.post('/', async (req, res) => {
  try {
    const {
      student_id,
      violation_type,
      subject_context,
      description,
      severity,
      status,
      incident_date,
      reported_by,
    } = req.body;

    const normalizedStudentId = normalizeRequiredText(student_id);
    const normalizedViolationType = normalizeRequiredText(violation_type);
    const normalizedIncidentDate = normalizeDateInput(incident_date);

    if (!normalizedStudentId || !normalizedViolationType || !normalizedIncidentDate) {
      return res.status(400).json({
        error: 'student_id, violation_type, and incident_date (YYYY-MM-DD) are required',
      });
    }

    const normalizedSeverity = severity ? normalizeSeverity(severity) : 'Warning';
    if (severity && !normalizedSeverity) {
      return res.status(400).json({ error: 'severity must be Minor, Warning, Serious, or Major' });
    }

    const normalizedStatus = status ? normalizeStatus(status) : 'Active';
    if (status && !normalizedStatus) {
      return res.status(400).json({ error: 'status must be Active, Resolved, or Dismissed' });
    }

    const [result] = await pool.query(
      `INSERT INTO student_violations
        (student_id, violation_type, subject_context, description, severity, status, incident_date, reported_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        normalizedStudentId,
        normalizedViolationType,
        normalizeOptionalText(subject_context),
        normalizeOptionalText(description),
        normalizedSeverity,
        normalizedStatus,
        normalizedIncidentDate,
        normalizeOptionalText(reported_by),
      ]
    );

    res.status(201).json({ message: 'Violation added successfully', violation_id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'Student record does not exist' });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - Update violation
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      violation_type,
      subject_context,
      description,
      severity,
      status,
      incident_date,
      reported_by,
    } = req.body;

    const normalizedSeverity = severity === undefined ? undefined : normalizeSeverity(severity);
    if (severity !== undefined && severity !== null && !normalizedSeverity) {
      return res.status(400).json({ error: 'severity must be Minor, Warning, Serious, or Major' });
    }

    const normalizedStatus = status === undefined ? undefined : normalizeStatus(status);
    if (status !== undefined && status !== null && !normalizedStatus) {
      return res.status(400).json({ error: 'status must be Active, Resolved, or Dismissed' });
    }

    const normalizedIncidentDate = incident_date === undefined
      ? undefined
      : (incident_date === null ? null : normalizeDateInput(incident_date));
    if (incident_date !== undefined && incident_date !== null && !normalizedIncidentDate) {
      return res.status(400).json({ error: 'incident_date must be in YYYY-MM-DD format' });
    }

    const [result] = await pool.query(
      `UPDATE student_violations
       SET violation_type = COALESCE(?, violation_type),
           subject_context = COALESCE(?, subject_context),
           description = COALESCE(?, description),
           severity = COALESCE(?, severity),
           status = COALESCE(?, status),
           incident_date = COALESCE(?, incident_date),
           reported_by = COALESCE(?, reported_by),
           updated_at = NOW()
       WHERE violation_id = ?`,
      [
        typeof violation_type === 'string' ? violation_type.trim() : violation_type,
        typeof subject_context === 'string' ? subject_context.trim() : subject_context,
        typeof description === 'string' ? description.trim() : description,
        normalizedSeverity,
        normalizedStatus,
        normalizedIncidentDate,
        typeof reported_by === 'string' ? reported_by.trim() : reported_by,
        id,
      ]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Violation not found' });

    res.json({ message: 'Violation updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - Delete violation
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM student_violations WHERE violation_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Violation not found' });
    res.json({ message: 'Violation deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
