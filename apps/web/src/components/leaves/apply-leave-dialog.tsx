"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { applyLeaveSchema, type ApplyLeaveValues } from "@/lib/validators/leave";
import { applyLeave } from "@/actions/leave";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BalanceItem {
  leaveTypeId: string;
  leaveTypeName: string;
  remainingDays: number;
}

interface ApplyLeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  balances: BalanceItem[];
}

export function ApplyLeaveDialog({
  open,
  onOpenChange,
  employeeId,
  balances,
}: ApplyLeaveDialogProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<ApplyLeaveValues>({
    resolver: zodResolver(applyLeaveSchema),
    defaultValues: {
      employeeId,
      leaveTypeId: "",
      startDate: "",
      endDate: "",
      reason: "",
    },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        employeeId,
        leaveTypeId: "",
        startDate: "",
        endDate: "",
        reason: "",
      });
    }
  }, [open, employeeId, form]);

  const selectedTypeId = form.watch("leaveTypeId");
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");

  const selectedBalance = balances.find((b) => b.leaveTypeId === selectedTypeId);

  let daysCount = 0;
  if (startDate && endDate) {
    const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
    daysCount = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
    if (daysCount < 1) daysCount = 0;
  }

  async function onSubmit(values: ApplyLeaveValues) {
    setLoading(true);
    const result = await applyLeave(values);
    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Leave applied successfully");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply for Leave</DialogTitle>
          <DialogDescription>Submit a leave request for approval.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="leaveTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {balances.map((b) => (
                        <SelectItem key={b.leaveTypeId} value={b.leaveTypeId}>
                          {b.leaveTypeName} ({b.remainingDays} days remaining)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedBalance && (
              <p className="text-sm text-muted-foreground">
                Remaining balance: <strong>{selectedBalance.remainingDays} days</strong>
              </p>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {daysCount > 0 && (
              <p className="text-sm text-muted-foreground">
                Duration: <strong>{daysCount} day(s)</strong>
              </p>
            )}

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Reason <span className="text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Reason for leave..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                Apply
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
