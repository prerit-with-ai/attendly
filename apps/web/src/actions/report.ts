"use server";

import { db } from "@/db";
import {
  attendanceLog,
  employee,
  department,
  leave,
  leaveType,
  leaveBalance,
  reportShare,
  location,
} from "@/db/schema";
import { requireCompany } from "@/lib/auth-server";
import { reportFilterSchema, createShareSchema } from "@/lib/validators/report";
import { eq, and, gte, lte, count, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ---------------------------------------------------------------------------
// Internal data functions (no auth — accept companyId directly)
// Used by both authenticated server actions and public embed/API routes
// ---------------------------------------------------------------------------

export async function _getAttendanceOverview(
  companyId: string,
  dateFrom: string,
  dateTo: string,
  filters?: { departmentId?: string; locationId?: string }
) {
  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);
  toDate.setHours(23, 59, 59, 999);

  // Build conditions
  const conditions = [
    eq(attendanceLog.companyId, companyId),
    gte(attendanceLog.capturedAt, fromDate),
    lte(attendanceLog.capturedAt, toDate),
    eq(attendanceLog.type, "check_in"),
  ];

  if (filters?.locationId) {
    conditions.push(eq(attendanceLog.locationId, filters.locationId));
  }

  // Daily trend
  const dailyTrend = await db
    .select({
      date: sql<string>`date_trunc('day', ${attendanceLog.capturedAt})::date::text`,
      checkIns: count(),
      uniqueEmployees: sql<number>`count(distinct ${attendanceLog.employeeId})`,
    })
    .from(attendanceLog)
    .where(and(...conditions))
    .groupBy(sql`date_trunc('day', ${attendanceLog.capturedAt})::date`)
    .orderBy(sql`date_trunc('day', ${attendanceLog.capturedAt})::date`);

  // Total employees in company (for absence calculation)
  const empConditions = [eq(employee.companyId, companyId), eq(employee.isActive, true)];
  if (filters?.departmentId) {
    empConditions.push(eq(employee.departmentId, filters.departmentId));
  }
  if (filters?.locationId) {
    empConditions.push(eq(employee.locationId, filters.locationId));
  }

  const [{ totalEmployees }] = await db
    .select({ totalEmployees: count() })
    .from(employee)
    .where(and(...empConditions));

  // On leave count for the period
  const [{ onLeave }] = await db
    .select({ onLeave: count() })
    .from(leave)
    .innerJoin(employee, eq(leave.employeeId, employee.id))
    .where(
      and(
        eq(leave.companyId, companyId),
        eq(leave.status, "approved"),
        lte(sql`${leave.startDate}::date`, toDate),
        gte(sql`${leave.endDate}::date`, fromDate),
        ...(filters?.departmentId ? [eq(employee.departmentId, filters.departmentId)] : []),
        ...(filters?.locationId ? [eq(employee.locationId, filters.locationId)] : [])
      )
    );

  const totalCheckIns = dailyTrend.reduce((sum, d) => sum + Number(d.checkIns), 0);
  const totalDays = dailyTrend.length || 1;
  const avgDailyPresent = Math.round(totalCheckIns / totalDays);
  const avgDailyAbsent = Math.max(0, totalEmployees - avgDailyPresent);

  const presentAbsentPie = [
    { name: "Present", value: avgDailyPresent },
    { name: "Absent", value: avgDailyAbsent },
    { name: "On Leave", value: Number(onLeave) },
  ];

  return {
    dailyTrend: dailyTrend.map((d) => ({
      date: d.date,
      checkIns: Number(d.checkIns),
      uniqueEmployees: Number(d.uniqueEmployees),
      absent: Math.max(0, totalEmployees - Number(d.uniqueEmployees)),
    })),
    summary: {
      totalCheckIns,
      avgDailyPresent,
      avgDailyAbsent,
      onLeave: Number(onLeave),
      totalEmployees,
    },
    presentAbsentPie,
  };
}

