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
  lateCount: {
    label: "Late Arrivals",
    color: "var(--chart-3)",
  },
  earlyCount: {
    label: "Early Departures",
    color: "var(--chart-4)",
  },
  overtimeHours: {
    label: "Overtime (hrs)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface PunctualityBarChartProps {
  data: { name: string; lateCount: number; earlyCount: number; overtimeHours: number }[];
}

export function PunctualityBarChart({ data }: PunctualityBarChartProps) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => (value.length > 10 ? `${value.slice(0, 10)}...` : value)}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="lateCount" fill="var(--color-lateCount)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="earlyCount" fill="var(--color-earlyCount)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="overtimeHours" fill="var(--color-overtimeHours)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
