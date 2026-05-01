import { pgTable, serial, integer, timestamp, pgEnum, unique } from "drizzle-orm/pg-core";
import { membershipsTable } from "./memberships";

// Each "kind" represents a milestone before expiry. The unique (membership, kind)
// constraint prevents duplicate sends if the scheduler runs more than once.
export const membershipReminderKindEnum = pgEnum("membership_reminder_kind", [
  "expiry_14d",
  "expiry_7d",
  "expiry_3d",
  "expiry_1d",
]);

export const membershipRemindersTable = pgTable(
  "membership_reminders",
  {
    id: serial("id").primaryKey(),
    membershipId: integer("membership_id")
      .notNull()
      .references(() => membershipsTable.id, { onDelete: "cascade" }),
    kind: membershipReminderKindEnum("kind").notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    membershipKindUniq: unique("membership_reminders_membership_kind_uniq").on(
      table.membershipId,
      table.kind,
    ),
  }),
);

export type MembershipReminderKind = (typeof membershipReminderKindEnum.enumValues)[number];
export type MembershipReminder = typeof membershipRemindersTable.$inferSelect;
