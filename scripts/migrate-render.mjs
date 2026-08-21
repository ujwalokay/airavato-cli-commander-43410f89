import { readFile } from "node:fs/promises";
import { join } from "node:path";
import pg from "pg";

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required to run Render migrations");

const pool = new Pool({
  connectionString,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

try {
  await pool.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())",
  );
  const existing = await pool.query("SELECT version FROM schema_migrations WHERE version = $1", [
    "001_initial",
  ]);
  if (existing.rowCount === 0) {
    const sql = await readFile(join(process.cwd(), "db/migrations/001_initial.sql"), "utf8");
    await pool.query("BEGIN");
    await pool.query(sql);
    await pool.query("INSERT INTO schema_migrations (version) VALUES ($1)", ["001_initial"]);
    await pool.query("COMMIT");
    console.log("Applied Render migration 001_initial");
  } else {
    console.log("Render migration 001_initial already applied");
  }
} catch (error) {
  await pool.query("ROLLBACK").catch(() => undefined);
  console.error(error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
