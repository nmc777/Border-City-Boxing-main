export interface User {
  id: number;
  email: string;
  password_hash: string;
  organization: string;
  created_at: string;
}

export interface Agent {
  id: number;
  user_id: number;
  name: string;
  system_prompt: string;
  phone_number: string;
  provider: 'twilio' | 'retell' | string;
  n8n_webhooks: Record<string, string>; // { crm_lookup: "...", booking: "..." }
  created_at: string;
}

export interface Call {
  id: number;
  agent_id: number;
  direction: 'inbound' | 'outbound';
  customer_phone: string;
  customer_email: string | null;
  duration_seconds: number | null;
  transcript: string | null;
  transcript_translated: string | null;
  status: 'active' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  call_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export const schema = `
-- Users & Auth
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  organization VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Agents Config
CREATE TABLE IF NOT EXISTS agents (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  system_prompt TEXT,
  phone_number VARCHAR,
  provider VARCHAR DEFAULT 'twilio',
  n8n_webhooks JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Call Logs
CREATE TABLE IF NOT EXISTS calls (
  id SERIAL PRIMARY KEY,
  agent_id INT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  direction VARCHAR NOT NULL,
  customer_phone VARCHAR NOT NULL,
  customer_email VARCHAR,
  duration_seconds INT,
  transcript TEXT,
  transcript_translated TEXT,
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages (call conversation history)
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  call_id INT NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  role VARCHAR NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_agent_id ON calls(agent_id);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_call_id ON messages(call_id);
`;
