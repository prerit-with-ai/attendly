"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { deleteEmployee } from "@/actions/employee";
import { DataTable } from "@/components/ui/data-table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { getEmployeeColumns, type EmployeeRow } from "./employee-columns";
import { EmployeeTableToolbar } from "./employee-table-toolbar";
import { EmployeeDialog } from "./employee-dialog";
import { CsvImportDialog } from "./csv-import-dialog";

interface EmployeeDataTableProps {
  data: EmployeeRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  locations: { id: string; name: string }[];
  departments: { id: string; name: string }[];
  shifts: { id: string; name: string }[];
}

export function EmployeeDataTable({
  data,
  total,
  page,
  pageSize,
  totalPages,
  locations,
  departments,
  shifts,
}: EmployeeDataTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<EmployeeRow | undefined>();

  function handleEdit(emp: EmployeeRow) {
    setEditEmployee(emp);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditEmployee(undefined);
    setDialogOpen(true);
  }

  async function handleDeactivate(id: string) {
    const result = await deleteEmployee(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Employee deactivated");
    }
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.replace(`?${params.toString()}`);
  }

  const columns = getEmployeeColumns({
    onEdit: handleEdit,
    onDeactivate: handleDeactivate,
  });

  return (
    <div className="space-y-4">
      <Suspense>
        <EmployeeTableToolbar
          locations={locations}
          departments={departments}
          onAddEmployee={handleAdd}
          onImportCsv={() => setCsvDialogOpen(true)}
        />
      </Suspense>

      <DataTable columns={columns} data={data} />

      <DataTablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <EmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        locations={locations}
        departments={departments}
        shifts={shifts}
        employee={editEmployee}
      />

      <CsvImportDialog
        open={csvDialogOpen}
        onOpenChange={setCsvDialogOpen}
        locations={locations}
        departments={departments}
      />
    </div>
  );
}
