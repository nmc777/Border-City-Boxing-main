import { db, usersTable } from "@workspace/db";
import { membershipApplicationsTable } from "@workspace/db/schema";
import { and, eq, gte, lte } from "drizzle-orm";
import { sendRenewalReminderEmail } from "./email";
import { logger } from "./logger";

export function startRenewalCron() {
  // Run once at startup after a short delay, then every 24 hours
  setTimeout(runCheck, 10_000);
  setInterval(runCheck, 24 * 60 * 60 * 1000);
}

async function runCheck() {
  try {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in8Days = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);

    // Find paid memberships expiring in the 7-day window (narrow to 1-day band to avoid re-sending)
    const expiring = await db
      .select({
        userId: membershipApplicationsTable.userId,
        plan: membershipApplicationsTable.plan,
        expiresAt: membershipApplicationsTable.expiresAt,
      })
      .from(membershipApplicationsTable)
      .where(
        and(
          eq(membershipApplicationsTable.status, "paid"),
          gte(membershipApplicationsTable.expiresAt, in7Days),
          lte(membershipApplicationsTable.expiresAt, in8Days)
        )
      );

    for (const row of expiring) {
      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, row.userId))
        .limit(1);

      if (user && row.expiresAt) {
        await sendRenewalReminderEmail(user.email, user.firstName, row.plan, row.expiresAt).catch(
          (err) => logger.error({ err, userId: row.userId }, "Failed to send renewal reminder")
        );
      }
    }

    if (expiring.length > 0) {
      logger.info({ count: expiring.length }, "Renewal reminders sent");
    }
  } catch (err) {
    logger.error({ err }, "Renewal cron check failed");
  }
}
