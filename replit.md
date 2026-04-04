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
- `/walkin` — Walk-in kiosk (no login required — for in-gym sign-in)
- `/api/*` — Backend API (proxied through Vite in dev)

## Walk-In Kiosk
A separate full-screen page at `/walkin` for gym front desk use. Members who walk in can:
1. Select a class from the list
2. Enter their first name, last name, and email
3. Sign in — recorded in the `walk_ins` DB table
No account or login required. Resets automatically after 12 seconds.

## Deployment Config Files
- `vercel.json` — Vercel deployment config (routes `/api/*` to serverless, rest to static frontend)
- `api/server.ts` — Vercel serverless function adapter for the Express app
- `.dockertest` — Dockerfile with `<nmcdebug>` placeholders for Docker deployment
- `MySQLTEST` — MySQL migration guide with `<nmcdebug>` placeholders for AWS Lightsail MySQL
- `AWSLightSailTEST` — Full step-by-step AWS Lightsail deployment guide with `<nmcdebug>` placeholders
- `REPLIT_REPLACE.md` — Documents all Replit-specific files/code that need replacing for other platforms
