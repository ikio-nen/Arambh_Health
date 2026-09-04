// src/config/migrate.js
// Applies every SQL file in migrations/ in FILENAME ORDER, one transaction each.
// Run:  npm install && node src/config/migrate.js
const fs = require('fs');
const path = require('path');

const { query } = require('./db');

const MIGRATIONS_DIR = path.join(__dirname, '..', '..', 'migrations');
const TABLE_VERSION = 'schema_migrations';

async function runMigrations() {
  console.log('Connecting to database…');
  await query('SELECT 1');

  // Track which files have already been applied — safe to re-run.
  await query(`
    CREATE TABLE IF NOT EXISTS ${TABLE_VERSION} (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT now()
    )
  `);

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const already = await query(
      `SELECT 1 FROM ${TABLE_VERSION} WHERE filename = $1`,
      [file]
    );
    if (already.rows.length) {
      console.log(`  skipped  ${file}`);
      continue;
    }
    console.log(`  applying ${file}…`);
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    await query(sql);
    await query(
      `INSERT INTO ${TABLE_VERSION} (filename) VALUES ($1)`,
      [file]
    );
    console.log(`  ✓        ${file}`);
  }

  console.log('Migrations complete.');
  process.exit(0);
}

runMigrations().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});