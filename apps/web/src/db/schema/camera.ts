import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { company } from "./company";
import { location } from "./location";

export const camera = pgTable("camera", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  companyId: text("company_id")
    .notNull()
    .references(() => company.id, { onDelete: "cascade" }),
  locationId: text("location_id")
    .notNull()
    .references(() => location.id, { onDelete: "restrict" }),
  name: text("name").notNull(),
  rtspUrl: text("rtsp_url").notNull(),
  description: text("description"),
  status: text("status", { enum: ["active", "inactive", "error"] })
    .notNull()
    .default("inactive"),
  lastConnectedAt: timestamp("last_connected_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
