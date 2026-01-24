import { NextResponse } from "next/server";
import { setCSRFCookie } from "@/lib/csrf";

export async function GET() {
  try {
    const token = await setCSRFCookie();

    return NextResponse.json(
      { token },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("CSRF token generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate CSRF token" },
      { status: 500 }
    );
  }
}
