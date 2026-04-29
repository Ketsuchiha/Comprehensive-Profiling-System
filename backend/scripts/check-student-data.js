const pool = require('../config/db');

async function main() {
  const studentId = 'BULK26-000013';
  try {
    const [studentRows] = await pool.query(
      `SELECT s.student_id, s.first_name, s.last_name, s.section, sa.section AS academic_section
       FROM students s
       LEFT JOIN student_academic sa ON sa.student_id = s.student_id
       WHERE s.student_id = ?`,
      [studentId]
    );

    const [courseRows] = await pool.query(
      `SELECT subject_code FROM student_course_assignments WHERE student_id = ? ORDER BY subject_code`,
      [studentId]
    );

    const [scheduleRows] = await pool.query(
      `SELECT schedule_id, section, subject_code, faculty_id, day_of_week, start_time, end_time
       FROM schedules
       WHERE section = COALESCE((SELECT NULLIF(section, '') FROM students WHERE student_id = ?), (SELECT section FROM student_academic WHERE student_id = ?))
       ORDER BY day_of_week, start_time`,
      [studentId, studentId]
    );

    console.log('Student:');
    console.table(studentRows);
    console.log('Assigned courses:');
    console.table(courseRows);
    console.log('Schedules for student section:');
    console.table(scheduleRows);
  } catch (error) {
    console.error(error.message);
  } finally {
    process.exit(0);
  }
}

main();
