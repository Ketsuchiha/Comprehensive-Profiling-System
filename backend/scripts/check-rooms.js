const pool = require('../config/db');

async function checkRooms() {
  try {
    console.log('Checking available rooms...');
    const [rows] = await pool.query('SELECT room_id FROM rooms LIMIT 10');
    console.log('Available room IDs:');
    rows.forEach(row => console.log('  -', row.room_id));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkRooms();
