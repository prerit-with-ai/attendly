"use server";

import { db } from "@/db";
import { shift, employee } from "@/db/schema";
import { requireCompany } from "@/lib/auth-server";
import { createShiftSchema, updateShiftSchema, assignShiftSchema } from "@/lib/validators/shift";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getShifts() {
  const session = await requireCompany();
  const companyId = session.user.companyId;

  return db.select().from(shift).where(eq(shift.companyId, companyId)).orderBy(shift.createdAt);
}

export async function createShift(values: unknown) {
  const session = await requireCompany();
  const companyId = session.user.companyId;
  const parsed = createShiftSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid data." };
  }

  // If setting as default, unset existing default
  if (parsed.data.isDefault) {
    await db
      .update(shift)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(and(eq(shift.companyId, companyId), eq(shift.isDefault, true)));
  }

  await db.insert(shift).values({
    companyId,
    name: parsed.data.name,
    startTime: parsed.data.startTime,
    endTime: parsed.data.endTime,
    gracePeriodMinutes: parsed.data.gracePeriodMinutes,
    isDefault: parsed.data.isDefault,
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updateShift(values: unknown) {
  const session = await requireCompany();
  const companyId = session.user.companyId;
  const parsed = updateShiftSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid data." };
  }

  // If setting as default, unset existing default
  if (parsed.data.isDefault) {
    await db
      .update(shift)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(and(eq(shift.companyId, companyId), eq(shift.isDefault, true)));
  }

  await db
    .update(shift)
    .set({
      name: parsed.data.name,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      gracePeriodMinutes: parsed.data.gracePeriodMinutes,
      isDefault: parsed.data.isDefault,
      updatedAt: new Date(),
    })
    .where(and(eq(shift.id, parsed.data.id), eq(shift.companyId, companyId)));

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function deleteShift(id: string) {
  const session = await requireCompany();
  const companyId = session.user.companyId;

  // Unassign employees from this shift first
  await db
    .update(employee)
    .set({ shiftId: null, updatedAt: new Date() })
    .where(and(eq(employee.shiftId, id), eq(employee.companyId, companyId)));

  await db.delete(shift).where(and(eq(shift.id, id), eq(shift.companyId, companyId)));

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function assignShift(values: unknown) {
  const session = await requireCompany();
  const companyId = session.user.companyId;
  const parsed = assignShiftSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid data." };
  }

  for (const empId of parsed.data.employeeIds) {
    await db
      .update(employee)
      .set({ shiftId: parsed.data.shiftId, updatedAt: new Date() })
      .where(and(eq(employee.id, empId), eq(employee.companyId, companyId)));
  }

  revalidatePath("/dashboard/employees");
  return { success: true };
}
