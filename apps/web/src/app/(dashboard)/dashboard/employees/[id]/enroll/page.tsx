import { notFound } from "next/navigation";
import { getEmployee } from "@/actions/enrollment";
import { FaceEnrollment } from "@/components/enrollment/face-enrollment";

export const metadata = {
  title: "Face Enrollment - Attndly",
};

interface EnrollPageProps {
  params: Promise<{ id: string }>;
}

export default async function EnrollPage({ params }: EnrollPageProps) {
  const { id } = await params;
  const emp = await getEmployee(id);

  if (!emp) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Face Enrollment</h1>
        <p className="text-muted-foreground">
          Enroll face for {emp.firstName} {emp.lastName} ({emp.employeeCode})
        </p>
      </div>

      <FaceEnrollment employee={emp} />
    </div>
  );
}
