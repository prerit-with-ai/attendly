export type UserRole = "super_admin" | "hr_admin" | "manager" | "employee";

export type CompanySize = "1-10" | "11-50" | "51-200" | "201-500" | "501-1000" | "1000+";

export type PlanTier = "free" | "starter" | "professional" | "enterprise";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type CameraStatus = "active" | "inactive" | "error";

export type AttendanceType = "check_in" | "check_out";

export type AttendanceSource = "kiosk" | "rtsp" | "manual";

export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export type NotificationType =
  | "leave_requested"
  | "leave_approved"
  | "leave_rejected"
  | "late_alert"
  | "early_departure"
  | "system";
