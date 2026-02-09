import { z } from "zod/v4";

export const createCameraSchema = z.object({
  name: z.string().min(1, "Camera name is required"),
  locationId: z.string().min(1, "Location is required"),
  rtspUrl: z.string().min(1, "RTSP URL is required").url("Must be a valid URL"),
  description: z.string().optional(),
});

export const updateCameraSchema = createCameraSchema.extend({
  id: z.string(),
});

export type CreateCameraValues = z.infer<typeof createCameraSchema>;
export type UpdateCameraValues = z.infer<typeof updateCameraSchema>;
