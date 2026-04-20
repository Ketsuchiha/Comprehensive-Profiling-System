const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const host = process.env.DB_HOST || '127.0.0.1';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const port = Number(process.env.DB_PORT || 3306);

  const sqlPath = path.join(__dirname, '..', 'sql', 'ccs113 (1).sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const adminConn = await mysql.createConnection({
    host,
    user,
    password,
    port,
    multipleStatements: true,
  });

  await adminConn.query(
    'DROP DATABASE IF EXISTS `ccs113`; CREATE DATABASE `ccs113` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;'
  );
  await adminConn.end();

  const dbConn = await mysql.createConnection({
    host,
    user,
    password,
    port,
    database: 'ccs113',
    multipleStatements: true,
  });

  await dbConn.query(sql);
  await dbConn.end();

  console.log('Successfully imported backend/sql/ccs113 (1).sql into database ccs113');
}

main().catch((error) => {
  console.error('Import failed:', error.message);
  process.exit(1);
});
