import { describe, it, expect, beforeEach, afterAll } from "vitest";
import crypto from "node:crypto";
import {
  issueAdminTokenFromPassword,
  verifyAdminToken,
  authorizeAdminRequest,
} from "./adminAuth";

const PASSWORD = "correct-horse-battery-staple";
const SECRET = "test-admin-session-secret";

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env.ADMIN_PASSWORD = PASSWORD;
  process.env.ADMIN_SESSION_SECRET = SECRET;
});

afterAll(() => {
  process.env = originalEnv;
});

describe("adminAuth", () => {
  it("issues a token only for the correct password", () => {
    expect(issueAdminTokenFromPassword("wrong")).toBeNull();
    expect(issueAdminTokenFromPassword("")).toBeNull();
    const token = issueAdminTokenFromPassword(PASSWORD);
    expect(token).toMatch(/^[a-z0-9]+\.[a-f0-9]{64}$/);
  });

  it("accepts a freshly issued token and rejects tampered/garbage ones", () => {
    const token = issueAdminTokenFromPassword(PASSWORD)!;
    expect(verifyAdminToken(token)).toBe(true);
    expect(verifyAdminToken(null)).toBe(false);
    expect(verifyAdminToken("garbage")).toBe(false);
    expect(verifyAdminToken(token + "ff")).toBe(false); // tampered signature
    const [ts] = token.split(".");
    expect(verifyAdminToken(`${ts}.${"0".repeat(64)}`)).toBe(false); // forged signature
  });

  it("rejects an expired but validly-signed token", () => {
    const oldTs = (Date.now() - 24 * 60 * 60 * 1000).toString(36); // 24h ago
    const sig = crypto.createHmac("sha256", SECRET).update(`admin.${oldTs}`).digest("hex");
    expect(verifyAdminToken(`${oldTs}.${sig}`)).toBe(false);
  });

  it("does not issue tokens when no admin password is configured", () => {
    delete process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_SESSION_SECRET;
    expect(issueAdminTokenFromPassword("anything")).toBeNull();
  });

  it("authorizes requests via the Bearer header", () => {
    const token = issueAdminTokenFromPassword(PASSWORD)!;
    expect(authorizeAdminRequest(`Bearer ${token}`)).toBe(true);
    expect(authorizeAdminRequest(token)).toBe(false); // missing scheme
    expect(authorizeAdminRequest(null)).toBe(false);
  });
});
