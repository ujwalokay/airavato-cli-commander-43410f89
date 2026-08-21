# Airvoto POS Remote Connection

The Airvoto POS is local-only, so the public web app cannot connect to it directly. This project now includes a small bridge that runs on the POS computer and forwards only explicitly allowlisted requests to the local POS service.

## Architecture

```text
Remote browser -> private VPN or protected relay -> Airvoto bridge on POS computer -> local Airvoto POS API
```

The bridge is not a replacement for the network layer. For computers outside the POS network, install a private VPN or use an authenticated outbound relay. Do not port-forward the POS API or bridge directly to the public internet.

## Configuration

Run the bridge on the POS computer with these environment variables:

```bash
AIRVOTO_BRIDGE_HOST=0.0.0.0
AIRVOTO_BRIDGE_PORT=8787
AIRVOTO_POS_BASE_URL=http://127.0.0.1:8080
AIRVOTO_BRIDGE_API_KEY=replace-with-a-random-secret-at-least-24-characters
AIRVOTO_ALLOWED_ORIGIN=https://your-web-app.example.com
AIRVOTO_ALLOWED_PATHS=/health,/api/products,/api/inventory,/api/orders
AIRVOTO_REQUEST_TIMEOUT_MS=10000
AIRVOTO_MAX_BODY_BYTES=1000000
```

The POS base URL and allowlisted paths are placeholders because the Airvoto POS protocol has not yet been supplied. Replace them with the actual local address and API paths exposed by Airvoto.

Start the bridge with:

```bash
pnpm airvoto:bridge
```

The bridge exposes `GET /health` and forwards requests under `/proxy/...` only when the requested path is present in `AIRVOTO_ALLOWED_PATHS`. Every request must include:

```http
X-Airvoto-Bridge-Key: <the configured bridge key>
```

## Network requirements

The POS computer must remain online while remote synchronization is needed. The VPN or relay must provide a private route from approved remote computers to the POS bridge. Restrict access to approved users, rotate the bridge key if a device is lost, and keep the POS API bound to localhost whenever possible.

## Remaining information needed for a live connection

The implementation cannot complete a live POS sync until the following Airvoto-specific details are available:

| Required item           | Example                                                    |
| ----------------------- | ---------------------------------------------------------- |
| Local POS base URL      | `http://127.0.0.1:8080`                                    |
| Authentication          | Bearer token, API key, Windows service credential, or none |
| API paths               | `/api/products`, `/api/inventory`, `/api/orders`           |
| Request/response format | JSON, XML, WebSocket messages, or database schema          |
| VPN or relay endpoint   | Private hostname or protected relay URL                    |

Without these values, the bridge is intentionally fail-closed and cannot access arbitrary local services.
