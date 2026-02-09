"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PunctualityBarChart } from "../charts/punctuality-bar-chart";
import { MonthlyTrendChart } from "../charts/monthly-trend-chart";
import { AlarmClock, LogOut, Timer } from "lucide-react";

export interface PunctualityReportData {
  topLateEmployees: { name: string; lateCount: number; avgLateMinutes: number }[];
  weeklyTrend: {
    week: string;
    lateCount: number;
    earlyDepartureCount: number;
    overtimeHours: number;
  }[];
  summary: {
    totalLateArrivals: number;
    totalEarlyDepartures: number;
    totalOvertimeHours: number;
  };
}

interface PunctualityWidgetProps {
  data: PunctualityReportData;
}

export function PunctualityWidget({ data }: PunctualityWidgetProps) {
  const stats = [
    {
      title: "Late Arrivals",
      value: data.summary.totalLateArrivals.toLocaleString(),
      icon: AlarmClock,
    },
    {
      title: "Early Departures",
      value: data.summary.totalEarlyDepartures.toLocaleString(),
      icon: LogOut,
    },
    {
      title: "Overtime Hours",
      value: data.summary.totalOvertimeHours.toLocaleString(),
      icon: Timer,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Late Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <PunctualityBarChart
              data={data.topLateEmployees.map((e) => ({
                name: e.name,
                lateCount: e.lateCount,
                earlyCount: 0,
                overtimeHours: 0,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Late Arrivals</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyTrendChart
              data={data.weeklyTrend.map((w) => ({
                month: w.week,
                value: w.lateCount,
              }))}
              label="Late Arrivals"
              color="var(--chart-3)"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