export async function _getEmployeeDetail(
  companyId: string,
  employeeId: string,
  dateFrom: string,
  dateTo: string
) {
  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);
  toDate.setHours(23, 59, 59, 999);

  // Employee info
  const [emp] = await db
    .select({
      id: employee.id,
      name: sql<string>`${employee.firstName} || ' ' || ${employee.lastName}`,
      code: employee.employeeCode,
      departmentId: employee.departmentId,
      shiftId: employee.shiftId,
    })
    .from(employee)
    .where(and(eq(employee.id, employeeId), eq(employee.companyId, companyId)));

  if (!emp) {
    return null;
  }

  // Get department name
  let deptName = "N/A";
  if (emp.departmentId) {
    const [dept] = await db
      .select({ name: department.name })
      .from(department)
      .where(eq(department.id, emp.departmentId));
    if (dept) deptName = dept.name;
  }

  // Monthly summary
  const monthlySummary = await db
    .select({
      month: sql<string>`to_char(${attendanceLog.capturedAt}, 'YYYY-MM')`,
      daysPresent: sql<number>`count(distinct date_trunc('day', ${attendanceLog.capturedAt})::date)`,
      daysLate: sql<number>`count(case when ${attendanceLog.isLate} = true then 1 end)`,
    })
    .from(attendanceLog)
    .where(
      and(
        eq(attendanceLog.employeeId, employeeId),
        eq(attendanceLog.companyId, companyId),
        eq(attendanceLog.type, "check_in"),
        gte(attendanceLog.capturedAt, fromDate),
        lte(attendanceLog.capturedAt, toDate)
      )
    )
    .groupBy(sql`to_char(${attendanceLog.capturedAt}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${attendanceLog.capturedAt}, 'YYYY-MM')`);

  // Leave days by month
  const leavesByMonth = await db
    .select({
      month: sql<string>`to_char(${leave.startDate}::date, 'YYYY-MM')`,
      daysOnLeave: sql<number>`sum(${leave.daysCount})`,
    })
    .from(leave)
    .where(
      and(
        eq(leave.employeeId, employeeId),
        eq(leave.companyId, companyId),
        eq(leave.status, "approved"),
        gte(sql`${leave.startDate}::date`, fromDate),
        lte(sql`${leave.endDate}::date`, toDate)
      )
    )
    .groupBy(sql`to_char(${leave.startDate}::date, 'YYYY-MM')`);

  const leaveMap = new Map(leavesByMonth.map((l) => [l.month, Number(l.daysOnLeave)]));

  // Leave balance
  const currentYear = new Date().getFullYear();
  const balances = await db
    .select({
      type: leaveType.name,
      total: leaveBalance.totalDays,
      used: leaveBalance.usedDays,
      remaining: leaveBalance.remainingDays,
    })
    .from(leaveBalance)
    .innerJoin(leaveType, eq(leaveBalance.leaveTypeId, leaveType.id))
    .where(and(eq(leaveBalance.employeeId, employeeId), eq(leaveBalance.year, currentYear)));

  // Recent logs
  const recentLogs = await db
    .select({
      id: attendanceLog.id,
      type: attendanceLog.type,
      capturedAt: attendanceLog.capturedAt,
      isLate: attendanceLog.isLate,
      lateMinutes: attendanceLog.lateMinutes,
      isEarlyDeparture: attendanceLog.isEarlyDeparture,
      overtimeMinutes: attendanceLog.overtimeMinutes,
    })
    .from(attendanceLog)
    .where(
      and(
        eq(attendanceLog.employeeId, employeeId),
        eq(attendanceLog.companyId, companyId),
        gte(attendanceLog.capturedAt, fromDate),
        lte(attendanceLog.capturedAt, toDate)
      )
    )
    .orderBy(desc(attendanceLog.capturedAt))
    .limit(50);

  return {
    employee: {
      name: emp.name,
      code: emp.code,
      department: deptName,
    },
    monthlySummary: monthlySummary.map((m) => ({
      month: m.month,
      daysPresent: Number(m.daysPresent),
      daysLate: Number(m.daysLate),
      daysOnLeave: leaveMap.get(m.month) || 0,
    })),
    leaveBalance: balances.map((b) => ({
      type: b.type,
      total: b.total,
      used: b.used,
      remaining: b.remaining,
    })),
    recentLogs: recentLogs.map((l) => ({
      ...l,
      capturedAt: l.capturedAt.toISOString(),
    })),
  };
}

