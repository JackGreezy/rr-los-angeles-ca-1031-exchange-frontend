import { NextRequest } from 'next/server';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

class ApiRateLimiter {
  private requests = new Map<string, { count: number; resetTime: number }>();
  private readonly limit = 5;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes

  isAllowed(request: NextRequest): RateLimitResult {
    const ip = this.getClientIP(request);
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Clean up old entries
    this.cleanup(windowStart);

    const key = ip;
    const current = this.requests.get(key);

    if (!current || current.resetTime <= now) {
      const resetTime = now + this.windowMs;
      this.requests.set(key, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: this.limit - 1,
        resetTime,
      };
    }

    if (current.count >= this.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
      };
    }

    current.count++;
    this.requests.set(key, current);

    return {
      allowed: true,
      remaining: this.limit - current.count,
      resetTime: current.resetTime,
    };
  }

  private getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');
    const cfConnecting = request.headers.get('cf-connecting-ip');

    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    if (realIP) {
      return realIP;
    }
    if (cfConnecting) {
      return cfConnecting;
    }
    return 'unknown';
  }

  private cleanup(windowStart: number): void {
    for (const [key, value] of this.requests.entries()) {
      if (value.resetTime <= windowStart) {
        this.requests.delete(key);
      }
    }
  }
}

export const apiRateLimiter = new ApiRateLimiter();
