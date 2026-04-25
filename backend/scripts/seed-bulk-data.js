const mysql = require('mysql2/promise');

const STUDENT_PASSWORD_HASH = '$2a$10$9NPVDCsePu1umcpd6qEZi.39g9D9KgOcTM4eosJ5yIKLjawk59nCK';
const FACULTY_PASSWORD_HASH = '$2a$10$9NPVDCsePu1umcpd6qEZi.39g9D9KgOcTM4eosJ5yIKLjawk59nCK';

const FIRST_NAMES_M = ['Liam', 'Noah', 'Ethan', 'Lucas', 'Mason', 'Aiden', 'Caleb', 'James', 'Isaac', 'Adrian'];
const FIRST_NAMES_F = ['Emma', 'Olivia', 'Mia', 'Ava', 'Sophia', 'Isabella', 'Ella', 'Amelia', 'Chloe', 'Grace'];
const MIDDLE_INITIALS = ['A.', 'B.', 'C.', 'D.', 'E.', 'F.', 'G.', 'H.', 'I.', 'J.'];
const LAST_NAMES = ['Santos', 'Reyes', 'Cruz', 'Garcia', 'Flores', 'Mendoza', 'Navarro', 'Torres', 'Bautista', 'Lopez'];
const CITIES = ['City A', 'City B', 'City C', 'City D', 'City E'];
const RELIGIONS = ['Roman Catholic', 'Christian', 'Iglesia ni Cristo'];
const SKILLS = ['Python, SQL', 'Java, Spring', 'Web Development, React', 'Networking, Linux', 'UI/UX, Figma'];

const SECTION_TARGET_SIZE = 50;
const SECTION_HARD_LIMIT = 54;
const YEAR_PATTERN = [1, 2, 2, 3, 4, 1, 3];
const SECTION_POOLS_BY_YEAR = {
  1: ['IT-1A', 'IT-1B', 'IT-1C', 'CS-1A', 'CS-1B'],
  2: ['IT-2A', 'IT-2B', 'IT-2C', 'IT-2D'],
  3: ['IT-3A', 'IT-3B', 'IT-3C', 'CS-3A', 'CS-3B'],
  4: ['IT-4A', 'IT-4B', 'IT-4C'],
};

function chunk(array, size) {
  const out = [];
  for (let i = 0; i < array.length; i += size) {
    out.push(array.slice(i, i + size));
  }
  return out;
}

function randFrom(arr, indexSeed) {
  return arr[indexSeed % arr.length];
}

function pad(n, len) {
  return String(n).padStart(len, '0');
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1, 2);
  const d = pad(date.getDate(), 2);
  return `${y}-${m}-${d}`;
}

function ageFromBirthDate(birthDate) {
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const hasHadBirthday =
    now.getMonth() > birthDate.getMonth() ||
    (now.getMonth() === birthDate.getMonth() && now.getDate() >= birthDate.getDate());
  if (!hasHadBirthday) age -= 1;
  return age;
}

function getTrackFromSection(section, year) {
  if (section.startsWith('CS-')) {
    return year <= 2 ? 'Software Engineering' : 'Data Science';
  }
  if (year === 1 || year === 4) return 'Web and Mobile';
  return 'Systems and Networking';
}

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
  return {
    section: chosen,
    year,
    track: getTrackFromSection(chosen, year),
  };
}

function buildSectionPlan(studentCount, startingCounts = new Map()) {
  const sectionCounts = new Map(startingCounts);
  const plan = [];

  for (let i = 0; i < studentCount; i += 1) {
    const year = YEAR_PATTERN[i % YEAR_PATTERN.length];
    plan.push(pickSectionForYear(year, sectionCounts));
  }

  return { plan, sectionCounts };
}

async function getExistingSectionCounts(pool) {
  const counts = new Map();
  const [rows] = await pool.query(
    `SELECT section, COUNT(*) AS c
     FROM students
     WHERE section IS NOT NULL AND TRIM(section) <> ''
     GROUP BY section`
  );

  for (const row of rows) {
    counts.set(row.section, Number(row.c) || 0);
  }

  return counts;
}

async function insertMany(pool, table, columns, rows) {
  if (!rows.length) return;
  const valuePlaceholders = `(${columns.map(() => '?').join(',')})`;

  for (const batch of chunk(rows, 200)) {
    const placeholders = batch.map(() => valuePlaceholders).join(',');
    const flat = batch.flat();
    const sql = `INSERT INTO ${table} (${columns.join(',')}) VALUES ${placeholders}`;
    await pool.query(sql, flat);
  }
}

