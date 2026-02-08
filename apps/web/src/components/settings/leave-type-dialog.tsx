"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createLeaveTypeSchema, type CreateLeaveTypeValues } from "@/lib/validators/leave-type";
import { createLeaveType, updateLeaveType } from "@/actions/leave-type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface LeaveTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveType?: {
    id: string;
    name: string;
    daysPerYear: number;
    isActive: boolean;
  };
}

export function LeaveTypeDialog({ open, onOpenChange, leaveType: editType }: LeaveTypeDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!editType;

  const form = useForm<CreateLeaveTypeValues>({
    resolver: zodResolver(createLeaveTypeSchema),
    defaultValues: {
      name: editType?.name ?? "",
      daysPerYear: editType?.daysPerYear ?? 12,
      isActive: editType?.isActive ?? true,
    },
  });

  async function onSubmit(values: CreateLeaveTypeValues) {
    setLoading(true);

    const result = isEditing
      ? await updateLeaveType({ ...values, id: editType.id })
      : await createLeaveType(values);

    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success(isEditing ? "Leave type updated" : "Leave type created");
    onOpenChange(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Leave Type" : "Add Leave Type"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the leave type details."
              : "Define a new leave type with annual quota."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Casual Leave" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="daysPerYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Days Per Year</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal">Active</FormLabel>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                {isEditing ? "Update" : "Create Leave Type"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
