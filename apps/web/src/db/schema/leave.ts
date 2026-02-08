import { pgTable, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { company } from "./company";
import { employee } from "./employee";
import { leaveType } from "./leave-type";
import { user } from "./auth";

export const leave = pgTable(
  "leave",
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
    leaveTypeId: text("leave_type_id")
      .notNull()
      .references(() => leaveType.id, { onDelete: "restrict" }),
    startDate: text("start_date").notNull(),
    endDate: text("end_date").notNull(),
    daysCount: integer("days_count").notNull(),
    reason: text("reason"),
    status: text("status", {
      enum: ["pending", "approved", "rejected", "cancelled"],
    })
      .notNull()
      .default("pending"),
    approvedBy: text("approved_by").references(() => user.id, {
      onDelete: "set null",
    }),
    approvedAt: timestamp("approved_at"),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("leave_company_idx").on(table.companyId),
    index("leave_employee_idx").on(table.employeeId),
    index("leave_status_idx").on(table.status),
  ]
);
