"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DepartmentBarChart } from "../charts/department-bar-chart";

export interface DepartmentAnalyticsData {
  departments: {
    name: string;
    employeeCount: number;
    attendanceRate: number;
    avgLateMinutes: number;
    leaveRate: number;
  }[];
  overallAttendanceRate: number;
}

interface DepartmentAnalyticsWidgetProps {
  data: DepartmentAnalyticsData;
}

export function DepartmentAnalyticsWidget({ data }: DepartmentAnalyticsWidgetProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Department Comparison</CardTitle>
          <span className="text-sm text-muted-foreground">
            Overall Attendance: {data.overallAttendanceRate}%
          </span>
        </CardHeader>
        <CardContent>
          <DepartmentBarChart
            data={data.departments.map((d) => ({
              department: d.name,
              attendanceRate: d.attendanceRate,
              avgLateMinutes: d.avgLateMinutes,
            }))}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Department Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium">Department</th>
                  <th className="pb-2 text-right font-medium">Employees</th>
                  <th className="pb-2 text-right font-medium">Attendance %</th>
                  <th className="pb-2 text-right font-medium">Avg Late (min)</th>
                  <th className="pb-2 text-right font-medium">Leave Rate %</th>
                </tr>
              </thead>
              <tbody>
                {data.departments.map((dept) => (
                  <tr key={dept.name} className="border-b last:border-0">
                    <td className="py-2">{dept.name}</td>
                    <td className="py-2 text-right">{dept.employeeCount}</td>
                    <td className="py-2 text-right">{dept.attendanceRate}%</td>
                    <td className="py-2 text-right">{dept.avgLateMinutes}</td>
                    <td className="py-2 text-right">{dept.leaveRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
