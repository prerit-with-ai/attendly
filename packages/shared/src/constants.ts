import type { UserRole } from "./types";

export const USER_ROLES: Record<UserRole, string> = {
  super_admin: "Super Admin",
  hr_admin: "HR Admin",
  manager: "Manager",
  employee: "Employee",
} as const;

export const APP_NAME = "Attndly";
export const APP_DESCRIPTION = "AI-powered attendance tracking using existing CCTV cameras";
