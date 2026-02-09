"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  attendanceRate: {
    label: "Attendance %",
    color: "var(--chart-1)",
  },
  avgLateMinutes: {
    label: "Avg Late (min)",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

interface DepartmentBarChartProps {
  data: { department: string; attendanceRate: number; avgLateMinutes: number }[];
}

export function DepartmentBarChart({ data }: DepartmentBarChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} />
        <YAxis
          dataKey="department"
          type="category"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={120}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="attendanceRate" fill="var(--color-attendanceRate)" radius={[0, 4, 4, 0]} />
        <Bar dataKey="avgLateMinutes" fill="var(--color-avgLateMinutes)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
