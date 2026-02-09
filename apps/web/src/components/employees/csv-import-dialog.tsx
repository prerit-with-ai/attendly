"use client";

import { useState, useCallback } from "react";
import Papa from "papaparse";
import { Loader2, Upload, FileText } from "lucide-react";
import { toast } from "sonner";

import { importEmployees } from "@/actions/employee-import";
import { csvRowSchema, type ImportRow } from "@/lib/validators/employee-import";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CsvPreviewTable } from "./csv-preview-table";

interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locations: { id: string; name: string }[];
  departments: { id: string; name: string }[];
}

export function CsvImportDialog({ open, onOpenChange }: CsvImportDialogProps) {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const validCount = rows.filter((r) => r._valid).length;
  const invalidCount = rows.filter((r) => !r._valid).length;

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const parsed: ImportRow[] = results.data.map((raw: unknown, i: number) => {
          const result = csvRowSchema.safeParse(raw);
          if (result.success) {
            return {
              ...result.data,
              _rowNumber: i + 1,
              _valid: true,
              _errors: [],
            };
          }
          const rawObj = raw as Record<string, string>;
          return {
            first_name: rawObj.first_name ?? "",
            last_name: rawObj.last_name ?? "",
            employee_code: rawObj.employee_code ?? "",
            email: rawObj.email,
            phone: rawObj.phone,
            position: rawObj.position,
            department: rawObj.department,
            location: rawObj.location ?? "",
            joined_date: rawObj.joined_date,
            _rowNumber: i + 1,
            _valid: false,
            _errors: result.error.issues.map((iss) => iss.message),
          };
        });
        setRows(parsed);
      },
    });
  }, []);

  async function handleImport() {
    const validRows = rows.filter((r) => r._valid);
    if (validRows.length === 0) {
      toast.error("No valid rows to import");
      return;
    }

    setLoading(true);
    const result = await importEmployees(
      validRows.map(({ _rowNumber, _valid, _errors, ...row }) => row)
    );
    setLoading(false);

    if (result.imported > 0) {
      toast.success(`Imported ${result.imported} employees`);
    }
    if (result.skipped > 0) {
      toast.error(`Skipped ${result.skipped} rows`);
    }

    onOpenChange(false);
    setRows([]);
    setFileName(null);
  }

  function handleClose(open: boolean) {
    if (!open) {
      setRows([]);
      setFileName(null);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Employees from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with columns: first_name, last_name, employee_code, email, phone,
            position, department, location, joined_date
          </DialogDescription>
        </DialogHeader>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8">
            <Upload className="size-10 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">Choose a CSV file</p>
              <p className="text-xs text-muted-foreground">Max 1000 rows per import</p>
            </div>
            <label>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
              <Button variant="outline" asChild>
                <span>Select File</span>
              </Button>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="size-4" />
              <span className="font-medium">{fileName}</span>
              <span className="text-muted-foreground">
                — {rows.length} rows ({validCount} valid, {invalidCount} invalid)
              </span>
            </div>

            <CsvPreviewTable rows={rows} />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={loading || validCount === 0}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                Import {validCount} Employees
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
