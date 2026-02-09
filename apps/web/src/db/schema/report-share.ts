import { pgTable, text, timestamp, boolean, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { company } from "./company";
import { user } from "./auth";

export const reportShare = pgTable(
  "report_share",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    companyId: text("company_id")
      .notNull()
      .references(() => company.id, { onDelete: "cascade" }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: text("token")
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    reportType: text("report_type").notNull(),
    filters: jsonb("filters"),
    title: text("title"),
    expiresAt: timestamp("expires_at"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("report_share_token_idx").on(table.token)]
);
