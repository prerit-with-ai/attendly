import { NextResponse } from "next/server";
import { db } from "@/db";
import { reportShare } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  _getAttendanceOverview,
  _getEmployeeDetail,
  _getDepartmentAnalytics,
  _getLeaveAnalytics,
  _getPunctualityReport,
} from "@/actions/report";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const [share] = await db
    .select()
    .from(reportShare)
    .where(and(eq(reportShare.token, token), eq(reportShare.isActive, true)));

  if (!share) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  if (share.expiresAt && new Date() > share.expiresAt) {
    return NextResponse.json({ error: "Report expired" }, { status: 410 });
  }

  const filters = (share.filters as Record<string, string>) || {};
  const dateFrom =
    filters.dateFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const dateTo = filters.dateTo || new Date().toISOString().split("T")[0];
  const companyId = share.companyId;

  let data: unknown = null;

  switch (share.reportType) {
    case "attendance_overview":
      data = await _getAttendanceOverview(companyId, dateFrom, dateTo, {
        departmentId: filters.departmentId,
        locationId: filters.locationId,
      });
      break;
    case "department_analytics":
      data = await _getDepartmentAnalytics(companyId, dateFrom, dateTo);
      break;
    case "leave_analytics":
      data = await _getLeaveAnalytics(companyId, dateFrom, dateTo);
      break;
    case "punctuality_overtime":
      data = await _getPunctualityReport(companyId, dateFrom, dateTo, {
        departmentId: filters.departmentId,
        locationId: filters.locationId,
      });
      break;
    case "employee_detail":
      if (filters.employeeId) {
        data = await _getEmployeeDetail(companyId, filters.employeeId, dateFrom, dateTo);
      }
      break;
  }

  return NextResponse.json(
    {
      reportType: share.reportType,
      title: share.title,
      dateRange: { from: dateFrom, to: dateTo },
      data,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}
