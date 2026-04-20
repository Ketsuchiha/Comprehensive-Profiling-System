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
app.use('/api/violations', require('./routes/violations'));

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

async function ensureStudentSectionColumn() {
  try {
    const [rows] = await pool.query(
      `SELECT 1
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'students'
         AND COLUMN_NAME = 'section'
       LIMIT 1`
    );

    if (rows.length === 0) {
      await pool.query('ALTER TABLE students ADD COLUMN section varchar(20) DEFAULT NULL AFTER student_id');
      await pool.query('ALTER TABLE students ADD KEY idx_students_section (section)');
      console.log('Applied schema update: added students.section column');
    }
  } catch (err) {
    console.warn(`Schema check skipped: ${err.message}`);
  }
}

async function ensureFacultyAssignedSectionColumn() {
  try {
    const [rows] = await pool.query(
      `SELECT 1
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'faculty_employment'
         AND COLUMN_NAME = 'assigned_section'
       LIMIT 1`
    );

    if (rows.length === 0) {
      await pool.query('ALTER TABLE faculty_employment ADD COLUMN assigned_section varchar(20) DEFAULT NULL AFTER department_id');
      console.log('Applied schema update: added faculty_employment.assigned_section column');
    }
  } catch (err) {
    console.warn(`Schema check skipped: ${err.message}`);
  }
}

async function ensureStudentViolationsTable() {
  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS student_violations (
        violation_id int(11) NOT NULL AUTO_INCREMENT,
        student_id varchar(20) NOT NULL,
        violation_type varchar(120) NOT NULL,
        subject_context varchar(120) DEFAULT NULL,
        description text DEFAULT NULL,
        severity enum('Minor','Warning','Serious','Major') DEFAULT 'Warning',
        status enum('Active','Resolved','Dismissed') DEFAULT 'Active',
        incident_date date NOT NULL,
        reported_by varchar(100) DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (violation_id),
        KEY student_id (student_id),
        KEY status (status),
        KEY incident_date (incident_date),
        CONSTRAINT student_violations_ibfk_1 FOREIGN KEY (student_id)
          REFERENCES students (student_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`
    );
  } catch (err) {
    console.warn(`Schema check skipped: ${err.message}`);
  }
}

async function applySchemaUpdates() {
  await ensureStudentSkillsColumn();
  await ensureStudentSectionColumn();
  await ensureFacultyAssignedSectionColumn();
  await ensureStudentViolationsTable();
}

applySchemaUpdates().finally(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

module.exports = app;
