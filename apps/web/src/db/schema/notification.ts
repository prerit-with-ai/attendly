import { pgTable, text, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { company } from "./company";
import { user } from "./auth";

export const notification = pgTable(
  "notification",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    companyId: text("company_id")
      .notNull()
      .references(() => company.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type", {
      enum: [
        "leave_requested",
        "leave_approved",
        "leave_rejected",
        "late_alert",
        "early_departure",
        "system",
      ],
    }).notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    data: jsonb("data"),
    isRead: boolean("is_read").notNull().default(false),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("notification_user_idx").on(table.userId),
    index("notification_is_read_idx").on(table.isRead),
  ]
);
