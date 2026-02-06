import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <main className="flex flex-col items-center gap-8 p-8">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-primary-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Attndly</h1>
          <p className="max-w-md text-center text-lg text-muted-foreground">
            AI-powered attendance tracking using existing CCTV cameras
          </p>
        </div>

        <div className="grid w-full max-w-lg grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium text-muted-foreground">Frontend</p>
            <p className="text-lg font-semibold text-card-foreground">Next.js 16</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium text-muted-foreground">UI</p>
            <p className="text-lg font-semibold text-card-foreground">Shadcn + Tailwind v4</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium text-muted-foreground">Auth</p>
            <p className="text-lg font-semibold text-card-foreground">BetterAuth</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium text-muted-foreground">Database</p>
            <p className="text-lg font-semibold text-card-foreground">Drizzle + PostgreSQL</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium text-muted-foreground">Face Service</p>
            <p className="text-lg font-semibold text-card-foreground">FastAPI + deepface</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium text-muted-foreground">Monorepo</p>
            <p className="text-lg font-semibold text-card-foreground">pnpm + Turborepo</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Sprint 0 - Foundation
          </span>
          <ThemeToggle />
        </div>
      </main>
    </div>
  );
}
