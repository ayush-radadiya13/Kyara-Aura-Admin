import { NextResponse } from "next/server";

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

    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: "Unable to reach login service" },
      { status: 502 }
    );
  }
}
