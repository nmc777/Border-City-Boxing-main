import { Router, Request, Response } from 'express';
import openphone from '../services/openphone.js';

const router = Router();

// GET /api/openphone/status
router.get('/status', async (_req: Request, res: Response): Promise<void> => {
  try {
    const phoneNumbers = await openphone.listPhoneNumbers();
    const webhooks = await openphone.listWebhooks();
    const cachedId = openphone.getCachedPhoneNumberId();
    res.json({
      phoneNumbers,
      webhooks,
      cachedPhoneNumberId: cachedId,
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch status' });
  }
});

// GET /api/openphone/phone-numbers
router.get('/phone-numbers', async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await openphone.listPhoneNumbers();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed' });
  }
});

// GET /api/openphone/messages?participants=+12265551234&limit=20
router.get('/messages', async (req: Request, res: Response): Promise<void> => {
  try {
    const participants = req.query.participants ? [req.query.participants as string] : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const data = await openphone.listMessages({ participants, limit });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed' });
  }
});

// GET /api/openphone/calls?participants=+12265551234&limit=10
router.get('/calls', async (req: Request, res: Response): Promise<void> => {
  try {
    const participants = req.query.participants ? [req.query.participants as string] : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const data = await openphone.listCalls({ participants, limit });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed' });
  }
});

// GET /api/openphone/calls/:id/transcript
router.get('/calls/:id/transcript', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await openphone.getCallTranscript(req.params.id);
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed' });
  }
});

// GET /api/openphone/calls/:id/summary
router.get('/calls/:id/summary', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await openphone.getCallSummary(req.params.id);
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed' });
  }
});

// GET /api/openphone/contacts
router.get('/contacts', async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const data = await openphone.listContacts({ limit });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed' });
  }
});

// GET /api/openphone/contacts/:id
router.get('/contacts/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await openphone.getContact(req.params.id);
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed' });
  }
});

// POST /api/openphone/contacts
router.post('/contacts', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await openphone.createContact(req.body);
    res.status(201).json({ data });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed' });
  }
});

// PATCH /api/openphone/contacts/:id
router.patch('/contacts/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await openphone.updateContact(req.params.id, req.body);
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed' });
  }
});

// DELETE /api/openphone/contacts/:id
router.delete('/contacts/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await openphone.deleteContact(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed' });
  }
});

// GET /api/openphone/conversations
router.get('/conversations', async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const data = await openphone.listConversations({ limit });
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed' });
  }
});

// GET /api/openphone/users
router.get('/users', async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await openphone.listUsers();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed' });
  }
});

// GET /api/openphone/webhooks
router.get('/webhooks', async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await openphone.listWebhooks();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed' });
  }
});

// DELETE /api/openphone/webhooks/:type/:id
router.delete('/webhooks/:type/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await openphone.deleteWebhook(req.params.type, req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed' });
  }
});

export default router;
