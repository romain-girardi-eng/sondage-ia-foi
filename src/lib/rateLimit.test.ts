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

describe('rateLimit - email bucket', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('allows up to 3 requests per hour by default', () => {
    const identifier = 'email-user-1';

    const result1 = rateLimit(identifier, 'email');
    const result2 = rateLimit(identifier, 'email');
    const result3 = rateLimit(identifier, 'email');

    expect(result1.success).toBe(true);
    expect(result1.remaining).toBe(2);
    expect(result2.success).toBe(true);
    expect(result2.remaining).toBe(1);
    expect(result3.success).toBe(true);
    expect(result3.remaining).toBe(0);
  });

  it('rejects the 4th request within the window', () => {
    const identifier = 'email-user-2';

    rateLimit(identifier, 'email');
    rateLimit(identifier, 'email');
    rateLimit(identifier, 'email');
    const result = rateLimit(identifier, 'email');

    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('resets after the 1 hour window expires', () => {
    const identifier = 'email-user-3';

    rateLimit(identifier, 'email');
    rateLimit(identifier, 'email');
    rateLimit(identifier, 'email');

    vi.advanceTimersByTime(3600001);

    const result = rateLimit(identifier, 'email');
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
  });

  it('does not share counters with the general bucket', () => {
    const identifier = 'email-user-4';

    rateLimit(identifier, 'general');
    const result = rateLimit(identifier, 'email');

    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
  });
});

describe('rateLimit - verifyEmail bucket', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('allows up to 5 requests per 15 minutes by default', () => {
    const identifier = 'verify-email-user-1';
    let result;

    for (let i = 0; i < 5; i++) {
      result = rateLimit(identifier, 'verifyEmail');
      expect(result.success).toBe(true);
    }

    expect(result!.remaining).toBe(0);
  });

  it('rejects the 6th request within the window', () => {
    const identifier = 'verify-email-user-2';

    for (let i = 0; i < 5; i++) {
      rateLimit(identifier, 'verifyEmail');
    }
    const result = rateLimit(identifier, 'verifyEmail');

    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('resets after the 15 minute window expires', () => {
    const identifier = 'verify-email-user-3';

    for (let i = 0; i < 5; i++) {
      rateLimit(identifier, 'verifyEmail');
    }

    vi.advanceTimersByTime(900001);

    const result = rateLimit(identifier, 'verifyEmail');
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
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
