import { NextRequest, NextResponse } from "next/server";

const authRoutes = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("better-auth.session_token");

  const isAuthRoute = authRoutes.includes(pathname);
  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");

  // Authenticated users on auth pages → redirect to dashboard
  if (sessionToken && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Unauthenticated users on protected routes → redirect to sign-in
  if (!sessionToken && isProtectedRoute) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};
