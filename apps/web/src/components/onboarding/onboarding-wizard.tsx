"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Building2, MapPin, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import {
  onboardingSchema,
  companyInfoSchema,
  locationSchema,
  type OnboardingValues,
} from "@/lib/validators/onboarding";
import { completeOnboarding } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { StepCompanyInfo } from "./step-company-info";
import { StepLocation } from "./step-location";
import { StepComplete } from "./step-complete";

const STEPS = [
  {
    title: "Company Information",
    description: "Tell us about your organization",
    icon: Building2,
  },
  {
    title: "First Location",
    description: "Add your primary office location",
    icon: MapPin,
  },
] as const;

interface OnboardingWizardProps {
  userName: string;
}

export function OnboardingWizard({ userName }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      companyName: "",
      industry: "",
      companySize: "",
      locationName: "",
      address: "",
      city: "",
      timezone: "Asia/Kolkata",
    },
  });

  async function handleNext() {
    if (step === 0) {
      const valid = await form.trigger(["companyName", "industry", "companySize"]);
      if (!valid) return;
      // Also validate with the step schema for extra safety
      const stepData = form.getValues();
      const result = companyInfoSchema.safeParse(stepData);
      if (!result.success) return;
      setStep(1);
    } else if (step === 1) {
      const valid = await form.trigger(["locationName", "city", "timezone"]);
      if (!valid) return;
      const stepData = form.getValues();
      const result = locationSchema.safeParse(stepData);
      if (!result.success) return;
      await handleSubmit();
    }
  }

  async function handleSubmit() {
    setLoading(true);
    const values = form.getValues();
    const result = await completeOnboarding(values);

    if (result?.error) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    // If no error and no redirect (shouldn't happen since action redirects),
    // show complete step
    setCompleted(true);
    setLoading(false);
  }

  if (completed) {
    return (
      <Card>
        <CardContent className="pt-6">
          <StepComplete companyName={form.getValues("companyName")} />
        </CardContent>
      </Card>
    );
  }

  const currentStep = STEPS[step];
  const StepIcon = currentStep.icon;
  const progress = ((step + 1) / (STEPS.length + 1)) * 100;

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Welcome, {userName}!</p>
          <CardTitle className="text-2xl">Set up your workspace</CardTitle>
          <CardDescription>Complete these steps to get started with Attndly</CardDescription>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <StepIcon className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">
              Step {step + 1} of {STEPS.length}
            </p>
            <p className="text-sm text-muted-foreground">{currentStep.description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNext();
            }}
            className="space-y-6"
          >
            {step === 0 && <StepCompanyInfo form={form} />}
            {step === 1 && <StepLocation form={form} />}

            <div className="flex justify-between">
              {step > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  disabled={loading}
                >
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
              ) : (
                <div />
              )}
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                {step === STEPS.length - 1 ? "Complete Setup" : "Next"}
                {!loading && step < STEPS.length - 1 && <ArrowRight className="size-4" />}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
