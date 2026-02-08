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
    accessorKey: "confidence",
    header: "Confidence",
    cell: ({ row }) => {
      const confidence = row.original.confidence;
      if (confidence === null) return "—";
      return `${Math.round(confidence * 100)}%`;
    },
  },
];
