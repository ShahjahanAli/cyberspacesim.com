import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { pool } from '../lib/db';

async function migrate() {
  const client = await pool.connect();

  try {
    // Ensure migration tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id          SERIAL PRIMARY KEY,
        filename    TEXT UNIQUE NOT NULL,
        applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const migrationsDir = join(process.cwd(), 'db', 'migrations');
    const allFiles = await readdir(migrationsDir);
    const files = allFiles.filter((f) => f.endsWith('.sql')).sort();

    let applied = 0;
    let skipped = 0;

    for (const file of files) {
      const { rows } = await client.query(
        'SELECT id FROM schema_migrations WHERE filename = $1',
        [file],
      );

      if (rows.length > 0) {
        console.log(`  ⏭  skip   ${file}`);
        skipped++;
        continue;
      }

      const sql = await readFile(join(migrationsDir, file), 'utf-8');

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [file],
        );
        await client.query('COMMIT');
        console.log(`  ✅ applied ${file}`);
        applied++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  ❌ failed  ${file}`);
        console.error(err);
        process.exit(1);
      }
    }

    console.log(`\nMigrations complete — applied: ${applied}, skipped: ${skipped}`);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
