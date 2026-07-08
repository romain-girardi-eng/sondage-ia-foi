/**
 * Unit Tests for Client IP Extraction and Pseudonymization
 *
 * getClientIp() feeds anti-abuse/duplicate-detection logic, so header
 * precedence and anti-spoofing behavior (rightmost XFF entry, not the
 * client-controlled leftmost one) must hold exactly. hashIp() must never
 * leak or reversibly expose raw addresses.
 */

import { describe, it, expect } from 'vitest';
import { getClientIp, hashIp, getHashedClientIp } from './clientIp';

function requestWithHeaders(headers: Record<string, string>): Request {
  return new Request('https://example.com/api/submit', { headers });
}

// ==========================================
// getClientIp
// ==========================================

describe('getClientIp', () => {
  it('prefers x-real-ip over x-forwarded-for when both are present', () => {
    const request = requestWithHeaders({
      'x-real-ip': '203.0.113.10',
      'x-forwarded-for': '198.51.100.1, 198.51.100.2',
    });
    expect(getClientIp(request)).toBe('203.0.113.10');
  });

  it('trims whitespace around x-real-ip', () => {
    const request = requestWithHeaders({ 'x-real-ip': '  203.0.113.10  ' });
    expect(getClientIp(request)).toBe('203.0.113.10');
  });

  it('falls back to the rightmost x-forwarded-for entry (anti-spoofing)', () => {
    // The leftmost entry is client-controlled and cannot be trusted; the
    // rightmost entry is the one appended by our trusted proxy.
    const request = requestWithHeaders({
      'x-forwarded-for': '203.0.113.10, 198.51.100.1, 198.51.100.2',
    });
    expect(getClientIp(request)).toBe('198.51.100.2');
  });

  it('returns the single entry when x-forwarded-for has only one IP', () => {
    const request = requestWithHeaders({ 'x-forwarded-for': '203.0.113.10' });
    expect(getClientIp(request)).toBe('203.0.113.10');
  });

  it('trims whitespace around each x-forwarded-for entry', () => {
    const request = requestWithHeaders({
      'x-forwarded-for': '  203.0.113.10  ,   198.51.100.2   ',
    });
    expect(getClientIp(request)).toBe('198.51.100.2');
  });

  it('ignores empty entries produced by stray commas in x-forwarded-for', () => {
    const request = requestWithHeaders({
      'x-forwarded-for': '203.0.113.10, , 198.51.100.2,',
    });
    expect(getClientIp(request)).toBe('198.51.100.2');
  });

  it("returns 'unknown' when neither header is present", () => {
    const request = requestWithHeaders({});
    expect(getClientIp(request)).toBe('unknown');
  });

  it("returns 'unknown' when x-forwarded-for is present but contains only whitespace/commas", () => {
    const request = requestWithHeaders({ 'x-forwarded-for': ' , , ' });
    expect(getClientIp(request)).toBe('unknown');
  });

  it('does not fall back to x-forwarded-for when x-real-ip is an empty string', () => {
    // Headers.get returns "" for an explicitly empty header value, which is
    // falsy, so the function should fall through to x-forwarded-for.
    const request = requestWithHeaders({
      'x-real-ip': '',
      'x-forwarded-for': '198.51.100.9',
    });
    expect(getClientIp(request)).toBe('198.51.100.9');
  });
});

// ==========================================
// hashIp
// ==========================================

describe('hashIp', () => {
  it('produces a 64-character lowercase hex digest (SHA-256 HMAC)', async () => {
    const hash = await hashIp('203.0.113.10');
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('is deterministic for the same input', async () => {
    const first = await hashIp('203.0.113.10');
    const second = await hashIp('203.0.113.10');
    expect(first).toBe(second);
  });

  it('produces different hashes for different inputs', async () => {
    const a = await hashIp('203.0.113.10');
    const b = await hashIp('203.0.113.11');
    expect(a).not.toBe(b);
  });

  it('trims the input before hashing (equivalent whitespace-padded IPs hash identically)', async () => {
    const a = await hashIp('203.0.113.10');
    const b = await hashIp('  203.0.113.10  ');
    expect(a).toBe(b);
  });

  it("produces a different hash for the literal string 'unknown' than for a real IP", async () => {
    const unknown = await hashIp('unknown');
    const real = await hashIp('203.0.113.10');
    expect(unknown).not.toBe(real);
    expect(unknown).toMatch(/^[0-9a-f]{64}$/);
  });
});

// ==========================================
// getHashedClientIp (integration of getClientIp + hashIp)
// ==========================================

describe('getHashedClientIp', () => {
  it('hashes the IP resolved by getClientIp (x-real-ip precedence)', async () => {
    const request = requestWithHeaders({
      'x-real-ip': '203.0.113.10',
      'x-forwarded-for': '198.51.100.1, 198.51.100.2',
    });
    const expected = await hashIp('203.0.113.10');
    expect(await getHashedClientIp(request)).toBe(expected);
  });

  it('hashes the rightmost x-forwarded-for entry when x-real-ip is absent', async () => {
    const request = requestWithHeaders({
      'x-forwarded-for': '203.0.113.10, 198.51.100.2',
    });
    const expected = await hashIp('198.51.100.2');
    expect(await getHashedClientIp(request)).toBe(expected);
  });

  it("hashes 'unknown' deterministically when no IP headers are present", async () => {
    const request = requestWithHeaders({});
    const first = await getHashedClientIp(request);
    const second = await getHashedClientIp(requestWithHeaders({}));
    expect(first).toBe(second);
    expect(first).toBe(await hashIp('unknown'));
  });
});