async function getStartingNumbers(pool) {
  const [studentRows] = await pool.query(
    "SELECT student_id FROM students WHERE student_id LIKE 'BULK26-%' ORDER BY student_id DESC LIMIT 1"
  );
  const [facultyRows] = await pool.query(
    "SELECT faculty_id FROM faculty WHERE faculty_id LIKE 'FBULK26%' ORDER BY faculty_id DESC LIMIT 1"
  );

  const studentStart = studentRows.length
    ? Number(String(studentRows[0].student_id).split('-')[1]) + 1
    : 1;
  const facultyStart = facultyRows.length
    ? Number(String(facultyRows[0].faculty_id).replace('FBULK26', '')) + 1
    : 1;

  return { studentStart, facultyStart };
}

async function getSubjectPools(pool) {
  const [currRows] = await pool.query(
    `SELECT cs.year_level, cs.subject_code
     FROM curriculum_subjects cs
     INNER JOIN curriculum c ON c.curriculum_id = cs.curriculum_id
     WHERE c.program = 'BSIT' AND c.is_active = 1`
  );

  const byYear = new Map();
  for (const row of currRows) {
    const year = Number(row.year_level) || 1;
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year).push(row.subject_code);
  }

  const [allSubjectRows] = await pool.query('SELECT subject_code FROM subjects ORDER BY subject_code');
  const allSubjects = allSubjectRows.map((r) => r.subject_code);

  return {
    byYear,
    allSubjects,
  };
}

