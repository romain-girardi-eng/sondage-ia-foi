// Simple in-memory rate limiter for serverless
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const botDetectionMap = new Map<string, { flagged: boolean; reason: string; timestamp: number }>();

// Default limits - can be overridden with env vars
const DEFAULT_LIMITS = {
  general: {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  },
  submit: {
    maxRequests: parseInt(process.env.RATE_LIMIT_SUBMIT_MAX || '5'),
    windowMs: parseInt(process.env.RATE_LIMIT_SUBMIT_WINDOW || '3600000'), // 1 hour
  },
  partial: {
    maxRequests: parseInt(process.env.RATE_LIMIT_PARTIAL_MAX || '60'),
    windowMs: parseInt(process.env.RATE_LIMIT_PARTIAL_WINDOW || '60000'), // 1 minute
  },
} as const;

type RateLimitType = keyof typeof DEFAULT_LIMITS;

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number;
  maxRequests: number;
}

/**
 * Rate limiter with configurable limits per endpoint type
 */
export function rateLimit(identifier: string, type: RateLimitType = 'general'): RateLimitResult {
  const now = Date.now();
  const limits = DEFAULT_LIMITS[type];
  const key = `${type}:${identifier}`;
  const record = rateLimitMap.get(key);

  // Clean up old entries periodically
  if (rateLimitMap.size > 10000) {
    for (const [mapKey, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(mapKey);
      }
    }
  }

  // Clean up old bot detection entries
  if (botDetectionMap.size > 5000) {
    for (const [mapKey, value] of botDetectionMap.entries()) {
      // Remove entries older than 24 hours
      if (now - value.timestamp > 86400000) {
        botDetectionMap.delete(mapKey);
      }
    }
  }

  // Check if this IP is already flagged as a bot
  const botFlag = botDetectionMap.get(identifier);
  if (botFlag?.flagged && now - botFlag.timestamp < 86400000) {
    return {
      success: false,
      remaining: 0,
      resetIn: 86400000 - (now - botFlag.timestamp),
      maxRequests: limits.maxRequests,
    };
  }

  if (!record || record.resetTime < now) {
    // New window
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + limits.windowMs,
    });
    return { success: true, remaining: limits.maxRequests - 1, resetIn: limits.windowMs, maxRequests: limits.maxRequests };
  }

  if (record.count >= limits.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn: record.resetTime - now,
      maxRequests: limits.maxRequests,
    };
  }

  record.count++;
  return {
    success: true,
    remaining: limits.maxRequests - record.count,
    resetIn: record.resetTime - now,
    maxRequests: limits.maxRequests,
  };
}

/**
 * Generate rate limit headers for HTTP response
 */
export function getRateLimitHeaders(result: RateLimitResult) {
  return {
    'X-RateLimit-Limit': result.maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetIn / 1000).toString(),
  };
}

/**
 * Honeypot detection - checks for fields that should never be filled
 * Returns true if request appears to be from a bot
 */
export function detectHoneypot(body: Record<string, unknown>): { isBot: boolean; reason?: string } {
  // Check for common honeypot field names that should never be filled
  const honeypotFields = ['website', 'url', 'phone2', 'fax', 'company_url', 'honeypot', '_gotcha'];

  for (const field of honeypotFields) {
    if (body[field] && String(body[field]).trim() !== '') {
      return { isBot: true, reason: `honeypot_field:${field}` };
    }
  }

  // Check for suspiciously fast submissions (less than 10 seconds for full survey)
  if (body.metadata && typeof body.metadata === 'object') {
    const metadata = body.metadata as Record<string, unknown>;
    if (metadata.timeSpent && typeof metadata.timeSpent === 'number') {
      if (metadata.timeSpent < 10000) {
        // Less than 10 seconds
        return { isBot: true, reason: 'too_fast' };
      }
    }
  }

  return { isBot: false };
}

/**
 * Flag an IP as a potential bot
 */
export function flagAsBot(identifier: string, reason: string): void {
  botDetectionMap.set(identifier, {
    flagged: true,
    reason,
    timestamp: Date.now(),
  });
}

/**
 * Get stricter rate limiting for submit endpoint
 */
export function rateLimitSubmit(identifier: string): RateLimitResult {
  return rateLimit(identifier, 'submit');
}

/**
 * Get more lenient rate limiting for partial saves
 */
export function rateLimitPartial(identifier: string): RateLimitResult {
  return rateLimit(identifier, 'partial');
}
