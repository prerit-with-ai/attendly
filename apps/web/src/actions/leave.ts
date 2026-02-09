"use server";

import { db } from "@/db";
import {
  leave,
  leaveBalance,
  leaveType,
  employee,
  department,
  notification,
  user,
} from "@/db/schema";
import { requireCompany } from "@/lib/auth-server";
import {
  applyLeaveSchema,
  approveLeaveSchema,
  rejectLeaveSchema,
  cancelLeaveSchema,
  leaveFilterSchema,
} from "@/lib/validators/leave";
import { eq, and, or, ilike, count, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export async function getMyEmployee() {
  const session = await requireCompany();
  const companyId = session.user.companyId;
  const userId = session.user.id;

  // Find employee linked by email match
  const [emp] = await db
    .select({ id: employee.id, firstName: employee.firstName, lastName: employee.lastName })
    .from(employee)
    .where(
      and(
        eq(employee.companyId, companyId),
        eq(employee.email, session.user.email),
        eq(employee.isActive, true)
      )
    );

  return emp || null;
}

async function createNotification(
  companyId: string,
  userId: string,
  type: "leave_requested" | "leave_approved" | "leave_rejected",
  title: string,
  message: string
) {
  await db.insert(notification).values({
    companyId,
    userId,
    type,
    title,
    message,
  });
}

async function notifyManagersAndHR(
  companyId: string,
  employeeDepartmentId: string | null,
  title: string,
  message: string
) {
  // Notify HR admins and super admins
  const admins = await db
    .select({ id: user.id })
    .from(user)
    .where(
      and(
        eq(user.companyId, companyId),
        or(eq(user.role, "super_admin"), eq(user.role, "hr_admin"))
      )
    );

  // Notify department manager if applicable
  if (employeeDepartmentId) {
    const [dept] = await db
      .select({ managerId: department.managerId })
      .from(department)
      .where(eq(department.id, employeeDepartmentId));

    if (dept?.managerId) {
      const managerAlreadyAdmin = admins.some((a) => a.id === dept.managerId);
      if (!managerAlreadyAdmin) {
        admins.push({ id: dept.managerId! });
      }
    }
  }

  for (const admin of admins) {
    await createNotification(companyId, admin.id, "leave_requested", title, message);
  }
}

export async function applyLeave(values: unknown) {
  const session = await requireCompany();
  const companyId = session.user.companyId;
  const parsed = applyLeaveSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid data." };
  }

  const daysCount = calculateDays(parsed.data.startDate, parsed.data.endDate);
  if (daysCount < 1) {
    return { error: "End date must be on or after start date." };
  }

  // Check balance
  const currentYear = new Date().getFullYear();
  const [balance] = await db
    .select()
    .from(leaveBalance)
    .where(
      and(
        eq(leaveBalance.employeeId, parsed.data.employeeId),
        eq(leaveBalance.leaveTypeId, parsed.data.leaveTypeId),
        eq(leaveBalance.year, currentYear)
      )
    );

  if (!balance) {
    return { error: "No leave balance found for this type." };
  }

  if (balance.remainingDays < daysCount) {
    return { error: `Insufficient balance. You have ${balance.remainingDays} day(s) remaining.` };
  }

  // Get employee details for notification
  const [emp] = await db
    .select({
      firstName: employee.firstName,
      lastName: employee.lastName,
      departmentId: employee.departmentId,
    })
    .from(employee)
    .where(eq(employee.id, parsed.data.employeeId));

  const [lt] = await db
    .select({ name: leaveType.name })
    .from(leaveType)
    .where(eq(leaveType.id, parsed.data.leaveTypeId));

  await db.insert(leave).values({
    companyId,
    employeeId: parsed.data.employeeId,
    leaveTypeId: parsed.data.leaveTypeId,
    startDate: parsed.data.startDate,
    endDate: parsed.data.endDate,
    daysCount,
    reason: parsed.data.reason || null,
    status: "pending",
  });

  // Notify managers/HR
  if (emp && lt) {
    await notifyManagersAndHR(
      companyId,
      emp.departmentId,
      "Leave Request",
      `${emp.firstName} ${emp.lastName} has applied for ${daysCount} day(s) of ${lt.name}.`
    );
  }

  revalidatePath("/dashboard/leaves");
  return { success: true };
}

