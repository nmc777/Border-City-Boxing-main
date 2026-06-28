// In-process scheduler for periodic tasks. Currently runs the membership-
// expiry-reminder sweep once an hour. Hourly cadence + DB idempotency
// (membership_reminders unique constraint on (membership_id, kind)) means we
// can safely run more often than strictly needed and never double-send.
//
// This runs in the same process as the api-server. Single-instance only — if
// you ever scale to multiple replicas, you'll need a leader-election or
// external scheduler. Not a concern for current Lightsail single-instance setup.

import { db } from "@workspace/db";
import {
  membershipsTable,
  membershipRemindersTable,
  usersTable,
  type MembershipReminderKind,
} from "@workspace/db/schema";
import { and, eq, gt, lt } from "drizzle-orm";
import { sendExpiryReminder } from "./notifications";
import { logger } from "./logger";

const MILESTONES: Array<{ days: 14 | 7 | 3 | 1; kind: MembershipReminderKind }> = [
  { days: 7, kind: "expiry_7d" },
];

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

async function runOnce(): Promise<void> {
  const now = new Date();
  for (const { days, kind } of MILESTONES) {
    // Window: memberships expiring between (now + (days-1)*24h) and (now + days*24h).
    // i.e. roughly "expires within 'days' days but more than 'days-1' days from now".
    // This catches each membership exactly once per milestone, on the day it crosses.
    const windowStart = new Date(now.getTime() + (days - 1) * DAY_MS);
    const windowEnd = new Date(now.getTime() + days * DAY_MS);

    let candidates: Array<{
      membershipId: number;
      plan: "single" | "family";
      expiresAt: Date | null;
      email: string | null;
      firstName: string | null;
    }> = [];
    try {
      candidates = await db
        .select({
          membershipId: membershipsTable.id,
          plan: membershipsTable.plan,
          expiresAt: membershipsTable.expiresAt,
          email: usersTable.email,
          firstName: usersTable.firstName,
        })
        .from(membershipsTable)
        .innerJoin(usersTable, eq(usersTable.id, membershipsTable.userId))
        .where(
          and(
            eq(membershipsTable.status, "active"),
            gt(membershipsTable.expiresAt, windowStart),
            lt(membershipsTable.expiresAt, windowEnd),
          ),
        );
    } catch (err) {
      logger.error({ err, days }, "[scheduler] failed to query expiring memberships");
      continue;
    }

    for (const c of candidates) {
      if (!c.email || !c.expiresAt) continue;

      // Insert the reminder row first; the unique (membership_id, kind) constraint
      // turns this into our cross-restart idempotency lock. If it conflicts, we've
      // already sent this milestone for this membership and we skip the email.
      try {
        const inserted = await db
          .insert(membershipRemindersTable)
          .values({ membershipId: c.membershipId, kind })
          .onConflictDoNothing({
            target: [membershipRemindersTable.membershipId, membershipRemindersTable.kind],
          })
          .returning({ id: membershipRemindersTable.id });

        if (inserted.length === 0) {
          continue; // already sent
        }
      } catch (err) {
        logger.error({ err, membershipId: c.membershipId, kind }, "[scheduler] reminder lock insert failed");
        continue;
      }

      // Send. If the email send fails, the reminder row stays — we won't retry.
      // That's a deliberate trade: better to drop a single reminder than spam on
      // every retry. Fix: add a `delivered_at` column later for at-least-once.
      await sendExpiryReminder({
        email: c.email,
        firstName: c.firstName,
        plan: c.plan,
        expiresAt: c.expiresAt,
        daysLeft: days,
      });
      logger.info(
        { membershipId: c.membershipId, kind, to: c.email },
        "[scheduler] sent expiry reminder",
      );
    }
  }
}

let timer: NodeJS.Timeout | null = null;

export function startScheduler(): void {
  if (timer) return;
  // Run once on boot (catches any reminders missed during restart) then every
  // hour. The DB idempotency lock makes multiple-runs-per-day safe.
  runOnce().catch((err) => logger.error({ err }, "[scheduler] initial run failed"));
  timer = setInterval(() => {
    runOnce().catch((err) => logger.error({ err }, "[scheduler] periodic run failed"));
  }, HOUR_MS);
  logger.info("[scheduler] started — expiry reminders sweep every 1h");
}

export function stopScheduler(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
