# Replit Replace — Files to Update for Non-Replit Deployment

When deploying outside of Replit (e.g., Vercel, AWS Lightsail, Docker), the files and settings below are Replit-specific and need to be replaced or removed.

---

## 1. `.replit` — Replit Replace

**File:** `.replit`  
**Purpose:** Tells the Replit platform how to run the project (modules, workflow config, agent mode).  
**Replace with:** Use `vercel.json` (already provided) for Vercel, `.dockertest` for Docker, or `AWSLightSailTEST` for Lightsail.  
**Action:** Delete or ignore this file outside of Replit.

---

## 2. Vite Plugins (Replit-specific)

**Files:** `artifacts/boxing-club/vite.config.ts`, `artifacts/mockup-sandbox/vite.config.ts`  
**Replit-specific blocks:**
```typescript
// Replit Replace — remove these plugins in non-Replit builds:
await import("@replit/vite-plugin-cartographer").then(...)
await import("@replit/vite-plugin-dev-banner").then(...)
```
These only activate when `process.env.REPL_ID` is set, so they are **automatically skipped** in non-Replit environments. No change needed.

---

## 3. `pnpm-workspace.yaml` — Replit Replace (catalog overrides)

**File:** `pnpm-workspace.yaml`  
**Replit-specific:** The `overrides` section strips many platform-specific binaries (Darwin, Windows, ARM, etc.) to reduce install size in the Replit container. On a general-purpose server you may want to remove these overrides so all platform binaries install correctly:
```yaml
# Replit Replace — remove or adjust these overrides for your target platform:
overrides:
  '@esbuild-kit/esm-loader': npm:tsx@^4.21.0
  esbuild: 0.27.3
  esbuild>@esbuild/aix-ppc64: '-'
  ...
```

---

## 4. `start.sh` — Replit Replace

**File:** `start.sh`  
**Purpose:** Development-only startup script for Replit.  
**Replace with:** Use `pm2` (see `AWSLightSailTEST`), Docker CMD, or Vercel's build+run system.  
**Action:** Do not use `start.sh` in production.

---

## 5. Environment Variables — Replit Replace

In Replit, env vars are managed through Replit Secrets. Outside Replit, set them via:
- **Vercel:** Dashboard → Settings → Environment Variables (or use `@secret-name` refs in `vercel.json`)
- **Docker:** `ENV` instructions in `.dockertest` or `--env-file` at runtime
- **Lightsail/VPS:** `/etc/environment` or a `.env` file loaded by your process manager

Variables that need to be set:
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL (or MySQL) connection string |
| `ADMIN_CODE` | Secret code to register as admin |
| `COACH_CODE` | Secret code to register as coach |
| `NODE_ENV` | Set to `production` |
| `PORT` | API server port (3000) |

---

## 6. Sessions Table Comment — Replit Replace

**File:** `lib/db/src/schema/auth.ts`  
**Comment:** `// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.`  
**Note:** The `sessions` table is used for the **custom cookie-based auth** in this app (not Replit OAuth). Keep this table regardless of deployment platform — it stores user sessions.
