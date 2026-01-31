/**
 * Server Action Rate Limiting Wrapper
 * 
 * For server actions (not API routes), we need to check rate limits
 * by wrapping critical actions with rate limit checks
 */

import { headers } from "next/headers";
import { checkRateLimit, RateLimits, getClientIp } from "./rate-limit";

export { RateLimits };

/**
 * Rate limit wrapper for server actions
 * 
 * Usage:
 * const result = await withRateLimit("action-name", RateLimits.PAYMENT_INTENT, async () => {
 *   // Your action logic
 * });
 */
export async function withRateLimit<T>(
  actionName: string,
  config: typeof RateLimits[keyof typeof RateLimits],
  action: () => Promise<T>
): Promise<T | { success: false; error: string }> {
  try {
    const headersList = await headers();
    
    // Create a Request-like object for getClientIp
    const mockRequest = {
      headers: {
        get: (name: string) => headersList.get(name),
      },
    } as Request;

    const clientIp = getClientIp(mockRequest);
    const rateCheck = checkRateLimit(`${actionName}:${clientIp}`, config);

    if (rateCheck.limited) {
      return {
        success: false,
        error: `Too many requests. Please try again in ${Math.ceil(rateCheck.resetIn / 1000)} seconds.`,
      };
    }

    return await action();
  } catch (error) {
    console.error(`[Rate Limit] Error in ${actionName}:`, error);
    throw error;
  }
}
