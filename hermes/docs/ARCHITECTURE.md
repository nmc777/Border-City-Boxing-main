# 🏗️ Hermes Architecture

Technical overview of Hermes' design and components.

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  User Interface (React)             │
│  Dashboard • Agent Management • Call History UI    │
└────────────────────┬────────────────────────────────┘
                     │ HTTP/REST
┌────────────────────▼────────────────────────────────┐
│              Express.js REST API                    │
│  /api/agents  /api/calls  /api/webhooks            │
├──────────────────────────────────────────────────────┤
│  Services Layer                                      │
│  ┌─────────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Claude      │  │ Phone    │  │ n8n Data     │   │
│  │ Integration │  │ Provider │  │ Fetcher      │   │
│  └─────────────┘  └──────────┘  └──────────────┘   │
└────────────────────┬──────────────────────────────┬─┘
                     │                              │
        ┌────────────▼───────────┐   ┌──────────────▼─────────┐
        │   PostgreSQL           │   │  External Services    │
        │   Database             │   │  - Claude API         │
        │  Users, Agents, Calls  │   │  - Twilio/Retell      │
        │  Messages, Transcripts │   │  - n8n                │
        └────────────────────────┘   └───────────────────────┘
```

## Core Components

### 1. Frontend (React + Vite)

**Purpose:** Web dashboard for managing agents and viewing calls

**Key Pages:**
- `Dashboard` - Overview and navigation
- `Agents` - List, create, edit agents
- `Calls` - View call history with pagination
- `AgentEdit` - Agent configuration form

**API Client:** `src/api/client.ts`
- Typed API requests
- Token-based auth (JWT)
- Error handling

**State Management:** React hooks (useState, useEffect)
- Simple for MVP, can migrate to Redux/Zustand if needed

### 2. Backend (Node.js + Express)

**Purpose:** REST API and core business logic

**Structure:**
```
src/
├── api/          # Route handlers
│   ├── agents.ts     # Agent CRUD
│   └── calls.ts      # Call management
├── services/     # Business logic
│   ├── claude.ts     # LLM integration
│   ├── phone.ts      # Phone provider abstraction
│   └── n8n.ts        # Data fetching
├── db/           # Database layer
│   ├── schema.ts     # TypeScript types & SQL schema
│   ├── db.ts         # Query utilities
│   └── migrate.ts    # Migration runner
├── app.ts        # Express setup
└── env.ts        # Configuration
```

### 3. Database (PostgreSQL)

**Schema:**

```sql
users
  ├─ id (PK)
  ├─ email (UNIQUE)
  ├─ password_hash
  ├─ organization
  └─ created_at

agents
  ├─ id (PK)
  ├─ user_id (FK → users)
  ├─ name
  ├─ system_prompt
  ├─ phone_number
  ├─ provider (twilio | retell | mock)
  ├─ n8n_webhooks (JSONB)
  └─ created_at

calls
  ├─ id (PK)
  ├─ agent_id (FK → agents)
  ├─ direction (inbound | outbound)
  ├─ customer_phone
  ├─ customer_email
  ├─ duration_seconds
  ├─ transcript
  ├─ transcript_translated
  ├─ status (active | completed | failed)
  ├─ created_at
  └─ updated_at

messages
  ├─ id (PK)
  ├─ call_id (FK → calls)
  ├─ role (user | assistant)
  ├─ content (TEXT)
  └─ created_at
```

**Indexes:** On frequently queried columns (user_id, agent_id, call_id, created_at)

### 4. Services

#### Claude Service (`services/claude.ts`)

Handles LLM integration with streaming support.

```typescript
interface AgentContext {
  agentName: string;
  systemPrompt: string;
  customerContext?: {
    email?: string;
    phone?: string;
    crm_data?: Record<string, any>;
    email_history?: string[];
  };
}

async generateResponse(
  messages: ConversationMessage[],
  context: AgentContext,
  stream: boolean = true
): Promise<string | AsyncIterable<string>>
```

**Features:**
- Streaming responses for real-time voice playback
- System prompt injection with customer context
- Function calling (future: for bookings, CRM updates)
- Model: Claude 3.5 Sonnet

#### Phone Service (`services/phone.ts`)

Abstract layer for phone providers.

```typescript
abstract class BasePhoneProvider {
  abstract makeCall(to: string, agentId: number): Promise<string>;
  abstract handleWebhook(event: Record<string, any>): Promise<void>;
}

