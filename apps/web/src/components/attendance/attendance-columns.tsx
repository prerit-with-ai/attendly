"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Camera, Monitor, Pencil } from "lucide-react";

export type AttendanceRow = {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
  departmentId: string | null;
  departmentName: string | null;
  locationName: string;
  type: string;
  source: string;
  confidence: number | null;
  isLate: boolean;
  lateMinutes: number | null;
  isEarlyDeparture: boolean;
  earlyDepartureMinutes: number | null;
  overtimeMinutes: number | null;
  capturedAt: Date;
};

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const sourceIcons: Record<string, React.ReactNode> = {
  kiosk: <Monitor className="size-3" />,
  rtsp: <Camera className="size-3" />,
  manual: <Pencil className="size-3" />,
};

export const attendanceColumns: ColumnDef<AttendanceRow>[] = [
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
    accessorKey: "locationName",
    header: "Location",
  },
  {
    accessorKey: "departmentName",
    header: "Department",
    cell: ({ row }) => row.getValue("departmentName") || "—",
  },
  {
    accessorKey: "capturedAt",
    header: "Time",
    cell: ({ row }) => formatDateTime(row.original.capturedAt),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant={row.original.type === "check_in" ? "default" : "secondary"}>
        {row.original.type === "check_in" ? "Check In" : "Check Out"}
      </Badge>
    ),
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => (
      <Badge variant="outline" className="gap-1">
        {sourceIcons[row.original.source]}
        {row.original.source}
      </Badge>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const badges = [];
      if (row.original.isLate) {
        badges.push(
          <Badge key="late" variant="destructive" className="text-xs">
            Late {row.original.lateMinutes ? `(${row.original.lateMinutes}m)` : ""}
          </Badge>
        );
      }
      if (row.original.isEarlyDeparture) {
        badges.push(
          <Badge key="early" className="bg-orange-500 text-xs text-white hover:bg-orange-600">
            Early{" "}
            {row.original.earlyDepartureMinutes ? `(${row.original.earlyDepartureMinutes}m)` : ""}
          </Badge>
        );
      }
      if (row.original.overtimeMinutes && row.original.overtimeMinutes > 0) {
        badges.push(
          <Badge key="ot" className="bg-green-600 text-xs text-white hover:bg-green-700">
            OT {row.original.overtimeMinutes}m
          </Badge>
        );
      }
      return badges.length > 0 ? <div className="flex gap-1">{badges}</div> : "—";
    },
  },
  {
    accessorKey: "confidence",
    header: "Confidence",
    cell: ({ row }) => {
      const confidence = row.original.confidence;
      if (confidence === null) return "—";
      return `${Math.round(confidence * 100)}%`;
    },
  },
];
