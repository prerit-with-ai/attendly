import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = {
  title: "Reset Password - Attndly",
};

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Reset password"
      description="Enter your new password below"
      footerText="Remember your password?"
      footerLinkText="Sign in"
      footerLinkHref="/sign-in"
    >
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
