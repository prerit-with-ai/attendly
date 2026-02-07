"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, UserX } from "lucide-react";

export type EmployeeRow = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  isActive: boolean;
  faceEnrolled: boolean;
  locationId: string;
  departmentId: string | null;
  locationName: string | null;
  departmentName: string | null;
  joinedDate: string | null;
  createdAt: Date;
};

interface ColumnActions {
  onEdit: (employee: EmployeeRow) => void;
  onDeactivate: (id: string) => void;
}

export function getEmployeeColumns(actions: ColumnActions): ColumnDef<EmployeeRow>[] {
  return [
    {
      accessorKey: "employeeCode",
      header: "Code",
      cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("employeeCode")}</span>,
    },
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <p className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </p>
          {row.original.email && (
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "position",
      header: "Position",
      cell: ({ row }) => row.getValue("position") || "—",
    },
    {
      accessorKey: "departmentName",
      header: "Department",
      cell: ({ row }) => row.getValue("departmentName") || "—",
    },
    {
      accessorKey: "locationName",
      header: "Location",
      cell: ({ row }) => row.getValue("locationName") || "—",
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.getValue("isActive") ? "default" : "secondary"}>
          {row.getValue("isActive") ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => actions.onEdit(row.original)}>
              <Pencil className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
            {row.original.isActive && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => actions.onDeactivate(row.original.id)}
              >
                <UserX className="mr-2 size-4" />
                Deactivate
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
