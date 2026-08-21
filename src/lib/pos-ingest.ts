import { query, type QueryResultRow } from "@/lib/render-db.server";

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
} as const;

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}

export function preflight() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export function newToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function bearer(request: Request) {
  const raw = request.headers.get("authorization") ?? "";
  return raw.toLowerCase().startsWith("bearer ") ? raw.slice(7).trim() : "";
}

type InstallationRow = QueryResultRow & {
  id: string;
  cafe_id: string;
  revoked_at: string | null;
  device_token: string | null;
  disk_free_gb: number;
  latency_ms: number;
  backup_ok: boolean;
  app_version: string;
  ring: string;
};

/** Resolves the installation behind a device token, or null. */
export async function authInstallation(request: Request) {
  const token = bearer(request);
  if (!token) return null;
  const result = await query<InstallationRow>(
    `SELECT * FROM public.installations WHERE device_token = $1 AND revoked_at IS NULL LIMIT 1`,
    [token],
  );
  const installation = result.rows[0];
  if (!installation) return null;
  return { installation };
}
