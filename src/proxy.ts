import { NextRequest, NextResponse } from "next/server";

// FE Middleware: Pure route guard — only checks if cookie exists.
// JWT verification is done by the BE (qaqc-platform-clone).
// FE does NOT have the JWT secret.

const PUBLIC_PATHS = ["/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check if auth cookie exists (not verified — BE will verify on API call)
  // Cookie name MUST match what BE sets: "qo_token" (see qaqc-platform-clone/src/app/api/auth/login/route.ts)
  const hasCookie = !!request.cookies.get("qo_token");

  if (!hasCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect all routes except static files and login
    "/((?!_next/static|_next/image|favicon.ico|login).*)",
  ],
};
