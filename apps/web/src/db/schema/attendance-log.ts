import { pgTable, text, timestamp, real, index } from "drizzle-orm/pg-core";
import { company } from "./company";
import { employee } from "./employee";
import { location } from "./location";
import { camera } from "./camera";

export const attendanceLog = pgTable(
  "attendance_log",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    companyId: text("company_id")
      .notNull()
      .references(() => company.id, { onDelete: "cascade" }),
    employeeId: text("employee_id")
      .notNull()
      .references(() => employee.id, { onDelete: "cascade" }),
    cameraId: text("camera_id").references(() => camera.id, {
      onDelete: "set null",
    }),
    locationId: text("location_id")
      .notNull()
      .references(() => location.id, { onDelete: "restrict" }),
    type: text("type", { enum: ["check_in", "check_out"] }).notNull(),
    source: text("source", { enum: ["kiosk", "rtsp", "manual"] }).notNull(),
    confidence: real("confidence"),
    capturedAt: timestamp("captured_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("attendance_log_company_idx").on(table.companyId),
    index("attendance_log_employee_idx").on(table.employeeId),
    index("attendance_log_captured_at_idx").on(table.capturedAt),
    index("attendance_log_dedup_idx").on(
      table.companyId,
      table.employeeId,
      table.locationId,
      table.capturedAt
    ),
  ]
);
