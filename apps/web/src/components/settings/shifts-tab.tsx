"use client";

import { useState } from "react";
import { Clock, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteShift } from "@/actions/shift";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShiftDialog } from "./shift-dialog";

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  gracePeriodMinutes: number;
  isDefault: boolean;
}

interface ShiftsTabProps {
  shifts: Shift[];
}

export function ShiftsTab({ shifts }: ShiftsTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | undefined>();

  function handleEdit(s: Shift) {
    setEditingShift(s);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditingShift(undefined);
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    const result = await deleteShift(id);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Shift deleted");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Shifts</h3>
          <p className="text-sm text-muted-foreground">
            Define work shifts with start/end times and grace periods.
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 size-4" />
          Add Shift
        </Button>
      </div>

      {shifts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Clock className="mb-4 size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No shifts defined yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shifts.map((s) => (
            <Card key={s.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">{s.name}</CardTitle>
                {s.isDefault && <Badge variant="secondary">Default</Badge>}
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="size-4 text-muted-foreground" />
                  <span>
                    {s.startTime} – {s.endTime}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Grace period: {s.gracePeriodMinutes} min
                </p>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(s)}>
                    <Pencil className="mr-1 size-3" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(s.id)}>
                    <Trash2 className="mr-1 size-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ShiftDialog open={dialogOpen} onOpenChange={setDialogOpen} shift={editingShift} />
    </div>
  );
}
