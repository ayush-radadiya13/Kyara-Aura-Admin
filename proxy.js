import { NextResponse } from "next/server";
import { AUTH_COOKIE_KEY } from "@/lib/constants";

export function proxy(request) {
  const token = request.cookies.get(AUTH_COOKIE_KEY)?.value;
  const { pathname } = request.nextUrl;

  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
  ],
};
