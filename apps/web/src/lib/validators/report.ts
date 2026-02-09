import { z } from "zod/v4";

export const reportFilterSchema = z.object({
  dateFrom: z.string().min(1, "Start date is required"),
  dateTo: z.string().min(1, "End date is required"),
  departmentId: z.string().optional(),
  locationId: z.string().optional(),
  employeeId: z.string().optional(),
});

export const createShareSchema = z.object({
  reportType: z.string().min(1, "Report type is required"),
  filters: z.record(z.string(), z.unknown()).optional(),
  title: z.string().optional(),
  expiresAt: z.string().optional(),
});

export type ReportFilterValues = z.infer<typeof reportFilterSchema>;
export type CreateShareValues = z.infer<typeof createShareSchema>;
