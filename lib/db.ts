import { Pool } from "pg";

// Singleton pool — reused across hot-reloads in dev
const globalForPool = global as unknown as { pool: Pool | undefined };

export const pool: Pool =
  globalForPool.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Enable SSL for hosted providers (Neon, Supabase, RDS). Safe to keep in dev:
    // local Postgres ignores ssl when the server isn't configured for it.
    // Neon (and other hosted PG providers) require SSL. Detect via URL param
    // so this works in dev and prod without manual NODE_ENV checks.
    ssl: process.env.DATABASE_URL?.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : false,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPool.pool = pool;
}

/** Convenience helper for a single query */
export async function query<T extends object = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
) {
  const result = await pool.query<T>(sql, params);
  return result;
}
