# 🚀 Hermes Setup Guide

Get Hermes running locally or on AWS EC2 in minutes.

## Local Development (Docker)

### Prerequisites
- Docker & Docker Compose
- Claude API Key (get from https://console.anthropic.com)
- Optional: Twilio credentials

### Quick Start

1. **Clone and Configure**
   ```bash
   cd hermes
   cp .env.example .env
   # Edit .env with your values
   ```

2. **Start Everything**
   ```bash
   docker-compose up
   ```

   Docker will build and start:
   - PostgreSQL database (port 5432)
   - Node.js backend (port 3001)
   - React frontend (port 3000)

3. **Access the App**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001/api/health

4. **Stop Everything**
   ```bash
   docker-compose down
   ```

## Local Development (Manual)

If you prefer running services manually:

### Backend

```bash
cd backend
pnpm install
# Set environment variables
export DATABASE_URL="postgresql://hermes:hermes_dev@localhost:5432/hermes"
export CLAUDE_API_KEY="your-key-here"
export JWT_SECRET="dev-secret"
export ORGANIZATION="personal-biz"

# Run migrations
pnpm db:migrate

# Start dev server
pnpm dev
```

Server runs on http://localhost:3001

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Server runs on http://localhost:3000

### Database

Need PostgreSQL running locally:

```bash
# With Homebrew (macOS)
brew install postgresql
brew services start postgresql

# With apt (Linux)
sudo apt install postgresql
sudo service postgresql start

# Create database
createdb hermes
```

## AWS EC2 Deployment

### Prerequisites
- AWS account with EC2 access
- EC2 instance with Ubuntu 22.04 LTS
- SSH access to instance
- Claude API key
- Twilio credentials (optional)

### Step 1: Prepare Instance

SSH into your instance:
```bash
ssh -i your-key.pem ubuntu@your-instance-ip
```

Install Docker:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
exit
# Reconnect
ssh -i your-key.pem ubuntu@your-instance-ip
```

### Step 2: Deploy Hermes

Clone the repo:
```bash
git clone <your-hermes-repo-url>
cd hermes
cp .env.example .env
# Edit .env with production values
nano .env
```

Critical environment variables:
```env
DATABASE_URL=postgresql://hermes:secure-password@db:5432/hermes
CLAUDE_API_KEY=your-claude-key
JWT_SECRET=generate-with-openssl-rand-hex-32
ORGANIZATION=your-business-name
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
NODE_ENV=production
```

### Step 3: Start with Docker Compose

```bash
docker-compose up -d
```

Check status:
```bash
docker ps
docker logs hermes_backend_1
```

### Step 4: Configure Domain & HTTPS

Update security group to allow HTTP/HTTPS:
```bash
# In AWS Console:
# Edit inbound rules for your instance
# Add: HTTP (80), HTTPS (443)
```

Add domain in nginx/load balancer config, or use AWS Route 53 + CloudFront.

### Step 5: Setup Auto-Restart

Ensure containers restart on reboot:
```bash
docker-compose down
docker-compose up -d --restart=always
```

## Configuration

### Environment Variables

See `.env.example` for all available options:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `CLAUDE_API_KEY` | Yes | Anthropic API key |
| `JWT_SECRET` | Yes | Secret for session tokens (use `openssl rand -hex 32`) |
| `ORGANIZATION` | Yes | Organization identifier |
| `NODE_ENV` | No | `development` or `production` |
| `TWILIO_ACCOUNT_SID` | No | For Twilio integration |
| `TWILIO_AUTH_TOKEN` | No | For Twilio integration |
| `N8N_URL` | No | URL to n8n instance |
| `PORT` | No | Backend port (default: 3001) |

### Twilio Setup

1. Create Twilio account: https://www.twilio.com/console
2. Get ACCOUNT_SID and AUTH_TOKEN
3. Purchase a phone number
4. Add to `.env`:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your-auth-token
   ```

### n8n Integration

Connect Hermes to n8n for data fetching:

1. Deploy n8n: https://docs.n8n.io/hosting/
2. Create webhooks for:
   - CRM data lookup
   - Email history fetching
   - Booking/appointment creation
3. Add webhook URLs to agent config in Hermes UI

Example n8n webhook URL in agent:
```json
{
  "crm_lookup": "http://n8n:5678/webhook/crm-lookup",
  "email_history": "http://n8n:5678/webhook/email-history",
  "booking": "http://n8n:5678/webhook/booking"
}
```

## Development Tips

### Hot Reload

Both backend and frontend support hot reload in development:

**Backend (with tsx watch):**
```bash
cd backend
pnpm dev
```

**Frontend (Vite):**
```bash
cd frontend
pnpm dev
```

### Database Debugging

Connect to database:
```bash
psql postgresql://hermes:hermes_dev@localhost:5432/hermes
```

Useful queries:
```sql
SELECT * FROM agents;
SELECT * FROM calls ORDER BY created_at DESC LIMIT 10;
SELECT * FROM messages WHERE call_id = 123;
```

### API Testing

Test endpoints with curl:
```bash
# Create agent
curl -X POST http://localhost:3001/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Agent",
    "system_prompt": "You are a helpful assistant",
    "phone_number": "+1234567890",
    "provider": "twilio"
  }'

# Get agents
curl http://localhost:3001/api/agents

# Health check
curl http://localhost:3001/api/health
```

## Troubleshooting

### Port Already in Use

Change port in `docker-compose.yml`:
```yaml
backend:
  ports:
    - "3002:3001"  # Change 3001 to unused port
```

### Database Connection Error

Check database is running:
```bash
docker ps | grep postgres
docker logs postgres_container_name
```

### Claude API Error

Verify API key:
```bash
# Check it's set in .env
cat .env | grep CLAUDE_API_KEY

# Test with curl
curl https://api.anthropic.com/v1/health \
  -H "x-api-key: $CLAUDE_API_KEY"
```

### Frontend Can't Reach API

Check API URL in frontend/vite.config.ts proxy settings.

In development, it should proxy to `http://localhost:3001`.

## Next Steps

1. Create your first agent at http://localhost:3000/agents
2. Configure n8n webhooks
3. Set up Twilio for phone calls
4. Test inbound/outbound calls
5. View call history and analytics

## Support

- GitHub Issues: Report bugs
- Documentation: Check `/docs` folder
- API Docs: Visit http://localhost:3001/api/docs (when implemented)
