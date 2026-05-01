import { Router, type IRouter, type Request } from "express";
import squarePkg from "square";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { getMembershipPriceCents, type MembershipTerm, type MembershipPlan } from "@workspace/db/pricing";
import { paymentLimiter } from "../middlewares/rateLimit";

const { SquareClient, SquareEnvironment } = squarePkg as any;

const router: IRouter = Router();

const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN ?? "",
  environment: process.env.SQUARE_ENVIRONMENT === "production" ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
});

const paymentSchema = z.object({
  sourceId: z.string().min(1),
  verificationToken: z.string().min(1).optional(),
  plan: z.enum(["single", "family"]),
  termMonths: z.union([z.literal(1), z.literal(3), z.literal(6)]),
  buyerEmail: z.string().email().optional(),
  billing: z.object({
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    addressLine1: z.string().min(1).max(200),
    addressLine2: z.string().max(200).optional().nullable(),
    city: z.string().min(1).max(100),
    province: z.string().min(2).max(50),
    postalCode: z.string().min(3).max(20),
    country: z.string().min(2).max(3).default("CA"),
    phone: z.string().min(7).max(30).optional(),
  }).optional(),
});

router.post("/payments/create", paymentLimiter, async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = paymentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid payment data" });
    return;
  }

  const { sourceId, verificationToken, plan, termMonths, buyerEmail, billing } = parsed.data;
  const amountCents = getMembershipPriceCents(termMonths as MembershipTerm, plan as MembershipPlan);

  try {
    const { payment } = await squareClient.payments.create({
      sourceId,
      verificationToken,
      idempotencyKey: randomUUID(),
      amountMoney: {
        amount: BigInt(amountCents),
        currency: "CAD",
      },
      note: `BCB ${plan} membership - ${termMonths} month(s)`,
      buyerEmailAddress: buyerEmail,
      billingAddress: billing ? {
        firstName: billing.firstName,
        lastName: billing.lastName,
        addressLine1: billing.addressLine1,
        addressLine2: billing.addressLine2 ?? undefined,
        locality: billing.city,
        administrativeDistrictLevel1: billing.province,
        postalCode: billing.postalCode,
        country: billing.country,
      } : undefined,
    });

    res.json({ paymentId: payment?.id, status: payment?.status, receiptUrl: payment?.receiptUrl });
  } catch (err: any) {
    req.log.error({ err }, "Square payment failed");
    const msg = err?.errors?.[0]?.detail ?? "Payment failed. Please try again.";
    res.status(402).json({ error: msg });
  }
});

function verifySquareSignature(req: Request): boolean {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const notificationUrl = process.env.SQUARE_WEBHOOK_NOTIFICATION_URL;
  if (!signatureKey || !notificationUrl) return false;

  const provided = req.header("x-square-hmacsha256-signature") ?? req.header("square-hmacsha256-signature");
  const rawBody = (req as any).rawBody as Buffer | undefined;
  if (!provided || !rawBody) return false;

  const expected = createHmac("sha256", signatureKey)
    .update(notificationUrl)
    .update(rawBody)
    .digest("base64");

  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

router.post("/payments/webhook", (req, res) => {
  if (!verifySquareSignature(req)) {
    req.log.warn({ headers: req.headers }, "Square webhook signature verification failed");
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  const eventType = req.body?.type;
  const eventId = req.body?.event_id;
  req.log.info({ eventType, eventId }, "Square webhook received");

  // TODO: handle event types we care about (refund.created, dispute.created, payment.updated, etc.)
  // For now, ack so Square stops retrying.
  res.status(200).json({ received: true });
});

export default router;
