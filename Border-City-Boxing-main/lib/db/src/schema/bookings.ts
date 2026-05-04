import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { classesTable } from "./classes";

export const bookingStatusEnum = pgEnum("booking_status", ["active", "cancelled"]);

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull().references(() => classesTable.id),
  userId: text("user_id").notNull(),
  bookedAt: timestamp("booked_at").notNull().defaultNow(),
  status: bookingStatusEnum("status").notNull().default("active"),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ id: true, bookedAt: true, status: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