export async function _getDepartmentAnalytics(companyId: string, dateFrom: string, dateTo: string) {
  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);
  toDate.setHours(23, 59, 59, 999);

  // Calculate business days in the period
  const diffDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const departments = await db
    .select({
      id: department.id,
      name: department.name,
    })
    .from(department)
    .where(eq(department.companyId, companyId));

  const result = [];
  let totalAttendanceRate = 0;

  for (const dept of departments) {
    // Employee count
    const [{ empCount }] = await db
      .select({ empCount: count() })
      .from(employee)
      .where(
        and(
          eq(employee.companyId, companyId),
          eq(employee.departmentId, dept.id),
          eq(employee.isActive, true)
        )
      );

    if (empCount === 0) {
      result.push({
        name: dept.name,
        employeeCount: 0,
        attendanceRate: 0,
        avgLateMinutes: 0,
        leaveRate: 0,
      });
      continue;
    }

    // Unique present days
    const [{ presentDays }] = await db
      .select({
        presentDays: sql<number>`count(distinct (${attendanceLog.employeeId} || '-' || date_trunc('day', ${attendanceLog.capturedAt})::date::text))`,
      })
      .from(attendanceLog)
      .innerJoin(employee, eq(attendanceLog.employeeId, employee.id))
      .where(
        and(
          eq(attendanceLog.companyId, companyId),
          eq(employee.departmentId, dept.id),
          eq(attendanceLog.type, "check_in"),
          gte(attendanceLog.capturedAt, fromDate),
          lte(attendanceLog.capturedAt, toDate)
        )
      );

    const maxPossible = empCount * diffDays;
    const attendanceRate =
      maxPossible > 0 ? Math.round((Number(presentDays) / maxPossible) * 100) : 0;

    // Average late minutes
    const [{ avgLate }] = await db
      .select({
        avgLate: sql<number>`coalesce(avg(${attendanceLog.lateMinutes}), 0)`,
      })
      .from(attendanceLog)
      .innerJoin(employee, eq(attendanceLog.employeeId, employee.id))
      .where(
        and(
          eq(attendanceLog.companyId, companyId),
          eq(employee.departmentId, dept.id),
          eq(attendanceLog.isLate, true),
          gte(attendanceLog.capturedAt, fromDate),
          lte(attendanceLog.capturedAt, toDate)
        )
      );

    // Leave rate
    const [{ leaveDays }] = await db
      .select({
        leaveDays: sql<number>`coalesce(sum(${leave.daysCount}), 0)`,
      })
      .from(leave)
      .innerJoin(employee, eq(leave.employeeId, employee.id))
      .where(
        and(
          eq(leave.companyId, companyId),
          eq(employee.departmentId, dept.id),
          eq(leave.status, "approved"),
          lte(sql`${leave.startDate}::date`, toDate),
          gte(sql`${leave.endDate}::date`, fromDate)
        )
      );

    const leaveRate = maxPossible > 0 ? Math.round((Number(leaveDays) / maxPossible) * 100) : 0;

    totalAttendanceRate += attendanceRate;

    result.push({
      name: dept.name,
      employeeCount: empCount,
      attendanceRate,
      avgLateMinutes: Math.round(Number(avgLate)),
      leaveRate,
    });
  }

  return {
    departments: result,
    overallAttendanceRate: result.length > 0 ? Math.round(totalAttendanceRate / result.length) : 0,
  };
}

export async function _getLeaveAnalytics(companyId: string, dateFrom: string, dateTo: string) {
  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);

  // By type
  const byType = await db
    .select({
      name: leaveType.name,
      count: count(),
      totalDays: sql<number>`coalesce(sum(${leave.daysCount}), 0)`,
    })
    .from(leave)
    .innerJoin(leaveType, eq(leave.leaveTypeId, leaveType.id))
    .where(
      and(
        eq(leave.companyId, companyId),
        gte(sql`${leave.startDate}::date`, fromDate),
        lte(sql`${leave.endDate}::date`, toDate)
      )
    )
    .groupBy(leaveType.id, leaveType.name);

  // Monthly trend
  const monthlyTrend = await db
    .select({
      month: sql<string>`to_char(${leave.startDate}::date, 'YYYY-MM')`,
      approved: sql<number>`count(case when ${leave.status} = 'approved' then 1 end)`,
      rejected: sql<number>`count(case when ${leave.status} = 'rejected' then 1 end)`,
      pending: sql<number>`count(case when ${leave.status} = 'pending' then 1 end)`,
    })
    .from(leave)
    .where(
      and(
        eq(leave.companyId, companyId),
        gte(sql`${leave.startDate}::date`, fromDate),
        lte(sql`${leave.endDate}::date`, toDate)
      )
    )
    .groupBy(sql`to_char(${leave.startDate}::date, 'YYYY-MM')`)
    .orderBy(sql`to_char(${leave.startDate}::date, 'YYYY-MM')`);

  // Summary
  const [summary] = await db
    .select({
      totalApplied: count(),
      totalApproved: sql<number>`count(case when ${leave.status} = 'approved' then 1 end)`,
      totalRejected: sql<number>`count(case when ${leave.status} = 'rejected' then 1 end)`,
      totalPending: sql<number>`count(case when ${leave.status} = 'pending' then 1 end)`,
    })
    .from(leave)
    .where(
      and(
        eq(leave.companyId, companyId),
        gte(sql`${leave.startDate}::date`, fromDate),
        lte(sql`${leave.endDate}::date`, toDate)
      )
    );

  return {
    byType: byType.map((b) => ({
      name: b.name,
      count: Number(b.count),
      totalDays: Number(b.totalDays),
    })),
    monthlyTrend: monthlyTrend.map((m) => ({
      month: m.month,
      approved: Number(m.approved),
      rejected: Number(m.rejected),
      pending: Number(m.pending),
    })),
    summary: {
      totalApplied: Number(summary.totalApplied),
      totalApproved: Number(summary.totalApproved),
      totalRejected: Number(summary.totalRejected),
      totalPending: Number(summary.totalPending),
    },
  };
}