export async function approveLeave(values: unknown) {
  const session = await requireCompany();
  const companyId = session.user.companyId;
  const parsed = approveLeaveSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid data." };
  }

  const [leaveRecord] = await db
    .select()
    .from(leave)
    .where(and(eq(leave.id, parsed.data.leaveId), eq(leave.companyId, companyId)));

  if (!leaveRecord) {
    return { error: "Leave request not found." };
  }

  if (leaveRecord.status !== "pending") {
    return { error: "Only pending requests can be approved." };
  }

  // Update leave status
  await db
    .update(leave)
    .set({
      status: "approved",
      approvedBy: session.user.id,
      approvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(leave.id, parsed.data.leaveId));

  // Deduct balance
  const currentYear = new Date().getFullYear();
  const [balance] = await db
    .select()
    .from(leaveBalance)
    .where(
      and(
        eq(leaveBalance.employeeId, leaveRecord.employeeId),
        eq(leaveBalance.leaveTypeId, leaveRecord.leaveTypeId),
        eq(leaveBalance.year, currentYear)
      )
    );

  if (balance) {
    await db
      .update(leaveBalance)
      .set({
        usedDays: balance.usedDays + leaveRecord.daysCount,
        remainingDays: balance.remainingDays - leaveRecord.daysCount,
        updatedAt: new Date(),
      })
      .where(eq(leaveBalance.id, balance.id));
  }

  // Find employee's user to notify
  const [emp] = await db
    .select({ email: employee.email })
    .from(employee)
    .where(eq(employee.id, leaveRecord.employeeId));

  if (emp?.email) {
    const [empUser] = await db.select({ id: user.id }).from(user).where(eq(user.email, emp.email));

    if (empUser) {
      await createNotification(
        companyId,
        empUser.id,
        "leave_approved",
        "Leave Approved",
        "Your leave request has been approved."
      );
    }
  }

  revalidatePath("/dashboard/leaves");
  return { success: true };
}

export async function rejectLeave(values: unknown) {
  const session = await requireCompany();
  const companyId = session.user.companyId;
  const parsed = rejectLeaveSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid data." };
  }

  const [leaveRecord] = await db
    .select()
    .from(leave)
    .where(and(eq(leave.id, parsed.data.leaveId), eq(leave.companyId, companyId)));

  if (!leaveRecord) {
    return { error: "Leave request not found." };
  }

  if (leaveRecord.status !== "pending") {
    return { error: "Only pending requests can be rejected." };
  }

  await db
    .update(leave)
    .set({
      status: "rejected",
      approvedBy: session.user.id,
      rejectionReason: parsed.data.rejectionReason,
      updatedAt: new Date(),
    })
    .where(eq(leave.id, parsed.data.leaveId));

  // Notify employee
  const [emp] = await db
    .select({ email: employee.email })
    .from(employee)
    .where(eq(employee.id, leaveRecord.employeeId));

  if (emp?.email) {
    const [empUser] = await db.select({ id: user.id }).from(user).where(eq(user.email, emp.email));

    if (empUser) {
      await createNotification(
        companyId,
        empUser.id,
        "leave_rejected",
        "Leave Rejected",
        `Your leave request was rejected. Reason: ${parsed.data.rejectionReason}`
      );
    }
  }

  revalidatePath("/dashboard/leaves");
  return { success: true };
}

export async function cancelLeave(values: unknown) {
  const session = await requireCompany();
  const companyId = session.user.companyId;
  const parsed = cancelLeaveSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid data." };
  }

  const [leaveRecord] = await db
    .select()
    .from(leave)
    .where(and(eq(leave.id, parsed.data.leaveId), eq(leave.companyId, companyId)));

  if (!leaveRecord) {
    return { error: "Leave request not found." };
  }

  if (leaveRecord.status !== "pending" && leaveRecord.status !== "approved") {
    return { error: "Only pending or approved requests can be cancelled." };
  }

  const wasApproved = leaveRecord.status === "approved";

  await db
    .update(leave)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(leave.id, parsed.data.leaveId));

  // Refund balance if it was approved
  if (wasApproved) {
    const currentYear = new Date().getFullYear();
    const [balance] = await db
      .select()
      .from(leaveBalance)
      .where(
        and(
          eq(leaveBalance.employeeId, leaveRecord.employeeId),
          eq(leaveBalance.leaveTypeId, leaveRecord.leaveTypeId),
          eq(leaveBalance.year, currentYear)
        )
      );

    if (balance) {
      await db
        .update(leaveBalance)
        .set({
          usedDays: Math.max(0, balance.usedDays - leaveRecord.daysCount),
          remainingDays: balance.remainingDays + leaveRecord.daysCount,
          updatedAt: new Date(),
        })
        .where(eq(leaveBalance.id, balance.id));
    }
  }

  revalidatePath("/dashboard/leaves");
  return { success: true };
}

