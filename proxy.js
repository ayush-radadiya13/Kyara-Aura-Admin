import { NextResponse } from "next/server";
import { AUTH_COOKIE_KEY } from "@/lib/constants";

const protectedPaths = [
  "/dashboard",
  "/category",
  "/product",
  "/orders",
  "/customers",
  "/settings",
];

export function proxy(request) {
  const token = request.cookies.get(AUTH_COOKIE_KEY)?.value;
  const { pathname } = request.nextUrl;
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  if (!token && isProtectedPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/category/:path*",
    "/product/:path*",
    "/orders/:path*",
    "/customers/:path*",
    "/settings/:path*",
    "/login",
  ],
};