// Concrete implementations
class TwilioProvider extends BasePhoneProvider { ... }
class MockPhoneProvider extends BasePhoneProvider { ... }
```

**Providers:**
- **Twilio**: Full integration for voice calls
- **Retell AI**: AI-first platform
- **Mock**: Testing without real calls

#### n8n Service (`services/n8n.ts`)

Fetches business data from n8n workflows.

```typescript
async getCrmData(webhookUrl: string, email: string): Promise<Record<string, any>>
async getEmailHistory(webhookUrl: string, customerId: string): Promise<string[]>
async bookAppointment(webhookUrl: string, customerId: string, dateTime: string): Promise<boolean>
```

**Usage Pattern:**
1. Agent receives call from customer
2. Extract customer email/ID from call
3. Call n8n webhook to fetch CRM data
4. Pass context to Claude
5. Claude generates response with customer knowledge
6. If booking needed, call n8n booking webhook

## Data Flow

### Inbound Call Flow

```
1. Customer calls Twilio number
2. Twilio forwards to Hermes /api/webhooks/call
3. Hermes creates Call record (status: active)
4. Extract customer phone, lookup in n8n
5. Get CRM data: emails, order history, etc.
6. Create Agent context with customer data
7. Stream Claude response based on system prompt
8. Send audio back to customer via Twilio
9. Store transcript and messages in DB
10. Update call status: completed
```

### Outbound Call Flow

```
1. Admin clicks "Make Call" on Agent
2. Hermes calls phone provider (Twilio)
3. Create Call record (direction: outbound)
4. Phone provider dials customer
5. When answered, stream Claude response
6. Handle speech recognition for customer input
7. Store conversation history
8. End call, update transcript
```

## Authentication & Security

**Current State (MVP):**
- Minimal auth (userId hardcoded to 1)
- No password validation
- JWT setup ready for future

**Future Improvements:**
1. Implement JWT auth middleware
2. Hash passwords with bcrypt
3. CORS configuration
4. Rate limiting on API
5. Webhook signature verification (Twilio, n8n)
6. Encrypted credentials storage

## Extensibility

### Adding a New Phone Provider

1. Extend `BasePhoneProvider` in `services/phone.ts`
2. Implement `makeCall()` and `handleWebhook()`
3. Register in `PhoneService.init()`
4. Update `.env.example` with new credentials
5. Add to provider dropdown in UI

### Adding a New Service Integration

1. Create new service file in `services/`
2. Implement async methods for data fetching
3. Add to app.ts as imported service
4. Use in agent system prompt or Claude context
5. Document webhook format

### Adding New API Endpoints

1. Create route handler in `api/`
2. Import and mount in `app.ts` with `app.use('/api/...', router)`
3. Update frontend API client
4. Add UI page if needed

## Performance Considerations

### Database
- Indexes on user_id, agent_id, created_at, call_id
- Pagination on /api/calls (limit 50, offset)
- Archive old calls to separate table (future)

### API
- Streaming responses for Claude (don't buffer)
- Connection pooling with pg Pool
- Error handling and retries

### Frontend
- Code splitting with React Router
- Lazy loading components
- Optimize re-renders with useCallback

### Deployment
- Docker multi-stage builds
- Nginx for static file serving
- Reverse proxy for API
- Environment-specific configs

## Testing Strategy

### Unit Tests
- Service methods (Claude, phone, n8n)
- Database utilities
- API route handlers

### Integration Tests
- Full call flow (inbound/outbound)
- Agent CRUD with DB
- Claude integration with real API

### E2E Tests
- Frontend → API → Database round trips
- Phone provider webhooks
- n8n data fetching

## Future Enhancements

### Phase 2
- Call recording and storage (S3)
- Automatic transcription (Deepgram)
- Call analytics dashboard
- Booking integration

### Phase 3
- Multi-tenant isolation
- Advanced prompt engineering UI
- Voice cloning/TTS customization
- Real-time agent monitoring

### Phase 4
- Mobile app (React Native)
- Webhook builder UI (visual n8n integration)
- AI-powered agent optimization
- Usage analytics and billing

## Tech Debt & Improvements

1. **Auth**: Implement proper JWT + refresh tokens
2. **Validation**: Add request/response validation (Zod/Joi)
3. **Testing**: Add comprehensive test suite
4. **Logging**: Structured logging (Winston, Pino)
5. **Monitoring**: APM integration (DataDog, New Relic)
6. **CI/CD**: GitHub Actions for auto-deploy
7. **Documentation**: API docs (OpenAPI/Swagger)
8. **Error Handling**: Better error messages and recovery
