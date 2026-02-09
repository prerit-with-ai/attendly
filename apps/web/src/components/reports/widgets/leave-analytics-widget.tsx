"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeaveDonutChart } from "../charts/leave-donut-chart";
import { MonthlyTrendChart } from "../charts/monthly-trend-chart";
import { FileText, CheckCircle2, XCircle, Clock } from "lucide-react";

export interface LeaveAnalyticsData {
  byType: { name: string; count: number; totalDays: number }[];
  monthlyTrend: { month: string; approved: number; rejected: number; pending: number }[];
  summary: {
    totalApplied: number;
    totalApproved: number;
    totalRejected: number;
    totalPending: number;
  };
}

interface LeaveAnalyticsWidgetProps {
  data: LeaveAnalyticsData;
}

export function LeaveAnalyticsWidget({ data }: LeaveAnalyticsWidgetProps) {
  const stats = [
    {
      title: "Total Applied",
      value: data.summary.totalApplied,
      icon: FileText,
    },
    {
      title: "Approved",
      value: data.summary.totalApproved,
      icon: CheckCircle2,
    },
    {
      title: "Rejected",
      value: data.summary.totalRejected,
      icon: XCircle,
    },
    {
      title: "Pending",
      value: data.summary.totalPending,
      icon: Clock,
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Leave by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <LeaveDonutChart
              data={data.byType.map((t) => ({
                name: t.name,
                value: t.totalDays,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend (Approved)</CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyTrendChart
              data={data.monthlyTrend.map((m) => ({
                month: m.month,
                value: m.approved,
              }))}
              label="Approved Leaves"
              color="var(--chart-1)"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
