"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Share2, Download, Printer } from "lucide-react";

interface ReportToolbarProps {
  dateFrom: string;
  dateTo: string;
  departmentId: string;
  locationId: string;
  employeeId: string;
  departments: { id: string; name: string }[];
  locations: { id: string; name: string }[];
  employees: { id: string; name: string; code: string }[];
  showEmployeeFilter: boolean;
  onFilterChange: (key: string, value: string) => void;
  onShare: () => void;
  onExportCsv: () => void;
  onPrint: () => void;
}

export function ReportToolbar({
  dateFrom,
  dateTo,
  departmentId,
  locationId,
  employeeId,
  departments,
  locations,
  employees,
  showEmployeeFilter,
  onFilterChange,
  onShare,
  onExportCsv,
  onPrint,
}: ReportToolbarProps) {
  const setPreset = useCallback(
    (days: number) => {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - days);
      onFilterChange("dateFrom", from.toISOString().split("T")[0]);
      onFilterChange("dateTo", to.toISOString().split("T")[0]);
    },
    [onFilterChange]
  );

  const setThisMonth = useCallback(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    onFilterChange("dateFrom", from.toISOString().split("T")[0]);
    onFilterChange("dateTo", now.toISOString().split("T")[0]);
  }, [onFilterChange]);

  const setLastMonth = useCallback(() => {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const to = new Date(now.getFullYear(), now.getMonth(), 0);
    onFilterChange("dateFrom", from.toISOString().split("T")[0]);
    onFilterChange("dateTo", to.toISOString().split("T")[0]);
  }, [onFilterChange]);

  return (
    <div className="flex flex-col gap-3 print:hidden">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setPreset(0)}>
          Today
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPreset(7)}>
          Last 7 days
        </Button>
        <Button variant="outline" size="sm" onClick={() => setPreset(30)}>
          Last 30 days
        </Button>
        <Button variant="outline" size="sm" onClick={setThisMonth}>
          This month
        </Button>
        <Button variant="outline" size="sm" onClick={setLastMonth}>
          Last month
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted-foreground">From</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => onFilterChange("dateFrom", e.target.value)}
            className="w-[160px]"
          />
        </div>
        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted-foreground">To</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => onFilterChange("dateTo", e.target.value)}
            className="w-[160px]"
          />
        </div>

        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted-foreground">Department</label>
          <Select
            value={departmentId || "all"}
            onValueChange={(v) => onFilterChange("departmentId", v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-1">
          <label className="text-xs font-medium text-muted-foreground">Location</label>
          <Select
            value={locationId || "all"}
            onValueChange={(v) => onFilterChange("locationId", v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showEmployeeFilter && (
          <div className="grid gap-1">
            <label className="text-xs font-medium text-muted-foreground">Employee</label>
            <Select
              value={employeeId || "none"}
              onValueChange={(v) => onFilterChange("employeeId", v === "none" ? "" : v)}
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select Employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select Employee</SelectItem>
                {employees.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name} ({e.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share2 className="mr-1 size-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" onClick={onExportCsv}>
            <Download className="mr-1 size-4" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={onPrint}>
            <Printer className="mr-1 size-4" />
            Print
          </Button>
        </div>
      </div>
    </div>
  );
}
