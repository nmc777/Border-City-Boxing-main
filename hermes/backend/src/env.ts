import dotenv from 'dotenv';

dotenv.config();

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export default {
  port: parseInt(process.env.PORT ?? '3001'),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: getEnv('DATABASE_URL'),
  claudeApiKey: getEnv('CLAUDE_API_KEY'),
  jwtSecret: getEnv('JWT_SECRET'),
  organization: getEnv('ORGANIZATION'),
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID ?? '',
    authToken: process.env.TWILIO_AUTH_TOKEN ?? '',
  },
  quo: {
    apiKey: process.env.QUO_API_KEY ?? '',
    phoneNumber: process.env.QUO_PHONE_NUMBER ?? '',
    webhookSecret: process.env.OPENPHONE_WEBHOOK_SECRET ?? '',
    webhookBaseUrl: process.env.WEBHOOK_BASE_URL ?? '',
  },
  n8n: {
    url: process.env.N8N_URL ?? 'http://localhost:5678',
  },
};
