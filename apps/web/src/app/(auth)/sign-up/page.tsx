import { AuthCard } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata = {
  title: "Sign Up - Attndly",
};

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Get started with Attndly for free"
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/sign-in"
    >
      <SignUpForm />
    </AuthCard>
  );
}
