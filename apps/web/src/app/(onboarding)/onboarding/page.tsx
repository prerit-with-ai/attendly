import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth-server";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export const metadata = {
  title: "Get Started - Attndly",
};

export default async function OnboardingPage() {
  const session = await requireSession();

  if (session.user.companyId) {
    redirect("/dashboard");
  }

  return <OnboardingWizard userName={session.user.name} />;
}
