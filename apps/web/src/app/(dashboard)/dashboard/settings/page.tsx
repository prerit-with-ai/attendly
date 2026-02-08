import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getShifts } from "@/actions/shift";
import { getLeaveTypes } from "@/actions/leave-type";
import { ShiftsTab } from "@/components/settings/shifts-tab";
import { LeaveTypesTab } from "@/components/settings/leave-types-tab";

export const metadata = {
  title: "Settings - Attndly",
};

export default async function SettingsPage() {
  const [shifts, leaveTypes] = await Promise.all([getShifts(), getLeaveTypes()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage shifts, leave types, and company settings.</p>
      </div>

      <Tabs defaultValue="shifts">
        <TabsList>
          <TabsTrigger value="shifts">Shifts</TabsTrigger>
          <TabsTrigger value="leave-types">Leave Types</TabsTrigger>
        </TabsList>
        <TabsContent value="shifts" className="mt-4">
          <ShiftsTab shifts={shifts} />
        </TabsContent>
        <TabsContent value="leave-types" className="mt-4">
          <LeaveTypesTab leaveTypes={leaveTypes} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
