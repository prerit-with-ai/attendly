import { Suspense } from "react";
import { getAttendanceOverview, getReportFilterOptions } from "@/actions/report";
import { ReportsClient } from "@/components/reports/reports-client";
import { ReportLoading } from "@/components/reports/report-loading";

export const metadata = {
  title: "Reports - Attndly",
};

export default async function ReportsPage() {
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const defaultDateFrom = thirtyDaysAgo.toISOString().split("T")[0];
  const defaultDateTo = now.toISOString().split("T")[0];

  const [overviewResult, filterOptions] = await Promise.all([
    getAttendanceOverview({ dateFrom: defaultDateFrom, dateTo: defaultDateTo }),
    getReportFilterOptions(),
  ]);

  const initialOverview = "error" in overviewResult ? null : overviewResult;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Interactive reports with charts, CSV export, and shareable links.
        </p>
      </div>

      <Suspense fallback={<ReportLoading />}>
        <ReportsClient
          initialOverview={initialOverview}
          departments={filterOptions.departments}
          locations={filterOptions.locations}
          employees={filterOptions.employees}
          defaultDateFrom={defaultDateFrom}
          defaultDateTo={defaultDateTo}
        />
      </Suspense>
    </div>
  );
}
