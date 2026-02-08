"use server";

import { db } from "@/db";
import { employee } from "@/db/schema";
import { requireCompany } from "@/lib/auth-server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const FACE_SERVICE_URL = process.env.FACE_SERVICE_URL || "http://localhost:8000";

export async function getEmployee(employeeId: string) {
  const session = await requireCompany();
  const [emp] = await db
    .select()
    .from(employee)
    .where(and(eq(employee.id, employeeId), eq(employee.companyId, session.user.companyId)));

  if (!emp) {
    return null;
  }
  return emp;
}

export async function enrollFace(employeeId: string, formData: FormData) {
  const session = await requireCompany();
  const companyId = session.user.companyId;

  // Verify employee belongs to this company
  const [emp] = await db
    .select({ id: employee.id })
    .from(employee)
    .where(and(eq(employee.id, employeeId), eq(employee.companyId, companyId)));

  if (!emp) {
    return { error: "Employee not found." };
  }

  // Forward images to face service
  const faceFormData = new FormData();
  faceFormData.append("company_id", companyId);
  faceFormData.append("employee_id", employeeId);

  const images = formData.getAll("images");
  for (const image of images) {
    faceFormData.append("images", image);
  }

  try {
    const response = await fetch(`${FACE_SERVICE_URL}/api/v1/enroll`, {
      method: "POST",
      body: faceFormData,
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.detail || "Failed to enroll face." };
    }

    const data = await response.json();

    // Update employee record
    await db
      .update(employee)
      .set({
        faceEnrolled: true,
        faceEnrolledAt: new Date(),
        faceImageCount: data.face_count,
        updatedAt: new Date(),
      })
      .where(and(eq(employee.id, employeeId), eq(employee.companyId, companyId)));

    revalidatePath("/dashboard/employees");
    revalidatePath(`/dashboard/employees/${employeeId}/enroll`);
    return { success: true, faceCount: data.face_count };
  } catch {
    return {
      error: "Face recognition service is not running. Please start the face service.",
    };
  }
}

export async function removeFaceEnrollment(employeeId: string) {
  const session = await requireCompany();
  const companyId = session.user.companyId;

  // Verify employee belongs to this company
  const [emp] = await db
    .select({ id: employee.id })
    .from(employee)
    .where(and(eq(employee.id, employeeId), eq(employee.companyId, companyId)));

  if (!emp) {
    return { error: "Employee not found." };
  }

  try {
    const response = await fetch(`${FACE_SERVICE_URL}/api/v1/enroll/${companyId}/${employeeId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      return { error: "Failed to remove face enrollment." };
    }
  } catch {
    // Even if face service is down, clear the DB record
  }

  // Reset employee face fields
  await db
    .update(employee)
    .set({
      faceEnrolled: false,
      faceEnrolledAt: null,
      faceImageCount: 0,
      updatedAt: new Date(),
    })
    .where(and(eq(employee.id, employeeId), eq(employee.companyId, companyId)));

  revalidatePath("/dashboard/employees");
  revalidatePath(`/dashboard/employees/${employeeId}/enroll`);
  return { success: true };
}

export async function detectFace(formData: FormData) {
  const image = formData.get("image");
  if (!image) {
    return { error: "No image provided." };
  }

  const faceFormData = new FormData();
  faceFormData.append("image", image);

  try {
    const response = await fetch(`${FACE_SERVICE_URL}/api/v1/enroll/detect`, {
      method: "POST",
      body: faceFormData,
    });

    if (!response.ok) {
      const data = await response.json();
      return { error: data.detail || "Face detection failed." };
    }

    const data = await response.json();
    return {
      detected: data.detected,
      faceCount: data.face_count,
      confidence: data.confidence,
      message: data.message,
    };
  } catch {
    return {
      error: "Face recognition service is not running. Please start the face service.",
    };
  }
}
