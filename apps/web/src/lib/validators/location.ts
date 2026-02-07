import { z } from "zod/v4";

export const createLocationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().optional(),
  city: z.string().min(1, "City is required"),
  timezone: z.string().min(1, "Timezone is required"),
});

export const updateLocationSchema = createLocationSchema.extend({
  id: z.string(),
  isActive: z.boolean().optional(),
});

export type CreateLocationValues = z.infer<typeof createLocationSchema>;
export type UpdateLocationValues = z.infer<typeof updateLocationSchema>;
