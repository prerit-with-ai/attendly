import { getReportShares } from "@/actions/report";
import { ManageSharesClient } from "@/components/reports/manage-shares-client";

export const metadata = {
  title: "Manage Shares - Attndly",
};

export default async function ManageSharesPage() {
  const shares = await getReportShares();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Report Shares</h1>
        <p className="text-muted-foreground">View and manage all shared report links.</p>
      </div>

      <ManageSharesClient initialShares={shares} />
    </div>
  );
}
