import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = {
  title: "Forgot Password - Attndly",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot password?"
      description="Enter your email and we'll send you a reset link"
      footerText="Remember your password?"
      footerLinkText="Sign in"
      footerLinkHref="/sign-in"
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
