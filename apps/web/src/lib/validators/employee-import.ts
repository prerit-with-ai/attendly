import { z } from "zod/v4";

export const csvRowSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  employee_code: z.string().min(1, "Employee code is required"),
  email: z.string().optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  joined_date: z.string().optional(),
});

export type CsvRow = z.infer<typeof csvRowSchema>;

export interface ImportRow extends CsvRow {
  _rowNumber: number;
  _valid: boolean;
  _errors: string[];
}
