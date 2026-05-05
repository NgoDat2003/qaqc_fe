import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("qo_token")?.value;
  const { pathname } = request.nextUrl;

  const isLoginPage = pathname.startsWith("/login");
  const isDashboard = pathname.startsWith("/dashboard") ||
    pathname.startsWith("/master-data") ||
    pathname.startsWith("/operations") ||
    pathname.startsWith("/settings");

  if (isDashboard && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/master-data/:path*",
    "/operations/:path*",
    "/settings/:path*",
    "/login",
  ],
};
