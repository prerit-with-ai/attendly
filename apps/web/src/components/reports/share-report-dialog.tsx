"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Copy, Trash2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createReportShare, getReportShares, deleteReportShare } from "@/actions/report";
import { REPORT_TYPE_LABELS } from "@attndly/shared";
import type { ReportType } from "@attndly/shared";

interface ShareReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportType: string;
  filters: Record<string, string>;
}

export function ShareReportDialog({
  open,
  onOpenChange,
  reportType,
  filters,
}: ShareReportDialogProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [expiration, setExpiration] = useState("never");
  const [generatedLink, setGeneratedLink] = useState("");
  const [shares, setShares] = useState<
    { id: string; token: string; title: string | null; reportType: string; createdAt: Date }[]
  >([]);
  const [loadedShares, setLoadedShares] = useState(false);

  async function loadShares() {
    if (loadedShares) return;
    const result = await getReportShares();
    setShares(result);
    setLoadedShares(true);
  }

  async function handleCreate() {
    setLoading(true);

    let expiresAt: string | undefined;
    if (expiration !== "never") {
      const d = new Date();
      d.setDate(d.getDate() + parseInt(expiration));
      expiresAt = d.toISOString();
    }

    const result = await createReportShare({
      reportType,
      filters,
      title: title || undefined,
      expiresAt,
    });

    setLoading(false);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    const link = `${window.location.origin}/embed/${result.token}`;
    setGeneratedLink(link);
    toast.success("Share link created");
    setLoadedShares(false); // refresh list next time
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }

  async function handleDelete(id: string) {
    await deleteReportShare(id);
    setShares(shares.filter((s) => s.id !== id));
    toast.success("Share link deleted");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (v) loadShares();
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Report</DialogTitle>
          <DialogDescription>
            Create a shareable link for the{" "}
            {REPORT_TYPE_LABELS[reportType as ReportType] || reportType} report.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Title (optional)</label>
            <Input
              placeholder="e.g. Q1 Attendance Report"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">Expiration</label>
            <Select value={expiration} onValueChange={setExpiration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleCreate} disabled={loading}>
            {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
            Create Share Link
          </Button>

          {generatedLink && (
            <div className="space-y-2 rounded-lg border p-3">
              <p className="text-sm font-medium">Share Link</p>
              <div className="flex gap-2">
                <Input readOnly value={generatedLink} className="text-xs" />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(generatedLink)}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
              <p className="text-sm font-medium">Embed Code</p>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`<iframe src="${generatedLink}" width="100%" height="600" frameborder="0"></iframe>`}
                  className="text-xs"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    copyToClipboard(
                      `<iframe src="${generatedLink}" width="100%" height="600" frameborder="0"></iframe>`
                    )
                  }
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {shares.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Active Shares</p>
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between rounded border p-2 text-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Link2 className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">
                      {share.title ||
                        REPORT_TYPE_LABELS[share.reportType as ReportType] ||
                        share.reportType}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7"
                      onClick={() =>
                        copyToClipboard(`${window.location.origin}/embed/${share.token}`)
                      }
                    >
                      <Copy className="size-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 text-destructive"
                      onClick={() => handleDelete(share.id)}
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
