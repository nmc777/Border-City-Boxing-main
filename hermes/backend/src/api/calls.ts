import { Router, Request, Response } from 'express';
import { query, queryOne } from '../db/db.js';

const router = Router();

// List calls for user's agents
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const calls = await query(
      `SELECT c.* FROM calls c
       JOIN agents a ON c.agent_id = a.id
       WHERE a.user_id = $1
       ORDER BY c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json(calls);
  } catch (error) {
    console.error('Error fetching calls:', error);
    res.status(500).json({ error: 'Failed to fetch calls' });
  }
});

// Get single call with messages
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;

    const call = await queryOne(
      `SELECT c.* FROM calls c
       JOIN agents a ON c.agent_id = a.id
       WHERE c.id = $1 AND a.user_id = $2`,
      [req.params.id, userId]
    );

    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

    const messages = await query(
      'SELECT * FROM messages WHERE call_id = $1 ORDER BY created_at ASC',
      [req.params.id]
    );

    res.json({ ...call, messages });
  } catch (error) {
    console.error('Error fetching call:', error);
    res.status(500).json({ error: 'Failed to fetch call' });
  }
});

// Create a new call record
router.post('/', async (req: Request, res: Response) => {
  try {
    const { agent_id, direction, customer_phone, customer_email } = req.body;

    if (!agent_id || !direction || !customer_phone) {
      return res.status(400).json({ error: 'agent_id, direction, and customer_phone are required' });
    }

    const call = await queryOne(
      `INSERT INTO calls (agent_id, direction, customer_phone, customer_email, status)
       VALUES ($1, $2, $3, $4, 'active')
       RETURNING *`,
      [agent_id, direction, customer_phone, customer_email || null]
    );

    res.status(201).json(call);
  } catch (error) {
    console.error('Error creating call:', error);
    res.status(500).json({ error: 'Failed to create call' });
  }
});

// Update call status
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { status, transcript, duration_seconds } = req.body;

    const call = await queryOne(
      `UPDATE calls
       SET status = COALESCE($2, status),
           transcript = COALESCE($3, transcript),
           duration_seconds = COALESCE($4, duration_seconds),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [req.params.id, status || null, transcript || null, duration_seconds || null]
    );

    if (!call) {
      return res.status(404).json({ error: 'Call not found' });
    }

    res.json(call);
  } catch (error) {
    console.error('Error updating call:', error);
    res.status(500).json({ error: 'Failed to update call' });
  }
});

// Add message to call
router.post('/:id/messages', async (req: Request, res: Response) => {
  try {
    const { role, content } = req.body;

    if (!role || !content) {
      return res.status(400).json({ error: 'role and content are required' });
    }

    const message = await queryOne(
      `INSERT INTO messages (call_id, role, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.params.id, role, content]
    );

    res.status(201).json(message);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Failed to add message' });
  }
});

export default router;
