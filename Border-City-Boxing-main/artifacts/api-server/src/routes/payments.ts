import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { membershipApplicationsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN!;
const SQUARE_LOCATION_ID = process.env.SQUARE_LOCATION_ID!;
const APP_URL = process.env.APP_URL ?? "https://bordercityboxingclub.com";
const SQUARE_BASE = process.env.SQUARE_ENVIRONMENT === "production"
  ? "https://connect.squareup.com"
  : "https://connect.squareupsandbox.com";

const PLAN_LABELS: Record<string, string> = {
  single: "Single Membership",
  family: "Family Membership",
  rock_steady: "Rock Steady Membership",
  womens_only: "Women's Only Membership",
};

const router: IRouter = Router();

router.post("/payments/checkout", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = z.object({ applicationId: z.number().int().positive() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const { applicationId } = parsed.data;

  const [application] = await db
    .select()
    .from(membershipApplicationsTable)
    .where(eq(membershipApplicationsTable.id, applicationId))
    .limit(1);

  if (!application) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  if (application.userId !== req.user.id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  if (application.status === "paid") {
    res.status(409).json({ error: "Already paid" });
    return;
  }

  const idempotencyKey = `membership-${applicationId}-${Date.now()}`;
  const label = PLAN_LABELS[application.plan] ?? "Membership";

  const body = {
    idempotency_key: idempotencyKey,
    order: {
      location_id: SQUARE_LOCATION_ID,
      line_items: [
        {
          name: label,
          quantity: "1",
          base_price_money: {
            amount: application.totalAmountCents,
            currency: "CAD",
          },
        },
      ],
    },
    checkout_options: {
      redirect_url: `${APP_URL}/membership/success?applicationId=${applicationId}`,
      merchant_support_email: "contact@bordercityboxingclub.com",
    },
    pre_populated_data: {
      buyer_email: req.user.email ?? undefined,
    },
  };

  try {
    const squareRes = await fetch(`${SQUARE_BASE}/v2/online-checkout/payment-links`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "Square-Version": "2024-01-18",
      },
      body: JSON.stringify(body),
    });

    const data = await squareRes.json() as any;

    if (!squareRes.ok) {
      req.log.error({ data }, "Square checkout creation failed");
      res.status(502).json({ error: "Payment provider error. Please try again." });
      return;
    }

    const checkoutUrl = data.payment_link?.url;
    const checkoutId = data.payment_link?.id;

    await db
      .update(membershipApplicationsTable)
      .set({ squareCheckoutId: checkoutId })
      .where(eq(membershipApplicationsTable.id, applicationId));

    res.json({ checkoutUrl });
  } catch (err) {
    req.log.error({ err }, "Failed to create Square checkout");
    res.status(500).json({ error: "Failed to initiate payment. Please try again." });
  }
});

export default router;
