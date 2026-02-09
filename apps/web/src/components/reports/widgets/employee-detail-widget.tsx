"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyTrendChart } from "../charts/monthly-trend-chart";
import { Badge } from "@/components/ui/badge";
import { User, Briefcase, Calendar } from "lucide-react";

export interface EmployeeDetailData {
  employee: {
    name: string;
    code: string;
    department: string;
  };
  monthlySummary: {
    month: string;
    daysPresent: number;
    daysLate: number;
    daysOnLeave: number;
  }[];
  leaveBalance: {
    type: string;
    total: number;
    used: number;
    remaining: number;
  }[];
  recentLogs: {
    id: string;
    type: string;
    capturedAt: string;
    isLate: boolean;
    lateMinutes: number | null;
    isEarlyDeparture: boolean;
    overtimeMinutes: number | null;
  }[];
}

interface EmployeeDetailWidgetProps {
  data: EmployeeDetailData;
}

export function EmployeeDetailWidget({ data }: EmployeeDetailWidgetProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <User className="size-6 text-primary" />
            </div>
            <div>
              <CardTitle>{data.employee.name}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{data.employee.code}</span>
                <span>|</span>
                <Briefcase className="size-3" />
                <span>{data.employee.department}</span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyTrendChart
              data={data.monthlySummary.map((m) => ({
                month: m.month,
                value: m.daysPresent,
              }))}
              label="Days Present"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leave Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {data.leaveBalance.map((lb) => (
                <div
                  key={lb.type}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{lb.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {lb.used} used of {lb.total}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{lb.remaining}</p>
                    <p className="text-xs text-muted-foreground">remaining</p>
                  </div>
                </div>
              ))}
              {data.leaveBalance.length === 0 && (
                <p className="text-sm text-muted-foreground">No leave balance data</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left font-medium">Date & Time</th>
                  <th className="pb-2 text-left font-medium">Type</th>
                  <th className="pb-2 text-left font-medium">Status</th>
                  <th className="pb-2 text-right font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {data.recentLogs.map((log) => (
                  <tr key={log.id} className="border-b last:border-0">
                    <td className="py-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3 text-muted-foreground" />
                        {new Date(log.capturedAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-2">
                      <Badge variant={log.type === "check_in" ? "default" : "secondary"}>
                        {log.type === "check_in" ? "Check In" : "Check Out"}
                      </Badge>
                    </td>
                    <td className="py-2">
                      {log.isLate && (
                        <Badge variant="destructive">Late ({log.lateMinutes} min)</Badge>
                      )}
                      {log.isEarlyDeparture && <Badge variant="outline">Early Departure</Badge>}
                      {!log.isLate && !log.isEarlyDeparture && (
                        <Badge variant="outline" className="border-green-500 text-green-600">
                          On Time
                        </Badge>
                      )}
                    </td>
                    <td className="py-2 text-right text-muted-foreground">
                      {log.overtimeMinutes && log.overtimeMinutes > 0
                        ? `OT: ${Math.round(log.overtimeMinutes / 60)}h`
                        : "-"}
                    </td>
                  </tr>
                ))}
                {data.recentLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-muted-foreground">
                      No attendance logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
