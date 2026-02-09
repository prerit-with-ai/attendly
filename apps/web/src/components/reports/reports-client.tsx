"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportToolbar } from "./report-toolbar";
import { ReportLoading } from "./report-loading";
import {
  AttendanceOverviewWidget,
  type AttendanceOverviewData,
} from "./widgets/attendance-overview-widget";
import {
  DepartmentAnalyticsWidget,
  type DepartmentAnalyticsData,
} from "./widgets/department-analytics-widget";
import { LeaveAnalyticsWidget, type LeaveAnalyticsData } from "./widgets/leave-analytics-widget";
import { PunctualityWidget, type PunctualityReportData } from "./widgets/punctuality-widget";
import { EmployeeDetailWidget, type EmployeeDetailData } from "./widgets/employee-detail-widget";
import { ShareReportDialog } from "./share-report-dialog";
import { ReportEmptyState } from "./report-empty-state";
import {
  getAttendanceOverview,
  getEmployeeDetail,
  getDepartmentAnalytics,
  getLeaveAnalytics,
  getPunctualityReport,
} from "@/actions/report";
import { exportToCSV } from "@/lib/csv-export";

type TabKey = "overview" | "department" | "leaves" | "punctuality" | "employee";

const TAB_TO_REPORT_TYPE: Record<TabKey, string> = {
  overview: "attendance_overview",
  department: "department_analytics",
  leaves: "leave_analytics",
  punctuality: "punctuality_overtime",
  employee: "employee_detail",
};

interface ReportsClientProps {
  initialOverview: AttendanceOverviewData | null;
  departments: { id: string; name: string }[];
  locations: { id: string; name: string }[];
  employees: { id: string; name: string; code: string }[];
  defaultDateFrom: string;
  defaultDateTo: string;
}

