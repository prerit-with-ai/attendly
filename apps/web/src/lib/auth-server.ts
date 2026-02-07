import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect("/sign-in");
  }
  return session;
}

export async function requireCompany() {
  const session = await requireSession();
  if (!session.user.companyId) {
    redirect("/onboarding");
  }
  return session as typeof session & {
    user: typeof session.user & { companyId: string };
  };
}
