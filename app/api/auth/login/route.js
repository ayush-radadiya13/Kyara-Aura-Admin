import { NextResponse } from "next/server";
import { AUTH_COOKIE_KEY, AUTH_COOKIE_MAX_AGE_SECONDS } from "@/lib/constants";

function extractToken(data) {
  return (
    data?.data?.token ||
    data?.data?.access_token ||
    data?.token ||
    data?.access_token ||
    null
  );
}

export async function POST(request) {
  const apiBase = process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE;
  if (!apiBase) {
    return NextResponse.json(
      { message: "Server is missing API base URL configuration" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const response = await fetch(`${apiBase}/cpanel/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : { message: await response.text() };

    const nextResponse = NextResponse.json(data, { status: response.status });
    const token = extractToken(data);

    if (response.ok && token) {
      nextResponse.cookies.set(AUTH_COOKIE_KEY, token, {
        path: "/",
        maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
        sameSite: "lax",
      });
    }

    return nextResponse;
  } catch {
    return NextResponse.json(
      { message: "Unable to reach login service" },
      { status: 502 }
    );
  }
}
