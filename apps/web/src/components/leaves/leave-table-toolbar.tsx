"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LeaveTableToolbarProps {
  onApplyLeave: () => void;
  showApplyButton: boolean;
}

export function LeaveTableToolbar({ onApplyLeave, showApplyButton }: LeaveTableToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by employee..."
            className="w-full pl-8 sm:w-64"
            defaultValue={searchParams.get("search") ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              const timeout = setTimeout(() => updateParam("search", value), 300);
              return () => clearTimeout(timeout);
            }}
          />
        </div>

        <Select
          defaultValue={searchParams.get("status") ?? "all"}
          onValueChange={(v) => updateParam("status", v)}
        >
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showApplyButton && (
        <Button onClick={onApplyLeave}>
          <Plus className="mr-2 size-4" />
          Apply for Leave
        </Button>
      )}
    </div>
  );
}
