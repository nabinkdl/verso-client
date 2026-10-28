# Mononet API

NestJS REST API for the Mononet (Verso) social app, backed by Prisma ORM and PostgreSQL.

## Stack

- NestJS 12 (ESM)
- Prisma ORM 7 with the PostgreSQL driver adapter
- PostgreSQL 16
- JWT authentication (Passport)
- Socket.IO for real-time chat
- Resend for transactional email (password reset)
- Swagger / OpenAPI docs
- Vitest for tests

## Requirements

- Node.js 22+
- npm 10+
- A PostgreSQL database (this project uses Neon)

## Setup

From the repository root:

```bash
npm install
cp apps/backend/.env.example apps/backend/.env
# Set DATABASE_URL, DATABASE_URL_UNPOOLED, and JWT_SECRET in apps/backend/.env.
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
| `POST` | `/auth/forgot-password` | Email a single-use password reset link |
| `POST` | `/auth/reset-password` | Reset a password with an emailed token |
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

### Chat

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/conversations` | List your conversations (`cursor`, `limit`) |
| `GET` | `/conversations/unread-count` | Unread messages and conversations |
| `POST` | `/conversations` | Get or create a direct conversation (`username` or `userId`) |
| `GET` | `/conversations/:id` | One conversation |
| `GET` | `/conversations/:id/messages` | Page history (`cursor`, `limit`) |
| `POST` | `/conversations/:id/messages` | Send over HTTP (also broadcasts) |
| `POST` | `/conversations/:id/read` | Mark read (`messageId` optional) |

Real-time: connect to Socket.IO at `<origin>/chat` with `{ auth: { token } }` (the same JWT). Events: `conversation:join`, `message:send`, `message:read`, `typing:start`/`typing:stop` from the client; `message:created`, `conversation:updated`, `conversation:read`, `typing`, `chat:error` from the server. See [docs/API-DESIGN.md](../../docs/API-DESIGN.md) for payloads.

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

## Project layout

```text
apps/backend/
├── prisma/
│   ├── schema.prisma       # data model
│   ├── migrations/         # committed migrations
│   └── seed.ts             # demo data
├── src/
│   ├── auth/               # register, login, JWT strategy
│   ├── users/              # profiles, search, follows
│   ├── posts/              # posts, likes, comments, feed
│   ├── prisma/             # Prisma client provider
│   ├── email/              # Resend password-reset email
│   ├── common/             # DTOs and filters
│   ├── config/             # environment validation
│   ├── health/             # database health check
│   ├── generated/prisma/   # generated client (gitignored)
│   ├── app.module.ts
│   └── main.ts
└── test/
```

## Environment variables

See `.env.example`. `DATABASE_URL` and `JWT_SECRET` are required; `JWT_SECRET` must be at least 32 characters. `JWT_EXPIRES_IN` defaults to `7d`.

Password reset email uses `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `APP_URL` (the public UI URL used to build the reset link). Reset links are single-use and expire after `PASSWORD_RESET_TOKEN_TTL_MINUTES` (default 60). Without a verified Resend domain, the test sender `onboarding@resend.dev` can only deliver to the Resend account owner's address.

## Production

```bash
npm run build:api
npm run db:deploy
npm run start:prod --workspace @mononet/backend
```

Set `NODE_ENV=production`, a managed `DATABASE_URL`, and a strong `JWT_SECRET`. The API can be deployed to any Node host; the UI is deployed separately to Vercel.
