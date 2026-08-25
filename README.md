# Gotcha — The Hunt Ends Here

AI-powered job search and career intelligence platform. Gotcha finds where you fit — Boolean/X-ray search generation, AI career coaching, CV intelligence, application tracking, and market insights, all in one place.

## Tech stack

- **Framework:** TanStack Router + React
- **Styling:** Tailwind
- **Auth:** better-auth
- **Data:** PGlite / Kysely
- **State:** Zustand

## Getting started

```bash
npm install
npm run dev
```

App runs on `http://localhost:8080` by default.

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build + DB migration
- `npm run typecheck` — TypeScript check
- `npm run lint` — ESLint
- `npm test` — run test suite

## Project structure

```
src/
  components/   # UI components (App.tsx is the main app shell)
  lib/          # auth, data, AI, store, utilities
  routes/       # TanStack Router routes
migrations/     # DB migrations
scripts/        # build/dev tooling
```

## License

Private — all rights reserved.
