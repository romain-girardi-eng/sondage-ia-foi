import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Security headers middleware
 * Implements OWASP security best practices
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- NextRequest required for middleware signature
export function middleware(_request: NextRequest): ReturnType<typeof NextResponse.next> {
  // Get the response
  const response = NextResponse.next();

  // Content Security Policy - Strict but allows necessary features
  const cspDirectives = [
    "default-src 'self'",
    // Scripts: self + inline for Next.js hydration + unsafe-eval for development
    process.env.NODE_ENV === "development"
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
      : "script-src 'self' 'unsafe-inline'",
    // Styles: self + inline for CSS-in-JS and Tailwind
    "style-src 'self' 'unsafe-inline'",
    // Images: self + data URIs + blob for canvas + external trusted sources
    "img-src 'self' data: blob: https:",
    // Fonts: self + data URIs
    "font-src 'self' data:",
    // Connect: API endpoints + external services
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com",
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
  const securityHeaders = {
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

    // Strict Transport Security (HSTS) - only in production
    ...(process.env.NODE_ENV === "production" && {
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    }),

    // Cross-Origin policies
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Cross-Origin-Embedder-Policy": "credentialless",
  };

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });

  return response;
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
