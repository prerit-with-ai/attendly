import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata = {
  title: "Sign In - Attndly",
};

export default function SignInPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your Attndly account"
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkHref="/sign-up"
    >
      <SignInForm />
    </AuthCard>
  );
}
