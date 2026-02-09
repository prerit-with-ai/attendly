"use server";

import { db } from "@/db";
import { company, location, user } from "@/db/schema";
import { requireSession } from "@/lib/auth-server";
import { onboardingSchema } from "@/lib/validators/onboarding";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function completeOnboarding(values: unknown) {
  const session = await requireSession();

  if (session.user.companyId) {
    redirect("/dashboard");
  }

  const parsed = onboardingSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid data. Please check your inputs." };
  }

  const data = parsed.data;

  try {
    await db.transaction(async (tx) => {
      const [newCompany] = await tx
        .insert(company)
        .values({
          name: data.companyName,
          industry: data.industry,
          size: data.companySize,
        })
        .returning();

      await tx.insert(location).values({
        companyId: newCompany.id,
        name: data.locationName,
        address: data.address || null,
        city: data.city,
        timezone: data.timezone,
      });

      await tx
        .update(user)
        .set({
          companyId: newCompany.id,
          role: "super_admin",
          updatedAt: new Date(),
        })
        .where(eq(user.id, session.user.id));
    });
  } catch {
    return { error: "Failed to complete onboarding. Please try again." };
  }

  redirect("/dashboard");
}
