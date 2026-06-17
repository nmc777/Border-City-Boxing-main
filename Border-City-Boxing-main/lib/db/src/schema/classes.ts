import { pgTable, serial, text, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const categoryEnum = pgEnum("category", ["kids", "recreation", "rock_steady", "womens_only"]);

export const classesTable = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: categoryEnum("category").notNull(),
  instructor: text("instructor").notNull(),
  description: text("description").notNull(),
  schedule: text("schedule").notNull(),
  duration: integer("duration").notNull(),
  capacity: integer("capacity").notNull(),
  location: text("location").notNull().default("BorderCityBoxing Gym"),
});

export const insertClassSchema = createInsertSchema(classesTable).omit({ id: true });
export type InsertClass = z.infer<typeof insertClassSchema>;
export type BoxingClass = typeof classesTable.$inferSelect;
