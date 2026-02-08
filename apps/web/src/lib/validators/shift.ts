import { z } from "zod/v4";

export const createShiftSchema = z.object({
  name: z.string().min(1, "Name is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  gracePeriodMinutes: z.number().min(0).max(120),
  isDefault: z.boolean(),
});

export const updateShiftSchema = createShiftSchema.extend({
  id: z.string(),
});

export const assignShiftSchema = z.object({
  employeeIds: z.array(z.string()).min(1, "Select at least one employee"),
  shiftId: z.string().min(1, "Shift is required"),
});

export type CreateShiftValues = z.infer<typeof createShiftSchema>;
export type UpdateShiftValues = z.infer<typeof updateShiftSchema>;
export type AssignShiftValues = z.infer<typeof assignShiftSchema>;
