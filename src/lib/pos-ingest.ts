import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

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

export function posClient() {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"]!;
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ??
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
          h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
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

/** Resolves the installation behind a device token, or null. */
export async function authInstallation(request: Request) {
  const token = bearer(request);
  if (!token) return null;
  const supabase = posClient();
  const { data } = await supabase
    .from("installations")
    .select("*")
    .eq("device_token", token)
    .maybeSingle();
  if (!data || data.revoked_at) return null;
  return { supabase, installation: data };
}
