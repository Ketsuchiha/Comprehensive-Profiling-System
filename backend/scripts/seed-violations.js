#!/usr/bin/env node

const pool = require('../config/db');

async function seedViolations() {
  let connection;
  try {
    connection = await pool.getConnection();

    // First, get real student IDs from the database
    const [students] = await connection.execute('SELECT student_id FROM students LIMIT 20');
    
    if (students.length === 0) {
      console.warn('⚠ No students found in database. Cannot seed violations without valid student IDs.');
      console.log('Run the student seeding script first to populate the students table.');
      connection.release();
      await pool.end();
      return;
    }

    const studentIds = students.map(s => s.student_id);
    console.log(`✓ Found ${studentIds.length} students. Using these for seeding violations...`);
    studentIds.forEach((id, idx) => {
      if (idx < 5) console.log(`  - ${id}`);
    });
    if (studentIds.length > 5) console.log(`  ... and ${studentIds.length - 5} more`);

    // Use the real student IDs in the test data
    const violationTemplates = [
      // Active violations
      { idx: 0, violation_type: 'Attendance', subject_context: 'CCS113 - Object Oriented Programming', description: 'Absent for 3 consecutive sessions without notice', severity: 'Minor', status: 'Active', incident_date: '2026-04-20 10:00:00', reported_by: 'Dr. Maria Santos' },
      { idx: 1, violation_type: 'Cheating', subject_context: 'CCS113 - Object Oriented Programming', description: 'Suspected plagiarism on midterm exam', severity: 'Serious', status: 'Active', incident_date: '2026-04-19 14:30:00', reported_by: 'Prof. John Cruz' },
      { idx: 2, violation_type: 'Late Submission', subject_context: 'CCS113 - Object Oriented Programming', description: 'Project submission 5 days late without valid reason', severity: 'Minor', status: 'Active', incident_date: '2026-04-21 09:15:00', reported_by: 'Dr. Maria Santos' },
      { idx: 3, violation_type: 'Disruptive Behavior', subject_context: 'IT 401 - Systems Administration', description: 'Interrupting lectures and arguing with instructor', severity: 'Warning', status: 'Active', incident_date: '2026-04-18 11:45:00', reported_by: 'Prof. Robert Lee' },
      { idx: 4, violation_type: 'Academic Dishonesty', subject_context: 'CCS113 - Object Oriented Programming', description: 'Unauthorized collaboration on individual assignment', severity: 'Major', status: 'Active', incident_date: '2026-04-22 08:30:00', reported_by: 'Dr. Maria Santos' },
      
      // Resolved violations
      { idx: 5, violation_type: 'Attendance', subject_context: 'CCS113 - Object Oriented Programming', description: 'Absent for 2 sessions. Student provided medical certificate.', severity: 'Minor', status: 'Resolved', incident_date: '2026-04-15 10:00:00', reported_by: 'Dr. Maria Santos' },
      { idx: 6, violation_type: 'Late Submission', subject_context: 'IT 301 - Database Design', description: 'Assignment submitted 2 days late. Extension was granted.', severity: 'Minor', status: 'Resolved', incident_date: '2026-04-16 15:20:00', reported_by: 'Prof. Sarah Wilson' },
      { idx: 7, violation_type: 'Improper Conduct', subject_context: 'CCS113 - Object Oriented Programming', description: 'Disrespectful language during class discussion. Student apologized.', severity: 'Warning', status: 'Resolved', incident_date: '2026-04-14 13:00:00', reported_by: 'Dr. Maria Santos' },
      
      // Dismissed violations
      { idx: 8, violation_type: 'Attendance', subject_context: 'IT 205 - Network Basics', description: 'Flagged as absent but was present - system error', severity: 'Minor', status: 'Dismissed', incident_date: '2026-04-17 10:00:00', reported_by: 'System Admin' },
      { idx: 9, violation_type: 'Code Quality', subject_context: 'CCS113 - Object Oriented Programming', description: 'Initial concern about naming conventions resolved after code review', severity: 'Minor', status: 'Dismissed', incident_date: '2026-04-12 16:45:00', reported_by: 'Dr. Maria Santos' },
      
      // Additional violations
      { idx: 10, violation_type: 'Incomplete Assignment', subject_context: 'CCS113 - Object Oriented Programming', description: 'Submitted incomplete project without explanation', severity: 'Warning', status: 'Active', incident_date: '2026-04-23 11:00:00', reported_by: 'Dr. Maria Santos' },
      { idx: 11, violation_type: 'Attendance', subject_context: 'IT 401 - Systems Administration', description: 'Absent from practical session', severity: 'Minor', status: 'Active', incident_date: '2026-04-24 09:30:00', reported_by: 'Prof. Robert Lee' },
      { idx: 12, violation_type: 'Plagiarism', subject_context: 'CCS113 - Object Oriented Programming', description: 'Portion of code found in online repository', severity: 'Serious', status: 'Resolved', incident_date: '2026-04-13 14:00:00', reported_by: 'Prof. John Cruz' },
      { idx: 13, violation_type: 'Disruptive Behavior', subject_context: 'IT 301 - Database Design', description: 'Excessive phone usage during class', severity: 'Minor', status: 'Dismissed', incident_date: '2026-04-11 10:15:00', reported_by: 'Prof. Sarah Wilson' },
      { idx: 14, violation_type: 'Missed Deadline', subject_context: 'CCS113 - Object Oriented Programming', description: 'Final project not submitted by deadline', severity: 'Major', status: 'Active', incident_date: '2026-04-25 23:59:00', reported_by: 'Dr. Maria Santos' },
      { idx: 15, violation_type: 'Cheating', subject_context: 'IT 205 - Network Basics', description: 'Copying answers from peer during quiz', severity: 'Serious', status: 'Resolved', incident_date: '2026-04-10 10:30:00', reported_by: 'Prof. Andrew Martinez' },
      { idx: 16, violation_type: 'Attendance', subject_context: 'CCS113 - Object Oriented Programming', description: 'Skipped class on exam day', severity: 'Major', status: 'Active', incident_date: '2026-04-26 09:00:00', reported_by: 'Dr. Maria Santos' },
      { idx: 17, violation_type: 'Late Submission', subject_context: 'IT 401 - Systems Administration', description: 'Lab report submitted 1 week late', severity: 'Minor', status: 'Resolved', incident_date: '2026-04-09 17:30:00', reported_by: 'Prof. Robert Lee' },
    ];

    let count = 0;
    for (const template of violationTemplates) {
      // Cycle through students if we have fewer students than violations
      const studentIdx = template.idx % studentIds.length;
      const studentId = studentIds[studentIdx];

      try {
        await connection.execute(
          `INSERT INTO student_violations (student_id, violation_type, subject_context, description, severity, status, incident_date, reported_by) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [studentId, template.violation_type, template.subject_context, template.description, template.severity, template.status, template.incident_date, template.reported_by]
        );
        count++;
        console.log(`✓ Inserted: ${studentId} - ${template.violation_type}`);
      } catch (err) {
        console.error(`✗ Error inserting ${studentId}:`, err.message);
      }
    }

    console.log(`\n✓ Successfully inserted ${count} violations`);

    // Verify the data
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM student_violations');
    console.log(`✓ Total violations in database: ${rows[0].count}`);

    // Show summary by status
    const [summary] = await connection.execute(`
      SELECT status, COUNT(*) as count FROM student_violations GROUP BY status ORDER BY status
    `);
    console.log('\nViolations by status:');
    summary.forEach(row => {
      console.log(`  - ${row.status}: ${row.count}`);
    });

    // Show sample by severity
    const [severity] = await connection.execute(`
      SELECT severity, COUNT(*) as count FROM student_violations GROUP BY severity ORDER BY severity
    `);
    console.log('\nViolations by severity:');
    severity.forEach(row => {
      console.log(`  - ${row.severity}: ${row.count}`);
    });

  } catch (err) {
    console.error('Fatal error:', err.message);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
    await pool.end();
  }
}

seedViolations();
