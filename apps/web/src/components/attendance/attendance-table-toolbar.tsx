"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AttendanceTableToolbarProps {
  locations: { id: string; name: string }[];
  departments: { id: string; name: string }[];
}

export function AttendanceTableToolbar({ locations, departments }: AttendanceTableToolbarProps) {
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
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Search employees..."
          className="w-full pl-8 sm:w-56"
          defaultValue={searchParams.get("search") ?? ""}
          onChange={(e) => {
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
        defaultValue={searchParams.get("type") ?? "all"}
        onValueChange={(v) => updateParam("type", v)}
      >
        <SelectTrigger className="w-full sm:w-32">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="check_in">Check In</SelectItem>
          <SelectItem value="check_out">Check Out</SelectItem>
        </SelectContent>
      </Select>

      <Select
        defaultValue={searchParams.get("source") ?? "all"}
        onValueChange={(v) => updateParam("source", v)}
      >
        <SelectTrigger className="w-full sm:w-32">
          <SelectValue placeholder="All Sources" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sources</SelectItem>
          <SelectItem value="kiosk">Kiosk</SelectItem>
          <SelectItem value="rtsp">RTSP</SelectItem>
          <SelectItem value="manual">Manual</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="date"
        className="w-full sm:w-36"
        defaultValue={searchParams.get("dateFrom") ?? ""}
        onChange={(e) => updateParam("dateFrom", e.target.value)}
        placeholder="From"
      />

      <Input
        type="date"
        className="w-full sm:w-36"
        defaultValue={searchParams.get("dateTo") ?? ""}
        onChange={(e) => updateParam("dateTo", e.target.value)}
        placeholder="To"
      />
    </div>
  );
}
