"use client";

import { useState } from "react";
import { CalendarDays, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteLeaveType } from "@/actions/leave-type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LeaveTypeDialog } from "./leave-type-dialog";

interface LeaveTypeItem {
  id: string;
  name: string;
  daysPerYear: number;
  isActive: boolean;
}

interface LeaveTypesTabProps {
  leaveTypes: LeaveTypeItem[];
}

export function LeaveTypesTab({ leaveTypes }: LeaveTypesTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<LeaveTypeItem | undefined>();

  function handleEdit(lt: LeaveTypeItem) {
    setEditingType(lt);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditingType(undefined);
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    const result = await deleteLeaveType(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Leave type deleted");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Leave Types</h3>
          <p className="text-sm text-muted-foreground">
            Configure leave types and annual quotas for your organization.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 size-4" />
          Add Leave Type
        </Button>
      </div>

      {leaveTypes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <CalendarDays className="mb-4 size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No leave types defined yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leaveTypes.map((lt) => (
            <Card key={lt.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">{lt.name}</CardTitle>
                <Badge variant={lt.isActive ? "default" : "secondary"}>
                  {lt.isActive ? "Active" : "Inactive"}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  <span>{lt.daysPerYear} days / year</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(lt)}>
                    <Pencil className="mr-1 size-3" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(lt.id)}>
                    <Trash2 className="mr-1 size-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <LeaveTypeDialog open={dialogOpen} onOpenChange={setDialogOpen} leaveType={editingType} />
    </div>
  );
}
