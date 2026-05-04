import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { classesTable } from "./classes";

export const walkInsTable = pgTable("walk_ins", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  classId: integer("class_id").notNull().references(() => classesTable.id),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true }).notNull().defaultNow(),
});

export type WalkIn = typeof walkInsTable.$inferSelect;
