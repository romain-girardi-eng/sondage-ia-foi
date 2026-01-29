import { NextRequest, NextResponse } from "next/server";
import { adminAuthSchema } from "@/lib/validation";
import { issueAdminTokenFromPassword } from "@/lib/security/adminAuth";

export async function POST(request: NextRequest) {
  try {
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
