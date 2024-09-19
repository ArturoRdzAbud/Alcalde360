const dbConfig = {
  user: 'sadmin',
  password: 'Nimdas2023@',
  database: 'Alcalde360_Des',
  server: 'enlaces.database.windows.net',
  pool: {
    max: 30,
    min: 0,
    idleTimeoutMillis: 60000
  },
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
}

module.exports = dbConfig;
