import { Router, Request, Response } from 'express';
import { query, queryOne } from '../db/db.js';
import { Agent } from '../db/schema.js';

const router = Router();

interface CreateAgentBody {
  name: string;
  system_prompt: string;
  phone_number?: string;
  provider?: string;
  n8n_webhooks?: Record<string, string>;
}

// List all agents for the user
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1; // TODO: Get from auth middleware
    const agents = await query(
      'SELECT * FROM agents WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Get single agent
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const agent = await queryOne(
      'SELECT * FROM agents WHERE id = $1 AND user_id = $2',
      [req.params.id, userId]
    );
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(agent);
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

// Create new agent
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const { name, system_prompt, phone_number, provider, n8n_webhooks }: CreateAgentBody = req.body;

    if (!name || !system_prompt) {
      return res.status(400).json({ error: 'Name and system_prompt are required' });
    }

    const agent = await queryOne(
      `INSERT INTO agents (user_id, name, system_prompt, phone_number, provider, n8n_webhooks)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, name, system_prompt, phone_number || null, provider || 'twilio', JSON.stringify(n8n_webhooks || {})]
    );

    res.status(201).json(agent);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// Update agent
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;
    const { name, system_prompt, phone_number, provider, n8n_webhooks }: CreateAgentBody = req.body;

    const agent = await queryOne(
      `UPDATE agents
       SET name = COALESCE($2, name),
           system_prompt = COALESCE($3, system_prompt),
           phone_number = COALESCE($4, phone_number),
           provider = COALESCE($5, provider),
           n8n_webhooks = COALESCE($6, n8n_webhooks)
       WHERE id = $1 AND user_id = $7
       RETURNING *`,
      [
        req.params.id,
        name || null,
        system_prompt || null,
        phone_number || null,
        provider || null,
        n8n_webhooks ? JSON.stringify(n8n_webhooks) : null,
        userId,
      ]
    );

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json(agent);
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

// Delete agent
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || 1;

    const result = await query(
      'DELETE FROM agents WHERE id = $1 AND user_id = $2',
      [req.params.id, userId]
    );

    res.json({ success: true, message: 'Agent deleted' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

export default router;
