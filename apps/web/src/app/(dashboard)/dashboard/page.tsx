import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MapPin, Building2, UserCheck, ScanFace, Camera } from "lucide-react";
import { getDashboardStats } from "@/actions/dashboard";

export const metadata = {
  title: "Dashboard - Attndly",
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const enrolledPercent =
    stats.employeeCount > 0
      ? Math.round((stats.enrolledEmployeeCount / stats.employeeCount) * 100)
      : 0;

  const cards = [
    {
      title: "Total Employees",
      value: stats.employeeCount,
      icon: Users,
      description: `${stats.activeEmployeeCount} active`,
    },
    {
      title: "Faces Enrolled",
      value: stats.enrolledEmployeeCount,
      icon: ScanFace,
      description: `${enrolledPercent}% of employees`,
    },
    {
      title: "Cameras",
      value: stats.cameraCount,
      icon: Camera,
      description: "CCTV cameras configured",
    },
    {
      title: "Locations",
      value: stats.locationCount,
      icon: MapPin,
      description: "Office locations",
    },
    {
      title: "Departments",
      value: stats.departmentCount,
      icon: Building2,
      description: "Departments",
    },
    {
      title: "Active Employees",
      value: stats.activeEmployeeCount,
      icon: UserCheck,
      description: "Currently active",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to Attndly. Here&apos;s an overview of your workspace.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((stat) => (
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
            Add employees, set up departments and locations, then configure cameras to start
            tracking attendance with AI.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
