import { Card, CardContent, CardHeader } from "@/components/ui/card";

function SkeletonPulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className ?? ""}`} />;
}

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <SkeletonPulse className="h-8 w-48" />
        <SkeletonPulse className="h-4 w-72" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <SkeletonPulse className="h-4 w-24" />
              <SkeletonPulse className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <SkeletonPulse className="mb-1 h-7 w-12" />
              <SkeletonPulse className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <SkeletonPulse className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <SkeletonPulse className="h-4 w-full max-w-lg" />
        </CardContent>
      </Card>
    </div>
  );
}
