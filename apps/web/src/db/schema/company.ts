import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const company = pgTable("company", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  industry: text("industry"),
  size: text("size"),
  planTier: text("plan_tier").notNull().default("free"),
  settings: jsonb("settings").default({}),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
