const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function initDb() {
  try {
    const schemaPath = path.join(__dirname, '../schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await pool.query(schema);
    console.log('Database schema initialized');
  } catch (err) {
    console.error('Failed to initialize database schema', err);
    process.exit(1);
  }
}

module.exports = initDb;
