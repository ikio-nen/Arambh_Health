// src/config/db.js
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Export both the pool and a convenience query helper.
module.exports = {
  pool,
  query: (text, params) => pool.query(text, params),
};