import { pgTable, text, timestamp, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { employee } from "./employee";
import { leaveType } from "./leave-type";

export const leaveBalance = pgTable(
  "leave_balance",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    employeeId: text("employee_id")
      .notNull()
      .references(() => employee.id, { onDelete: "cascade" }),
    leaveTypeId: text("leave_type_id")
      .notNull()
      .references(() => leaveType.id, { onDelete: "cascade" }),
    totalDays: integer("total_days").notNull(),
    usedDays: integer("used_days").notNull().default(0),
    remainingDays: integer("remaining_days").notNull(),
    year: integer("year").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("leave_balance_employee_type_year_idx").on(
      table.employeeId,
      table.leaveTypeId,
      table.year
    ),
  ]
);
