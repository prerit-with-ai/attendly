"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getRecentActivity } from "@/actions/attendance";
import { ATTENDANCE_POLL_INTERVAL_MS } from "@attndly/shared";

type ActivityItem = Awaited<ReturnType<typeof getRecentActivity>>[number];

function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function RecentActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchActivity() {
      try {
        const data = await getRecentActivity(20);
        if (mounted) {
          setItems(data);
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    }

    fetchActivity();
    const interval = setInterval(fetchActivity, ATTENDANCE_POLL_INTERVAL_MS);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        Loading activity...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
        No attendance activity yet today
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 pb-2">
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-green-500" />
        </span>
        <span className="text-xs text-muted-foreground">Live - updates every 5s</span>
      </div>
      <div className="max-h-[400px] space-y-2 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border px-3 py-2"
          >
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium">
                {item.firstName} {item.lastName}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{item.employeeCode}</span>
                <span>&middot;</span>
                <span>{item.locationName}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">
              <Badge
                variant={item.type === "check_in" ? "default" : "secondary"}
                className="text-xs"
              >
                {item.type === "check_in" ? "In" : "Out"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {item.source}
              </Badge>
              {item.confidence !== null && (
                <span className="text-xs text-muted-foreground">
                  {Math.round(item.confidence * 100)}%
                </span>
              )}
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatTime(item.capturedAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
