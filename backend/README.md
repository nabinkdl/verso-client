# Mononet API

NestJS REST API for the Mononet (Verso) social app, backed by Prisma ORM and PostgreSQL.

## Stack

- NestJS 12 (ESM)
- Prisma ORM 7 with the PostgreSQL driver adapter
- PostgreSQL 16
- JWT authentication (Passport)
- Swagger / OpenAPI docs
- Vitest for tests

## Requirements

- Node.js 22+
- npm 10+
- Docker (for the local PostgreSQL container)

## Setup

From the repository root:

```bash
npm install
npm run db:up          # start PostgreSQL on localhost:5432
cp backend/.env.example backend/.env
npm run db:migrate     # apply migrations
npm run db:seed        # load demo users and posts
```

Start the API:

```bash
npm run dev:api        # http://localhost:3000/api
```

Swagger docs: <http://localhost:3000/docs>

Health check: <http://localhost:3000/api/health>

## Demo account

The seed script creates six accounts. All use the password `Password123!`.

| Email | Username |
| --- | --- |
| `alex@mononet.dev` | `alexm` |
| `jamie@mononet.dev` | `jamiel` |
| `taylor@mononet.dev` | `tray` |
| `casey@mononet.dev` | `caseyw` |
| `jordan@mononet.dev` | `jsmith` |
| `riley@mononet.dev` | `rpark` |

## Endpoints

All routes use the `/api` prefix.

### Auth

| Method | Path | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Create an account |
| `POST` | `/auth/login` | Sign in with email or username |
| `GET` | `/auth/me` | Current account |

### Users

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/users/me` | Current profile |
| `PATCH` | `/users/me` | Update name, bio, or avatar |
| `GET` | `/users/search?q=` | Search users |
| `GET` | `/users/:username` | Public profile |
| `POST` | `/users/:username/follow` | Follow a user |
| `DELETE` | `/users/:username/follow` | Unfollow a user |

### Posts

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/posts` | List posts (`author`, `q`, `cursor`, `limit`) |
| `GET` | `/posts/feed` | Posts from followed users and yourself |
| `GET` | `/posts/:id` | Single post |
| `POST` | `/posts` | Create a post |
| `PATCH` | `/posts/:id` | Edit your post |
| `DELETE` | `/posts/:id` | Delete your post |
| `POST` | `/posts/:id/like` | Like a post |
| `DELETE` | `/posts/:id/like` | Unlike a post |
| `GET` | `/posts/:id/comments` | List comments |
| `POST` | `/posts/:id/comments` | Add a comment |
| `DELETE` | `/posts/:id/comments/:commentId` | Delete a comment |

Authenticated routes expect `Authorization: Bearer <accessToken>`.

## Scripts

Run from the repository root:

| Command | Description |
| --- | --- |
| `npm run dev:api` | Start NestJS in watch mode |
| `npm run build:api` | Generate the Prisma client and build |
| `npm run test` | Run all workspaces' tests |
| `npm run lint` | Lint all workspaces |
| `npm run typecheck` | Typecheck all workspaces |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:migrate` | Create/apply a development migration |
| `npm run db:deploy` | Apply committed migrations (production) |
| `npm run db:seed` | Reset and seed demo data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:up` / `npm run db:down` | Start/stop PostgreSQL |

## Project layout

```text
backend/
├── prisma/
│   ├── schema.prisma       # data model
│   ├── migrations/         # committed migrations
│   └── seed.ts             # demo data
├── src/
│   ├── auth/               # register, login, JWT strategy
│   ├── users/              # profiles, search, follows
│   ├── posts/              # posts, likes, comments, feed
│   ├── prisma/             # Prisma client provider
│   ├── common/             # decorators, guards, filters, DTOs
│   ├── config/             # environment validation
│   ├── health/             # database health check
│   ├── generated/prisma/   # generated client (gitignored)
│   ├── app.module.ts
│   └── main.ts
└── test/
```

## Environment variables

See `.env.example`. `DATABASE_URL` and `JWT_SECRET` are required; `JWT_SECRET` must be at least 32 characters.

## Production

```bash
npm run build:api
npm run db:deploy
npm run start:prod --workspace @mononet/backend
```

Set `NODE_ENV=production`, a managed `DATABASE_URL`, and a strong `JWT_SECRET`. The API can be deployed to any Node host; the UI is deployed separately to Vercel.
