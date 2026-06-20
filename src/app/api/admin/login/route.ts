import { NextRequest, NextResponse } from "next/server";
import { adminAuthSchema } from "@/lib/validation";
import { issueAdminTokenFromPassword } from "@/lib/security/adminAuth";
import { rateLimit, getRateLimitHeaders } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    // Throttle login attempts by client IP to block password brute-forcing.
    const ip =
      request.headers.get("x-real-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "anonymous";
    const rl = rateLimit(`admin-login:${ip}`, "admin");
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429, headers: getRateLimitHeaders(rl) }
      );
    }

    const body = await request.json();
    const validation = adminAuthSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const token = issueAdminTokenFromPassword(validation.data.password);

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
