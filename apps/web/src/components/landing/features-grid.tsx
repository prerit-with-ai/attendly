import { Camera, ScanFace, LayoutDashboard, CalendarDays, BarChart3, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Camera,
    title: "No New Hardware",
    description:
      "Works with your existing CCTV cameras. Just connect your RTSP streams and start tracking.",
  },
  {
    icon: ScanFace,
    title: "Real-time Detection",
    description:
      "AI-powered facial recognition identifies employees as they walk in. Instant check-in, no queues.",
  },
  {
    icon: LayoutDashboard,
    title: "Smart Dashboard",
    description:
      "Live attendance data with real-time updates. See who's in, who's late, and who's absent at a glance.",
  },
  {
    icon: CalendarDays,
    title: "Leave Management",
    description:
      "Integrated leave requests and approvals. Employees apply, managers approve — all in one place.",
  },
  {
    icon: BarChart3,
    title: "Reports & Analytics",
    description:
      "Generate attendance reports, trend analysis, and compliance reports with a single click.",
  },
  {
    icon: MapPin,
    title: "Multi-Location",
    description:
      "Manage multiple offices and branches from one dashboard. Centralized control, distributed tracking.",
  },
];

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need for modern attendance
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            A complete solution that replaces biometric scanners, manual registers, and scattered
            spreadsheets.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border bg-card transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="size-5 text-primary" />
                </div>
                <CardTitle className="mt-4 text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
