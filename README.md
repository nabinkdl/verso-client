# Client (Verso) — Project Objective

## Objective

Build a small, **mobile-style social app UI prototype** named **Verso**. The client focuses on demonstrating core social interactions in a clean black/white interface:

- Sign in (UI only)
- Feed of posts with likes and comments
- Search users and follow/unfollow
- Create/publish a new post
- Chat list and in-chat messaging
- Profile view/edit (e.g., change display name) and logout

This client is designed as a **front-end prototype**: screens, interactions, and state updates are implemented locally to help validate UX and flows before connecting a real backend.

## What it is / isn’t

- ✅ Works as a functional UI demo using seeded data and in-memory state
- ✅ Good for showcasing layout and interaction patterns
- ❌ Not production auth (login does not validate credentials)
- ❌ No persistence (refresh resets data)
- ❌ No backend integration yet (Supabase is installed but not wired in)

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

From the `client` folder:

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`

