import { z } from "zod/v4";

export const kioskCheckInSchema = z.object({
  locationId: z.string().min(1, "Location is required"),
  type: z.enum(["check_in", "check_out"]),
});

export const manualCheckInSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  locationId: z.string().min(1, "Location is required"),
  type: z.enum(["check_in", "check_out"]),
});

export const attendanceFilterSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  locationId: z.string().optional(),
  departmentId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  type: z.enum(["check_in", "check_out", "all"]).optional().default("all"),
  source: z.enum(["kiosk", "rtsp", "manual", "all"]).optional().default("all"),
});

export type KioskCheckInValues = z.infer<typeof kioskCheckInSchema>;
export type ManualCheckInValues = z.infer<typeof manualCheckInSchema>;
export type AttendanceFilterValues = z.infer<typeof attendanceFilterSchema>;
