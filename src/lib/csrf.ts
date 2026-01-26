import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const CSRF_TOKEN_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";

// Lazy-loaded CSRF secret to avoid build-time evaluation
let _csrfSecret: string | null = null;
function getCSRFSecret(): string {
  if (_csrfSecret !== null) return _csrfSecret;

  const secret = process.env.CSRF_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CSRF_SECRET environment variable is required in production");
    }
    // Development-only fallback - never used in production
    _csrfSecret = "dev-only-csrf-secret-not-for-production";
  } else {
    _csrfSecret = secret;
  }
  return _csrfSecret;
}

/**
 * Generate a CSRF token using Web Crypto API
 */
export async function generateCSRFToken(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
  return token;
}

/**
 * Create a signed CSRF token
 */
export async function createSignedToken(): Promise<string> {
  const token = await generateCSRFToken();
  const timestamp = Date.now().toString(36);
  const data = `${token}.${timestamp}`;

  // Sign the token using Web Crypto API
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getCSRFSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(data)
  );

  const signatureHex = Array.from(new Uint8Array(signature), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("");

  return `${data}.${signatureHex}`;
}

/**
 * Verify a signed CSRF token
 */
export async function verifySignedToken(signedToken: string): Promise<boolean> {
  try {
    const parts = signedToken.split(".");
    if (parts.length !== 3) return false;

    const [token, timestamp, signature] = parts;
    const data = `${token}.${timestamp}`;

    // Check token age (1 hour max)
    const tokenTime = parseInt(timestamp, 36);
    if (Date.now() - tokenTime > 3600000) return false;

    // Verify signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(getCSRFSecret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureBytes = new Uint8Array(
      (signature.match(/.{2}/g) || []).map((h) => parseInt(h, 16))
    );

    return await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      encoder.encode(data)
    );
  } catch {
    return false;
  }
}

/**
 * Set CSRF token in cookies
 */
export async function setCSRFCookie(): Promise<string> {
  const token = await createSignedToken();
  const cookieStore = await cookies();

  cookieStore.set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 3600, // 1 hour
  });

  return token;
}

/**
 * Get CSRF token from cookies
 */
export async function getCSRFToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_TOKEN_NAME)?.value || null;
}

/**
 * Middleware to validate CSRF token on mutating requests
 */
export async function validateCSRF(request: NextRequest): Promise<{ valid: boolean; error?: string }> {
  // Only check on mutating methods
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    return { valid: true };
  }

  // Get token from header
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (!headerToken) {
    return { valid: false, error: "Missing CSRF token" };
  }

  // Get token from cookie
  const cookieToken = request.cookies.get(CSRF_TOKEN_NAME)?.value;
  if (!cookieToken) {
    return { valid: false, error: "Missing CSRF cookie" };
  }

  // Tokens should match
  if (headerToken !== cookieToken) {
    return { valid: false, error: "CSRF token mismatch" };
  }

  // Verify the token signature
  const isValid = await verifySignedToken(headerToken);
  if (!isValid) {
    return { valid: false, error: "Invalid CSRF token" };
  }

  return { valid: true };
}

/**
 * Create a response with CSRF error
 */
export function csrfErrorResponse(error: string): NextResponse {
  return NextResponse.json(
    { error: "CSRF validation failed", details: error },
    { status: 403 }
  );
}
