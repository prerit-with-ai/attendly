import { getLeaves, getLeaveBalance, getMyEmployee } from "@/actions/leave";
import { requireCompany } from "@/lib/auth-server";
import { LeaveBalanceCards } from "@/components/leaves/leave-balance-cards";
import { LeaveDataTable } from "@/components/leaves/leave-data-table";

export const metadata = {
  title: "Leaves - Attndly",
};

export default async function LeavesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireCompany();
  const params = await searchParams;
  const role = session.user.role;

  const leavesResult = await getLeaves(params as Record<string, unknown>);

  const myEmployee = await getMyEmployee();

  let balances: {
    id: string;
    leaveTypeId: string;
    leaveTypeName: string;
    totalDays: number;
    usedDays: number;
    remainingDays: number;
    year: number;
  }[] = [];

  if (myEmployee) {
    balances = await getLeaveBalance(myEmployee.id);
  }

  const canApprove = role === "super_admin" || role === "hr_admin" || role === "manager";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leaves</h1>
        <p className="text-muted-foreground">Manage leave requests and balances.</p>
      </div>

      {myEmployee && balances.length > 0 && (
        <LeaveBalanceCards
          balances={balances.map((b) => ({
            id: b.id,
            leaveTypeName: b.leaveTypeName,
            totalDays: b.totalDays,
            usedDays: b.usedDays,
            remainingDays: b.remainingDays,
          }))}
        />
      )}

      <LeaveDataTable
        data={leavesResult.items}
        total={leavesResult.total}
        page={leavesResult.page}
        pageSize={leavesResult.pageSize}
        totalPages={leavesResult.totalPages}
        employeeId={myEmployee?.id ?? null}
        balances={balances.map((b) => ({
          leaveTypeId: b.leaveTypeId,
          leaveTypeName: b.leaveTypeName,
          remainingDays: b.remainingDays,
        }))}
        canApprove={canApprove}
      />
    </div>
  );
}
