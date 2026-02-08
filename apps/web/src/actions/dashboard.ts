"use server";

import { db } from "@/db";
import { employee, location, department, camera } from "@/db/schema";
import { requireCompany } from "@/lib/auth-server";
import { eq, and, count } from "drizzle-orm";

export async function getDashboardStats() {
  const session = await requireCompany();
  const companyId = session.user.companyId;

  const [
    [{ employeeCount }],
    [{ activeEmployeeCount }],
    [{ enrolledEmployeeCount }],
    [{ locationCount }],
    [{ departmentCount }],
    [{ cameraCount }],
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
  ]);

  return {
    employeeCount,
    activeEmployeeCount,
    enrolledEmployeeCount,
    locationCount,
    departmentCount,
    cameraCount,
  };
}
