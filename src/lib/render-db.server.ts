import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Pool, type PoolClient, type QueryResultRow } from "pg";

let pool: Pool | undefined;

function getDatabaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) throw new Error("DATABASE_URL is required for the Render PostgreSQL backend");
  return value;
}

export function getRenderPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: getDatabaseUrl(),
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
      max: Number(process.env.DATABASE_POOL_MAX ?? 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = [],
) {
  return getRenderPool().query<T>(text, values);
}

export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>) {
  const client = await getRenderPool().connect();
  try {
    await client.query("BEGIN");
    const value = await fn(client);
    await client.query("COMMIT");
    return value;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function runRenderMigrations() {
  const migration = await readFile(join(process.cwd(), "db/migrations/001_initial.sql"), "utf8");
  await query(
    `CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`,
  );
  const existing = await query<{ version: string }>(
    "SELECT version FROM schema_migrations WHERE version = $1",
    ["001_initial"],
  );
  if (existing.rowCount) return false;
  await withTransaction(async (client) => {
    await client.query(migration);
    await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", ["001_initial"]);
  });
  return true;
}

export async function closeRenderPool() {
  await pool?.end();
  pool = undefined;
}
