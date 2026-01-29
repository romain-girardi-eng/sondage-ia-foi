import crypto from "node:crypto";

const ADMIN_SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.ADMIN_PASSWORD ||
  (process.env.NODE_ENV !== "production" ? "dev-admin-session-secret" : "");

function getAdminPassword(): string | null {
  return process.env.ADMIN_PASSWORD || null;
}

function getExpectedToken(): string | null {
  const password = getAdminPassword();
  if (!password || !ADMIN_SESSION_SECRET) {
    return null;
  }

  return crypto.createHmac("sha256", ADMIN_SESSION_SECRET).update(password).digest("hex");
}

export function verifyAdminToken(token: string | null): boolean {
  const expected = getExpectedToken();
  if (!expected || !token) {
    return false;
  }
  return token === expected;
}

export function authorizeAdminRequest(authHeader: string | null): boolean {
  if (!authHeader?.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.slice(7);
  return verifyAdminToken(token);
}

export function issueAdminTokenFromPassword(password: string): string | null {
  const adminPassword = getAdminPassword();
  if (!adminPassword || password !== adminPassword || !ADMIN_SESSION_SECRET) {
    return null;
  }
  return crypto.createHmac("sha256", ADMIN_SESSION_SECRET).update(password).digest("hex");
}
