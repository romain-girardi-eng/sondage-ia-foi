import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SUPPORTED_LOCALES = ["fr", "en"] as const;
const DEFAULT_LOCALE = "fr";
const LOCALE_COOKIE = "NEXT_LOCALE";

function getPreferredLocale(request: NextRequest): string {
  // Check cookie first
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as "fr" | "en")) {
    return cookieLocale;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const languages = acceptLanguage
      .split(",")
      .map((lang) => {
        const [code, priority = "1"] = lang.trim().split(";q=");
        return {
          code: code.split("-")[0].toLowerCase(),
          priority: parseFloat(priority),
        };
      })
      .sort((a, b) => b.priority - a.priority);

    for (const { code } of languages) {
      if (SUPPORTED_LOCALES.includes(code as "fr" | "en")) {
        return code;
      }
    }
  }

  return DEFAULT_LOCALE;
}

const DEFAULT_PLAUSIBLE_SRC = "https://plausible.io/js/script.js";
const configuredPlausibleSrc = process.env.NEXT_PUBLIC_PLAUSIBLE_SRC || DEFAULT_PLAUSIBLE_SRC;
let PLAUSIBLE_ORIGIN = "https://plausible.io";

try {
  PLAUSIBLE_ORIGIN = new URL(configuredPlausibleSrc).origin;
} catch {
  PLAUSIBLE_ORIGIN = "https://plausible.io";
}

function addSecurityHeaders(response: NextResponse, nonce: string): void {
  // Content Security Policy - Strict but allows necessary features
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
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com ${PLAUSIBLE_ORIGIN}`,
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

  // Security headers
  const securityHeaders: Record<string, string> = {
    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",
    // Prevent clickjacking
    "X-Frame-Options": "DENY",
    // Control referrer information
    "Referrer-Policy": "strict-origin-when-cross-origin",
    // Content Security Policy
    "Content-Security-Policy": cspDirectives.join("; "),
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

  // Add HSTS in production
  if (process.env.NODE_ENV === "production") {
    securityHeaders["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload";
  }

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
}

function createResponse(response: NextResponse, nonce: string) {
  addSecurityHeaders(response, nonce);
  response.headers.set("x-nonce", nonce);
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  // Skip middleware for static files, API routes, and admin
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    return createResponse(response, nonce);
  }

  // Check if pathname starts with a locale
  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    // Extract locale from pathname
    const locale = pathname.split("/")[1];

    // Set cookie and continue
    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 31536000, // 1 year
      sameSite: "lax",
    });
    return createResponse(response, nonce);
  }

  // No locale in pathname - redirect to preferred locale
  const locale = getPreferredLocale(request);

  // Build new URL with locale
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  newUrl.search = request.nextUrl.search;

  const response = NextResponse.redirect(newUrl, {
    request: { headers: requestHeaders },
  });
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 31536000,
    sameSite: "lax",
  });
  return createResponse(response, nonce);
}

export const config = {
  // Match all paths except static files
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