export async function getLeaves(params: Record<string, unknown>) {
  const session = await requireCompany();
  const companyId = session.user.companyId;
  const parsed = leaveFilterSchema.safeParse(params);
  if (!parsed.success) {
    return { items: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
  }

  const { page, pageSize, search, status, employeeId } = parsed.data;
  const offset = (page - 1) * pageSize;

  const conditions = [eq(leave.companyId, companyId)];

  // Role-based filtering: employees see only their own
  const role = session.user.role;
  if (role === "employee") {
    const myEmp = await getMyEmployee();
    if (myEmp) {
      conditions.push(eq(leave.employeeId, myEmp.id));
    } else {
      return { items: [], total: 0, page, pageSize, totalPages: 0 };
    }
  } else if (role === "manager") {
    // Managers see their team (employees in departments they manage)
    const managedDepts = await db
      .select({ id: department.id })
      .from(department)
      .where(and(eq(department.companyId, companyId), eq(department.managerId, session.user.id)));

    if (managedDepts.length > 0) {
      const deptIds = managedDepts.map((d) => d.id);
      const teamEmployees = await db
        .select({ id: employee.id })
        .from(employee)
        .where(
          and(
            eq(employee.companyId, companyId),
            or(...deptIds.map((dId) => eq(employee.departmentId, dId)))
          )
        );

      if (teamEmployees.length > 0) {
        conditions.push(or(...teamEmployees.map((e) => eq(leave.employeeId, e.id)))!);
      } else {
        return { items: [], total: 0, page, pageSize, totalPages: 0 };
      }
    } else {
      return { items: [], total: 0, page, pageSize, totalPages: 0 };
    }
  }
  // super_admin and hr_admin see all

  if (search) {
    conditions.push(
      or(
        ilike(employee.firstName, `%${search}%`),
        ilike(employee.lastName, `%${search}%`),
        ilike(employee.employeeCode, `%${search}%`)
      )!
    );
  }

  if (status && status !== "all") {
    conditions.push(eq(leave.status, status));
  }

  if (employeeId) {
    conditions.push(eq(leave.employeeId, employeeId));
  }

  const where = and(...conditions);

  const [items, [{ total }]] = await Promise.all([
    db
      .select({
        id: leave.id,
        employeeId: leave.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        employeeCode: employee.employeeCode,
        leaveTypeId: leave.leaveTypeId,
        leaveTypeName: leaveType.name,
        startDate: leave.startDate,
        endDate: leave.endDate,
        daysCount: leave.daysCount,
        reason: leave.reason,
        status: leave.status,
        rejectionReason: leave.rejectionReason,
        createdAt: leave.createdAt,
      })
      .from(leave)
      .innerJoin(employee, eq(leave.employeeId, employee.id))
      .innerJoin(leaveType, eq(leave.leaveTypeId, leaveType.id))
      .where(where)
      .orderBy(desc(leave.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ total: count() })
      .from(leave)
      .innerJoin(employee, eq(leave.employeeId, employee.id))
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

export async function getLeaveBalance(employeeId: string, year?: number) {
  const currentYear = year || new Date().getFullYear();

  const balances = await db
    .select({
      id: leaveBalance.id,
      leaveTypeId: leaveBalance.leaveTypeId,
      leaveTypeName: leaveType.name,
      totalDays: leaveBalance.totalDays,
      usedDays: leaveBalance.usedDays,
      remainingDays: leaveBalance.remainingDays,
      year: leaveBalance.year,
    })
    .from(leaveBalance)
    .innerJoin(leaveType, eq(leaveBalance.leaveTypeId, leaveType.id))
    .where(and(eq(leaveBalance.employeeId, employeeId), eq(leaveBalance.year, currentYear)));

  return balances;
}
