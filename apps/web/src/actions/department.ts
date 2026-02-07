"use server";

import { db } from "@/db";
import { department } from "@/db/schema";
import { requireCompany } from "@/lib/auth-server";
import { createDepartmentSchema, updateDepartmentSchema } from "@/lib/validators/department";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getDepartments() {
  const session = await requireCompany();
  return db
    .select()
    .from(department)
    .where(eq(department.companyId, session.user.companyId))
    .orderBy(department.createdAt);
}

export async function createDepartment(values: unknown) {
  const session = await requireCompany();
  const parsed = createDepartmentSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid data." };
  }

  try {
    await db.insert(department).values({
      companyId: session.user.companyId,
      name: parsed.data.name,
      managerId: parsed.data.managerId || null,
    });
  } catch {
    return { error: "Failed to create department." };
  }

  revalidatePath("/dashboard/departments");
  return { success: true };
}

export async function updateDepartment(values: unknown) {
  const session = await requireCompany();
  const parsed = updateDepartmentSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid data." };
  }

  try {
    await db
      .update(department)
      .set({
        name: parsed.data.name,
        managerId: parsed.data.managerId || null,
        updatedAt: new Date(),
      })
      .where(
        and(eq(department.id, parsed.data.id), eq(department.companyId, session.user.companyId))
      );
  } catch {
    return { error: "Failed to update department." };
  }

  revalidatePath("/dashboard/departments");
  return { success: true };
}

export async function deleteDepartment(id: string) {
  const session = await requireCompany();

  try {
    await db
      .delete(department)
      .where(and(eq(department.id, id), eq(department.companyId, session.user.companyId)));
  } catch {
    return { error: "Failed to delete department. It may have employees assigned." };
  }

  revalidatePath("/dashboard/departments");
  return { success: true };
}