export async function _getPunctualityReport(
  companyId: string,
  dateFrom: string,
  dateTo: string,
  filters?: { departmentId?: string; locationId?: string }
) {
  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);
  toDate.setHours(23, 59, 59, 999);

  const empConditions = [eq(employee.companyId, companyId), eq(employee.isActive, true)];
  if (filters?.departmentId) {
    empConditions.push(eq(employee.departmentId, filters.departmentId));
  }
  if (filters?.locationId) {
    empConditions.push(eq(employee.locationId, filters.locationId));
  }

  // Top late employees
  const topLateEmployees = await db
    .select({
      name: sql<string>`${employee.firstName} || ' ' || ${employee.lastName}`,
      lateCount: sql<number>`count(case when ${attendanceLog.isLate} = true then 1 end)`,
      avgLateMinutes: sql<number>`coalesce(avg(case when ${attendanceLog.isLate} = true then ${attendanceLog.lateMinutes} end), 0)`,
    })
    .from(attendanceLog)
    .innerJoin(employee, eq(attendanceLog.employeeId, employee.id))
    .where(
      and(
        eq(attendanceLog.companyId, companyId),
        eq(attendanceLog.type, "check_in"),
        gte(attendanceLog.capturedAt, fromDate),
        lte(attendanceLog.capturedAt, toDate),
        ...empConditions.slice(1) // skip companyId (already in attendanceLog conditions)
      )
    )
    .groupBy(employee.id, employee.firstName, employee.lastName)
    .having(sql`count(case when ${attendanceLog.isLate} = true then 1 end) > 0`)
    .orderBy(sql`count(case when ${attendanceLog.isLate} = true then 1 end) desc`)
    .limit(10);

  // Weekly trend
  const weeklyTrend = await db
    .select({
      week: sql<string>`to_char(date_trunc('week', ${attendanceLog.capturedAt}), 'YYYY-"W"IW')`,
      lateCount: sql<number>`count(case when ${attendanceLog.isLate} = true then 1 end)`,
      earlyDepartureCount: sql<number>`count(case when ${attendanceLog.isEarlyDeparture} = true then 1 end)`,
      overtimeHours: sql<number>`coalesce(round(sum(case when ${attendanceLog.overtimeMinutes} > 0 then ${attendanceLog.overtimeMinutes} end)::numeric / 60, 1), 0)`,
    })
    .from(attendanceLog)
    .where(
      and(
        eq(attendanceLog.companyId, companyId),
        gte(attendanceLog.capturedAt, fromDate),
        lte(attendanceLog.capturedAt, toDate)
      )
    )
    .groupBy(sql`date_trunc('week', ${attendanceLog.capturedAt})`)
    .orderBy(sql`date_trunc('week', ${attendanceLog.capturedAt})`);

  // Summary
  const [summary] = await db
    .select({
      totalLateArrivals: sql<number>`count(case when ${attendanceLog.isLate} = true then 1 end)`,
      totalEarlyDepartures: sql<number>`count(case when ${attendanceLog.isEarlyDeparture} = true then 1 end)`,
      totalOvertimeHours: sql<number>`coalesce(round(sum(case when ${attendanceLog.overtimeMinutes} > 0 then ${attendanceLog.overtimeMinutes} end)::numeric / 60, 1), 0)`,
    })
    .from(attendanceLog)
    .where(
      and(
        eq(attendanceLog.companyId, companyId),
        gte(attendanceLog.capturedAt, fromDate),
        lte(attendanceLog.capturedAt, toDate)
      )
    );

  return {
    topLateEmployees: topLateEmployees.map((e) => ({
      name: e.name,
      lateCount: Number(e.lateCount),
      avgLateMinutes: Math.round(Number(e.avgLateMinutes)),
    })),
    weeklyTrend: weeklyTrend.map((w) => ({
      week: w.week,
      lateCount: Number(w.lateCount),
      earlyDepartureCount: Number(w.earlyDepartureCount),
      overtimeHours: Number(w.overtimeHours),
    })),
    summary: {
      totalLateArrivals: Number(summary.totalLateArrivals),
      totalEarlyDepartures: Number(summary.totalEarlyDepartures),
      totalOvertimeHours: Number(summary.totalOvertimeHours),
    },
  };
}

