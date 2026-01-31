/**
 * Rate Limiting Middleware
 * 
 * IP-based rate limiting to prevent abuse:
 * - Auth endpoints: 5 requests/minute
 * - Booking creation: 10 requests/hour
 * - Payment intents: 5 requests/hour
 * 
 * In-memory storage (upgrade to Redis for multi-instance deployment)
 */

type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

type RateLimitStore = {
  [key: string]: {
    count: number;
    resetTime: number;
  };
};

const store: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

/**
 * Rate limit checker
 * Returns true if rate limit exceeded
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { limited: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const key = identifier;

  // Initialize or get existing record
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + config.windowMs,
    };

    return {
      limited: false,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    };
  }

  // Increment count
  store[key].count++;

  const remaining = Math.max(0, config.maxRequests - store[key].count);
  const resetIn = store[key].resetTime - now;

  return {
    limited: store[key].count > config.maxRequests,
    remaining,
    resetIn,
  };
}

/**
 * Rate limit configurations
 */
export const RateLimits = {
  AUTH: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
  },
  BOOKING_CREATE: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  PAYMENT_INTENT: {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  DEFAULT: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
  },
} as const;

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
  // Check Vercel/Cloudflare headers first
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback to connection IP (not reliable behind proxy)
  return "unknown";
}

/**
 * Rate limit response helper
 */
export function rateLimitResponse(resetIn: number) {
  return new Response(
    JSON.stringify({
      error: "Too many requests. Please try again later.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": Math.ceil(resetIn / 1000).toString(),
        "X-RateLimit-Reset": new Date(Date.now() + resetIn).toISOString(),
      },
    }
  );
}
