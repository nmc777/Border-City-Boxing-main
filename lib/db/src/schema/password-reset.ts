import { pgTable, serial, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const passwordResetTokensTable = pgTable(
  "password_reset_tokens",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("IDX_password_reset_user").on(t.userId)],
);

export type PasswordResetToken = typeof passwordResetTokensTable.$inferSelect;
