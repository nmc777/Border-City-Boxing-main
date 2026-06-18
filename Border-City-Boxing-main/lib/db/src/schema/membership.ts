import { pgTable, serial, varchar, text, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const membershipPlanEnum = pgEnum("membership_plan", ["single", "family", "rock_steady", "womens_only"]);
export const membershipStatusEnum = pgEnum("membership_status", ["pending", "paid", "cancelled"]);

export const membershipApplicationsTable = pgTable("membership_applications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => usersTable.id),
  plan: membershipPlanEnum("plan").notNull(),
  durationMonths: integer("duration_months").notNull().default(1),
  participantCount: integer("participant_count").notNull().default(1),
  totalAmountCents: integer("total_amount_cents").notNull(),
  status: membershipStatusEnum("status").notNull().default("pending"),
  squareCheckoutId: varchar("square_checkout_id"),
  squarePaymentId: varchar("square_payment_id"),
  squareOrderId: varchar("square_order_id"),
  agreedToTerms: boolean("agreed_to_terms").notNull().default(false),
  agreedToWaiver: boolean("agreed_to_waiver").notNull().default(false),
  agreedAt: timestamp("agreed_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const participantsTable = pgTable("participants", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => membershipApplicationsTable.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  isUnder18: boolean("is_under_18").notNull().default(false),
  guardianName: text("guardian_name"),
  guardianConsent: boolean("guardian_consent").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type MembershipApplication = typeof membershipApplicationsTable.$inferSelect;
export type Participant = typeof participantsTable.$inferSelect;
