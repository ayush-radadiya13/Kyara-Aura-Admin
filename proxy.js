import { NextResponse } from "next/server";
import { AUTH_COOKIE_KEY } from "@/lib/constants";

const PUBLIC_PATHS = new Set(["/login", "/forgot-password"]);

function isPublicPath(pathname) {
  return (
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/assets/")
  );
}

export function proxy(request) {
  const token = request.cookies.get(AUTH_COOKIE_KEY)?.value;
  const { pathname } = request.nextUrl;

  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!token && !isPublicPath(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
