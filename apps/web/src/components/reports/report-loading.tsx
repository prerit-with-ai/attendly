import { Card, CardContent, CardHeader } from "@/components/ui/card";

function SkeletonPulse({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-muted ${className ?? ""}`} />;
}

export function ReportLoading() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <SkeletonPulse className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <SkeletonPulse className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <SkeletonPulse className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <SkeletonPulse className="h-[300px] w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <SkeletonPulse className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <SkeletonPulse className="mx-auto h-[300px] w-[200px] rounded-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