export function ReportsClient({
  initialOverview,
  departments,
  locations,
  employees,
  defaultDateFrom,
  defaultDateTo,
}: ReportsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentTab = (searchParams.get("tab") as TabKey) || "overview";
  const [dateFrom, setDateFrom] = useState(searchParams.get("from") || defaultDateFrom);
  const [dateTo, setDateTo] = useState(searchParams.get("to") || defaultDateTo);
  const [departmentId, setDepartmentId] = useState(searchParams.get("dept") || "");
  const [locationId, setLocationId] = useState(searchParams.get("loc") || "");
  const [employeeId, setEmployeeId] = useState(searchParams.get("emp") || "");

  const [overviewData, setOverviewData] = useState<AttendanceOverviewData | null>(initialOverview);
  const [departmentData, setDepartmentData] = useState<DepartmentAnalyticsData | null>(null);
  const [leaveData, setLeaveData] = useState<LeaveAnalyticsData | null>(null);
  const [punctualityData, setPunctualityData] = useState<PunctualityReportData | null>(null);
  const [employeeData, setEmployeeData] = useState<EmployeeDetailData | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const updateUrl = useCallback(
    (tab: string, filters: Record<string, string>) => {
      const params = new URLSearchParams();
      params.set("tab", tab);
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      if (filters.dept) params.set("dept", filters.dept);
      if (filters.loc) params.set("loc", filters.loc);
      if (filters.emp) params.set("emp", filters.emp);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  const fetchData = useCallback(
    (tab: TabKey, from: string, to: string, dept: string, loc: string, emp: string) => {
      const filters = {
        dateFrom: from,
        dateTo: to,
        departmentId: dept,
        locationId: loc,
        employeeId: emp,
      };

      startTransition(async () => {
        switch (tab) {
          case "overview": {
            const result = await getAttendanceOverview(filters);
            if (!("error" in result)) setOverviewData(result);
            break;
          }
          case "department": {
            const result = await getDepartmentAnalytics(filters);
            if (!("error" in result)) setDepartmentData(result);
            break;
          }
          case "leaves": {
            const result = await getLeaveAnalytics(filters);
            if (!("error" in result)) setLeaveData(result);
            break;
          }
          case "punctuality": {
            const result = await getPunctualityReport(filters);
            if (!("error" in result)) setPunctualityData(result);
            break;
          }
          case "employee": {
            if (emp) {
              const result = await getEmployeeDetail(filters);
              if (result && !("error" in result)) setEmployeeData(result);
              else setEmployeeData(null);
            }
            break;
          }
        }
      });
    },
    []
  );

  const handleTabChange = useCallback(
    (tab: string) => {
      const t = tab as TabKey;
      updateUrl(t, {
        from: dateFrom,
        to: dateTo,
        dept: departmentId,
        loc: locationId,
        emp: employeeId,
      });
      fetchData(t, dateFrom, dateTo, departmentId, locationId, employeeId);
    },
    [dateFrom, dateTo, departmentId, locationId, employeeId, updateUrl, fetchData]
  );

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      let newFrom = dateFrom,
        newTo = dateTo,
        newDept = departmentId,
        newLoc = locationId,
        newEmp = employeeId;

      switch (key) {
        case "dateFrom":
          newFrom = value;
          setDateFrom(value);
          break;
        case "dateTo":
          newTo = value;
          setDateTo(value);
          break;
        case "departmentId":
          newDept = value;
          setDepartmentId(value);
          break;
        case "locationId":
          newLoc = value;
          setLocationId(value);
          break;
        case "employeeId":
          newEmp = value;
          setEmployeeId(value);
          break;
      }

      updateUrl(currentTab, { from: newFrom, to: newTo, dept: newDept, loc: newLoc, emp: newEmp });
      fetchData(currentTab, newFrom, newTo, newDept, newLoc, newEmp);
    },
    [dateFrom, dateTo, departmentId, locationId, employeeId, currentTab, updateUrl, fetchData]
  );

  const handleExportCsv = useCallback(() => {
    switch (currentTab) {
      case "overview":
        if (overviewData) exportToCSV(overviewData.dailyTrend, "attendance-overview");
        break;
      case "department":
        if (departmentData) exportToCSV(departmentData.departments, "department-analytics");
        break;
      case "leaves":
        if (leaveData) exportToCSV(leaveData.byType, "leave-analytics");
        break;
      case "punctuality":
        if (punctualityData) exportToCSV(punctualityData.topLateEmployees, "punctuality-report");
        break;
      case "employee":
        if (employeeData) exportToCSV(employeeData.recentLogs, "employee-detail");
        break;
    }
  }, [currentTab, overviewData, departmentData, leaveData, punctualityData, employeeData]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <>
      <ReportToolbar
        dateFrom={dateFrom}
        dateTo={dateTo}
        departmentId={departmentId}
        locationId={locationId}
        employeeId={employeeId}
        departments={departments}
        locations={locations}
        employees={employees}
        showEmployeeFilter={currentTab === "employee"}
        onFilterChange={handleFilterChange}
        onShare={() => setShareOpen(true)}
        onExportCsv={handleExportCsv}
        onPrint={handlePrint}
      />

      <Tabs value={currentTab} onValueChange={handleTabChange} className="mt-4">
        <TabsList className="print:hidden">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="department">Department</TabsTrigger>
          <TabsTrigger value="leaves">Leaves</TabsTrigger>
          <TabsTrigger value="punctuality">Punctuality</TabsTrigger>
          <TabsTrigger value="employee">Employee</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          {isPending ? (
            <ReportLoading />
          ) : (
            <>
              <TabsContent value="overview" className="mt-0">
                {overviewData ? (
                  <AttendanceOverviewWidget data={overviewData} />
                ) : (
                  <ReportEmptyState reportType="attendance_overview" />
                )}
              </TabsContent>

              <TabsContent value="department" className="mt-0">
                {departmentData ? (
                  <DepartmentAnalyticsWidget data={departmentData} />
                ) : (
                  <ReportEmptyState reportType="department_analytics" />
                )}
              </TabsContent>

              <TabsContent value="leaves" className="mt-0">
                {leaveData ? (
                  <LeaveAnalyticsWidget data={leaveData} />
                ) : (
                  <ReportEmptyState reportType="leave_analytics" />
                )}
              </TabsContent>

              <TabsContent value="punctuality" className="mt-0">
                {punctualityData ? (
                  <PunctualityWidget data={punctualityData} />
                ) : (
                  <ReportEmptyState reportType="punctuality_overtime" />
                )}
              </TabsContent>

              <TabsContent value="employee" className="mt-0">
                {!employeeId ? (
                  <ReportEmptyState
                    reportType="employee_detail"
                    message="Select an employee from the filter above to view their details."
                  />
                ) : employeeData ? (
                  <EmployeeDetailWidget data={employeeData} />
                ) : (
                  <ReportEmptyState reportType="employee_detail" />
                )}
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>

      <ShareReportDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        reportType={TAB_TO_REPORT_TYPE[currentTab]}
        filters={{ dateFrom, dateTo, departmentId, locationId, employeeId }}
      />
    </>
  );
}
