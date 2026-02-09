"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarDays } from "lucide-react";

interface LeaveBalanceItem {
  id: string;
  leaveTypeName: string;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

interface LeaveBalanceCardsProps {
  balances: LeaveBalanceItem[];
}

export function LeaveBalanceCards({ balances }: LeaveBalanceCardsProps) {
  if (balances.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {balances.map((b) => {
        const usedPercent = b.totalDays > 0 ? Math.round((b.usedDays / b.totalDays) * 100) : 0;
        return (
          <Card key={b.id}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{b.leaveTypeName}</CardTitle>
              <CalendarDays className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-2xl font-bold">{b.remainingDays}</div>
              <p className="text-xs text-muted-foreground">
                {b.usedDays} used of {b.totalDays} total
              </p>
              <Progress value={usedPercent} className="h-2" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
