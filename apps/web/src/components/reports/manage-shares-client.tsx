"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, Trash2, ExternalLink, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { deleteReportShare } from "@/actions/report";
import { REPORT_TYPE_LABELS } from "@attndly/shared";
import type { ReportType } from "@attndly/shared";
import Link from "next/link";

interface Share {
  id: string;
  token: string;
  title: string | null;
  reportType: string;
  expiresAt: Date | null;
  createdAt: Date;
}

interface ManageSharesClientProps {
  initialShares: Share[];
}

export function ManageSharesClient({ initialShares }: ManageSharesClientProps) {
  const [shares, setShares] = useState(initialShares);

  async function handleDelete(id: string) {
    await deleteReportShare(id);
    setShares(shares.filter((s) => s.id !== id));
    toast.success("Share link deleted");
  }

  function copyLink(token: string) {
    navigator.clipboard.writeText(`${window.location.origin}/embed/${token}`);
    toast.success("Link copied to clipboard");
  }

  if (shares.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <Link2 className="mb-4 size-12 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold">No Shared Reports</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Create shareable links from the Reports page using the Share button.
        </p>
        <Link href="/dashboard/reports">
          <Button variant="outline" className="mt-4">
            Go to Reports
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {shares.map((share) => {
        const isExpired = share.expiresAt && new Date() > new Date(share.expiresAt);

        return (
          <Card key={share.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base">
                  {share.title ||
                    REPORT_TYPE_LABELS[share.reportType as ReportType] ||
                    share.reportType}
                </CardTitle>
                <Badge variant="outline">
                  {REPORT_TYPE_LABELS[share.reportType as ReportType] || share.reportType}
                </Badge>
                {isExpired && <Badge variant="destructive">Expired</Badge>}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyLink(share.token)}
                  title="Copy link"
                >
                  <Copy className="size-4" />
                </Button>
                <a href={`/embed/${share.token}`} target="_blank" rel="noopener noreferrer">
                  <Button size="icon" variant="ghost" title="Open embed">
                    <ExternalLink className="size-4" />
                  </Button>
                </a>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => handleDelete(share.id)}
                  title="Delete share"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Created: {new Date(share.createdAt).toLocaleDateString()}</span>
                <span>
                  Expires:{" "}
                  {share.expiresAt ? new Date(share.expiresAt).toLocaleDateString() : "Never"}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
