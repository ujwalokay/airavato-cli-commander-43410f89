import { createFileRoute } from "@tanstack/react-router";
import { json, preflight, authInstallation } from "@/lib/pos-ingest";

export const Route = createFileRoute("/api/public/pos/heartbeat")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),
      POST: async ({ request }) => {
        const auth = await authInstallation(request);
        if (!auth) return json({ error: "Unauthorized" }, 401);
        const { supabase, installation } = auth;

        let body: Record<string, unknown> = {};
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          /* heartbeat may be empty */
        }

        const num = (k: string, fallback: number) =>
          typeof body[k] === "number" ? (body[k] as number) : fallback;
        const bool = (k: string, fallback: boolean) =>
          typeof body[k] === "boolean" ? (body[k] as boolean) : fallback;

        const now = new Date().toISOString();
        const syncQueue = num("sync_queue", 0);
        const healthy =
          bool("db_readable", true) && bool("db_writable", true) && bool("local_api_ok", true);

        await supabase
          .from("installations")
          .update({
            last_heartbeat: now,
            app_version: String(body["app_version"] ?? installation.app_version),
            service_version: String(body["service_version"] ?? installation.service_version),
            os: String(body["os"] ?? installation.os),
            sync_queue: syncQueue,
            clock_drift_ms: num("clock_drift_ms", 0),
            disk_free_gb: num("disk_free_gb", installation.disk_free_gb),
            latency_ms: num("latency_ms", installation.latency_ms),
            db_readable: bool("db_readable", true),
            db_writable: bool("db_writable", true),
            local_api_ok: bool("local_api_ok", true),
            backup_ok: bool("backup_ok", installation.backup_ok),
            last_backup: (body["last_backup"] as string | undefined) ?? installation.last_backup,
            mode: String(body["mode"] ?? installation.mode),
            migration_state: String(body["migration_state"] ?? installation.migration_state),
          })
          .eq("id", installation.id);

        await supabase.from("heartbeats").insert({
          installation_id: installation.id,
          cafe_id: installation.cafe_id,
          at: now,
          app_version: String(body["app_version"] ?? installation.app_version),
          sync_queue: syncQueue,
          healthy,
          payload: body as never,
        });

        const { data: license } = await supabase
          .from("licenses")
          .select("state, plan, grace_ends, renewal_date")
          .eq("cafe_id", installation.cafe_id)
          .maybeSingle();

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
