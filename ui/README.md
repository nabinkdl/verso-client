
# UI (Verso) — Project Objective
<img width="1392" height="848" alt="Screenshot 2026-07-15 at 3 32 43 pm" src="https://github.com/user-attachments/assets/4c4327e4-f397-493b-9540-fc7bd175013b" />

This package is the frontend of the **Mononet** monorepo.

## Objective

Build a small, **mobile-style social app UI prototype** named **Verso**. The UI focuses on demonstrating core social interactions in a clean black/white interface:

- Sign in (UI only)
- Feed of posts with likes, comments, and saved posts
- Reels-style full-screen feed
- Search users and follow/unfollow
- Create/publish a new post
- Pages/communities with members, roles, events, and settings
- Marketplace with listings, cart, checkout, and orders
- Chat list and in-chat messaging
- Profile view/edit with profile photos and logout
- Light/dark theme

This UI is designed as a **front-end prototype**: screens, interactions, and state updates are implemented locally to help validate UX and flows before connecting a real backend.

## What it is / isn’t

- ✅ Works as a functional UI demo using seeded data and in-memory state
- ✅ Good for showcasing layout and interaction patterns
- ❌ Not production auth (login does not validate credentials)
- ❌ No persistence (refresh resets data)
- ❌ No backend integration yet (Supabase is installed but not wired in)

## Documentation

- [User Guide](docs/USER_GUIDE.md) — a task-by-task guide to using the app

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS (plus inline styles in components)

## App Structure (high level)

- `src/App.tsx`: screen routing + in-memory state (users, posts, chats)
- `src/components/*`: UI screens (Home, Search, New Post, Chat, Profile, Login) + shared UI pieces
- `src/data.ts`: seeded sample users/posts/chats
- `src/types.ts`: shared TypeScript types

## Run Locally

From the repository root:

- Install dependencies: `npm ci`
- Start dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`

Or, from this `ui` folder:

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`

