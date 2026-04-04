# Boxing Club - Border City Boxing

A full-stack web application for managing a boxing gym with member, coach, and admin portals.

## Architecture

**Monorepo** managed with `pnpm` workspaces.

### Apps (`artifacts/`)
- `boxing-club/` — React 19 + Vite frontend (port 5000)
- `api-server/` — Express 5 backend API (port 3000)
- `mockup-sandbox/` — UI component sandbox

### Libraries (`lib/`)
- `db/` — Drizzle ORM schema + PostgreSQL connection
- `api-spec/` — OpenAPI specification
- `api-client-react/` — Generated TanStack Query hooks
- `api-zod/` — Generated Zod validation schemas
- `replit-auth-web/` — Replit auth utilities

## Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS 4, Radix UI, Wouter, TanStack Query
- **Backend:** Express 5, TypeScript, Pino logging
- **Database:** PostgreSQL via Drizzle ORM
- **Auth:** Custom session-based auth with bcryptjs (cookie sessions stored in DB)
- **Code Gen:** Orval generates API clients from OpenAPI spec

## Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (auto-set by Replit DB)
- `PORT` — Server port (frontend: 5000, backend: 3000)
- `BASE_PATH` — Vite base path (default: `/`)
- `API_PORT` — Backend port for Vite proxy (default: 3000)
- `ADMIN_CODE` — Admin registration code (default: `BCB-ADMIN-2024`)
- `COACH_CODE` — Coach registration code (default: `BCB-COACH-2024`)
- `NODE_ENV` — Environment mode
- `LOG_LEVEL` — Pino log level (optional)

## Running Locally
The `start.sh` script runs both services:
1. API server builds (esbuild) and starts on port 3000
2. Vite dev server starts on port 5000 with proxy to `/api` → localhost:3000

## Database
PostgreSQL via Replit's built-in database. Schema pushed via:
```bash
pnpm --filter @workspace/db run push
```

## Key Routes
- `/` — Home page
- `/classes` — Browse and book classes
- `/bookings` — Member's bookings
- `/coach` — Coach portal
- `/admin` — Admin portal
- `/api/*` — Backend API (proxied through Vite in dev)
