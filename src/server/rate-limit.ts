import "server-only";

/**
 * In-memory sliding-window rate limiter for public, unauthenticated endpoints
 * (the audit-request funnel today).
 *
 * Honest scope: the buckets live in this process's memory. That is correct for
 * a single-instance deployment; a multi-instance deployment needs a shared
 * store (Redis or similar) before this can be called production-grade. It is
 * a friction layer against casual abuse, never the only defense — validation,
 * authorization, and audit logging remain the primary controls.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** epoch ms when the window resets */
  resetAt: number;
}

/**
 * Consume one unit of `key`'s window. Pure with respect to `now` (injectable
 * for tests). Prunes expired buckets and caps memory at MAX_BUCKETS.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimitResult {
  const existing = buckets.get(key);
  if (existing && existing.resetAt > now) {
    if (existing.count >= limit) {
      return { allowed: false, remaining: 0, resetAt: existing.resetAt };
    }
    existing.count += 1;
    return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
  }

  // new or expired window
  if (buckets.size >= MAX_BUCKETS) {
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k);
      if (buckets.size < MAX_BUCKETS) break;
    }
    if (buckets.size >= MAX_BUCKETS) {
      // still full — drop the oldest entry (Map keeps insertion order)
      const oldest = buckets.keys().next().value;
      if (oldest !== undefined) buckets.delete(oldest);
    }
  }

  const resetAt = now + windowMs;
  buckets.set(key, { count: 1, resetAt });
  return { allowed: true, remaining: limit - 1, resetAt };
}

/** Test/maintenance escape hatch. */
export function resetRateLimits(): void {
  buckets.clear();
}

/** Standard response headers describing the window. */
export function rateLimitHeaders(result: RateLimitResult, limit: number): Record<string, string> {
  const retryAfterSec = Math.max(0, Math.ceil((result.resetAt - Date.now()) / 1000));
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(result.remaining),
  };
  if (!result.allowed) headers["Retry-After"] = String(retryAfterSec);
  return headers;
}

/**
 * Best-effort client address. Behind a trusted proxy the first
 * X-Forwarded-For entry is the client; without one everything shares the
 * "unknown" bucket, which still bounds total throughput.
 */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") ?? "unknown";
}
