"use client";

import { useState } from "react";
import { Building2, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteDepartment } from "@/actions/department";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DepartmentDialog } from "./department-dialog";

type Department = {
  id: string;
  name: string;
  companyId: string;
  managerId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

interface DepartmentListProps {
  departments: Department[];
}

export function DepartmentList({ departments }: DepartmentListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDepartment, setEditDepartment] = useState<Department | undefined>();

  function handleEdit(dept: Department) {
    setEditDepartment(dept);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditDepartment(undefined);
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    const result = await deleteDepartment(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Department deleted");
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">Manage your organization&apos;s departments</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="size-4" />
          Add Department
        </Button>
      </div>

      {departments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="size-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No departments yet</h3>
            <p className="text-sm text-muted-foreground">
              Create your first department to organize your employees.
            </p>
            <Button className="mt-4" onClick={handleAdd}>
              <Plus className="size-4" />
              Add Department
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <Card key={dept.id}>
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="size-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{dept.name}</CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(dept)}>
                      <Pencil className="mr-2 size-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(dept.id)}
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Created {new Date(dept.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DepartmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        department={editDepartment}
      />
    </>
  );
}
