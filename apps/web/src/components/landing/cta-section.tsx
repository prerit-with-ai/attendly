import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="border-t">
      <div className="bg-gradient-to-r from-primary to-primary/80 py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to Modernize Your Attendance?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
            Join companies that have already switched from outdated biometric scanners to
            intelligent, camera-based attendance tracking.
          </p>
          <div className="mt-10">
            <Button size="lg" variant="secondary" className="text-base" asChild>
              <Link href="/sign-up">
                Get Started for Free
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
