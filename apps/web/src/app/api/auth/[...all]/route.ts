import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { rateLimitAuth } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

const { GET: authGET, POST: authPOST } = toNextJsHandler(auth.handler);

export { authGET as GET };

export async function POST(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isRateLimited =
    pathname.includes("/sign-in") ||
    pathname.includes("/sign-up") ||
    pathname.includes("/forget-password");

  if (isRateLimited) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "anonymous";
    const { success, remaining } = await rateLimitAuth(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: { "X-RateLimit-Remaining": String(remaining), "Retry-After": "10" },
        }
      );
    }
  }

  return authPOST(request);
}
