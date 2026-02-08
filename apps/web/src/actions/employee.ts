"use server";

import { db } from "@/db";
import { employee, department, location, shift } from "@/db/schema";
import { requireCompany } from "@/lib/auth-server";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  employeeFilterSchema,
} from "@/lib/validators/employee";
import { eq, and, or, ilike, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getEmployees(params: Record<string, unknown>) {
  const session = await requireCompany();
  const parsed = employeeFilterSchema.safeParse(params);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
  }

  const { page, pageSize, search, departmentId, locationId, isActive } = parsed.data;
  const offset = (page - 1) * pageSize;

  const conditions = [eq(employee.companyId, session.user.companyId)];

  if (search) {
    conditions.push(
      or(
        ilike(employee.firstName, `%${search}%`),
        ilike(employee.lastName, `%${search}%`),
        ilike(employee.employeeCode, `%${search}%`),
        ilike(employee.email, `%${search}%`)
      )!
    );
  }

  if (departmentId) {
    conditions.push(eq(employee.departmentId, departmentId));
  }

  if (locationId) {
    conditions.push(eq(employee.locationId, locationId));
  }

  if (isActive === "true") {
    conditions.push(eq(employee.isActive, true));
  } else if (isActive === "false") {
    conditions.push(eq(employee.isActive, false));
  }

  const where = and(...conditions);

  const [items, [{ total }]] = await Promise.all([
    db
      .select({
        id: employee.id,
        employeeCode: employee.employeeCode,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        position: employee.position,
        isActive: employee.isActive,
        faceEnrolled: employee.faceEnrolled,
        joinedDate: employee.joinedDate,
        locationId: employee.locationId,
        departmentId: employee.departmentId,
        shiftId: employee.shiftId,
        locationName: location.name,
        departmentName: department.name,
        shiftName: shift.name,
        createdAt: employee.createdAt,
      })
      .from(employee)
      .leftJoin(location, eq(employee.locationId, location.id))
      .leftJoin(department, eq(employee.departmentId, department.id))
      .leftJoin(shift, eq(employee.shiftId, shift.id))
      .where(where)
      .orderBy(employee.createdAt)
      .limit(pageSize)
      .offset(offset),
    db.select({ total: count() }).from(employee).where(where),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function createEmployee(values: unknown) {
  const session = await requireCompany();
  const parsed = createEmployeeSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid data." };
  }

  try {
    await db.insert(employee).values({
      companyId: session.user.companyId,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      employeeCode: parsed.data.employeeCode,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      position: parsed.data.position || null,
      locationId: parsed.data.locationId,
      departmentId: parsed.data.departmentId || null,
      shiftId: parsed.data.shiftId || null,
      joinedDate: parsed.data.joinedDate || null,
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("employee_company_code_idx")) {
      return { error: "An employee with this code already exists." };
    }
    return { error: "Failed to create employee." };
  }

  revalidatePath("/dashboard/employees");
  return { success: true };
}

export async function updateEmployee(values: unknown) {
  const session = await requireCompany();
  const parsed = updateEmployeeSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid data." };
  }

  try {
    await db
      .update(employee)
      .set({
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        employeeCode: parsed.data.employeeCode,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        position: parsed.data.position || null,
        locationId: parsed.data.locationId,
        departmentId: parsed.data.departmentId || null,
        shiftId: parsed.data.shiftId || null,
        joinedDate: parsed.data.joinedDate || null,
        isActive: parsed.data.isActive,
        updatedAt: new Date(),
      })
      .where(and(eq(employee.id, parsed.data.id), eq(employee.companyId, session.user.companyId)));
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes("employee_company_code_idx")) {
      return { error: "An employee with this code already exists." };
    }
    return { error: "Failed to update employee." };
  }

  revalidatePath("/dashboard/employees");
  return { success: true };
}

export async function deleteEmployee(id: string) {
  const session = await requireCompany();

  try {
    await db
      .update(employee)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(employee.id, id), eq(employee.companyId, session.user.companyId)));
  } catch {
    return { error: "Failed to deactivate employee." };
  }

  revalidatePath("/dashboard/employees");
  return { success: true };
}
