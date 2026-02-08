"use server";

import { db } from "@/db";
import { attendanceLog, employee, location, department } from "@/db/schema";
import { requireCompany } from "@/lib/auth-server";
import {
  kioskCheckInSchema,
  manualCheckInSchema,
  attendanceFilterSchema,
} from "@/lib/validators/attendance";
import { eq, and, or, ilike, count, desc, gte, lte, countDistinct } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { ATTENDANCE_DEDUP_WINDOW_MS } from "@attndly/shared";

const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL || "http://localhost:8000";

export async function checkInViaKiosk(formData: FormData) {
  const session = await requireCompany();
  const companyId = session.user.companyId;

  const locationId = formData.get("locationId") as string;
  const type = formData.get("type") as string;
  const image = formData.get("image") as File;

  const parsed = kioskCheckInSchema.safeParse({ locationId, type });
  if (!parsed.success) {
    return { error: "Invalid data." };
  }

  if (!image) {
    return { error: "No image provided." };
  }

  // Send image to face service for identification
  const faceFormData = new FormData();
  faceFormData.append("company_id", companyId);
  faceFormData.append("image", image);

  let identifyResult;
  try {
    const response = await fetch(`${FACE_SERVICE_URL}/api/v1/attendance/identify`, {
      method: "POST",
      body: faceFormData,
    });

    if (!response.ok) {
      return { error: "Face identification service error." };
    }

    identifyResult = await response.json();
  } catch {
    return { error: "Face recognition service is not running." };
  }

  if (!identifyResult.identified || !identifyResult.employee_id) {
    return {
      identified: false,
      message: identifyResult.message || "Face not recognized",
      confidence: identifyResult.confidence,
    };
  }

  // Verify employee belongs to company and is active
  const [emp] = await db
    .select({
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      employeeCode: employee.employeeCode,
      isActive: employee.isActive,
    })
    .from(employee)
    .where(
      and(
        eq(employee.id, identifyResult.employee_id),
        eq(employee.companyId, companyId),
        eq(employee.isActive, true)
      )
    );

  if (!emp) {
    return { identified: false, message: "Employee not found or inactive" };
  }

  // Dedup check: same employee, same location, within window
  const dedupCutoff = new Date(Date.now() - ATTENDANCE_DEDUP_WINDOW_MS);
  const [existing] = await db
    .select({ id: attendanceLog.id })
    .from(attendanceLog)
    .where(
      and(
        eq(attendanceLog.companyId, companyId),
        eq(attendanceLog.employeeId, emp.id),
        eq(attendanceLog.locationId, parsed.data.locationId),
        gte(attendanceLog.capturedAt, dedupCutoff)
      )
    )
    .limit(1);

  if (existing) {
    return {
      identified: true,
      duplicate: true,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      employeeCode: emp.employeeCode,
      message: "Already checked in recently",
    };
  }

  // Create attendance log
  await db.insert(attendanceLog).values({
    companyId,
    employeeId: emp.id,
    locationId: parsed.data.locationId,
    type: parsed.data.type,
    source: "kiosk",
    confidence: identifyResult.confidence,
  });

  revalidatePath("/dashboard/attendance");
  return {
    identified: true,
    duplicate: false,
    employeeName: `${emp.firstName} ${emp.lastName}`,
    employeeCode: emp.employeeCode,
    confidence: identifyResult.confidence,
    type: parsed.data.type,
    message: `${parsed.data.type === "check_in" ? "Check-in" : "Check-out"} successful`,
  };
}

export async function manualCheckIn(values: unknown) {
  const session = await requireCompany();
  const companyId = session.user.companyId;
  const parsed = manualCheckInSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid data." };
  }

  // Verify employee
  const [emp] = await db
    .select({ id: employee.id })
    .from(employee)
    .where(and(eq(employee.id, parsed.data.employeeId), eq(employee.companyId, companyId)));

  if (!emp) {
    return { error: "Employee not found." };
  }

  await db.insert(attendanceLog).values({
    companyId,
    employeeId: parsed.data.employeeId,
    locationId: parsed.data.locationId,
    type: parsed.data.type,
    source: "manual",
  });

  revalidatePath("/dashboard/attendance");
  return { success: true };
}

