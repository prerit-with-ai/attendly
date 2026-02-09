import { getDepartments } from "@/actions/department";
import { DepartmentList } from "@/components/departments/department-list";

export const metadata = {
  title: "Departments - Attndly",
};

export default async function DepartmentsPage() {
  const departments = await getDepartments();

  return (
    <div className="space-y-6">
      <DepartmentList departments={departments} />
    </div>
  );
}
