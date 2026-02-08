import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { attendanceLog, employee } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { ATTENDANCE_DEDUP_WINDOW_MS } from "@attndly/shared";

export async function POST(request: NextRequest) {
  // Verify internal API secret
  const apiSecret = process.env.INTERNAL_API_SECRET;
  if (apiSecret) {
    const providedSecret = request.headers.get("x-api-secret");
    if (providedSecret !== apiSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const body = await request.json();
  const { employee_id, camera_id, company_id, location_id, confidence, type, source } = body;

  if (!employee_id || !company_id || !location_id) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify employee exists and is active
  const [emp] = await db
    .select({ id: employee.id })
    .from(employee)
    .where(
      and(
        eq(employee.id, employee_id),
        eq(employee.companyId, company_id),
        eq(employee.isActive, true)
      )
    );

  if (!emp) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  // Dedup check
  const dedupCutoff = new Date(Date.now() - ATTENDANCE_DEDUP_WINDOW_MS);
  const [existing] = await db
    .select({ id: attendanceLog.id })
    .from(attendanceLog)
    .where(
      and(
        eq(attendanceLog.companyId, company_id),
        eq(attendanceLog.employeeId, employee_id),
        eq(attendanceLog.locationId, location_id),
        gte(attendanceLog.capturedAt, dedupCutoff)
      )
    )
    .limit(1);

  if (existing) {
    return NextResponse.json({ success: true, duplicate: true });
  }

  await db.insert(attendanceLog).values({
    companyId: company_id,
    employeeId: employee_id,
    cameraId: camera_id || null,
    locationId: location_id,
    type: type || "check_in",
    source: source || "rtsp",
    confidence: confidence || null,
  });

  return NextResponse.json({ success: true, duplicate: false });
}
