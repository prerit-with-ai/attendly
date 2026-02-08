import { z } from "zod/v4";

export const applyLeaveSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),
  leaveTypeId: z.string().min(1, "Leave type is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  reason: z.string().optional(),
});

export const approveLeaveSchema = z.object({
  leaveId: z.string().min(1, "Leave ID is required"),
});

export const rejectLeaveSchema = z.object({
  leaveId: z.string().min(1, "Leave ID is required"),
  rejectionReason: z.string().min(1, "Rejection reason is required"),
});

export const cancelLeaveSchema = z.object({
  leaveId: z.string().min(1, "Leave ID is required"),
});

export const leaveFilterSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected", "cancelled", "all"]).optional().default("all"),
  employeeId: z.string().optional(),
});

export type ApplyLeaveValues = z.infer<typeof applyLeaveSchema>;
export type ApproveLeaveValues = z.infer<typeof approveLeaveSchema>;
export type RejectLeaveValues = z.infer<typeof rejectLeaveSchema>;
export type CancelLeaveValues = z.infer<typeof cancelLeaveSchema>;
export type LeaveFilterValues = z.infer<typeof leaveFilterSchema>;
