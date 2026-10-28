# Running the App (Dev Mode)

How the app was started locally, what is currently serving, and how to reproduce or stop it.

## Current state

| Service | URL | Status |
| --- | --- | --- |
| UI (Vite, hot reload) | <http://localhost:5173> | ✅ 200 |
| API | <http://localhost:3000/api> | ✅ healthy, DB up |
| Swagger docs | <http://localhost:3000/docs> | ✅ |
| Chat socket | `ws://localhost:3000/chat` (namespace) | ✅ JWT handshake |

Chat history is REST (`/api/conversations`); live messages, typing, and read receipts use Socket.IO on the `/chat` namespace. The UI connects with the stored access token, so no extra port or service is needed.

Health check used to confirm the API:

```bash
curl http://localhost:3000/api/health
# {"status":"ok","database":"up","uptime":17,"timestamp":"..."}
```

## How it was started

1. A previous single-port production build (`node dist/main.js` started via `npm run start:prod`) was still holding port 3000. It was stopped first, because `npm run dev` runs the API on the same port.
2. `npm run dev` was launched from the repository root. It runs both workspaces concurrently:
   - `dev:ui` → Vite dev server on 5173 (hot reload)
   - `dev:api` → NestJS in watch mode on 3000

```bash
# stop whatever owns port 3000
kill $(lsof -t -iTCP:3000 -sTCP:LISTEN)

# run UI + API together
npm run dev
```

Equivalent targeted commands:

```bash
npm run dev:ui    # UI only (5173)
npm run dev:api   # API only, watch mode (3000)

# or through Nx
npx nx run @mononet/ui:dev
npx nx run @mononet/backend:dev
```

## Demo login

| Field | Value |
| --- | --- |
| Email | `alex@mononet.dev` |
| Password | `Password123!` |

All six seeded accounts share that password.

## Notes

- The API logs a `pg` SSL-mode deprecation warning because the Neon connection string uses `sslmode=require`. It is harmless and needs no action for now; a future `pg` major version will treat these modes differently.
- The UI reads `VITE_API_URL` (default `http://localhost:3000/api`). A local `apps/ui/.env` is optional for dev.
- The backend requires `apps/backend/.env` with `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, and `JWT_SECRET`.

## Single-port alternative

To serve the built UI and API on one port (3000) instead of dev servers:

```bash
npm run start:single   # or: npm run docker:up
```

Stop the dev servers first so port 3000 is free.

## Stopping

Ctrl+C stops the foreground `npm run dev`. When it runs in the background, free the ports explicitly:

```bash
lsof -t -iTCP:3000 -sTCP:LISTEN | xargs kill
lsof -t -iTCP:5173 -sTCP:LISTEN | xargs kill
```
