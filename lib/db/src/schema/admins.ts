import { pgTable, serial, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const adminsTable = pgTable("admins", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => usersTable.id).unique(),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
});

export const memberStatusEnum = pgEnum("member_status", ["active", "inactive"]);

export const memberProfilesTable = pgTable("member_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => usersTable.id).unique(),
  status: memberStatusEnum("status").notNull().default("active"),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Admin = typeof adminsTable.$inferSelect;
export type MemberProfile = typeof memberProfilesTable.$inferSelect;
