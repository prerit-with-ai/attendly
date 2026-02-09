"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface StepCompleteProps {
  companyName: string;
}

export function StepComplete({ companyName }: StepCompleteProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
        <CheckCircle2 className="size-8 text-primary" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold">You&apos;re all set!</h3>
        <p className="text-muted-foreground">
          <strong>{companyName}</strong> has been created. You can now add employees, set up
          departments, and start tracking attendance.
        </p>
      </div>
      <Button asChild size="lg">
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
    </div>
  );
}
