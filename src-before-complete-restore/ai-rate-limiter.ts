// Simple in-memory rate limiter for AI requests
// In production, use Redis or similar for distributed rate limiting

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class AIRateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly windowMs = 60000; // 1 minute window
  private readonly maxRequests = 100; // Increased from 50 to 100 per minute

  async checkLimit(userId: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    const now = Date.now();
    const userLimit = this.limits.get(userId);

    // Clean up old entries
    if (userLimit && now > userLimit.resetTime) {
      this.limits.delete(userId);
    }

    // Get current limit or create new
    const limit = this.limits.get(userId) || { count: 0, resetTime: now + this.windowMs };

    // Check if limit exceeded
    if (limit.count >= this.maxRequests) {
      const retryAfter = Math.ceil((limit.resetTime - now) / 1000); // seconds
      return { allowed: false, retryAfter };
    }

    // Increment count
    limit.count++;
    this.limits.set(userId, limit);

    return { allowed: true };
  }

  // Get current usage for a user
  getUsage(userId: string): { used: number; remaining: number; resetIn: number } {
    const now = Date.now();
    const userLimit = this.limits.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
      return { used: 0, remaining: this.maxRequests, resetIn: 0 };
    }

    return {
      used: userLimit.count,
      remaining: Math.max(0, this.maxRequests - userLimit.count),
      resetIn: Math.ceil((userLimit.resetTime - now) / 1000)
    };
  }

  // Reset limits for a user (e.g., for premium users)
  resetUser(userId: string) {
    this.limits.delete(userId);
  }

  // Clear all limits (for testing)
  clearAll() {
    this.limits.clear();
  }
}

// Global instance
export const aiRateLimiter = new AIRateLimiter();

// Rate limit configurations per plan
export const AI_RATE_LIMITS = {
  free: { perMinute: 5, perDay: 5 },
  starter: { perMinute: 10, perDay: 25 },
  professional: { perMinute: 20, perDay: 100 },
  business: { perMinute: 50, perDay: 500 },
  enterprise: { perMinute: 200, perDay: -1 } // unlimited daily
};