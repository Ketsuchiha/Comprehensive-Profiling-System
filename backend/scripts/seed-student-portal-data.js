const pool = require('../config/db');

const studentId = 'BULK26-000013';
const section = 'CS-1A';

async function getExistingEventId() {
  const [rows] = await pool.query(
    `SELECT event_id
     FROM events
     WHERE start_date >= CURDATE()
     ORDER BY start_date ASC
     LIMIT 1`
  );
  if (rows.length > 0) return rows[0].event_id;

  const [anyRows] = await pool.query(
    `SELECT event_id FROM events ORDER BY event_id DESC LIMIT 1`
  );
  return anyRows.length > 0 ? anyRows[0].event_id : null;
}

async function seedSchedules() {
  const scheduleRows = [
    ['CCS101', section, 'F2604SAMP001', null, '1st', '2026-2027', 'Monday', '08:00:00', '09:30:00', 'Lecture'],
    ['CCS102', section, 'F2604SAMP003', null, '1st', '2026-2027', 'Tuesday', '09:30:00', '11:00:00', 'Lecture'],
    ['GAD101', section, 'FBULK260005', null, '1st', '2026-2027', 'Wednesday', '10:00:00', '12:00:00', 'Laboratory'],
    ['NSTP2', section, 'FBULK260005', null, '1st', '2026-2027', 'Thursday', '13:00:00', '15:00:00', 'Lecture'],
    ['PED102', section, 'F2604SAMP001', null, '1st', '2026-2027', 'Friday', '07:30:00', '09:00:00', 'Lecture'],
  ];

  for (const row of scheduleRows) {
    const [exists] = await pool.query(
      `SELECT schedule_id
       FROM schedules
       WHERE subject_code = ?
         AND section = ?
         AND semester = ?
         AND academic_year = ?
         AND day_of_week = ?
         AND start_time = ?
         AND end_time = ?
       LIMIT 1`,
      [row[0], row[1], row[4], row[5], row[6], row[7], row[8]]
    );

    if (exists.length === 0) {
      await pool.query(
        `INSERT INTO schedules
          (subject_code, section, faculty_id, room_id, semester, academic_year, day_of_week, start_time, end_time, schedule_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        row
      );
      console.log(`Inserted schedule ${row[0]} for ${section}`);
    } else {
      console.log(`Schedule ${row[0]} already exists for ${section}`);
    }
  }
}

async function seedOrganizations() {
  const [exists] = await pool.query(
    `SELECT org_id FROM student_orgs
     WHERE student_id = ? AND organization_name = ?
     LIMIT 1`,
    [studentId, 'CCS Student Society']
  );

  if (exists.length === 0) {
    await pool.query(
      `INSERT INTO student_orgs (student_id, organization_name, position, academic_year)
       VALUES (?, ?, ?, ?)`,
      [studentId, 'CCS Student Society', 'Member', '2026-2027']
    );
    console.log('Inserted student organization membership');
  } else {
    console.log('Student organization membership already exists');
  }
}

async function seedInternship() {
  const [exists] = await pool.query(
    `SELECT internship_id FROM student_internship
     WHERE student_id = ? AND company_name = ?
     LIMIT 1`,
    [studentId, 'TechNova Solutions']
  );

  if (exists.length === 0) {
    await pool.query(
      `INSERT INTO student_internship
        (student_id, company_name, supervisor, start_date, end_date, hours_rendered, eval_grade)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [studentId, 'TechNova Solutions', 'Engr. Carla Reyes', '2026-03-01', '2026-05-30', 120, 'A']
    );
    console.log('Inserted internship record');
  } else {
    console.log('Internship record already exists');
  }
}

async function seedEventParticipation() {
  const eventId = await getExistingEventId();
  if (!eventId) {
    console.log('No events found to register the student');
    return;
  }

  const [exists] = await pool.query(
    `SELECT participation_id
     FROM event_participants
     WHERE event_id = ? AND participant_id = ? AND participant_type = 'Student'
     LIMIT 1`,
    [eventId, studentId]
  );

  if (exists.length === 0) {
    await pool.query(
      `INSERT INTO event_participants (event_id, participant_id, participant_type, attendance)
       VALUES (?, ?, 'Student', 'Registered')`,
      [eventId, studentId]
    );
    console.log(`Registered student to event ${eventId}`);
  } else {
    console.log(`Student is already registered to event ${eventId}`);
  }
}

async function verify() {
  const [schedules] = await pool.query(
    `SELECT subject_code, day_of_week, start_time, end_time
     FROM schedules
     WHERE section = ? AND subject_code IN ('CCS101', 'CCS102', 'GAD101', 'NSTP2', 'PED102')
     ORDER BY subject_code`,
    [section]
  );
  const [orgs] = await pool.query('SELECT organization_name FROM student_orgs WHERE student_id = ?', [studentId]);
  const [internships] = await pool.query('SELECT company_name, hours_rendered FROM student_internship WHERE student_id = ?', [studentId]);
  const [events] = await pool.query(
    `SELECT e.event_id, e.event_name, ep.attendance
     FROM event_participants ep
     INNER JOIN events e ON e.event_id = ep.event_id
     WHERE ep.participant_id = ? AND ep.participant_type = 'Student'`,
    [studentId]
  );

  console.log('\nVerification summary:');
  console.log(`Schedules matching assigned subjects: ${schedules.length}`);
  console.log(`Organizations: ${orgs.length}`);
  console.log(`Internships: ${internships.length}`);
  console.log(`Registered events: ${events.length}`);
}

async function main() {
  try {
    console.log('Seeding student portal data for BULK26-000013...');
    await seedSchedules();
    await seedOrganizations();
    await seedInternship();
    await seedEventParticipation();
    await verify();
    console.log('\nDone.');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
}

main();
