import { createFileRoute } from "@tanstack/react-router";
import { query, withTransaction } from "@/lib/render-db.server";
import { json, preflight, newToken } from "@/lib/pos-ingest";

type InstallationRow = {
  id: string;
  cafe_id: string;
  registration_code: string | null;
  revoked_at: string | null;
  registered_at: string | null;
  machine_name: string;
  app_version: string;
  service_version: string;
  os: string;
};

type CafeRow = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  currency: string;
};

export const Route = createFileRoute("/api/public/pos/register")({
  server: {
    handlers: {
      OPTIONS: async () => preflight(),
      POST: async ({ request }) => {
        let body: Record<string, unknown>;
        try {
          body = (await request.json()) as Record<string, unknown>;
        } catch {
          return json({ error: "Invalid JSON body" }, 400);
        }

        const code = String(body["registration_code"] ?? "")
          .trim()
          .toUpperCase();
        if (!code) return json({ error: "registration_code is required" }, 400);

        const result = await query<InstallationRow>(
          `SELECT * FROM public.installations WHERE registration_code = $1 LIMIT 1`,
          [code],
        );
        const installation = result.rows[0];
        if (!installation) return json({ error: "Unknown registration code" }, 404);
        if (installation.revoked_at) return json({ error: "Installation revoked" }, 403);

        const token = newToken();
        const now = new Date().toISOString();
        const cafeResult = await query<CafeRow>(
          `SELECT id, name, slug, timezone, currency FROM public.cafes WHERE id = $1 LIMIT 1`,
          [installation.cafe_id],
        );
        const cafe = cafeResult.rows[0] ?? null;

        await withTransaction(async (client) => {
          await client.query(
            `UPDATE public.installations
             SET device_token = $1,
                 device_token_issued_at = $2,
                 registered_at = COALESCE(registered_at, $2),
                 registration_code = NULL,
                 machine_name = COALESCE(NULLIF($3, ''), machine_name),
                 app_version = COALESCE(NULLIF($4, ''), app_version),
                 service_version = COALESCE(NULLIF($5, ''), service_version),
                 os = COALESCE(NULLIF($6, ''), os),
                 token_state = 'Valid',
                 last_heartbeat = $2,
                 updated_at = $2
             WHERE id = $7`,
            [
              token,
              now,
              String(body["machine_name"] ?? ""),
              String(body["app_version"] ?? ""),
              String(body["service_version"] ?? ""),
              String(body["os"] ?? ""),
              installation.id,
            ],
          );
          await client.query(
            `INSERT INTO public.audit_logs
              (actor, actor_role, action, target_type, target_id, cafe_id, cafe_name, reason, after_summary, context)
             VALUES ($1, 'system', 'installation.activate', 'Installation', $2, $3, $4, $5, $6, 'POS ingest API')`,
            [
              installation.id,
              installation.id,
              installation.cafe_id,
              cafe?.name ?? null,
              "POS device completed registration",
              `device token issued for ${installation.id}`,
            ],
          );
        });

        return json({
          installation_id: installation.id,
          device_token: token,
          cafe,
          heartbeat_url: "/api/public/pos/heartbeat",
        });
      },
    },
  },
});
