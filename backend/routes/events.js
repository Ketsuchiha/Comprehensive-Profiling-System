const express = require('express');
const router = express.Router();
const pool = require('../config/db');

function parsePagination(query) {
  const hasPagination = query.page !== undefined || query.limit !== undefined;
  if (!hasPagination) return null;

  const pageValue = Number.parseInt(String(query.page || '1'), 10);
  const limitValue = Number.parseInt(String(query.limit || '10'), 10);

  const page = Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1;
  const limit = Number.isFinite(limitValue) && limitValue > 0
    ? Math.min(limitValue, 10)
    : 10;

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

function buildEventFilterClause(query) {
  const conditions = [];
  const params = [];

  const search = typeof query.search === 'string' ? query.search.trim() : '';
  if (search) {
    const pattern = `%${search}%`;
    conditions.push("(e.title LIKE ? OR COALESCE(e.description, '') LIKE ? OR COALESCE(e.venue, '') LIKE ?)");
    params.push(pattern, pattern, pattern);
  }

  const status = typeof query.status === 'string' ? query.status.trim() : '';
  if (status) {
    conditions.push('e.status = ?');
    params.push(status);
  }

  const type = typeof query.type === 'string' ? query.type.trim().toLowerCase() : '';
  if (type && type !== 'all') {
    if (type === 'seminar') {
      conditions.push('e.event_type = ?');
      params.push('Seminar');
    } else if (type === 'conference') {
      conditions.push('e.event_type = ?');
      params.push('Academic');
    } else if (type === 'workshop') {
      conditions.push('e.event_type IN (?, ?, ?)');
      params.push('Sports', 'Cultural', 'Organizational');
    } else if (type === 'meeting') {
      conditions.push('e.event_type = ?');
      params.push('Other');
    }
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { whereClause, params };
}

// ─── EVENTS CRUD ────────────────────────────────────────────────

// GET / - List all events with participant count
router.get('/', async (req, res) => {
  try {
    const pagination = parsePagination(req.query || {});
    const { whereClause, params } = buildEventFilterClause(req.query || {});

    if (!pagination) {
      const [rows] = await pool.query(
        `SELECT e.*, COUNT(ep.participation_id) AS participant_count
         FROM events e
         LEFT JOIN event_participants ep ON e.event_id = ep.event_id
         ${whereClause}
         GROUP BY e.event_id
         ORDER BY e.start_date DESC`,
        params
      );
      return res.json(rows);
    }

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total
       FROM events e
       ${whereClause}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT e.*, COUNT(ep.participation_id) AS participant_count
       FROM events e
       LEFT JOIN event_participants ep ON e.event_id = ep.event_id
       ${whereClause}
       GROUP BY e.event_id
       ORDER BY e.start_date DESC
       LIMIT ${pagination.limit} OFFSET ${pagination.offset}`,
      params
    );

    const total = Number(countRows[0]?.total || 0);
    const totalPages = total === 0 ? 1 : Math.ceil(total / pagination.limit);

    res.json({
      data: rows,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /:id - Get single event with participants
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [event] = await pool.query('SELECT * FROM events WHERE event_id = ?', [id]);
    if (event.length === 0) return res.status(404).json({ error: 'Event not found' });

    const [participants] = await pool.query('SELECT * FROM event_participants WHERE event_id = ?', [id]);

    res.json({ ...event[0], participants });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST / - Create event
router.post('/', async (req, res) => {
  try {
    const { title, description, event_type, venue, start_date, end_date, organizer, is_mandatory, created_by, status } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const [result] = await pool.query(
      `INSERT INTO events (title, description, event_type, venue, start_date, end_date, organizer, is_mandatory, created_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description || null, event_type || null, venue || null, start_date || null, end_date || null,
       organizer || null, is_mandatory || 0, created_by || null, status || 'Upcoming']
    );

    res.status(201).json({ message: 'Event created successfully', event_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /:id - Update event
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, event_type, venue, start_date, end_date, organizer, is_mandatory, status } = req.body;

    const [result] = await pool.query(
      `UPDATE events SET title = COALESCE(?, title), description = COALESCE(?, description),
        event_type = COALESCE(?, event_type), venue = COALESCE(?, venue),
        start_date = COALESCE(?, start_date), end_date = COALESCE(?, end_date),
        organizer = COALESCE(?, organizer), is_mandatory = COALESCE(?, is_mandatory),
        status = COALESCE(?, status)
       WHERE event_id = ?`,
      [title, description, event_type, venue, start_date, end_date, organizer, is_mandatory, status, id]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /:id - Delete event
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM event_participants WHERE event_id = ?', [id]);
    const [result] = await pool.query('DELETE FROM events WHERE event_id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PARTICIPANTS ───────────────────────────────────────────────

// POST /:id/participants - Add participant
router.post('/:id/participants', async (req, res) => {
  try {
    const { id } = req.params;
    const { participant_id, participant_type, attendance } = req.body;

    const [result] = await pool.query(
      'INSERT INTO event_participants (event_id, participant_id, participant_type, attendance) VALUES (?, ?, ?, ?)',
      [id, participant_id, participant_type, attendance || 'Registered']
    );

    res.status(201).json({ message: 'Participant added', participation_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /participants/:participationId - Update attendance
router.put('/participants/:participationId', async (req, res) => {
  try {
    const { participationId } = req.params;
    const { attendance } = req.body;

    const [result] = await pool.query(
      'UPDATE event_participants SET attendance = ? WHERE participation_id = ?',
      [attendance, participationId]
    );

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Participant not found' });
    res.json({ message: 'Attendance updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /participants/:participationId - Remove participant
router.delete('/participants/:participationId', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM event_participants WHERE participation_id = ?', [req.params.participationId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Participant not found' });
    res.json({ message: 'Participant removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
