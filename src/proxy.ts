import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next.js 16 proxy (replaces the deprecated middleware.ts convention, whose
// response headers were silently dropped in production — cookies survived,
// CSP/X-Frame-Options did not). Per the official CSP guide, the policy is set
// on BOTH the request headers (so Next can wire the nonce during dynamic
// rendering) and the response headers (so browsers enforce it).

const LOCALE_COOKIE = "NEXT_LOCALE";
const DEFAULT_LOCALE = "fr";
const PATH_LOCALE_MAP: Record<string, "fr" | "en"> = {
  fr: "fr",
  en: "en",
  eng: "en",
};

const DEFAULT_PLAUSIBLE_SRC = "https://plausible.io/js/script.js";
const configuredPlausibleSrc = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC || DEFAULT_PLAUSIBLE_SRC;
let PLAUSIBLE_ORIGIN = "https://plausible.io";

try {
  PLAUSIBLE_ORIGIN = new URL(configuredPlausibleSrc).origin;
} catch {
  PLAUSIBLE_ORIGIN = "https://plausible.io";
}

function buildCsp(nonce: string): string {
  const cspDirectives = [
    "default-src 'self'",
    // Scripts: self + Plausible + nonce and optional unsafe-eval for dev tooling
    process.env.NODE_ENV === "development"
      ? `script-src 'self' 'nonce-${nonce}' 'unsafe-eval' ${PLAUSIBLE_ORIGIN}`
      : `script-src 'self' 'nonce-${nonce}' ${PLAUSIBLE_ORIGIN}`,
    // Styles: self + inline for CSS-in-JS and Tailwind
    "style-src 'self' 'unsafe-inline'",
    // Images: self + data URIs + blob for canvas + external trusted sources
    "img-src 'self' data: blob: https:",
    // Fonts: self + data URIs
    "font-src 'self' data:",
    // Connect: API endpoints + external services
    // - Supabase: src/lib/supabase/client.ts, server.ts (NEXT_PUBLIC_SUPABASE_URL)
    // - Resend: server-side only (RESEND_API_KEY), kept for defense-in-depth
    // - cdn.jsdelivr.net: @react-pdf/renderer fetches font files client-side
    //   (src/lib/pdf/reportDocument.tsx) from PDFDownloadButton, a "use client"
    //   component (src/components/sharing/PDFDownloadButton.tsx)
    // - Sentry ingest: sentry.client.config.ts reads NEXT_PUBLIC_SENTRY_DSN; exact
    //   ingest host depends on the DSN's org/region, so both known SaaS patterns
    //   are allowed
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com https://cdn.jsdelivr.net https://*.ingest.sentry.io https://*.ingest.us.sentry.io ${PLAUSIBLE_ORIGIN}`,
    // Frame ancestors: prevent clickjacking
    "frame-ancestors 'none'",
    // Form actions: only self
    "form-action 'self'",
    // Base URI: prevent base tag hijacking
    "base-uri 'self'",
    // Object/embed: none needed
    "object-src 'none'",
    // Upgrade insecure requests in production
    ...(process.env.NODE_ENV === "production" ? ["upgrade-insecure-requests"] : []),
  ];

  return cspDirectives.join("; ");
}

function addSecurityHeaders(response: NextResponse, csp: string): void {
  // Note: X-Content-Type-Options, Referrer-Policy, and Strict-Transport-Security
  // are owned by next.config.ts (static, no nonce needed, and next.config's
  // headers() covers routes this proxy's matcher excludes, e.g. _next/static).
  // This file owns X-Frame-Options and the nonce-based CSP exclusively, to avoid
  // two CSPs enforcing as their (weaker) intersection.
  const securityHeaders: Record<string, string> = {
    // Prevent clickjacking (matches CSP frame-ancestors 'none')
    "X-Frame-Options": "DENY",
    // Content Security Policy
    "Content-Security-Policy": csp,
    // Permissions Policy - restrict browser features
    "Permissions-Policy": [
      "accelerometer=()",
      "autoplay=()",
      "camera=()",
      "cross-origin-isolated=()",
      "display-capture=()",
      "encrypted-media=()",
      "fullscreen=(self)",
      "geolocation=()",
      "gyroscope=()",
      "keyboard-map=()",
      "magnetometer=()",
      "microphone=()",
      "midi=()",
      "payment=()",
      "picture-in-picture=()",
      "publickey-credentials-get=()",
      "screen-wake-lock=()",
      "sync-xhr=()",
      "usb=()",
      "web-share=()",
      "xr-spatial-tracking=()",
    ].join(", "),
    // Cross-Origin policies
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "credentialless",
  };

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  // Per the Next.js CSP guide: the request-header copy lets the framework
  // thread the nonce through dynamic rendering.
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Skip locale handling for static files, API routes, and admin
  const isBypassedPath =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico";

  if (!isBypassedPath) {
    const firstSegment = pathname.split("/").filter(Boolean)[0];
    const resolvedLocale = firstSegment ? PATH_LOCALE_MAP[firstSegment] : undefined;

    response.cookies.set(LOCALE_COOKIE, resolvedLocale ?? DEFAULT_LOCALE, {
      path: "/",
      maxAge: 31536000, // 1 year
      sameSite: "lax",
    });
  }

  addSecurityHeaders(response, csp);
  response.headers.set("x-nonce", nonce);
  return response;
}

export const config = {
  // Match all paths except static files
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
