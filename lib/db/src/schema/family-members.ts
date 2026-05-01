import { pgTable, serial, text, integer, date, timestamp } from "drizzle-orm/pg-core";
import { membershipsTable } from "./memberships";

export const familyMembersTable = pgTable("family_members", {
  id: serial("id").primaryKey(),
  membershipId: integer("membership_id").notNull().references(() => membershipsTable.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dob: date("dob").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type FamilyMember = typeof familyMembersTable.$inferSelect;
