import { pgTable, serial, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";
import { classesTable } from "./classes";

export const coachesTable = pgTable("coaches", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => usersTable.id).unique(),
  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
});

export const coachClassSigninsTable = pgTable("coach_class_signins", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull().references(() => classesTable.id),
  userId: varchar("user_id").notNull().references(() => usersTable.id),
  signinAt: timestamp("signin_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Coach = typeof coachesTable.$inferSelect;
export type CoachClassSignin = typeof coachClassSigninsTable.$inferSelect;