export async function getTodayAttendanceStats() {
  const session = await requireCompany();
  const companyId = session.user.companyId;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [[{ totalCheckIns }], [{ uniqueEmployees }], [{ totalEnrolled }]] = await Promise.all([
    db
      .select({ totalCheckIns: count() })
      .from(attendanceLog)
      .where(
        and(eq(attendanceLog.companyId, companyId), gte(attendanceLog.capturedAt, todayStart))
      ),
    db
      .select({ uniqueEmployees: countDistinct(attendanceLog.employeeId) })
      .from(attendanceLog)
      .where(
        and(eq(attendanceLog.companyId, companyId), gte(attendanceLog.capturedAt, todayStart))
      ),
    db
      .select({ totalEnrolled: count() })
      .from(employee)
      .where(
        and(
          eq(employee.companyId, companyId),
          eq(employee.faceEnrolled, true),
          eq(employee.isActive, true)
        )
      ),
  ]);

  const presentPercentage =
    totalEnrolled > 0 ? Math.round((uniqueEmployees / totalEnrolled) * 100) : 0;

  return { totalCheckIns, uniqueEmployees, totalEnrolled, presentPercentage };
}

export async function getRecentActivity(limit = 20) {
  const session = await requireCompany();
  const companyId = session.user.companyId;

  const items = await db
    .select({
      id: attendanceLog.id,
      employeeId: attendanceLog.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      employeeCode: employee.employeeCode,
      locationName: location.name,
      type: attendanceLog.type,
      source: attendanceLog.source,
      confidence: attendanceLog.confidence,
      capturedAt: attendanceLog.capturedAt,
    })
    .from(attendanceLog)
    .innerJoin(employee, eq(attendanceLog.employeeId, employee.id))
    .innerJoin(location, eq(attendanceLog.locationId, location.id))
    .where(eq(attendanceLog.companyId, companyId))
    .orderBy(desc(attendanceLog.capturedAt))
    .limit(limit);

  return items;
}

export async function getAttendanceLogs(params: Record<string, unknown>) {
  const session = await requireCompany();
  const companyId = session.user.companyId;
  const parsed = attendanceFilterSchema.safeParse(params);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
  }

  const { page, pageSize, search, locationId, departmentId, dateFrom, dateTo, type, source } =
    parsed.data;
  const offset = (page - 1) * pageSize;

  const conditions = [eq(attendanceLog.companyId, companyId)];

  if (search) {
    conditions.push(
      or(
        ilike(employee.firstName, `%${search}%`),
        ilike(employee.lastName, `%${search}%`),
        ilike(employee.employeeCode, `%${search}%`)
      )!
    );
  }

  if (locationId) {
    conditions.push(eq(attendanceLog.locationId, locationId));
  }

  if (departmentId) {
    conditions.push(eq(employee.departmentId, departmentId));
  }

  if (dateFrom) {
    conditions.push(gte(attendanceLog.capturedAt, new Date(dateFrom)));
  }

  if (dateTo) {
    const endDate = new Date(dateTo);
    endDate.setHours(23, 59, 59, 999);
    conditions.push(lte(attendanceLog.capturedAt, endDate));
  }

  if (type && type !== "all") {
    conditions.push(eq(attendanceLog.type, type));
  }

  if (source && source !== "all") {
    conditions.push(eq(attendanceLog.source, source));
  }

  const where = and(...conditions);

  const [items, [{ total }]] = await Promise.all([
    db
      .select({
        id: attendanceLog.id,
        employeeId: attendanceLog.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        employeeCode: employee.employeeCode,
        departmentId: employee.departmentId,
        departmentName: department.name,
        locationName: location.name,
        type: attendanceLog.type,
        source: attendanceLog.source,
        confidence: attendanceLog.confidence,
        capturedAt: attendanceLog.capturedAt,
      })
      .from(attendanceLog)
      .innerJoin(employee, eq(attendanceLog.employeeId, employee.id))
      .innerJoin(location, eq(attendanceLog.locationId, location.id))
      .leftJoin(department, eq(employee.departmentId, department.id))
      .where(where)
      .orderBy(desc(attendanceLog.capturedAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ total: count() })
      .from(attendanceLog)
      .innerJoin(employee, eq(attendanceLog.employeeId, employee.id))
      .where(where),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}
