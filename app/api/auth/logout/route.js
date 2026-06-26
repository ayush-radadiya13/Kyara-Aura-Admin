import { NextResponse } from "next/server";
import { AUTH_COOKIE_KEY } from "@/lib/constants";

export async function POST(request) {
  const apiBase = process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE;
  const token = request.cookies.get(AUTH_COOKIE_KEY)?.value;

  let status = 200;
  let data = { message: "Logged out" };

  if (apiBase && token) {
    try {
      const response = await fetch(`${apiBase}/cpanel/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const contentType = response.headers.get("content-type") || "";
      data = contentType.includes("application/json")
        ? await response.json()
        : { message: await response.text() };
      status = response.status;
    } catch {
      // Ignore upstream failures so the session is always cleared locally.
    }
  }

  const nextResponse = NextResponse.json(data, { status });
  nextResponse.cookies.set(AUTH_COOKIE_KEY, "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });

  return nextResponse;
}
