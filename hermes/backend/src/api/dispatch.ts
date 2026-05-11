import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import phoneService from '../services/phone.js';
import openphone from '../services/openphone.js';
import env from '../env.js';

const router = Router();

// ─── Signature Verification ────────────────────────────────────────────────────

function verifyOpenPhoneSignature(req: Request): boolean {
  const secret = env.quo.webhookSecret;
  if (!secret) return true; // skip if not configured

  const signature = req.headers['openphone-signature'] as string;
  if (!signature) {
    console.warn('⚠️  No openphone-signature header');
    return false;
  }

  const rawBody = JSON.stringify(req.body);
  const expected = crypto
    .createHmac('sha256', Buffer.from(secret, 'base64'))
    .update(rawBody)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

// ─── Event Handlers ───────────────────────────────────────────────────────────

async function handleMessageReceived(event: any): Promise<void> {
  const obj = event?.data?.object ?? {};
  const from: string = obj.from ?? '';
  const body: string = (obj.body ?? obj.content ?? '').trim();
  const upper = body.toUpperCase();

  console.log(`📨 Inbound SMS from ${from}: "${body}"`);

  if (upper === 'ACCEPT') {
    // TODO: mark job as accepted in DB, notify customer
    console.log(`✅ Tech ${from} ACCEPTED job`);
    await phoneService.sendSMS('quo', from, '✅ Job confirmed! We\'ll send you the customer details shortly.');
    return;
  }

  if (upper === 'DECLINE') {
    // TODO: mark as declined, try next tech in queue
    console.log(`❌ Tech ${from} DECLINED job`);
    await phoneService.sendSMS('quo', from, 'Got it — we\'ll offer the job to another technician. Thanks!');
    return;
  }

  // Non-dispatch message — fetch conversation history and route to Claude
  try {
    const history = await openphone.getMessageHistory(from, 10);
    console.log(`💬 Routing message from ${from} to Claude (${history.length} prior messages)`);
    // TODO: wire to Claude agent for intelligent reply
    // const reply = await claudeService.respondToSMS(from, body, history);
    // await phoneService.sendSMS('quo', from, reply);
  } catch (err) {
    console.error('❌ Error fetching message history:', err);
  }
}

async function handleMessageDelivered(event: any): Promise<void> {
  const id = event?.data?.object?.id ?? 'unknown';
  console.log(`📤 Message ${id} delivered`);
}

async function handleCallRinging(event: any): Promise<void> {
  const obj = event?.data?.object ?? {};
  const from = obj.from ?? 'unknown';
  const to = obj.to ?? 'unknown';
  const direction = obj.direction ?? 'inbound';
  console.log(`📞 Call ringing — ${direction} ${from} → ${to}`);
  // NOTE: OpenPhone cannot do real-time AI answering. Log only.
  // Real-time AI calls require Twilio/Retell integration.
}

async function handleCallCompleted(event: any): Promise<void> {
  const obj = event?.data?.object ?? {};
  const callId = obj.id ?? 'unknown';
  const from = obj.from ?? 'unknown';
  const duration = obj.duration ?? 0;
  const aiHandled = obj.aiHandled ?? false;

  console.log(`📞 Call completed — id=${callId} from=${from} duration=${duration}s aiHandled=${aiHandled}`);

  // TODO: store call log in DB
  // await db.query(
  //   'INSERT INTO calls (external_id, direction, customer_phone, duration_seconds, status) VALUES ($1,$2,$3,$4,$5)',
  //   [callId, obj.direction, from, duration, 'completed']
  // );
}

async function handleCallRecordingCompleted(event: any): Promise<void> {
  const obj = event?.data?.object ?? {};
  const callId = obj.callId ?? obj.id ?? 'unknown';
  console.log(`🎙️  Recording ready for call ${callId}`);

  try {
    const recordings = await openphone.getCallRecordings(callId);
    if (recordings.length > 0) {
      console.log(`   Recording URL: ${recordings[0].url}`);
      // TODO: store recording URL in DB
    }
  } catch (err) {
    console.error('❌ Could not fetch recording:', err);
  }
}

async function handleTranscriptCompleted(event: any): Promise<void> {
  const obj = event?.data?.object ?? {};
  const callId = obj.callId ?? obj.id ?? 'unknown';
  console.log(`📝 Transcript ready for call ${callId}`);

  try {
    const transcript = await openphone.getCallTranscript(callId);
    if (transcript?.dialogue?.length) {
      console.log(`   ${transcript.dialogue.length} lines transcribed`);
      // TODO: store transcript in DB calls.transcript column
      // TODO: optionally run Claude summary on transcript
    }
  } catch (err) {
    console.error('❌ Could not fetch transcript:', err);
  }
}

async function handleSummaryCompleted(event: any): Promise<void> {
  const obj = event?.data?.object ?? {};
  const callId = obj.callId ?? obj.id ?? 'unknown';
  console.log(`📋 Summary ready for call ${callId}`);

  try {
    const summary = await openphone.getCallSummary(callId);
    if (summary) {
      console.log(`   Summary: ${summary.summary.slice(0, 100)}...`);
      // TODO: store summary in DB
    }
  } catch (err) {
    console.error('❌ Could not fetch summary:', err);
  }
}

// ─── Webhook Endpoint ─────────────────────────────────────────────────────────

router.post('/webhook/openphone', async (req: Request, res: Response): Promise<void> => {
  if (!verifyOpenPhoneSignature(req)) {
    console.warn('⚠️  OpenPhone webhook signature mismatch — rejected');
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  const type: string = req.body?.type ?? 'unknown';
  const event = req.body;

  res.status(200).json({ status: 'received', type });

  // Process async after responding so OpenPhone doesn't time out
  setImmediate(async () => {
    try {
      switch (type) {
        case 'message.received':          await handleMessageReceived(event); break;
        case 'message.delivered':         await handleMessageDelivered(event); break;
        case 'call.ringing':              await handleCallRinging(event); break;
        case 'call.completed':            await handleCallCompleted(event); break;
        case 'call.recording.completed':  await handleCallRecordingCompleted(event); break;
        case 'call.transcript.completed': await handleTranscriptCompleted(event); break;
        case 'call.summary.completed':    await handleSummaryCompleted(event); break;
        default:
          console.log(`ℹ️  Unhandled OpenPhone event: ${type}`);
      }
    } catch (err) {
      console.error(`❌ Error processing ${type}:`, err);
    }
  });
});

// ─── Outbound SMS ─────────────────────────────────────────────────────────────

router.post('/sms', async (req: Request, res: Response): Promise<void> => {
  try {
    const { to, message, provider = 'quo' } = req.body;

    if (!to || !message) {
      res.status(400).json({ error: 'Missing required fields: to, message' });
      return;
    }

    await phoneService.sendSMS(provider, to, message);

    res.status(200).json({
      status: 'success',
      message: `SMS sent to ${Array.isArray(to) ? to.length : 1} recipient(s)`,
      provider,
    });
  } catch (error) {
    console.error('SMS dispatch error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to send SMS' });
  }
});

// ─── Dispatch Job (ACCEPT/DECLINE workflow) ────────────────────────────────────

/**
 * Kick off a job dispatch — send SMS to one or more technicians.
 * Techs reply ACCEPT or DECLINE; handleMessageReceived processes the reply.
 *
 * POST /api/dispatch/job
 * Body: { jobId, customerPhone, technicianPhones: string[], issueDescription, address }
 */
router.post('/job', async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId, customerPhone, technicianPhones, issueDescription, address } = req.body;

    if (!jobId || !technicianPhones?.length || !issueDescription) {
      res.status(400).json({ error: 'Missing required fields: jobId, technicianPhones, issueDescription' });
      return;
    }

    const message = [
      `🔧 New job #${jobId}`,
      address ? `📍 ${address}` : null,
      `Issue: ${issueDescription}`,
      `Customer: ${customerPhone ?? 'N/A'}`,
      `Reply ACCEPT or DECLINE`,
    ].filter(Boolean).join('\n');

    for (const tech of technicianPhones) {
      await phoneService.sendSMS('quo', tech, message);
      console.log(`📤 Dispatch SMS sent to ${tech} for job ${jobId}`);
    }

    res.status(200).json({ status: 'dispatched', jobId, techCount: technicianPhones.length });
  } catch (error) {
    console.error('Dispatch job error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to dispatch job' });
  }
});

// ─── Analytics Log ────────────────────────────────────────────────────────────

router.post('/log', async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId, agentId, customerPhone, technicianPhones, issueDescription } = req.body;

    console.log(`📋 Dispatch Job: ${jobId}`);
    console.log(`   Agent: ${agentId}`);
    console.log(`   Customer: ${customerPhone}`);
    console.log(`   Technicians: ${(technicianPhones ?? []).join(', ')}`);
    console.log(`   Issue: ${issueDescription}`);

    res.status(200).json({ status: 'logged', jobId });
  } catch (error) {
    console.error('Dispatch log error:', error);
    res.status(500).json({ error: 'Failed to log dispatch' });
  }
});

export default router;
