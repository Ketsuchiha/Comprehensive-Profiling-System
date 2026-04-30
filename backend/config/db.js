const mysql = require('mysql2/promise');

function pick(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') {
      return value.trim();
    }
  }
  return undefined;
}

function resolveMysqlConfig() {
  const databaseUrl = pick(process.env.DATABASE_URL, process.env.MYSQL_URL, process.env.MYSQL_PUBLIC_URL);

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

  const railwayHost = pick(process.env.MYSQLHOST);
  const railwayUser = pick(process.env.MYSQLUSER);
  const railwayPassword = pick(process.env.MYSQLPASSWORD);
  const railwayDatabase = pick(process.env.MYSQLDATABASE);
  const railwayPort = pick(process.env.MYSQLPORT);

  const dbHost = pick(process.env.DB_HOST);
  const dbUser = pick(process.env.DB_USER);
  const dbPassword = pick(process.env.DB_PASSWORD);
  const dbName = pick(process.env.DB_NAME);
  const dbPort = pick(process.env.DB_PORT);

  return {
    host: railwayHost || dbHost || '127.0.0.1',
    user: railwayUser || dbUser || 'root',
    password: railwayPassword || dbPassword || '',
    database: railwayDatabase || dbName || 'ccs113',
    port: Number(railwayPort || dbPort || 3306),
  };
}

const resolvedConfig = resolveMysqlConfig();

console.log(
  `[DB] target host=${resolvedConfig.host} port=${resolvedConfig.port} database=${resolvedConfig.database} user=${resolvedConfig.user}`
);

const pool = mysql.createPool({
  ...resolvedConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
