# 🤖 Hermes: AI Phone Agent Platform

An intelligent phone automation system that combines AI, business data integration, and phone call handling for customer service, sales, and business automation.

## Features

- **Inbound & Outbound Calls** - Handle both customer calls and make outbound calls
- **AI-Powered Conversations** - Powered by Claude with access to business context
- **Data Integration** - Connect to n8n workflows to fetch emails, CRM data, and custom business data
- **Booking Integration** - Agents can schedule appointments automatically
- **Call Recording & Transcription** - Store and analyze all conversations
- **Multi-Organization Support** - Separate instances for personal and business use
- **Flexible Phone Providers** - Abstract layer supports Twilio, Retell AI, and custom providers

## Tech Stack

- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + Vite + TypeScript
- **Database**: PostgreSQL
- **LLM**: Claude (Anthropic API)
- **Deployment**: Docker + Docker Compose

## ⚠️ Recent Updates

If you're redeploying to AWS EC2 after the initial launch, see [DEPLOYMENT-FIX.md](docs/DEPLOYMENT-FIX.md) for important Docker build fixes.

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose (v20.10+)
- Claude API key (get from [console.anthropic.com](https://console.anthropic.com))
- PostgreSQL (or use Docker Compose version)

### Development

1. **Clone and setup**
   ```bash
   git clone <repo-url>
   cd hermes
   cp .env.example .env
   # Edit .env with your values
   ```

2. **Start with Docker**
   ```bash
   docker-compose up
   ```

3. **Access the app**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001
   - Database: localhost:5432

### Manual Setup (No Docker)

**Backend:**
```bash
cd backend
pnpm install
DATABASE_URL=postgresql://user:pass@localhost/hermes CLAUDE_API_KEY=your-key npm run db:migrate
npm run dev
```

**Frontend:**
```bash
cd frontend
pnpm install
npm run dev
```

## Environment Variables

See `.env.example` for all available options. Key variables:

- `DATABASE_URL` - PostgreSQL connection string
- `CLAUDE_API_KEY` - Your Anthropic API key
- `JWT_SECRET` - Secret for session tokens
- `ORGANIZATION` - Organization identifier (e.g., "personal-biz")
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` - For Twilio support
- `N8N_URL` - URL to your n8n instance

## Architecture

```
┌─────────────────────────────────────────┐
│         Web Dashboard (React)           │
│  - Agent Management                     │
│  - Call History & Analytics             │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      Express API Backend                │
│  - Agent CRUD                           │
│  - Call Handler                         │
│  - Webhook Receiver                     │
└────────────────┬────────────────────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼───┐   ┌───▼───┐   ┌───▼─────┐
│Claude │   │  n8n  │   │  Phone  │
│  API  │   │       │   │  (Twilio│
└───────┘   └───────┘   └─────────┘
    │            │            │
    └────────────┼────────────┘
                 │
        ┌────────▼────────┐
        │   PostgreSQL    │
        │   Database      │
        └─────────────────┘
```

## Project Structure

```
hermes/
├── backend/
│   ├── src/
│   │   ├── api/          # API routes
│   │   ├── services/     # Core services (Claude, phone, n8n)
│   │   ├── db/           # Database schemas & migrations
│   │   ├── app.ts        # Express app
│   │   └── env.ts        # Config
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/        # React pages
│   │   ├── components/   # React components
│   │   ├── api/          # API client
│   │   └── App.tsx
│   ├── Dockerfile
│   ├── vite.config.ts
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## Next Steps

- [ ] Implement agent CRUD API endpoints
- [ ] Build agent configuration UI
- [ ] Integrate with Twilio for calls
- [ ] Add n8n webhook caller
- [ ] Implement call recording
- [ ] Add call transcription
- [ ] Build booking integration
- [ ] Create analytics dashboard

## Contributing

PRs welcome! Follow the existing code style and add tests for new features.

## License

MIT

---

**Built with ❤️ for business automation**
