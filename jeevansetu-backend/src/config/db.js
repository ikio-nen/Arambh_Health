<<<<<<< HEAD
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

module.exports = pool;
=======
// src/config/db.js
// Single shared pg Pool — used by migrate.js and every route later.
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Export both the pool and a convenience query helper so route files
// don't need to call pool.query directly if they don't want to.
module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
};
>>>>>>> origin/main
