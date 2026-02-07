import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, CalendarDays, Camera } from "lucide-react";

export const metadata = {
  title: "Dashboard - Attndly",
};

const stats = [
  {
    title: "Total Employees",
    value: "--",
    icon: Users,
    description: "Complete onboarding to see data",
  },
  {
    title: "Present Today",
    value: "--",
    icon: Clock,
    description: "No attendance data yet",
  },
  {
    title: "Pending Leaves",
    value: "--",
    icon: CalendarDays,
    description: "No leave requests",
  },
  {
    title: "Active Cameras",
    value: "--",
    icon: Camera,
    description: "Set up cameras to begin",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to Attndly. Here&apos;s an overview of your workspace.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
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
          <CardTitle>Get Started</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Complete your onboarding to start tracking attendance. Add employees, set up cameras,
            and enroll faces to begin.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
