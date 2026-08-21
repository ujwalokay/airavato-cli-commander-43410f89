import http from "node:http";
import { URL } from "node:url";

const listenHost = process.env.AIRVOTO_BRIDGE_HOST ?? "127.0.0.1";
const listenPort = Number(process.env.AIRVOTO_BRIDGE_PORT ?? 8787);
const posBaseUrl = process.env.AIRVOTO_POS_BASE_URL;
const bridgeApiKey = process.env.AIRVOTO_BRIDGE_API_KEY;
const allowedOrigin = process.env.AIRVOTO_ALLOWED_ORIGIN ?? "";
const allowedPaths = new Set(
  (process.env.AIRVOTO_ALLOWED_PATHS ?? "/health")
    .split(",")
    .map((path) => path.trim())
    .filter(Boolean),
);
const requestTimeoutMs = Number(process.env.AIRVOTO_REQUEST_TIMEOUT_MS ?? 10000);
const maxBodyBytes = Number(process.env.AIRVOTO_MAX_BODY_BYTES ?? 1_000_000);

if (!posBaseUrl) {
  console.error("AIRVOTO_POS_BASE_URL is required, for example http://127.0.0.1:8080");
  process.exit(1);
}

if (!bridgeApiKey || bridgeApiKey.length < 24) {
  console.error("AIRVOTO_BRIDGE_API_KEY is required and must be at least 24 characters");
  process.exit(1);
}

const upstream = new URL(posBaseUrl);
if (!/^https?:$/.test(upstream.protocol)) {
  console.error("AIRVOTO_POS_BASE_URL must use http or https");
  process.exit(1);
}

function writeJson(response, status, body) {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  };
  if (allowedOrigin) {
    headers["access-control-allow-origin"] = allowedOrigin;
    headers["access-control-allow-headers"] = "authorization, content-type, x-airvoto-bridge-key";
    headers["access-control-allow-methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
    headers.vary = "Origin";
  }
  response.writeHead(status, headers);
  response.end(JSON.stringify(body));
}

function authorized(request) {
  const supplied = request.headers["x-airvoto-bridge-key"];
  return typeof supplied === "string" && supplied === bridgeApiKey;
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    request.on("data", (chunk) => {
      total += chunk.length;
      if (total > maxBodyBytes) {
        reject(new Error("request body too large"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

function upstreamUrl(pathname, search) {
  const target = new URL(upstream);
  target.pathname = pathname;
  target.search = search;
  return target;
}

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === "OPTIONS") {
      writeJson(response, 204, {});
      return;
    }

    if (!authorized(request)) {
      writeJson(response, 401, { error: "Unauthorized" });
      return;
    }

    const incoming = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    const path =
      incoming.pathname === "/health"
        ? "/health"
        : incoming.pathname.replace(/^\/proxy/, "") || "/";

    if (!allowedPaths.has(path)) {
      writeJson(response, 403, { error: "Path is not allowlisted" });
      return;
    }

    if (path === "/health") {
      writeJson(response, 200, { ok: true, bridge: "airvoto", upstream: upstream.origin });
      return;
    }

    const body = await readBody(request);
    const target = upstreamUrl(path, incoming.search);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);

    const headers = new Headers();
    const contentType = request.headers["content-type"];
    if (typeof contentType === "string") headers.set("content-type", contentType);
    const authorization = request.headers.authorization;
    if (typeof authorization === "string") headers.set("authorization", authorization);

    const upstreamResponse = await fetch(target, {
      method: request.method,
      headers,
      body: ["GET", "HEAD"].includes(request.method ?? "") ? undefined : body,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const responseBody = Buffer.from(await upstreamResponse.arrayBuffer());
    response.writeHead(upstreamResponse.status, {
      "content-type": upstreamResponse.headers.get("content-type") ?? "application/json",
      "cache-control": "no-store",
    });
    response.end(responseBody);
  } catch (error) {
    const message =
      error?.name === "AbortError" ? "POS request timed out" : "POS bridge request failed";
    writeJson(response, 502, { error: message });
  }
});

server.listen(listenPort, listenHost, () => {
  console.log(`Airvoto bridge listening on http://${listenHost}:${listenPort}`);
  console.log(`Forwarding approved paths to ${upstream.origin}`);
  console.log(`Allowlisted paths: ${Array.from(allowedPaths).join(", ")}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
