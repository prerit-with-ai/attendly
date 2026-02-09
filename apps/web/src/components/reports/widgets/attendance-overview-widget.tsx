"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceAreaChart } from "../charts/attendance-area-chart";
import { AttendancePieChart } from "../charts/attendance-pie-chart";
import { Users, UserCheck, UserX, CalendarDays } from "lucide-react";

export interface AttendanceOverviewData {
  dailyTrend: { date: string; checkIns: number; uniqueEmployees: number; absent: number }[];
  summary: {
    totalCheckIns: number;
    avgDailyPresent: number;
    avgDailyAbsent: number;
    onLeave: number;
    totalEmployees: number;
  };
  presentAbsentPie: { name: string; value: number }[];
}

interface AttendanceOverviewWidgetProps {
  data: AttendanceOverviewData;
}

export function AttendanceOverviewWidget({ data }: AttendanceOverviewWidgetProps) {
  const stats = [
    {
      title: "Total Check-ins",
      value: data.summary.totalCheckIns.toLocaleString(),
      icon: UserCheck,
    },
    {
      title: "Avg. Daily Present",
      value: data.summary.avgDailyPresent.toLocaleString(),
      icon: Users,
    },
    {
      title: "Avg. Daily Absent",
      value: data.summary.avgDailyAbsent.toLocaleString(),
      icon: UserX,
    },
    {
      title: "On Leave",
      value: data.summary.onLeave.toLocaleString(),
      icon: CalendarDays,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Daily Attendance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendanceAreaChart
              data={data.dailyTrend.map((d) => ({
                date: d.date,
                checkIns: d.uniqueEmployees,
                absent: d.absent,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Present vs Absent</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendancePieChart data={data.presentAbsentPie} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
