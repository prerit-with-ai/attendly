import { z } from "zod/v4";

export const createDepartmentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  managerId: z.string().nullable().optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.extend({
  id: z.string(),
});

export type CreateDepartmentValues = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentValues = z.infer<typeof updateDepartmentSchema>;
