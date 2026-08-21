import { createFileRoute } from "@tanstack/react-router";
import { json, preflight, posClient, newToken } from "@/lib/pos-ingest";

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

        const code = String(body["registration_code"] ?? "").trim().toUpperCase();
        if (!code) return json({ error: "registration_code is required" }, 400);

        const supabase = posClient();
        const { data: inst, error } = await supabase
          .from("installations")
          .select("*")
          .eq("registration_code", code)
          .maybeSingle();
        if (error) return json({ error: "Lookup failed" }, 500);
        if (!inst) return json({ error: "Unknown registration code" }, 404);
        if (inst.revoked_at) return json({ error: "Installation revoked" }, 403);

        const token = newToken();
        const now = new Date().toISOString();
        const { error: upErr } = await supabase
          .from("installations")
          .update({
            device_token: token,
            device_token_issued_at: now,
            registered_at: inst.registered_at ?? now,
            registration_code: null,
            machine_name: String(body["machine_name"] ?? inst.machine_name),
            app_version: String(body["app_version"] ?? inst.app_version),
            service_version: String(body["service_version"] ?? inst.service_version),
            os: String(body["os"] ?? inst.os),
            token_state: "Valid",
            last_heartbeat: now,
          })
          .eq("id", inst.id);
        if (upErr) return json({ error: "Registration failed" }, 500);

        const { data: cafe } = await supabase
          .from("cafes")
          .select("id, name, slug, timezone, currency")
          .eq("id", inst.cafe_id)
          .maybeSingle();

        await supabase.from("audit_logs").insert({
          actor: inst.id,
          actor_role: "system",
          action: "installation.activate",
          target_type: "Installation",
          target_id: inst.id,
          cafe_id: inst.cafe_id,
          cafe_name: cafe?.name ?? null,
          reason: "POS device completed registration",
          after_summary: `device token issued for ${inst.id}`,
          context: "POS ingest API",
        });

        return json({
          installation_id: inst.id,
          device_token: token,
          cafe,
          heartbeat_url: "/api/public/pos/heartbeat",
        });
      },
    },
  },
});
