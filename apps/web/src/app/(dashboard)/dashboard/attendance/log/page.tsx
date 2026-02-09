import { Suspense } from "react";
import { getAttendanceLogs } from "@/actions/attendance";
import { getLocations } from "@/actions/location";
import { getDepartments } from "@/actions/department";
import { AttendanceLogTable } from "@/components/attendance/attendance-log-table";

export const metadata = {
  title: "Attendance Log - Attndly",
};

interface AttendanceLogPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AttendanceLogPage({ searchParams }: AttendanceLogPageProps) {
  const params = await searchParams;
  const [logData, locations, departments] = await Promise.all([
    getAttendanceLogs({
      page: params.page ? Number(params.page) : 1,
      pageSize: 10,
      search: typeof params.search === "string" ? params.search : undefined,
      locationId: typeof params.locationId === "string" ? params.locationId : undefined,
      departmentId: typeof params.departmentId === "string" ? params.departmentId : undefined,
      dateFrom: typeof params.dateFrom === "string" ? params.dateFrom : undefined,
      dateTo: typeof params.dateTo === "string" ? params.dateTo : undefined,
      type: typeof params.type === "string" ? params.type : "all",
      source: typeof params.source === "string" ? params.source : "all",
    }),
    getLocations(),
    getDepartments(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance Log</h1>
        <p className="text-muted-foreground">View and filter all attendance records</p>
      </div>

      <Suspense>
        <AttendanceLogTable
          data={logData.items}
          total={logData.total}
          page={logData.page}
          pageSize={logData.pageSize}
          totalPages={logData.totalPages}
          locations={locations.map((l) => ({ id: l.id, name: l.name }))}
          departments={departments.map((d) => ({ id: d.id, name: d.name }))}
        />
      </Suspense>
    </div>
  );
}
