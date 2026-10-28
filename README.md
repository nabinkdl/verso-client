# Mononet

Monorepo for the Verso social app and its API.

## Structure

| Path | Purpose |
| --- | --- |
| `apps/ui/` | Verso frontend — React, TypeScript, Vite, Tailwind |
| `apps/backend/` | Mononet API — NestJS, Prisma, PostgreSQL |
| `Dockerfile` | Single-image build serving the UI + API on one port |

Project memory for agents: [`apps/ui/.brain.md`](apps/ui/.brain.md) and [`apps/backend/.brain.md`](apps/backend/.brain.md). Keep them current when architecture, conventions, or known issues change.

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

On the login screen, those credentials also open a **UI-only demo session** backed by local mock data — no API or database required. Any other credentials use the real API.

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
| `npm run graph` | Open the Nx project graph |
| `npm run affected` | Lint, typecheck, test, and build only what changed |
| `npm run db:migrate` | Create/apply a development migration |
| `npm run db:deploy` | Apply committed migrations (production) |
| `npm run db:seed` | Reset and seed demo data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:generate` | Regenerate the Prisma client |

## Monorepo tooling

The workspace is driven by **Nx 24** over npm workspaces. Task targets live in `apps/*/project.json` and caching/inputs in `nx.json`.

```bash
npx nx graph                          # visualize projects and targets
npx nx run-many -t lint typecheck test # run a target across both apps
npx nx affected -t typecheck test     # only projects changed vs. main
npx nx run @mononet/ui:build          # one target
npx nx run @mononet/backend:dev       # NestJS in watch mode
```

| Project | Targets |
| --- | --- |
| `@mononet/ui` | `dev`, `build`, `preview`, `lint`, `typecheck` |
| `@mononet/backend` | `dev`, `build`, `start`, `start:prod`, `lint`, `typecheck`, `test`, `test:e2e`, `format`, `db:*` |

`build`, `lint`, `typecheck`, `test`, and `db:generate` are cached locally under `.nx/cache`. `db:generate` is a dependency of the backend build, lint, typecheck, and test targets, so a clean checkout works without a separate generate step. The existing `npm run …` scripts are unchanged and still work.

## Git hooks

**Husky** is installed by the root `prepare` script on `npm install`.

- `pre-commit` → `lint-staged`: ESLint `--fix` for staged UI files, type-aware `oxlint` for staged API files.
- `pre-push` → `nx run-many -t typecheck test`.

Bypass a hook when needed with `git commit --no-verify` or `git push --no-verify`.


## Backend

The API uses NestJS 12 with Prisma ORM 7 and PostgreSQL. It provides:

- Email/username registration and login with JWT access tokens
- Profiles, user search, and follow/unfollow
- Posts, cursor-paginated feed, likes, and comments
- Authenticated feed based on who you follow
- Swagger documentation at `/docs`
- Environment validation and Prisma error mapping
- Password reset emails via Resend with single-use, expiring tokens
- Real-time chat over Socket.IO (`/chat` namespace) with REST history

See [apps/backend/README.md](apps/backend/README.md) for the API reference, data model, and deployment notes.

See [docs/API-DESIGN.md](docs/API-DESIGN.md) for the full API design: conventions, the built endpoints, and the proposed modules for pages, marketplace, chat, notifications, reels, and media uploads.

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
cp .env.example .env   # set NEON_DB_HOST / NEON_DB_IP (and PUBLIC_URL if needed)
npm run db:deploy      # apply migrations to DATABASE_URL first
npm run docker:up      # build + start
npm run docker:ps
npm run docker:logs
npm run docker:down
```

Keep `apps/backend/.env` (database URL, JWT secret, Resend key) and `.neon` (Neon org/project IDs) local. Both are gitignored; never commit or `git add -f` them.

| Service | URL |
| --- | --- |
| UI | <http://localhost:3000> |
| API | <http://localhost:3000/api> |
| Auth | <http://localhost:3000/api/auth> |
| Swagger | <http://localhost:3000/docs> |

The container reads `apps/backend/.env` for `DATABASE_URL` (Neon), `JWT_SECRET`, and Resend settings. The UI is built with `VITE_API_URL=/api`, so browser requests are same-origin.

> Docker's bridge network can resolve Neon's pooler hostname to an edge it cannot reach. Compose pins that hostname to a working IPv4 via `extra_hosts`, using `NEON_DB_HOST` / `NEON_DB_IP` from the root `.env`. If your host does not need this workaround, remove the `extra_hosts` block from `docker-compose.yml`.

Override the public origin when deploying:

```bash
PUBLIC_URL=https://app.example.com npm run docker:up
```

## Deployment

The frontend is configured for Vercel in `vercel.json`, with `apps/ui/dist` as the output directory. Deploy the API to a Node host, set `DATABASE_URL` and `JWT_SECRET`, run `npm run db:deploy`, then start it with `npm run start:prod --workspace @mononet/backend`.
