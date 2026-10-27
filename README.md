# Mononet

Monorepo for the Verso social app and its supporting services.

## Structure

| Path | Purpose |
| --- | --- |
| `ui/` | Verso frontend — React, TypeScript, and Vite |
| `backend/` | Backend services (next stage) |

## Getting started

### UI

From the repository root:

```bash
npm ci
npm run dev
```

The Vite development server runs at `http://localhost:5173`.

Other root commands:

```bash
npm run build      # builds the UI into ui/dist
npm run lint
npm run typecheck
npm run preview
```

You can also work directly inside `ui/` with `npm install` and `npm run dev`.

### Backend

The backend will be added in the next stage. Once it exists, its setup and run instructions will be documented here.

## Deployment

Vercel builds from the repository root using `vercel.json`:

- Installs the `ui` workspace with `npm ci`
- Runs the root `npm run build` script
- Publishes `ui/dist`

## Documentation

- [UI README](ui/README.md)
- [User Guide](ui/docs/USER_GUIDE.md)

## Notes

- The UI is a front-end prototype using seeded, in-memory data.
- Most UI state resets on a full page reload.
- Git history for the frontend is preserved after moving it into `ui/`.
