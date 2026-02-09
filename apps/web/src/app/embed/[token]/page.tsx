import { db } from "@/db";
import { reportShare } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import {
  _getAttendanceOverview,
  _getEmployeeDetail,
  _getDepartmentAnalytics,
  _getLeaveAnalytics,
  _getPunctualityReport,
} from "@/actions/report";
import { AttendanceOverviewWidget } from "@/components/reports/widgets/attendance-overview-widget";
import { DepartmentAnalyticsWidget } from "@/components/reports/widgets/department-analytics-widget";
import { LeaveAnalyticsWidget } from "@/components/reports/widgets/leave-analytics-widget";
import { PunctualityWidget } from "@/components/reports/widgets/punctuality-widget";
import { EmployeeDetailWidget } from "@/components/reports/widgets/employee-detail-widget";
import { REPORT_TYPE_LABELS } from "@attndly/shared";
import type { ReportType } from "@attndly/shared";

export const metadata = {
  robots: "noindex",
};

interface EmbedPageProps {
  params: Promise<{ token: string }>;
}

export default async function EmbedPage({ params }: EmbedPageProps) {
  const { token } = await params;

  const [share] = await db
    .select()
    .from(reportShare)
    .where(and(eq(reportShare.token, token), eq(reportShare.isActive, true)));

  if (!share) {
    notFound();
  }

  // Check expiration
  if (share.expiresAt && new Date() > share.expiresAt) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <h2 className="text-xl font-semibold">Report Expired</h2>
        <p className="mt-2 text-muted-foreground">
          This shared report has expired. Please contact the report owner for a new link.
        </p>
      </div>
    );
  }

  const filters = (share.filters as Record<string, string>) || {};
  const dateFrom =
    filters.dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const dateTo = filters.dateTo || new Date().toISOString().split("T")[0];
  const companyId = share.companyId;

  let content: React.ReactNode = null;

  switch (share.reportType) {
    case "attendance_overview": {
      const data = await _getAttendanceOverview(companyId, dateFrom, dateTo, {
        departmentId: filters.departmentId,
        locationId: filters.locationId,
      });
      content = <AttendanceOverviewWidget data={data} />;
      break;
    }
    case "department_analytics": {
      const data = await _getDepartmentAnalytics(companyId, dateFrom, dateTo);
      content = <DepartmentAnalyticsWidget data={data} />;
      break;
    }
    case "leave_analytics": {
      const data = await _getLeaveAnalytics(companyId, dateFrom, dateTo);
      content = <LeaveAnalyticsWidget data={data} />;
      break;
    }
    case "punctuality_overtime": {
      const data = await _getPunctualityReport(companyId, dateFrom, dateTo, {
        departmentId: filters.departmentId,
        locationId: filters.locationId,
      });
      content = <PunctualityWidget data={data} />;
      break;
    }
    case "employee_detail": {
      if (filters.employeeId) {
        const data = await _getEmployeeDetail(companyId, filters.employeeId, dateFrom, dateTo);
        if (data) {
          content = <EmployeeDetailWidget data={data} />;
        }
      }
      break;
    }
  }

  const title = share.title || REPORT_TYPE_LABELS[share.reportType as ReportType] || "Report";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{title}</h1>
        <span className="text-xs text-muted-foreground">
          {dateFrom} to {dateTo}
        </span>
      </div>
      {content || (
        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
          <p className="text-muted-foreground">No data available for this report.</p>
        </div>
      )}
      <div className="text-center text-xs text-muted-foreground">Powered by Attndly</div>
    </div>
  );
}
