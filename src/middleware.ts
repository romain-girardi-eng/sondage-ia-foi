import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DEFAULT_LOCALE = "fr";
const LOCALE_COOKIE = "NEXT_LOCALE";
const PATH_LOCALE_MAP: Record<string, "fr" | "en"> = {
  fr: "fr",
  en: "en",
  eng: "en",
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes, and admin
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const firstSegment = pathname.split("/").filter(Boolean)[0];
  const resolvedLocale = firstSegment ? PATH_LOCALE_MAP[firstSegment] : undefined;

  const response = NextResponse.next();
  response.cookies.set(LOCALE_COOKIE, resolvedLocale ?? DEFAULT_LOCALE, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  // Match all paths except static files and API
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
