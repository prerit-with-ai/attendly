import { z } from "zod/v4";

export const createEmployeeSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  employeeCode: z.string().min(1, "Employee code is required"),
  email: z.email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  position: z.string().optional(),
  locationId: z.string().min(1, "Location is required"),
  departmentId: z.string().nullable().optional(),
  shiftId: z.string().nullable().optional(),
  joinedDate: z.string().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.extend({
  id: z.string(),
  isActive: z.boolean().optional(),
});

export const employeeFilterSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  departmentId: z.string().optional(),
  locationId: z.string().optional(),
  isActive: z.enum(["true", "false", "all"]).optional().default("all"),
});

export type CreateEmployeeValues = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeValues = z.infer<typeof updateEmployeeSchema>;
export type EmployeeFilterValues = z.infer<typeof employeeFilterSchema>;
