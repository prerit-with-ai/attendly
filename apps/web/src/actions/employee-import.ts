"use server";

import { db } from "@/db";
import { employee, location, department } from "@/db/schema";
import { requireCompany } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface ImportRowData {
  first_name: string;
  last_name: string;
  employee_code: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  location: string;
  joined_date?: string;
}

export async function importEmployees(rows: ImportRowData[]) {
  const session = await requireCompany();
  const companyId = session.user.companyId;

  // Fetch locations and departments for name resolution
  const [locations, departments] = await Promise.all([
    db
      .select({ id: location.id, name: location.name })
      .from(location)
      .where(eq(location.companyId, companyId)),
    db
      .select({ id: department.id, name: department.name })
      .from(department)
      .where(eq(department.companyId, companyId)),
  ]);

  const locationMap = new Map(locations.map((l) => [l.name.toLowerCase(), l.id]));
  const departmentMap = new Map(departments.map((d) => [d.name.toLowerCase(), d.id]));

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    const locationId = locationMap.get(row.location.toLowerCase());
    if (!locationId) {
      errors.push(`Row ${rowNum}: Location "${row.location}" not found`);
      skipped++;
      continue;
    }

    const departmentId = row.department ? departmentMap.get(row.department.toLowerCase()) : null;

    if (row.department && !departmentId) {
      errors.push(`Row ${rowNum}: Department "${row.department}" not found`);
      skipped++;
      continue;
    }

    try {
      await db.insert(employee).values({
        companyId,
        firstName: row.first_name,
        lastName: row.last_name,
        employeeCode: row.employee_code,
        email: row.email || null,
        phone: row.phone || null,
        position: row.position || null,
        locationId,
        departmentId: departmentId || null,
        joinedDate: row.joined_date || null,
      });
      imported++;
    } catch (e: unknown) {
      if (e instanceof Error && e.message.includes("employee_company_code_idx")) {
        errors.push(`Row ${rowNum}: Duplicate employee code "${row.employee_code}"`);
      } else {
        errors.push(`Row ${rowNum}: Failed to insert`);
      }
      skipped++;
    }
  }

  revalidatePath("/dashboard/employees");

  return {
    imported,
    skipped,
    total: rows.length,
    errors: errors.slice(0, 20), // limit to 20 errors
  };
}
