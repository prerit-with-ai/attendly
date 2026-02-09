"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export type LeaveRow = {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string | null;
  status: string;
  rejectionReason: string | null;
  createdAt: Date;
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  approved: "default",
  rejected: "destructive",
  cancelled: "secondary",
};

export function getLeaveColumns({
  onAction,
}: {
  onAction: (leave: LeaveRow) => void;
}): ColumnDef<LeaveRow>[] {
  return [
    {
      id: "employee",
      header: "Employee",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </p>
          <p className="font-mono text-xs text-muted-foreground">{row.original.employeeCode}</p>
        </div>
      ),
    },
    {
      accessorKey: "leaveTypeName",
      header: "Leave Type",
    },
    {
      id: "dates",
      header: "Dates",
      cell: ({ row }) => (
        <div className="text-sm">
          <p>{row.original.startDate}</p>
          <p className="text-muted-foreground">to {row.original.endDate}</p>
        </div>
      ),
    },
    {
      accessorKey: "daysCount",
      header: "Days",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={statusVariant[row.original.status] ?? "outline"}>
          {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const leave = row.original;
        if (leave.status === "pending" || leave.status === "approved") {
          return (
            <button
              onClick={() => onAction(leave)}
              className="text-sm font-medium text-primary hover:underline"
            >
              Actions
            </button>
          );
        }
        return null;
      },
    },
  ];
}
