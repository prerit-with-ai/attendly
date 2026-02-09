import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Users, UserCheck, TrendingUp, ScanFace, List } from "lucide-react";
import { getTodayAttendanceStats } from "@/actions/attendance";
import { RecentActivityFeed } from "@/components/attendance/recent-activity-feed";

export const metadata = {
  title: "Attendance - Attndly",
};

export default async function AttendancePage() {
  const stats = await getTodayAttendanceStats();

  const statCards = [
    {
      title: "Total Check-ins",
      value: stats.totalCheckIns,
      icon: Clock,
      description: "Today",
    },
    {
      title: "Unique Employees",
      value: stats.uniqueEmployees,
      icon: Users,
      description: "Checked in today",
    },
    {
      title: "Total Enrolled",
      value: stats.totalEnrolled,
      icon: UserCheck,
      description: "Faces enrolled",
    },
    {
      title: "Present %",
      value: `${stats.presentPercentage}%`,
      icon: TrendingUp,
      description: "Of enrolled employees",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">
            Monitor real-time attendance across your organization
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/attendance/log">
              <List className="mr-2 size-4" />
              Full Log
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/attendance/kiosk">
              <ScanFace className="mr-2 size-4" />
              Kiosk Mode
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivityFeed />
        </CardContent>
      </Card>
    </div>
  );
}
