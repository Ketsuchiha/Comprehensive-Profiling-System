const mysql = require('mysql2/promise');

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ccs113',
    port: parseInt(process.env.DB_PORT || '3306', 10),
  });

  const tables = ['students', 'student_academic', 'student_course_assignments', 'faculty', 'faculty_employment'];
  for (const table of tables) {
    const [rows] = await pool.query(`SELECT COUNT(*) AS c FROM ${table}`);
    console.log(`${table}: ${rows[0].c}`);
  }

  const [bulkStudents] = await pool.query("SELECT COUNT(*) AS c FROM students WHERE student_id LIKE 'BULK26-%'");
  const [bulkFaculty] = await pool.query("SELECT COUNT(*) AS c FROM faculty WHERE faculty_id LIKE 'FBULK26%'");

  console.log(`bulk_students: ${bulkStudents[0].c}`);
  console.log(`bulk_faculty: ${bulkFaculty[0].c}`);

  await pool.end();
}

main().catch((err) => {
  console.error('COUNT_ERR', err.message);
  process.exit(1);
});
