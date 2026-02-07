import type { UserRole, CompanySize } from "./types";

export const USER_ROLES: Record<UserRole, string> = {
  super_admin: "Super Admin",
  hr_admin: "HR Admin",
  manager: "Manager",
  employee: "Employee",
} as const;

export const APP_NAME = "Attndly";
export const APP_DESCRIPTION = "AI-powered attendance tracking using existing CCTV cameras";

export const COMPANY_SIZES: { value: CompanySize; label: string }[] = [
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "501-1000", label: "501-1000 employees" },
  { value: "1000+", label: "1000+ employees" },
];

export const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance & Banking",
  "Manufacturing",
  "Retail",
  "Education",
  "Construction",
  "Hospitality",
  "Logistics & Transport",
  "Government",
  "Other",
] as const;

export const TIMEZONES = [
  { value: "Asia/Kolkata", label: "IST (Asia/Kolkata)" },
  { value: "America/New_York", label: "EST (America/New_York)" },
  { value: "America/Chicago", label: "CST (America/Chicago)" },
  { value: "America/Denver", label: "MST (America/Denver)" },
  { value: "America/Los_Angeles", label: "PST (America/Los_Angeles)" },
  { value: "Europe/London", label: "GMT (Europe/London)" },
  { value: "Europe/Berlin", label: "CET (Europe/Berlin)" },
  { value: "Asia/Dubai", label: "GST (Asia/Dubai)" },
  { value: "Asia/Singapore", label: "SGT (Asia/Singapore)" },
  { value: "Asia/Tokyo", label: "JST (Asia/Tokyo)" },
  { value: "Australia/Sydney", label: "AEST (Australia/Sydney)" },
] as const;
