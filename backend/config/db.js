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

  const railwayHost = process.env.MYSQLHOST;
  const railwayUser = process.env.MYSQLUSER;
  const railwayPassword = process.env.MYSQLPASSWORD;
  const railwayDatabase = process.env.MYSQLDATABASE;
  const railwayPort = process.env.MYSQLPORT;

  return {
    host: railwayHost || process.env.DB_HOST || '127.0.0.1',
    user: railwayUser || process.env.DB_USER || 'root',
    password: railwayPassword || process.env.DB_PASSWORD || '',
    database: railwayDatabase || process.env.DB_NAME || 'ccs113',
    port: Number(railwayPort || process.env.DB_PORT || 3306),
  };
}

const pool = mysql.createPool({
  ...resolveMysqlConfig(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
