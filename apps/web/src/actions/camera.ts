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

export async function startCameraStream(cameraId: string) {
  const session = await requireCompany();
  const companyId = session.user.companyId;
  const faceServiceUrl = process.env.FACE_SERVICE_URL || "http://localhost:8000";
  const nextjsBaseUrl = process.env.NEXTJS_BASE_URL || "http://localhost:3000";

  // Fetch camera details
  const [cam] = await db
    .select({
      id: camera.id,
      rtspUrl: camera.rtspUrl,
      locationId: camera.locationId,
    })
    .from(camera)
    .where(and(eq(camera.id, cameraId), eq(camera.companyId, companyId)));

  if (!cam) {
    return { error: "Camera not found." };
  }

  try {
    const response = await fetch(`${faceServiceUrl}/api/v1/stream/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        camera_id: cam.id,
        rtsp_url: cam.rtspUrl,
        company_id: companyId,
        location_id: cam.locationId,
        callback_url: `${nextjsBaseUrl}/api/attendance/log`,
        frame_interval: 30,
      }),
    });

    const data = await response.json();
    if (data.success) {
      await db
        .update(camera)
        .set({ status: "active", lastConnectedAt: new Date(), updatedAt: new Date() })
        .where(eq(camera.id, cameraId));
      revalidatePath("/dashboard/cameras");
    }
    return { success: data.success, message: data.message };
  } catch {
    return { error: "Face recognition service is not running." };
  }
}

export async function stopCameraStream(cameraId: string) {
  const session = await requireCompany();
  const companyId = session.user.companyId;
  const faceServiceUrl = process.env.FACE_SERVICE_URL || "http://localhost:8000";

  // Verify camera belongs to company
  const [cam] = await db
    .select({ id: camera.id })
    .from(camera)
    .where(and(eq(camera.id, cameraId), eq(camera.companyId, companyId)));

  if (!cam) {
    return { error: "Camera not found." };
  }

  try {
    const response = await fetch(`${faceServiceUrl}/api/v1/stream/stop`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ camera_id: cameraId }),
    });

    const data = await response.json();
    if (data.success) {
      await db
        .update(camera)
        .set({ status: "inactive", updatedAt: new Date() })
        .where(eq(camera.id, cameraId));
      revalidatePath("/dashboard/cameras");
    }
    return { success: data.success, message: data.message };
  } catch {
    return { error: "Face recognition service is not running." };
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
