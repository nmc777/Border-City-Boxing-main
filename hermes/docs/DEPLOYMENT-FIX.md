# 🔧 Hermes Deployment Fix Guide

## What Was Fixed

The initial Docker build had issues with TypeScript compilation in the container. These fixes address:

1. **Missing Lock Files**: Removed `--frozen-lockfile` constraints that required pnpm-lock.yaml to exist
2. **Migration Timing**: Separated database migrations from the startup CMD to prevent crashes
3. **Build Verification**: Added explicit checks to ensure TypeScript compiles successfully
4. **Development Volume Mount**: Removed the volume mount that interfered with compiled output
5. **Better Error Diagnostics**: Added clear error messages during the build process

## Key Changes

### Backend (Dockerfile)
- Changed from `pnpm install --frozen-lockfile` to `pnpm install --no-frozen-lockfile`
- Added build verification checks to ensure dist/ directory and compiled files exist
- Created `entrypoint.sh` to handle graceful startup and migrations

### Frontend (Dockerfile)
- Updated to use `--no-frozen-lockfile` for flexibility
- Simplified package.json build script to just `vite build`

### Docker Compose
- Removed the `volumes` mount for backend source code that was interfering with the build

---

## AWS EC2 Redeployment Steps

### 1. SSH into Your Instance

```bash
ssh -i hermes-key.pem ubuntu@34.229.231.36
```

### 2. Stop and Remove Old Containers

```bash
cd ~/hermes
docker-compose down -v  # Also removes volumes
```

### 3. Pull Latest Changes

```bash
git pull origin main
```

You should see the commit: "Fix Docker build: improve TypeScript compilation and startup resilience"

### 4. Rebuild and Start

```bash
docker-compose build --no-cache
docker-compose up -d
```

### 5. Check Build Progress

Monitor the build as it happens:

```bash
docker-compose logs -f
```

Wait for output like:
```
hermes-postgres-1  | ... ready to accept connections
hermes-backend-1   | ✓ Build successful
hermes-backend-1   | ✓ Frontend build successful
hermes-backend-1   | 🤖 Hermes running on port 3001
```

### 6. Verify Deployment

Check that all containers are running:

```bash
docker ps
```

Test the API:

```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "organization": "personal-biz",
  "timestamp": "2026-05-03T..."
}
```

Test the frontend:

```bash
curl http://localhost:3000 | head -20
```

Should return HTML with "Hermes" in it.

### 7. Check Logs for Any Errors

```bash
docker-compose logs hermes_backend_1
docker-compose logs hermes_frontend_1
docker-compose logs hermes_db_1
```

---

## What to Expect During Startup

The backend entrypoint script (`entrypoint.sh`) will:

1. **Wait for Database** (up to 20 seconds)
   ```
   ⏳ Waiting for database...
   ```

2. **Run Migrations** (first time only)
   ```
   🔄 Running migrations...
   ✅ Migrations completed successfully
   ```

3. **Start the API**
   ```
   📱 Starting Hermes API...
   🤖 Hermes running on port 3001
   📍 Organization: personal-biz
   🔧 Environment: development
   ```

### If Migrations Fail

If the database isn't ready, the app will still start anyway (migrations aren't required for the API to function). You can manually run them:

```bash
docker-compose exec hermes_backend_1 pnpm db:migrate
```

---

## Security Configuration (AWS)

The EC2 instance security group should allow:

| Protocol | Port | Source |
|----------|------|--------|
| SSH | 22 | Your IP (restrict for security) |
| HTTP | 80 | 0.0.0.0/0 |
| HTTPS | 443 | 0.0.0.0/0 |
| TCP (API) | 3001 | 0.0.0.0/0 (optional, frontend calls it) |
| TCP (Frontend) | 3000 | 0.0.0.0/0 (internal only) |

### To Restrict SSH to Your IP

1. Get your public IP: `curl ifconfig.me`
2. In AWS Console → EC2 → Security Groups → Edit Inbound Rules
3. Change SSH rule source from `0.0.0.0/0` to `YOUR_IP/32`

---

## Testing the Deployment

### 1. Create an Agent

```bash
curl -X POST http://34.229.231.36:3001/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Agent",
    "system_prompt": "You are a helpful support agent",
    "phone_number": "+1234567890",
    "provider": "mock"
  }'
```

### 2. Access the Dashboard

Open your browser: `http://34.229.231.36:3000`

You should see:
- Hermes dashboard header
- Agents and Calls navigation
- Getting started guide

### 3. View API Docs

```bash
curl http://34.229.231.36:3001/api/health | jq
```

---

## Troubleshooting

### "Cannot find module '/app/dist/migrate.js'"

The build didn't complete. Check:

```bash
docker-compose logs hermes_backend_1 | grep -i error
```

Rebuild without cache:

```bash
docker-compose build --no-cache backend
```

### Database Connection Refused

The database might not be fully ready. Wait 10 seconds and try again:

```bash
docker-compose restart hermes_backend_1
```

### Frontend Returns 502 Bad Gateway

The backend might still be starting. Check logs:

```bash
docker-compose logs -f hermes_backend_1
```

### Port Already in Use

If port 3001 or 3000 are already in use:

Edit `docker-compose.yml` and change:
```yaml
ports:
  - "3002:3001"  # Change external port
```

---

## Next Steps

1. ✅ Redeploy with fixed Docker
2. ✅ Verify all containers are running
3. ⬜️ Add Twilio credentials to `.env`
4. ⬜️ Create your first agent
5. ⬜️ Test inbound/outbound calls
6. ⬜️ Configure n8n webhooks (optional)

---

## Environment Variables

Update `.env` on the EC2 instance with your production values:

```env
# Database (uses docker-compose network, don't change)
DATABASE_URL=postgresql://hermes:hermes_dev@db:5432/hermes

# Claude API
CLAUDE_API_KEY=sk-ant-your-key-here

# Security
JWT_SECRET=your-32-character-hex-string

# Organization
ORGANIZATION=personal-biz

# Phone (add when ready)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token

# Environment
NODE_ENV=production
```

After updating `.env`, restart:

```bash
docker-compose restart hermes_backend_1
```

---

## Performance Monitoring

Watch container resource usage:

```bash
docker stats
```

Watch logs in real-time:

```bash
docker-compose logs -f
```

---

## Support

If you encounter issues:

1. Check the logs: `docker-compose logs`
2. Verify the .env file: `cat .env | grep -v '^#'`
3. Test connectivity to database: `docker-compose exec hermes_backend_1 pg_isready -h db`
4. Review the SETUP.md and ARCHITECTURE.md documentation

