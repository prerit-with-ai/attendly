import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-background" />

      {/* Floating orbs */}
      <div className="absolute left-1/4 top-1/4 h-72 w-72 animate-float rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 animate-float-delayed rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-64 w-64 animate-pulse-glow rounded-full bg-primary/8 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-muted-foreground">AI-Powered Attendance Tracking</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Turn Your CCTV Cameras Into an{" "}
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Intelligent Attendance System
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Replace outdated biometric thumb scanners with AI-powered facial recognition. No new
            hardware needed — just your existing cameras.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="text-base" asChild>
              <Link href="/sign-up">
                Start Free Trial
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base" asChild>
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </div>

          {/* Stats line */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4 text-primary" />
              <span>No new hardware required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4 text-primary" />
              <span>Setup in minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4 text-primary" />
              <span>99.2% recognition accuracy</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
