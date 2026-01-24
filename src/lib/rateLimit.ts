// Simple in-memory rate limiter for serverless
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');

export function rateLimit(identifier: string): { success: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  // Clean up old entries periodically
  if (rateLimitMap.size > 10000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!record || record.resetTime < now) {
    // New window
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return { success: true, remaining: MAX_REQUESTS - 1, resetIn: WINDOW_MS };
  }

  if (record.count >= MAX_REQUESTS) {
    return {
      success: false,
      remaining: 0,
      resetIn: record.resetTime - now,
    };
  }

  record.count++;
  return {
    success: true,
    remaining: MAX_REQUESTS - record.count,
    resetIn: record.resetTime - now,
  };
}

export function getRateLimitHeaders(result: ReturnType<typeof rateLimit>) {
  return {
    'X-RateLimit-Limit': MAX_REQUESTS.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetIn / 1000).toString(),
  };
}
