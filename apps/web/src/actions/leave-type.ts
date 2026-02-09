"use server";

import { db } from "@/db";
import { leaveType, leaveBalance, leave, employee } from "@/db/schema";
import { requireCompany } from "@/lib/auth-server";
import { createLeaveTypeSchema, updateLeaveTypeSchema } from "@/lib/validators/leave-type";
import { eq, and, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getLeaveTypes() {
  const session = await requireCompany();
  const companyId = session.user.companyId;

  return db
    .select()
    .from(leaveType)
    .where(eq(leaveType.companyId, companyId))
    .orderBy(leaveType.createdAt);
}

export async function createLeaveType(values: unknown) {
  const session = await requireCompany();
  const companyId = session.user.companyId;
  const parsed = createLeaveTypeSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid data." };
  }

  const [newType] = await db
    .insert(leaveType)
    .values({
      companyId,
      name: parsed.data.name,
      daysPerYear: parsed.data.daysPerYear,
      isActive: parsed.data.isActive,
    })
    .returning({ id: leaveType.id });

  // Auto-initialize leave balances for all active employees
  const currentYear = new Date().getFullYear();
  const employees = await db
    .select({ id: employee.id })
    .from(employee)
    .where(and(eq(employee.companyId, companyId), eq(employee.isActive, true)));

  if (employees.length > 0) {
    await db.insert(leaveBalance).values(
      employees.map((emp) => ({
        employeeId: emp.id,
        leaveTypeId: newType.id,
        totalDays: parsed.data.daysPerYear,
        usedDays: 0,
        remainingDays: parsed.data.daysPerYear,
        year: currentYear,
      }))
    );
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updateLeaveType(values: unknown) {
  const session = await requireCompany();
  const companyId = session.user.companyId;
  const parsed = updateLeaveTypeSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid data." };
  }

  await db
    .update(leaveType)
    .set({
      name: parsed.data.name,
      daysPerYear: parsed.data.daysPerYear,
      isActive: parsed.data.isActive,
      updatedAt: new Date(),
    })
    .where(and(eq(leaveType.id, parsed.data.id), eq(leaveType.companyId, companyId)));

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function deleteLeaveType(id: string) {
  const session = await requireCompany();
  const companyId = session.user.companyId;

  // Check if any leave records use this type
  const [{ usageCount }] = await db
    .select({ usageCount: count() })
    .from(leave)
    .where(eq(leave.leaveTypeId, id));

  if (usageCount > 0) {
    return { error: "Cannot delete: leave records exist for this type. Deactivate it instead." };
  }

  // Delete balances first
  await db.delete(leaveBalance).where(eq(leaveBalance.leaveTypeId, id));

  await db.delete(leaveType).where(and(eq(leaveType.id, id), eq(leaveType.companyId, companyId)));

  revalidatePath("/dashboard/settings");
  return { success: true };
}
