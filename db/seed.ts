import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { pool } from '../lib/db';

async function seed() {
  const client = await pool.connect();
  const seedsDir = join(process.cwd(), 'db', 'seeds');
  const allFiles = await readdir(seedsDir);
  const files = allFiles.filter((f) => f.endsWith('.sql')).sort();

  try {
    for (const file of files) {
      const sql = await readFile(join(seedsDir, file), 'utf-8');

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`  ✅ seeded  ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  ❌ failed  ${file}`);
        console.error(err);
        process.exit(1);
      }
    }

    console.log('\nSeeding complete.');
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
