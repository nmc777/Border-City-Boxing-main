import { pgTable, serial, varchar, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";
import { classesTable } from "./classes";

export const attendanceTable = pgTable(
  "attendance",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull().references(() => usersTable.id),
    classId: integer("class_id").notNull().references(() => classesTable.id),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("attendance_user_class_unique").on(table.userId, table.classId),
  ],
);

export type Attendance = typeof attendanceTable.$inferSelect;
