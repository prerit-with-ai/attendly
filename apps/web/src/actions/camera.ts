"use server";

import { db } from "@/db";
import { camera, location } from "@/db/schema";
import { requireCompany } from "@/lib/auth-server";
import { createCameraSchema, updateCameraSchema } from "@/lib/validators/camera";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCameras() {
  const session = await requireCompany();
  return db
    .select({
      id: camera.id,
      name: camera.name,
      rtspUrl: camera.rtspUrl,
      description: camera.description,
      status: camera.status,
      lastConnectedAt: camera.lastConnectedAt,
      locationId: camera.locationId,
      locationName: location.name,
      createdAt: camera.createdAt,
    })
    .from(camera)
    .leftJoin(location, eq(camera.locationId, location.id))
    .where(eq(camera.companyId, session.user.companyId))
    .orderBy(camera.createdAt);
}

export async function createCamera(values: unknown) {
  const session = await requireCompany();
  const parsed = createCameraSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid data." };
  }

  try {
    await db.insert(camera).values({
      companyId: session.user.companyId,
      name: parsed.data.name,
      locationId: parsed.data.locationId,
      rtspUrl: parsed.data.rtspUrl,
      description: parsed.data.description || null,
    });
  } catch {
    return { error: "Failed to create camera." };
  }

  revalidatePath("/dashboard/cameras");
  return { success: true };
}

export async function updateCamera(values: unknown) {
  const session = await requireCompany();
  const parsed = updateCameraSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid data." };
  }

  try {
    await db
      .update(camera)
      .set({
        name: parsed.data.name,
        locationId: parsed.data.locationId,
        rtspUrl: parsed.data.rtspUrl,
        description: parsed.data.description || null,
        updatedAt: new Date(),
      })
      .where(and(eq(camera.id, parsed.data.id), eq(camera.companyId, session.user.companyId)));
  } catch {
    return { error: "Failed to update camera." };
  }

  revalidatePath("/dashboard/cameras");
  return { success: true };
}

export async function deleteCamera(id: string) {
  const session = await requireCompany();

  try {
    await db
      .delete(camera)
      .where(and(eq(camera.id, id), eq(camera.companyId, session.user.companyId)));
  } catch {
    return { error: "Failed to delete camera." };
  }

  revalidatePath("/dashboard/cameras");
  return { success: true };
}

export async function testCameraConnection(rtspUrl: string) {
  const faceServiceUrl = process.env.FACE_SERVICE_URL || "http://localhost:8000";

  try {
    const response = await fetch(`${faceServiceUrl}/api/v1/camera/test-rtsp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rtsp_url: rtspUrl }),
    });

    if (!response.ok) {
      return { success: false, message: "Face recognition service returned an error." };
    }

    const data = await response.json();
    return { success: data.success, message: data.message };
  } catch {
    return {
      success: false,
      message: "Face recognition service is not running. Please start the face service.",
    };
  }
}

export async function updateCameraStatus(id: string, status: "active" | "inactive" | "error") {
  const session = await requireCompany();

  try {
    await db
      .update(camera)
      .set({
        status,
        lastConnectedAt: status === "active" ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(camera.id, id), eq(camera.companyId, session.user.companyId)));
  } catch {
    return { error: "Failed to update camera status." };
  }

  revalidatePath("/dashboard/cameras");
  return { success: true };
}
