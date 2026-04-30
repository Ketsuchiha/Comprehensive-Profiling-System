const mysql = require('mysql2/promise');

function resolveMysqlConfig() {
  const databaseUrl = process.env.DATABASE_URL || process.env.MYSQL_URL || process.env.MYSQL_PUBLIC_URL;

  if (databaseUrl) {
    const parsed = new URL(databaseUrl);
    return {
      host: parsed.hostname,
      user: decodeURIComponent(parsed.username || process.env.DB_USER || process.env.MYSQLUSER || 'root'),
      password: decodeURIComponent(parsed.password || process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || ''),
      database: decodeURIComponent(parsed.pathname.replace(/^\//, '') || process.env.DB_NAME || process.env.MYSQLDATABASE || 'ccs113'),
      port: Number(parsed.port || process.env.DB_PORT || process.env.MYSQLPORT || 3306),
    };
  }

  return {
    host: process.env.DB_HOST || process.env.MYSQLHOST || '127.0.0.1',
    user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
    database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'ccs113',
    port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
  };
}

const pool = mysql.createPool({
  ...resolveMysqlConfig(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
