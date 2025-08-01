const { Pool } = require('pg');

// Template configuration file - Copy to db.js and fill in your credentials
const pool = new Pool({
    user: 'username',
    host: 'your-db-host',
    database: 'your-database-name',
    password: 'your-password',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully');
  }
});

module.exports = pool;
