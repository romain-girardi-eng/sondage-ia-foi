import crypto from "node:crypto";

// Admin session tokens are time-bound: a stolen token stops working after this.
const TOKEN_TTL_MS = parseInt(process.env.ADMIN_TOKEN_TTL_MS || "43200000", 10); // 12h

function getSessionSecret(): string | null {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    (process.env.NODE_ENV !== "production" ? "dev-admin-session-secret" : "");
  return secret || null;
}

function getAdminPassword(): string | null {
  return process.env.ADMIN_PASSWORD || null;
}

function hmacHex(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

// Constant-time comparison of two hex strings (no early-exit timing leak).
function safeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

/**
 * Issue a time-bound, signed admin session token, but only if the supplied
 * password matches. The password check is constant-time (compares fixed-length
 * HMAC digests), and the issued token is `timestamp.signature` so it expires
 * and is not a static replayable value.
 */
export function issueAdminTokenFromPassword(password: string): string | null {
  const adminPassword = getAdminPassword();
  const secret = getSessionSecret();
  if (!adminPassword || !secret) {
    return null;
  }

  // Constant-time password verification via fixed-length HMAC digests.
  const given = crypto.createHmac("sha256", secret).update(password).digest();
  const expected = crypto.createHmac("sha256", secret).update(adminPassword).digest();
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
    return null;
  }

  const ts = Date.now().toString(36);
  return `${ts}.${hmacHex(`admin.${ts}`, secret)}`;
}

/**
 * Verify a signed admin session token: correct signature and not expired.
 */
export function verifyAdminToken(token: string | null): boolean {
  const secret = getSessionSecret();
  if (!secret || !token) {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return false;
  }

  const [ts, signature] = parts;
  const issuedAt = parseInt(ts, 36);
  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > TOKEN_TTL_MS) {
    return false;
  }

  return safeEqualHex(signature, hmacHex(`admin.${ts}`, secret));
}

export function authorizeAdminRequest(authHeader: string | null): boolean {
  if (!authHeader?.startsWith("Bearer ")) {
    return false;
  }
  return verifyAdminToken(authHeader.slice(7));
}
