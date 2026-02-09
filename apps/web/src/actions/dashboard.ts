"use server";

import { db } from "@/db";
import { employee, location, department, camera, attendanceLog, leave } from "@/db/schema";
import { requireCompany } from "@/lib/auth-server";
import { eq, and, count, gte, lte } from "drizzle-orm";

export async function getDashboardStats() {
  const session = await requireCompany();
  const companyId = session.user.companyId;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    [{ employeeCount }],
    [{ activeEmployeeCount }],
    [{ enrolledEmployeeCount }],
    [{ locationCount }],
    [{ departmentCount }],
    [{ cameraCount }],
    [{ todayAttendance }],
    [{ pendingLeaves }],
    [{ onLeaveToday }],
  ] = await Promise.all([
    db.select({ employeeCount: count() }).from(employee).where(eq(employee.companyId, companyId)),
    db
      .select({ activeEmployeeCount: count() })
      .from(employee)
      .where(and(eq(employee.companyId, companyId), eq(employee.isActive, true))),
    db
      .select({ enrolledEmployeeCount: count() })
      .from(employee)
      .where(and(eq(employee.companyId, companyId), eq(employee.faceEnrolled, true))),
    db.select({ locationCount: count() }).from(location).where(eq(location.companyId, companyId)),
    db
      .select({ departmentCount: count() })
      .from(department)
      .where(eq(department.companyId, companyId)),
    db.select({ cameraCount: count() }).from(camera).where(eq(camera.companyId, companyId)),
    db
      .select({ todayAttendance: count() })
      .from(attendanceLog)
      .where(
        and(eq(attendanceLog.companyId, companyId), gte(attendanceLog.capturedAt, todayStart))
      ),
    db
      .select({ pendingLeaves: count() })
      .from(leave)
      .where(and(eq(leave.companyId, companyId), eq(leave.status, "pending"))),
    db
      .select({ onLeaveToday: count() })
      .from(leave)
      .where(
        and(
          eq(leave.companyId, companyId),
          eq(leave.status, "approved"),
          lte(leave.startDate, new Date().toISOString().split("T")[0]),
          gte(leave.endDate, new Date().toISOString().split("T")[0])
        )
      ),
  ]);

  return {
    employeeCount,
    activeEmployeeCount,
    enrolledEmployeeCount,
    locationCount,
    departmentCount,
    cameraCount,
    todayAttendance,
    pendingLeaves,
    onLeaveToday,
  };
}
