"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { DataTable } from "@/components/ui/data-table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { attendanceColumns, type AttendanceRow } from "./attendance-columns";
import { AttendanceTableToolbar } from "./attendance-table-toolbar";

interface AttendanceLogTableProps {
  data: AttendanceRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  locations: { id: string; name: string }[];
  departments: { id: string; name: string }[];
}

export function AttendanceLogTable({
  data,
  total,
  page,
  pageSize,
  totalPages,
  locations,
  departments,
}: AttendanceLogTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.replace(`?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <Suspense>
        <AttendanceTableToolbar locations={locations} departments={departments} />
      </Suspense>

      <DataTable columns={attendanceColumns} data={data} />

      <DataTablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
