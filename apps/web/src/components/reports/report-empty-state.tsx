"use client";

import { BarChart3, Users, CalendarDays, Clock, UserSearch } from "lucide-react";
import { REPORT_TYPE_LABELS } from "@attndly/shared";
import type { ReportType } from "@attndly/shared";

const ICONS: Record<string, typeof BarChart3> = {
  attendance_overview: BarChart3,
  employee_detail: UserSearch,
  department_analytics: Users,
  leave_analytics: CalendarDays,
  punctuality_overtime: Clock,
};

const MESSAGES: Record<string, string> = {
  attendance_overview: "No attendance data found for this period. Try adjusting your date range.",
  employee_detail: "No data found for this employee in the selected period.",
  department_analytics:
    "No department analytics available. Ensure departments have active employees.",
  leave_analytics: "No leave data found for this period. Try adjusting your date range.",
  punctuality_overtime: "No punctuality data found for this period. Try adjusting your date range.",
};

interface ReportEmptyStateProps {
  reportType: string;
  message?: string;
}

export function ReportEmptyState({ reportType, message }: ReportEmptyStateProps) {
  const Icon = ICONS[reportType] || BarChart3;
  const label = REPORT_TYPE_LABELS[reportType as ReportType] || "Report";
  const defaultMessage = MESSAGES[reportType] || "No data available for the selected filters.";

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <Icon className="mb-4 size-12 text-muted-foreground/50" />
      <h3 className="text-lg font-semibold">{label}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message || defaultMessage}</p>
    </div>
  );
}
