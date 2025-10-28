import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import pool from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function stripSqlComments(sql) {
  // Remove /* */ block comments
  let cleaned = sql.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove -- line comments
  cleaned = cleaned
    .split(/\r?\n/)
    .map(line => line.replace(/--.*$/, ''))
    .join('\n');
  return cleaned;
}

async function run() {
  try {
    console.log('✓ Connecting to MySQL and preparing to create tables...');

    const sqlPath = path.join(__dirname, 'database.sql');
    const raw = fs.readFileSync(sqlPath, 'utf8');
    const cleaned = stripSqlComments(raw);

    // Split into individual statements by semicolon
    const statements = cleaned
      .split(';')
      .map(s => s.trim())
      .filter(Boolean);

    for (const stmt of statements) {
      try {
        await pool.query(stmt);
        // console.log('Executed:', stmt.substring(0, 60) + (stmt.length > 60 ? '...' : ''));
      } catch (e) {
        console.warn('Statement failed, continuing:', e.message);
      }
    }

    // Verify
    const [tables] = await pool.query('SHOW TABLES');
    console.log('✓ Tables now present:', tables.map(row => Object.values(row)[0]));

    console.log('✓ Database initialization completed.');
    process.exit(0);
  } catch (err) {
    console.error('✗ Failed to initialize database:', err.message);
    process.exit(1);
  }
}

run();
