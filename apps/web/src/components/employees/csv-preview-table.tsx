"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ImportRow } from "@/lib/validators/employee-import";

interface CsvPreviewTableProps {
  rows: ImportRow[];
}

export function CsvPreviewTable({ rows }: CsvPreviewTableProps) {
  return (
    <ScrollArea className="h-64">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row._rowNumber} className={row._valid ? "" : "bg-destructive/5"}>
              <TableCell className="text-xs text-muted-foreground">{row._rowNumber}</TableCell>
              <TableCell>
                {row.first_name} {row.last_name}
              </TableCell>
              <TableCell className="font-mono text-xs">{row.employee_code}</TableCell>
              <TableCell>{row.location}</TableCell>
              <TableCell>{row.department || "—"}</TableCell>
              <TableCell>
                {row._valid ? (
                  <Badge variant="default">Valid</Badge>
                ) : (
                  <Badge variant="destructive">{row._errors[0]}</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
