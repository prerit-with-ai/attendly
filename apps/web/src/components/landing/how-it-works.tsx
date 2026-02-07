import { Cable, UserPlus, Activity } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Cable,
    title: "Connect Your Cameras",
    description:
      "Add your existing CCTV camera RTSP streams. No new hardware purchases — use what you already have.",
  },
  {
    number: "02",
    icon: UserPlus,
    title: "Enroll Employees",
    description:
      "Upload employee photos or capture them via camera. Our AI learns each face in seconds.",
  },
  {
    number: "03",
    icon: Activity,
    title: "Track Automatically",
    description:
      "Attendance is recorded automatically as employees are recognized. Real-time updates on your dashboard.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t bg-muted/30 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Up and running in three steps
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Get started in minutes, not weeks. No complex installation or training required.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="relative text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <step.icon className="size-7 text-primary" />
              </div>
              <span className="mb-2 block text-sm font-bold text-primary">Step {step.number}</span>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
