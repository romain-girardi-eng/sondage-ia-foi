import { describe, it, expect, beforeEach, vi } from 'vitest';
import { rateLimit, getRateLimitHeaders } from './rateLimit';

describe('rateLimit', () => {
  beforeEach(() => {
    // Reset the rate limit map between tests by using different identifiers
    vi.useFakeTimers();
  });

  it('allows first request', () => {
    const result = rateLimit('test-user-1');
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(99);
  });

  it('decrements remaining count on subsequent requests', () => {
    const result1 = rateLimit('test-user-2');
    const result2 = rateLimit('test-user-2');
    const result3 = rateLimit('test-user-2');

    expect(result1.remaining).toBe(99);
    expect(result2.remaining).toBe(98);
    expect(result3.remaining).toBe(97);
  });

  it('rejects requests after limit is reached', () => {
    const identifier = 'test-user-exhausted';

    // Exhaust the limit
    for (let i = 0; i < 100; i++) {
      rateLimit(identifier);
    }

    const result = rateLimit(identifier);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('resets after window expires', () => {
    const identifier = 'test-user-reset';

    // Make a request
    rateLimit(identifier);

    // Advance time past the window
    vi.advanceTimersByTime(61000);

    // New request should start fresh
    const result = rateLimit(identifier);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(99);
  });

  it('tracks different identifiers separately', () => {
    const result1 = rateLimit('user-a');
    const result2 = rateLimit('user-b');

    expect(result1.remaining).toBe(99);
    expect(result2.remaining).toBe(99);
  });
});

describe('getRateLimitHeaders', () => {
  it('returns correct headers', () => {
    const result = {
      success: true,
      remaining: 95,
      resetIn: 30000,
      maxRequests: 100,
    };

    const headers = getRateLimitHeaders(result);

    expect(headers['X-RateLimit-Limit']).toBe('100');
    expect(headers['X-RateLimit-Remaining']).toBe('95');
    expect(headers['X-RateLimit-Reset']).toBe('30');
  });

  it('rounds up reset time', () => {
    const result = {
      success: true,
      remaining: 50,
      resetIn: 15500,
      maxRequests: 100,
    };

    const headers = getRateLimitHeaders(result);
    expect(headers['X-RateLimit-Reset']).toBe('16');
  });
});
