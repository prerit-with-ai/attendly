import { z } from "zod/v4";

const requiredEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  BETTER_AUTH_SECRET: z.string().min(16, "BETTER_AUTH_SECRET must be at least 16 characters"),
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL"),
});

const optionalEnvSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  REDIS_URL: z.string().optional(),
  FACE_SERVICE_URL: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
});

function validateEnv() {
  const requiredResult = requiredEnvSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });

  if (!requiredResult.success) {
    const errors = requiredResult.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`);
    console.error(`\n❌ Missing or invalid environment variables:\n${errors.join("\n")}\n`);
    throw new Error("Environment validation failed. Check the logs above.");
  }

  const optionalResult = optionalEnvSchema.safeParse({
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    REDIS_URL: process.env.REDIS_URL,
    FACE_SERVICE_URL: process.env.FACE_SERVICE_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    SENTRY_DSN: process.env.SENTRY_DSN,
  });

  const optional = optionalResult.success ? optionalResult.data : {};

  if (!optional.GOOGLE_CLIENT_ID || !optional.GOOGLE_CLIENT_SECRET) {
    console.warn("⚠ Google OAuth not configured — social sign-in will be disabled");
  }
  if (!optional.RESEND_API_KEY) {
    console.warn("⚠ RESEND_API_KEY not set — emails will be logged to console");
  }

  return {
    ...requiredResult.data,
    ...optional,
  };
}

export const env = validateEnv();
