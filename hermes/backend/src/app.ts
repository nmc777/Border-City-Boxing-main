import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './env.js';
import phoneService from './services/phone.js';
import openphone from './services/openphone.js';
import agentsRouter from './api/agents.js';
import callsRouter from './api/calls.js';
import dispatchRouter from './api/dispatch.js';
import openphoneRouter from './api/openphone.js';

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Initialize Quo phone provider
if (env.quo?.apiKey && env.quo?.phoneNumber) {
  phoneService.initQuo(env.quo.apiKey, env.quo.phoneNumber);
}

// Initialize OpenPhone REST client and register webhooks on startup
if (env.quo?.apiKey) {
  openphone.init(env.quo.apiKey, env.quo.webhookBaseUrl);
}

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    organization: env.organization,
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/agents', agentsRouter);
app.use('/api/calls', callsRouter);
app.use('/api/dispatch', dispatchRouter);
app.use('/api/openphone', openphoneRouter);
// app.use('/api/auth', authRouter);

// Error handling middleware
app.use((err: any, _req: Request, res: Response): void => {
  console.error('Error:', err);

  // Only send response if headers haven't been sent yet
  if (!res.headersSent) {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ error: message });
  }
});

// Start server
const port = env.port;
app.listen(port, async () => {
  console.log(`🤖 Hermes running on port ${port}`);
  console.log(`📍 Organization: ${env.organization}`);
  console.log(`🔧 Environment: ${env.nodeEnv}`);

  // Resolve phoneNumberId and register webhooks after server is up
  if (env.quo?.apiKey && env.quo?.phoneNumber) {
    await openphone.startup(env.quo.phoneNumber);
  }
});

export default app;
