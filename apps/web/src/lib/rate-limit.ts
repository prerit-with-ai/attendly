import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitResult = { success: boolean; remaining: number };

let authLimiter: { limit: (identifier: string) => Promise<RateLimitResult> };
let apiLimiter: { limit: (identifier: string) => Promise<RateLimitResult> };

if (process.env.REDIS_URL) {
  const redis = new Redis({ url: process.env.REDIS_URL, token: process.env.REDIS_TOKEN ?? "" });

  authLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    prefix: "rl:auth",
  });

  apiLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "60 s"),
    prefix: "rl:api",
  });
} else {
  // In-memory fallback for development
  const store = new Map<string, { count: number; resetAt: number }>();

  function createMemoryLimiter(limit: number, windowMs: number) {
    return {
      async limit(identifier: string): Promise<RateLimitResult> {
        const now = Date.now();
        const entry = store.get(identifier);

        if (!entry || now > entry.resetAt) {
          store.set(identifier, { count: 1, resetAt: now + windowMs });
          return { success: true, remaining: limit - 1 };
        }

        entry.count++;
        if (entry.count > limit) {
          return { success: false, remaining: 0 };
        }
        return { success: true, remaining: limit - entry.count };
      },
    };
  }

  authLimiter = createMemoryLimiter(10, 10_000);
  apiLimiter = createMemoryLimiter(60, 60_000);
}

export async function rateLimitAuth(identifier: string): Promise<RateLimitResult> {
  return authLimiter.limit(identifier);
}

export async function rateLimitApi(identifier: string): Promise<RateLimitResult> {
  return apiLimiter.limit(identifier);
}
