/**
 * Client IP extraction and pseudonymization.
 *
 * Extraction: the leftmost x-forwarded-for entry is attacker-controlled
 * (clients can send their own XFF header). On Vercel, x-real-ip is set by
 * the platform and cannot be spoofed; the rightmost XFF entry is the one
 * appended by the trusted proxy. We therefore prefer x-real-ip, then the
 * rightmost XFF entry.
 *
 * Pseudonymization: raw IPs are never persisted. hashIp() derives a keyed
 * HMAC-SHA256 (IP_HASH_SALT) so equality-based anti-abuse checks keep
 * working without storing the address itself. Fail-closed in production.
 */

const IP_HASH_SALT =
  process.env.IP_HASH_SALT ||
  (process.env.NODE_ENV !== "production" ? "dev-only-ip-hash-salt" : undefined);

let cachedIpHashKey: Promise<CryptoKey> | null = null;

function getIpHashKey(): Promise<CryptoKey> {
  if (!IP_HASH_SALT) {
    throw new Error("IP_HASH_SALT environment variable is required in production");
  }

  if (!cachedIpHashKey) {
    const encoder = new TextEncoder();
    cachedIpHashKey = crypto.subtle.importKey(
      "raw",
      encoder.encode(IP_HASH_SALT),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
  }

  return cachedIpHashKey;
}

export function getClientIp(request: Request): string {
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const entries = forwardedFor.split(",").map((entry) => entry.trim()).filter(Boolean);
    if (entries.length > 0) {
      return entries[entries.length - 1];
    }
  }

  return "unknown";
}

export async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await getIpHashKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(ip.trim()));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getHashedClientIp(request: Request): Promise<string> {
  return hashIp(getClientIp(request));
}
