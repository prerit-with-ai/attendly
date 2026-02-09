import { z } from "zod/v4";

export const createLeaveTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  daysPerYear: z.number().min(1, "Must be at least 1 day"),
  isActive: z.boolean(),
});

export const updateLeaveTypeSchema = createLeaveTypeSchema.extend({
  id: z.string(),
});

export type CreateLeaveTypeValues = z.infer<typeof createLeaveTypeSchema>;
export type UpdateLeaveTypeValues = z.infer<typeof updateLeaveTypeSchema>;
