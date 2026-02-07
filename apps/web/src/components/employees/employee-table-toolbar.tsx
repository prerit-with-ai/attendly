"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Plus, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EmployeeTableToolbarProps {
  locations: { id: string; name: string }[];
  departments: { id: string; name: string }[];
  onAddEmployee: () => void;
  onImportCsv: () => void;
}

export function EmployeeTableToolbar({
  locations,
  departments,
  onAddEmployee,
  onImportCsv,
}: EmployeeTableToolbarProps) {
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
      params.delete("page"); // reset to page 1 on filter change
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
            placeholder="Search employees..."
            className="w-full pl-8 sm:w-64"
            defaultValue={searchParams.get("search") ?? ""}
            onChange={(e) => {
              // Debounce search
              const value = e.target.value;
              const timeout = setTimeout(() => updateParam("search", value), 300);
              return () => clearTimeout(timeout);
            }}
          />
        </div>

        <Select
          defaultValue={searchParams.get("locationId") ?? "all"}
          onValueChange={(v) => updateParam("locationId", v)}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          defaultValue={searchParams.get("departmentId") ?? "all"}
          onValueChange={(v) => updateParam("departmentId", v)}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          defaultValue={searchParams.get("isActive") ?? "all"}
          onValueChange={(v) => updateParam("isActive", v)}
        >
          <SelectTrigger className="w-full sm:w-32">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onImportCsv}>
          <Upload className="size-4" />
          Import CSV
        </Button>
        <Button onClick={onAddEmployee}>
          <Plus className="size-4" />
          Add Employee
        </Button>
      </div>
    </div>
  );
}
