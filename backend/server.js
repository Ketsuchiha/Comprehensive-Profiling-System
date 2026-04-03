const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'CCS Profiling System API is running' });
});

// Mount routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/curriculum', require('./routes/curriculum'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/events', require('./routes/events'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/research', require('./routes/research'));
app.use('/api/instruments', require('./routes/instruments'));

const PORT = process.env.PORT || 5000;

async function ensureStudentSkillsColumn() {
  try {
    const [rows] = await pool.query(
      `SELECT 1
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'students'
         AND COLUMN_NAME = 'skills'
       LIMIT 1`
    );

    if (rows.length === 0) {
      await pool.query('ALTER TABLE students ADD COLUMN skills TEXT NULL AFTER religion');
      console.log('Applied schema update: added students.skills column');
    }
  } catch (err) {
    console.warn(`Schema check skipped: ${err.message}`);
  }
}

ensureStudentSkillsColumn().finally(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

module.exports = app;
