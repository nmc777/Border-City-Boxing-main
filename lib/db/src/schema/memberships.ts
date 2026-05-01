import { pgTable, serial, text, timestamp, pgEnum, date, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const membershipPlanEnum = pgEnum("membership_plan", ["single", "family"]);
export const membershipStatusEnum = pgEnum("membership_status", ["pending", "active", "cancelled"]);

export const membershipsTable = pgTable("memberships", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  plan: membershipPlanEnum("plan").notNull(),
  status: membershipStatusEnum("status").notNull().default("pending"),
  termMonths: integer("term_months").notNull().default(1),
  priceCents: integer("price_cents").notNull().default(0),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dob: date("dob").notNull(),
  phone: text("phone"),
  addressLine1: text("address_line1"),
  addressLine2: text("address_line2"),
  city: text("city"),
  province: text("province"),
  postalCode: text("postal_code"),
  country: text("country").default("CA"),
  paymentId: text("payment_id"),
  termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }),
  waiverAcceptedAt: timestamp("waiver_accepted_at", { withTimezone: true }),
  startedAt: timestamp("started_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertMembershipSchema = createInsertSchema(membershipsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMembership = z.infer<typeof insertMembershipSchema>;
export type Membership = typeof membershipsTable.$inferSelect;
