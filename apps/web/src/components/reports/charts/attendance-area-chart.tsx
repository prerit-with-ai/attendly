"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  checkIns: {
    label: "Check-ins",
    color: "var(--chart-1)",
  },
  absent: {
    label: "Absent",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

interface AttendanceAreaChartProps {
  data: { date: string; checkIns: number; absent: number }[];
}

export function AttendanceAreaChart({ data }: AttendanceAreaChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="fillCheckIns" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-checkIns)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-checkIns)" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="fillAbsent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-absent)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-absent)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          }}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(value) => {
                return new Date(value).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                });
              }}
            />
          }
        />
        <Area
          dataKey="absent"
          type="monotone"
          fill="url(#fillAbsent)"
          stroke="var(--color-absent)"
          stackId="a"
        />
        <Area
          dataKey="checkIns"
          type="monotone"
          fill="url(#fillCheckIns)"
          stroke="var(--color-checkIns)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  );
}