// ---------------------------------------------------------------------------
// Authenticated server actions
// ---------------------------------------------------------------------------

export async function getAttendanceOverview(filters: unknown) {
  const session = await requireCompany();
  const parsed = reportFilterSchema.safeParse(filters);
  if (!parsed.success) return { error: "Invalid filters." };

  return _getAttendanceOverview(session.user.companyId, parsed.data.dateFrom, parsed.data.dateTo, {
    departmentId: parsed.data.departmentId,
    locationId: parsed.data.locationId,
  });
}

export async function getEmployeeDetail(filters: unknown) {
  const session = await requireCompany();
  const parsed = reportFilterSchema.safeParse(filters);
  if (!parsed.success || !parsed.data.employeeId) return { error: "Invalid filters." };

  return _getEmployeeDetail(
    session.user.companyId,
    parsed.data.employeeId,
    parsed.data.dateFrom,
    parsed.data.dateTo
  );
}

export async function getDepartmentAnalytics(filters: unknown) {
  const session = await requireCompany();
  const parsed = reportFilterSchema.safeParse(filters);
  if (!parsed.success) return { error: "Invalid filters." };

  return _getDepartmentAnalytics(session.user.companyId, parsed.data.dateFrom, parsed.data.dateTo);
}

export async function getLeaveAnalytics(filters: unknown) {
  const session = await requireCompany();
  const parsed = reportFilterSchema.safeParse(filters);
  if (!parsed.success) return { error: "Invalid filters." };

  return _getLeaveAnalytics(session.user.companyId, parsed.data.dateFrom, parsed.data.dateTo);
}

export async function getPunctualityReport(filters: unknown) {
  const session = await requireCompany();
  const parsed = reportFilterSchema.safeParse(filters);
  if (!parsed.success) return { error: "Invalid filters." };

  return _getPunctualityReport(session.user.companyId, parsed.data.dateFrom, parsed.data.dateTo, {
    departmentId: parsed.data.departmentId,
    locationId: parsed.data.locationId,
  });
}

export async function createReportShare(values: unknown) {
  const session = await requireCompany();
  const parsed = createShareSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid data." };

  const expiresAt = parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null;

  const [share] = await db
    .insert(reportShare)
    .values({
      companyId: session.user.companyId,
      createdBy: session.user.id,
      reportType: parsed.data.reportType,
      filters: parsed.data.filters || null,
      title: parsed.data.title || null,
      expiresAt,
    })
    .returning();

  revalidatePath("/dashboard/reports/shares");
  return { success: true, token: share.token };
}

export async function getReportShares() {
  const session = await requireCompany();

  const shares = await db
    .select()
    .from(reportShare)
    .where(and(eq(reportShare.companyId, session.user.companyId), eq(reportShare.isActive, true)))
    .orderBy(desc(reportShare.createdAt));

  return shares;
}

export async function deleteReportShare(id: string) {
  const session = await requireCompany();

  await db
    .update(reportShare)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(reportShare.id, id), eq(reportShare.companyId, session.user.companyId)));

  revalidatePath("/dashboard/reports/shares");
  return { success: true };
}

// Helper to get filter options for the reports page
export async function getReportFilterOptions() {
  const session = await requireCompany();
  const companyId = session.user.companyId;

  const [departments, locations, employees] = await Promise.all([
    db
      .select({ id: department.id, name: department.name })
      .from(department)
      .where(eq(department.companyId, companyId)),
    db
      .select({ id: location.id, name: location.name })
      .from(location)
      .where(and(eq(location.companyId, companyId), eq(location.isActive, true))),
    db
      .select({
        id: employee.id,
        name: sql<string>`${employee.firstName} || ' ' || ${employee.lastName}`,
        code: employee.employeeCode,
      })
      .from(employee)
      .where(and(eq(employee.companyId, companyId), eq(employee.isActive, true))),
  ]);

  return { departments, locations, employees };
}
