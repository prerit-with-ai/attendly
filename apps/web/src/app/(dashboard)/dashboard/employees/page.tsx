import { Suspense } from "react";
import { getEmployees } from "@/actions/employee";
import { getLocations } from "@/actions/location";
import { getDepartments } from "@/actions/department";
import { EmployeeDataTable } from "@/components/employees/employee-data-table";

export const metadata = {
  title: "Employees - Attndly",
};

interface EmployeesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EmployeesPage({ searchParams }: EmployeesPageProps) {
  const params = await searchParams;
  const [employeeData, locations, departments] = await Promise.all([
    getEmployees({
      page: params.page ? Number(params.page) : 1,
      pageSize: 10,
      search: typeof params.search === "string" ? params.search : undefined,
      departmentId: typeof params.departmentId === "string" ? params.departmentId : undefined,
      locationId: typeof params.locationId === "string" ? params.locationId : undefined,
      isActive: typeof params.isActive === "string" ? params.isActive : "all",
    }),
    getLocations(),
    getDepartments(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
        <p className="text-muted-foreground">Manage your organization&apos;s employees</p>
      </div>

      <Suspense>
        <EmployeeDataTable
          data={employeeData.items}
          total={employeeData.total}
          page={employeeData.page}
          pageSize={employeeData.pageSize}
          totalPages={employeeData.totalPages}
          locations={locations.map((l) => ({ id: l.id, name: l.name }))}
          departments={departments.map((d) => ({ id: d.id, name: d.name }))}
        />
      </Suspense>
    </div>
  );
}
