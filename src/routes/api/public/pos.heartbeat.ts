import { createFileRoute } from "@tanstack/react-router";
import { query, withTransaction } from "@/lib/render-db.server";
import { json, preflight, authInstallation } from "@/lib/pos-ingest";

export const Route = createFileRoute("/api/public/pos/heartbeat")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),
      POST: async ({ request }) => {
        const auth = await authInstallation(request);
        if (!auth) return json({ error: "Unauthorized" }, 401);
        const { installation } = auth;

        let body: Record<string, unknown> = {};
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          /* heartbeat may be empty */
        }

        const num = (key: string, fallback: number) =>
          typeof body[key] === "number" ? (body[key] as number) : fallback;
        const bool = (key: string, fallback: boolean) =>
          typeof body[key] === "boolean" ? (body[key] as boolean) : fallback;

        const now = new Date().toISOString();
        const syncQueue = num("sync_queue", 0);
        const healthy =
          bool("db_readable", true) && bool("db_writable", true) && bool("local_api_ok", true);

        await withTransaction(async (client) => {
          await client.query(
            `UPDATE public.installations
             SET last_heartbeat = $1,
                 app_version = COALESCE(NULLIF($2, ''), app_version),
                 service_version = COALESCE(NULLIF($3, ''), service_version),
                 os = COALESCE(NULLIF($4, ''), os),
                 sync_queue = $5,
                 clock_drift_ms = $6,
                 disk_free_gb = $7,
                 latency_ms = $8,
                 db_readable = $9,
                 db_writable = $10,
                 local_api_ok = $11,
                 backup_ok = $12,
                 last_backup = COALESCE(NULLIF($13, '')::timestamptz, last_backup),
                 mode = COALESCE(NULLIF($14, ''), mode),
                 migration_state = COALESCE(NULLIF($15, ''), migration_state),
                 updated_at = $1
             WHERE id = $16`,
            [
              now,
              String(body["app_version"] ?? ""),
              String(body["service_version"] ?? ""),
              String(body["os"] ?? ""),
              syncQueue,
              num("clock_drift_ms", 0),
              num("disk_free_gb", installation.disk_free_gb ?? 0),
              num("latency_ms", installation.latency_ms ?? 0),
              bool("db_readable", true),
              bool("db_writable", true),
              bool("local_api_ok", true),
              bool("backup_ok", installation.backup_ok ?? false),
              String(body["last_backup"] ?? ""),
              String(body["mode"] ?? ""),
              String(body["migration_state"] ?? ""),
              installation.id,
            ],
          );
          await client.query(
            `INSERT INTO public.heartbeats (installation_id, cafe_id, at, app_version, sync_queue, healthy, payload)
             VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
            [
              installation.id,
              installation.cafe_id,
              now,
              String(body["app_version"] ?? installation.app_version ?? "—"),
              syncQueue,
              healthy,
              JSON.stringify(body),
            ],
          );
        });

        const licenseResult = await query<{
          state: string;
          plan: string;
          grace_ends: string | null;
          renewal_date: string | null;
        }>(
          `SELECT state, plan, grace_ends, renewal_date FROM public.licenses WHERE cafe_id = $1 LIMIT 1`,
          [installation.cafe_id],
        );
        const license = licenseResult.rows[0] ?? null;

        return json({
          ok: true,
          server_time: now,
          license_state: license?.state ?? "Unknown",
          ring: installation.ring,
        });
      },
    },
  },
});
