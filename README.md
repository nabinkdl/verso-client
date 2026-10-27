# Mononet

Monorepo for the Verso social app and its API.

## Structure

| Path | Purpose |
| --- | --- |
| `apps/ui/` | Verso frontend — React, TypeScript, Vite, Tailwind |
| `apps/backend/` | Mononet API — NestJS, Prisma, PostgreSQL |
| `Dockerfile` | Single-image build serving the UI + API on one port |

## Requirements

- Node.js 22+
- npm 10+
- A PostgreSQL database (this project uses Neon)

## Quick start

```bash
# Install dependencies for every workspace
npm install

# Configure the database and prepare it
cp apps/backend/.env.example apps/backend/.env
# Set DATABASE_URL, DATABASE_URL_UNPOOLED, and JWT_SECRET in apps/backend/.env.
npm run db:migrate
npm run db:seed

# Run the UI and API together
npm run dev
```

| Service | URL |
| --- | --- |
| UI | <http://localhost:5173> |
| API | <http://localhost:3000/api> |
| Swagger docs | <http://localhost:3000/docs> |
| Health check | <http://localhost:3000/api/health> |

The seeded demo account is `alex@mononet.dev` with password `Password123!`. All six seeded accounts share that password.

See [docs/RUNNING.md](docs/RUNNING.md) for the local dev run state, ports, and how to start/stop the app.

## Scripts

Run these from the repository root.

| Command | Description |
| --- | --- |
| `npm run dev` | Run UI and API together |
| `npm run dev:ui` | Run only the UI |
| `npm run dev:api` | Run only the API in watch mode |
| `npm run build` | Build every workspace |
| `npm run lint` | Lint every workspace |
| `npm run typecheck` | Typecheck every workspace |
| `npm run test` | Run every workspace's tests |
| `npm run db:migrate` | Create/apply a development migration |
| `npm run db:deploy` | Apply committed migrations (production) |
| `npm run db:seed` | Reset and seed demo data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:generate` | Regenerate the Prisma client |

## Backend

The API uses NestJS 12 with Prisma ORM 7 and PostgreSQL. It provides:

- Email/username registration and login with JWT access tokens
- Profiles, user search, and follow/unfollow
- Posts, cursor-paginated feed, likes, and comments
- Authenticated feed based on who you follow
- Swagger documentation at `/docs`
- Environment validation and Prisma error mapping
- Password reset emails via Resend with single-use, expiring tokens

See [apps/backend/README.md](apps/backend/README.md) for the API reference, data model, and deployment notes.

## Frontend

The UI is wired to the API for authentication, the feed, posts, likes, comments, profiles, follow/unfollow, and user search. Pages, Marketplace, Chat, Notifications, and Reels remain local prototype screens.

See [apps/ui/README.md](apps/ui/README.md) and [apps/ui/docs/USER_GUIDE.md](apps/ui/docs/USER_GUIDE.md).

## Environment

Copy `apps/backend/.env.example` to `apps/backend/.env`. Database, JWT, and Resend settings live there; the file is gitignored. Set `JWT_SECRET` (32+ characters). Password reset needs `RESEND_API_KEY` plus a verified Resend domain in `RESEND_FROM_EMAIL`; `APP_URL` must point at the public UI so the emailed link opens the reset screen.

Copy `apps/ui/.env.example` to `apps/ui/.env` to point the UI at the API (`VITE_API_URL`, default `http://localhost:3000/api`). That file is gitignored too.

## Local single port

Run the built UI and API on one port with plain Node (no Docker):

```bash
npm run start:single
```

This builds the UI with `VITE_API_URL=/api`, builds the API, copies the UI into `apps/backend/public`, and starts Node on <http://localhost:3000>. Stop it with `Ctrl+C`. Free port 3000 first if the Docker app is running (`docker compose stop app`).

## Single-port container

The `Dockerfile` builds the UI into the API image. Node serves both on **port 3000** — one container, one port.

```bash
npm run db:deploy   # apply migrations to DATABASE_URL first
npm run docker:up   # build + start
npm run docker:ps
npm run docker:logs
npm run docker:down
```

| Service | URL |
| --- | --- |
| UI | <http://localhost:3000> |
| API | <http://localhost:3000/api> |
| Auth | <http://localhost:3000/api/auth> |
| Swagger | <http://localhost:3000/docs> |

The container reads `apps/backend/.env` for `DATABASE_URL` (Neon), `JWT_SECRET`, and Resend settings. The UI is built with `VITE_API_URL=/api`, so browser requests are same-origin.

> Docker's bridge network can resolve Neon's pooler hostname to an edge it cannot reach. Compose pins that hostname to a working IPv4 via `extra_hosts`; if the host or IP changes, override `NEON_DB_HOST` / `NEON_DB_IP`.

Override the public origin when deploying:

```bash
PUBLIC_URL=https://app.example.com npm run docker:up
```

## Deployment

The frontend is configured for Vercel in `vercel.json`, with `apps/ui/dist` as the output directory. Deploy the API to a Node host, set `DATABASE_URL` and `JWT_SECRET`, run `npm run db:deploy`, then start it with `npm run start:prod --workspace @mononet/backend`.
