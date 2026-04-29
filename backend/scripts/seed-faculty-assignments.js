const pool = require('../config/db');

async function seedFacultyAssignments() {
  try {
    console.log('Starting to seed faculty assignments...');

    // Insert schedules
    const scheduleSQL = `
      INSERT INTO schedules (subject_code, section, faculty_id, room_id, semester, academic_year, day_of_week, start_time, end_time, schedule_type) VALUES
      ('CSA101', 'IT-1C', 'FBULK260005', NULL, '1st', '2026-2027', 'Monday', '06:00:00', '07:30:00', 'Lecture'),
      ('CSA102', 'IT-1D', 'FBULK260005', NULL, '1st', '2026-2027', 'Wednesday', '06:00:00', '07:30:00', 'Lecture'),
      ('HCI210', 'CS-3C', 'FBULK260005', NULL, '1st', '2026-2027', 'Tuesday', '16:00:00', '17:30:00', 'Laboratory'),
      ('DSA220', 'IT-2C', 'FBULK260005', NULL, '1st', '2026-2027', 'Thursday', '16:00:00', '18:00:00', 'Laboratory'),
      ('ITN201', 'IT-2D', 'FBULK260005', NULL, '2nd', '2026-2027', 'Friday', '07:00:00', '08:30:00', 'Lecture'),
      ('NET301', 'CS-3D', 'FBULK260005', NULL, '2nd', '2026-2027', 'Saturday', '13:00:00', '14:30:00', 'Laboratory')
    `;

    console.log('Inserting schedules...');
    await pool.query(scheduleSQL);
    console.log('✓ Schedules inserted successfully');

    // Insert faculty load
    const loadSQL = `
      INSERT INTO faculty_load (faculty_id, subject_code, section, teaching_units, semester, academic_year) VALUES
      ('FBULK260005', 'CSA101', 'IT-1C', 3, '1st', '2026-2027'),
      ('FBULK260005', 'CSA102', 'IT-1D', 3, '1st', '2026-2027'),
      ('FBULK260005', 'HCI210', 'CS-3C', 2, '1st', '2026-2027'),
      ('FBULK260005', 'DSA220', 'IT-2C', 3, '1st', '2026-2027'),
      ('FBULK260005', 'ITN201', 'IT-2D', 3, '2nd', '2026-2027'),
      ('FBULK260005', 'NET301', 'CS-3D', 3, '2nd', '2026-2027')
    `;

    console.log('Inserting faculty load records...');
    await pool.query(loadSQL);
    console.log('✓ Faculty load records inserted successfully');

    console.log('\n✅ Faculty assignments seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding data:', err.message);
    process.exit(1);
  }
}

seedFacultyAssignments();
