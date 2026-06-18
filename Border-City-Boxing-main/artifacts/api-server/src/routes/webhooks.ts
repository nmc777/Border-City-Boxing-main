import { Router, type IRouter } from "express";
import { createHmac } from "crypto";
import { db, usersTable } from "@workspace/db";
import { membershipApplicationsTable, memberProfilesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { sendMembershipReceiptEmail } from "../lib/email";

const SIGNATURE_KEY = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!;
const NOTIFICATION_URL = process.env.SQUARE_WEBHOOK_NOTIFICATION_URL!;

function verifySignature(body: Buffer, signatureHeader: string): boolean {
  const payload = NOTIFICATION_URL + body.toString("utf8");
  const hmac = createHmac("sha256", SIGNATURE_KEY);
  hmac.update(payload);
  const expected = hmac.digest("base64");
  return expected === signatureHeader;
}

const router: IRouter = Router();

router.post("/webhooks/square", async (req, res) => {
  const signature = req.headers["x-square-hmacsha256-signature"] as string;

  if (!signature || !verifySignature(req.body as Buffer, signature)) {
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  const event = JSON.parse((req.body as Buffer).toString("utf8"));
  const eventType: string = event.type ?? "";

  if (eventType === "payment.completed") {
    const orderId: string | undefined = event.data?.object?.payment?.order_id;

    if (orderId) {
      const [application] = await db
        .select()
        .from(membershipApplicationsTable)
        .where(eq(membershipApplicationsTable.squareOrderId, orderId))
        .limit(1);

      if (application && application.status !== "paid") {
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + (application.durationMonths ?? 1));

        await db
          .update(membershipApplicationsTable)
          .set({
            status: "paid",
            squarePaymentId: event.data?.object?.payment?.id,
            expiresAt,
          })
          .where(eq(membershipApplicationsTable.id, application.id));

        // Grant membership
        await db
          .insert(memberProfilesTable)
          .values({ userId: application.userId })
          .onConflictDoNothing();

        // Send receipt email
        const [user] = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.id, application.userId))
          .limit(1);
        if (user) {
          sendMembershipReceiptEmail(
            user.email,
            user.firstName,
            application.plan,
            application.totalAmountCents
          ).catch(() => {});
        }
      }
    }
  }

  res.status(200).json({ received: true });
});

export default router;
