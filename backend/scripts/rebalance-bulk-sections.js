const mysql = require('mysql2/promise');

const SECTION_TARGET_SIZE = 50;
const SECTION_HARD_LIMIT = 54;
const YEAR_PATTERN = [1, 2, 2, 3, 4, 1, 3];
const SECTION_POOLS_BY_YEAR = {
  1: ['IT-1A', 'IT-1B', 'IT-1C', 'CS-1A', 'CS-1B'],
  2: ['IT-2A', 'IT-2B', 'IT-2C', 'IT-2D'],
  3: ['IT-3A', 'IT-3B', 'IT-3C', 'CS-3A', 'CS-3B'],
  4: ['IT-4A', 'IT-4B', 'IT-4C'],
};

function createOverflowSection(year, pool, sectionCounts) {
  const prefix = `IT-${year}`;
  let index = pool.length;

  while (index < 26) {
    const letter = String.fromCharCode(65 + index);
    const candidate = `${prefix}${letter}`;
    if (!sectionCounts.has(candidate)) {
      pool.push(candidate);
      sectionCounts.set(candidate, 0);
      return candidate;
    }
    index += 1;
  }

  return pool[0];
}

function pickSectionForYear(year, sectionCounts) {
  const pool = SECTION_POOLS_BY_YEAR[year] || ['IT-1A'];

  for (const section of pool) {
    if (!sectionCounts.has(section)) sectionCounts.set(section, 0);
  }

  const sortedPool = [...pool].sort((a, b) => (sectionCounts.get(a) || 0) - (sectionCounts.get(b) || 0));
  let chosen = sortedPool.find((section) => (sectionCounts.get(section) || 0) < SECTION_TARGET_SIZE);

  if (!chosen) {
    chosen = sortedPool.find((section) => (sectionCounts.get(section) || 0) < SECTION_HARD_LIMIT);
  }

  if (!chosen) {
    chosen = createOverflowSection(year, pool, sectionCounts);
  }

  sectionCounts.set(chosen, (sectionCounts.get(chosen) || 0) + 1);
  return chosen;
}

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ccs113',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  const conn = await pool.getConnection();

  try {
    const [fixedRows] = await conn.query(
      `SELECT section, COUNT(*) AS c
       FROM students
       WHERE student_id NOT LIKE 'BULK26-%'
         AND section IS NOT NULL
         AND TRIM(section) <> ''
       GROUP BY section`
    );

    const [rows] = await conn.query(
      `SELECT st.student_id,
              COALESCE(sa.year_level, 1) AS year_level
       FROM students st
       LEFT JOIN student_academic sa ON sa.student_id = st.student_id
       WHERE st.student_id LIKE 'BULK26-%'
       ORDER BY st.student_id`
    );

    if (rows.length === 0) {
      console.log('No BULK26 students found.');
      conn.release();
      await pool.end();
      return;
    }

    await conn.beginTransaction();

    const sectionCounts = new Map();
    for (const row of fixedRows) {
      sectionCounts.set(row.section, Number(row.c) || 0);
    }

    let updated = 0;

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];
      let year = Number(row.year_level) || YEAR_PATTERN[i % YEAR_PATTERN.length];
      if (year < 1 || year > 4) year = YEAR_PATTERN[i % YEAR_PATTERN.length];

      const section = pickSectionForYear(year, sectionCounts);
      const studentId = row.student_id;

      await conn.query('UPDATE students SET section = ? WHERE student_id = ?', [section, studentId]);
      await conn.query('UPDATE student_academic SET section = ?, year_level = ? WHERE student_id = ?', [section, year, studentId]);
      updated += 1;
    }

    await conn.commit();

    const maxSectionSize = Math.max(...Array.from(sectionCounts.values()));
    console.log(`Rebalanced BULK26 students: ${updated}`);
    console.log(`Largest section size after rebalance: ${maxSectionSize}`);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('REBALANCE_ERR', err.message);
  process.exit(1);
});
