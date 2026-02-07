import { pgTable, text, timestamp, boolean, date, uniqueIndex } from "drizzle-orm/pg-core";
import { company } from "./company";
import { location } from "./location";
import { department } from "./department";

export const employee = pgTable(
  "employee",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    companyId: text("company_id")
      .notNull()
      .references(() => company.id, { onDelete: "cascade" }),
    locationId: text("location_id")
      .notNull()
      .references(() => location.id, { onDelete: "restrict" }),
    departmentId: text("department_id").references(() => department.id, {
      onDelete: "set null",
    }),
    employeeCode: text("employee_code").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email"),
    phone: text("phone"),
    position: text("position"),
    faceEnrolled: boolean("face_enrolled").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    joinedDate: date("joined_date"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("employee_company_code_idx").on(table.companyId, table.employeeCode)]
);
