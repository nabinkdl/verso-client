# Mononet

Monorepo for the Verso social app and its API.

## Structure

| Path | Purpose |
| --- | --- |
| `ui/` | Verso frontend — React, TypeScript, Vite, Tailwind |
| `backend/` | Mononet API — NestJS, Prisma, PostgreSQL |
| `docker-compose.yml` | Local PostgreSQL database |

## Requirements

- Node.js 22+
- npm 10+
- Docker (for the local database)

## Quick start

```bash
# Install dependencies for every workspace
npm install

# Start PostgreSQL and prepare the database
npm run db:up
cp backend/.env.example backend/.env
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
| `npm run db:up` | Start the PostgreSQL container |
| `npm run db:down` | Stop the PostgreSQL container |
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

See [backend/README.md](backend/README.md) for the API reference, data model, and deployment notes.

## Frontend

The UI is currently a front-end prototype with seeded, in-memory data. It is not wired to the API yet; connecting the screens to these endpoints is the next step.

See [ui/README.md](ui/README.md) and [ui/docs/USER_GUIDE.md](ui/docs/USER_GUIDE.md).

## Environment

Copy `backend/.env.example` to `backend/.env`. Database and JWT settings live there; the file is gitignored.

## Deployment

The frontend is configured for Vercel in `vercel.json`, with `ui/dist` as the output directory. Deploy the API to a Node host, set `DATABASE_URL` and `JWT_SECRET`, run `npm run db:deploy`, then start it with `npm run start:prod --workspace @mononet/backend`.
