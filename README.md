# Mononet

Monorepo for the Verso social app and its supporting services.

## Structure

| Path | Purpose |
| --- | --- |
| `ui/` | Verso frontend — React, TypeScript, and Vite |
| `backend/` | Backend services (next stage) |

## Getting started

### UI

```bash
cd ui
npm install
npm run dev
```

The Vite development server runs at `http://localhost:5173`.

### Backend

The backend will be added in the next stage. Once it exists, its setup and run instructions will be documented here.

## Documentation

- [UI README](ui/README.md)
- [User Guide](ui/docs/USER_GUIDE.md)

## Notes

- The UI is a front-end prototype using seeded, in-memory data.
- Most UI state resets on a full page reload.
- Git history for the frontend is preserved after moving it into `ui/`.