async function main() {
  const studentCount = Number(process.argv[2] || '1000');
  const facultyCount = Number(process.argv[3] || '100');

  if (!Number.isFinite(studentCount) || studentCount <= 0 || !Number.isFinite(facultyCount) || facultyCount <= 0) {
    throw new Error('Usage: node scripts/seed-bulk-data.js [studentCount] [facultyCount]');
  }

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
    const { studentStart, facultyStart } = await getStartingNumbers(pool);
    const { byYear, allSubjects } = await getSubjectPools(pool);
    const existingSectionCounts = await getExistingSectionCounts(pool);
    const { plan: sectionPlan, sectionCounts: finalSectionCounts } = buildSectionPlan(studentCount, existingSectionCounts);

    await conn.beginTransaction();

    const studentRows = [];
    const studentAcademicRows = [];
    const studentUserRows = [];
    const studentAssignmentRows = [];

    for (let i = 0; i < studentCount; i += 1) {
      const seq = studentStart + i;
      const studentId = `BULK26-${pad(seq, 6)}`;
      const sectionInfo = sectionPlan[i];
      const isFemale = i % 2 === 0;
      const firstName = isFemale ? randFrom(FIRST_NAMES_F, i) : randFrom(FIRST_NAMES_M, i);
      const middleName = randFrom(MIDDLE_INITIALS, i);
      const lastName = randFrom(LAST_NAMES, i + 3);
      const city = randFrom(CITIES, i + 7);
      const birthDate = new Date(2001 + (i % 7), (i * 3) % 12, ((i * 5) % 28) + 1);
      const birthDateStr = formatDate(birthDate);
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${seq}@student.ccs.edu.ph`;

      studentRows.push([
        studentId,
        sectionInfo.section,
        firstName,
        middleName,
        lastName,
        birthDateStr,
        isFemale ? 'Female' : 'Male',
        'Single',
        `+63915${pad(100000 + (seq % 900000), 6)}`,
        email,
        `${lastName.charAt(0)}${birthDateStr}`,
        `${city}, Laguna`,
        `${firstName} ${lastName} Sr.`,
        `+63917${pad(200000 + (seq % 700000), 6)}`,
        'Filipino',
        randFrom(RELIGIONS, i),
        randFrom(SKILLS, i),
      ]);

      studentAcademicRows.push([
        studentId,
        sectionInfo.section.startsWith('CS-') ? 'BSCS' : 'BSIT',
        null,
        sectionInfo.track,
        sectionInfo.year,
        sectionInfo.section,
        'Regular',
        'Enrolled',
        null,
        `${2027 - sectionInfo.year}-08-15`,
      ]);

      studentUserRows.push([
        studentId,
        'Student',
        email,
        STUDENT_PASSWORD_HASH,
        1,
      ]);

      const yearSubjects = byYear.get(sectionInfo.year) && byYear.get(sectionInfo.year).length
        ? byYear.get(sectionInfo.year)
        : allSubjects;

      const subjectCount = Math.min(5, yearSubjects.length || 0);
      for (let j = 0; j < subjectCount; j += 1) {
        const subjectCode = yearSubjects[(i + j) % yearSubjects.length];
        studentAssignmentRows.push([studentId, subjectCode]);
      }
    }

    const facultyRows = [];
    const facultyEmploymentRows = [];
    const facultyUserRows = [];

    for (let i = 0; i < facultyCount; i += 1) {
      const seq = facultyStart + i;
      const facultyId = `FBULK26${pad(seq, 4)}`;
      const isFemale = i % 3 !== 0;
      const firstName = isFemale ? randFrom(FIRST_NAMES_F, i + 11) : randFrom(FIRST_NAMES_M, i + 11);
      const middleName = randFrom(MIDDLE_INITIALS, i + 4);
      const lastName = randFrom(LAST_NAMES, i + 6);
      const birthDate = new Date(1978 + (i % 14), (i * 2) % 12, ((i * 7) % 28) + 1);
      const birthDateStr = formatDate(birthDate);
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${seq}@faculty.ccs.edu.ph`;

      facultyRows.push([
        facultyId,
        firstName,
        middleName,
        lastName,
        birthDateStr,
        ageFromBirthDate(birthDate),
        isFemale ? 'Female' : 'Male',
        email,
        `+63918${pad(300000 + (seq % 600000), 6)}`,
        `${randFrom(CITIES, i)}, Laguna`,
        randFrom([
          'Programming and Algorithms',
          'Web Development',
          'Systems and Databases',
          'Networking and Security',
          'HCI and Mobile Development',
          'General Education',
          'Capstone and Emerging Technologies',
        ], i),
        3 + (i % 18),
      ]);

      facultyEmploymentRows.push([
        facultyId,
        i % 5 === 0 ? 'Part-time' : 'Full-time',
        i % 3 === 0 ? 'Assistant Professor' : 'Instructor',
        null,
        `${2010 + (i % 14)}-06-01`,
        i % 4 === 0 ? 'Probationary' : 'Tenured',
      ]);

      facultyUserRows.push([
        facultyId,
        'Faculty',
        email,
        FACULTY_PASSWORD_HASH,
        1,
      ]);
    }

    await insertMany(conn, 'students', [
      'student_id', 'section', 'first_name', 'middle_name', 'last_name', 'birth_date', 'sex', 'civil_status',
      'contact_number', 'email', 'password', 'address', 'emergency_contact', 'emergency_contact_num',
      'nationality', 'religion', 'skills',
    ], studentRows);

    await insertMany(conn, 'student_academic', [
      'student_id', 'program', 'major', 'track', 'year_level', 'section',
      'admission_type', 'enrollment_status', 'scholarship_type', 'admission_date',
    ], studentAcademicRows);

    await insertMany(conn, 'users', [
      'ref_id', 'user_type', 'username', 'password_hash', 'is_active',
    ], studentUserRows);

    await insertMany(conn, 'student_course_assignments', [
      'student_id', 'subject_code',
    ], studentAssignmentRows);

    await insertMany(conn, 'faculty', [
      'faculty_id', 'first_name', 'middle_name', 'last_name', 'birth_date', 'age', 'gender',
      'email', 'contact_no', 'address', 'specialization', 'work_experience_years',
    ], facultyRows);

    await insertMany(conn, 'faculty_employment', [
      'faculty_id', 'employment_status', 'rank', 'department_id', 'date_hired', 'tenure_status',
    ], facultyEmploymentRows);

    await insertMany(conn, 'users', [
      'ref_id', 'user_type', 'username', 'password_hash', 'is_active',
    ], facultyUserRows);

    await conn.commit();

    console.log(`Inserted ${studentRows.length} students`);
    console.log(`Inserted ${studentAcademicRows.length} student_academic rows`);
    console.log(`Inserted ${studentUserRows.length} student user rows`);
    console.log(`Inserted ${studentAssignmentRows.length} student course assignments`);
    console.log(`Inserted ${facultyRows.length} faculty`);
    console.log(`Inserted ${facultyEmploymentRows.length} faculty_employment rows`);
    console.log(`Inserted ${facultyUserRows.length} faculty user rows`);
    const maxSectionSize = Math.max(...Array.from(finalSectionCounts.values()));
    console.log(`Largest generated section size: ${maxSectionSize}`);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('SEED_ERR', err.message);
  process.exit(1);
});
