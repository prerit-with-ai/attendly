"use client";

import { useState } from "react";
import { Loader2, CheckCircle, XCircle, Ban } from "lucide-react";
import { toast } from "sonner";

import { approveLeave, rejectLeave, cancelLeave } from "@/actions/leave";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LeaveActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leave: {
    id: string;
    firstName: string;
    lastName: string;
    leaveTypeName: string;
    startDate: string;
    endDate: string;
    daysCount: number;
    reason: string | null;
    status: string;
  } | null;
  canApprove: boolean;
}

export function LeaveActionDialog({
  open,
  onOpenChange,
  leave: leaveRecord,
  canApprove,
}: LeaveActionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  if (!leaveRecord) return null;

  async function handleApprove() {
    setLoading(true);
    const result = await approveLeave({ leaveId: leaveRecord!.id });
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Leave approved");
      onOpenChange(false);
    }
  }

  async function handleReject() {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setLoading(true);
    const result = await rejectLeave({
      leaveId: leaveRecord!.id,
      rejectionReason,
    });
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Leave rejected");
      onOpenChange(false);
      setRejectionReason("");
    }
  }

  async function handleCancel() {
    setLoading(true);
    const result = await cancelLeave({ leaveId: leaveRecord!.id });
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Leave cancelled");
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave Request</DialogTitle>
          <DialogDescription>
            {leaveRecord.firstName} {leaveRecord.lastName} &mdash; {leaveRecord.leaveTypeName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-sm">
            <p>
              <strong>Dates:</strong> {leaveRecord.startDate} to {leaveRecord.endDate} (
              {leaveRecord.daysCount} days)
            </p>
            {leaveRecord.reason && (
              <p>
                <strong>Reason:</strong> {leaveRecord.reason}
              </p>
            )}
          </div>

          {canApprove && leaveRecord.status === "pending" && (
            <>
              <Textarea
                placeholder="Rejection reason (required if rejecting)"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handleApprove} disabled={loading} className="flex-1">
                  {loading ? (
                    <Loader2 className="mr-1 size-4 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-1 size-4" />
                  )}
                  Approve
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={loading}
                  variant="destructive"
                  className="flex-1"
                >
                  {loading ? (
                    <Loader2 className="mr-1 size-4 animate-spin" />
                  ) : (
                    <XCircle className="mr-1 size-4" />
                  )}
                  Reject
                </Button>
              </div>
            </>
          )}

          {(leaveRecord.status === "pending" || leaveRecord.status === "approved") && (
            <Button onClick={handleCancel} disabled={loading} variant="outline" className="w-full">
              {loading ? (
                <Loader2 className="mr-1 size-4 animate-spin" />
              ) : (
                <Ban className="mr-1 size-4" />
              )}
              Cancel Leave
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
