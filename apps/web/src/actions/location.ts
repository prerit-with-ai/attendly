"use server";

import { db } from "@/db";
import { location } from "@/db/schema";
import { requireCompany } from "@/lib/auth-server";
import { createLocationSchema, updateLocationSchema } from "@/lib/validators/location";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getLocations() {
  const session = await requireCompany();
  return db
    .select()
    .from(location)
    .where(eq(location.companyId, session.user.companyId))
    .orderBy(location.createdAt);
}

export async function createLocation(values: unknown) {
  const session = await requireCompany();
  const parsed = createLocationSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid data." };
  }

  try {
    await db.insert(location).values({
      companyId: session.user.companyId,
      name: parsed.data.name,
      address: parsed.data.address || null,
      city: parsed.data.city,
      timezone: parsed.data.timezone,
    });
  } catch {
    return { error: "Failed to create location." };
  }

  revalidatePath("/dashboard/locations");
  return { success: true };
}

export async function updateLocation(values: unknown) {
  const session = await requireCompany();
  const parsed = updateLocationSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid data." };
  }

  try {
    await db
      .update(location)
      .set({
        name: parsed.data.name,
        address: parsed.data.address || null,
        city: parsed.data.city,
        timezone: parsed.data.timezone,
        isActive: parsed.data.isActive,
        updatedAt: new Date(),
      })
      .where(and(eq(location.id, parsed.data.id), eq(location.companyId, session.user.companyId)));
  } catch {
    return { error: "Failed to update location." };
  }

  revalidatePath("/dashboard/locations");
  return { success: true };
}

export async function deleteLocation(id: string) {
  const session = await requireCompany();

  try {
    await db
      .delete(location)
      .where(and(eq(location.id, id), eq(location.companyId, session.user.companyId)));
  } catch {
    return { error: "Failed to delete location. It may have employees assigned." };
  }

  revalidatePath("/dashboard/locations");
  return { success: true };
}
