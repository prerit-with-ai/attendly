"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { DataTable } from "@/components/ui/data-table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { getLeaveColumns, type LeaveRow } from "./leave-columns";
import { LeaveTableToolbar } from "./leave-table-toolbar";
import { ApplyLeaveDialog } from "./apply-leave-dialog";
import { LeaveActionDialog } from "./leave-action-dialog";

interface BalanceItem {
  leaveTypeId: string;
  leaveTypeName: string;
  remainingDays: number;
}

interface LeaveDataTableProps {
  data: LeaveRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  employeeId: string | null;
  balances: BalanceItem[];
  canApprove: boolean;
}

export function LeaveDataTable({
  data,
  total,
  page,
  pageSize,
  totalPages,
  employeeId,
  balances,
  canApprove,
}: LeaveDataTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRow | null>(null);

  function handleAction(leave: LeaveRow) {
    setSelectedLeave(leave);
    setActionDialogOpen(true);
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.replace(`?${params.toString()}`);
  }

  const columns = getLeaveColumns({ onAction: handleAction });

  return (
    <div className="space-y-4">
      <Suspense>
        <LeaveTableToolbar
          onApplyLeave={() => setApplyDialogOpen(true)}
          showApplyButton={!!employeeId}
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

      {employeeId && (
        <ApplyLeaveDialog
          open={applyDialogOpen}
          onOpenChange={setApplyDialogOpen}
          employeeId={employeeId}
          balances={balances}
        />
      )}

      <LeaveActionDialog
        open={actionDialogOpen}
        onOpenChange={setActionDialogOpen}
        leave={
          selectedLeave
            ? {
                id: selectedLeave.id,
                firstName: selectedLeave.firstName,
                lastName: selectedLeave.lastName,
                leaveTypeName: selectedLeave.leaveTypeName,
                startDate: selectedLeave.startDate,
                endDate: selectedLeave.endDate,
                daysCount: selectedLeave.daysCount,
                reason: selectedLeave.reason,
                status: selectedLeave.status,
              }
            : null
        }
        canApprove={canApprove}
      />
    </div>
  );
}
