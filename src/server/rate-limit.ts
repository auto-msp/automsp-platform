import "server-only";
import { activeStoreKind, store } from "@/server/db/store";
import type { RateLimitBucketRecord } from "@/server/db/types";

/**
 * Sliding-window rate limiter for public, unauthenticated endpoints (the
 * audit-request funnel today). Two backends behind one interface:
 *
 *  - In-memory (checkRateLimit): buckets live in this process's memory.
 *    Correct for a single-instance deployment and for local dev.
 *  - Shared store (checkRateLimitShared): buckets persist in the
 *    rate_limit_buckets table via the store abstraction, so multiple app
 *    instances behind one database share the same windows. Active whenever
 *    DATABASE_URL is set (checkRateLimitAuto picks it).
 *
 * Honest limits of the shared backend: the check is read-modify-write, not an
 * atomic increment, so N truly concurrent requests can overshoot the limit by
 * up to N-1. For a friction layer on a public funnel that is acceptable —
 * validation, authorization, and audit logging remain the primary controls.
 * Expired windows are overwritten in place per key, so the table grows with
 * the number of distinct keys, not with time.
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

/**
 * Shared-store backend: the same sliding window, persisted in
 * rate_limit_buckets so every app instance behind one database sees the same
 * counts. Read-modify-write, not atomic — see the module note on overshoot.
 * `now` is injectable for tests.
 */
export async function checkRateLimitShared(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): Promise<RateLimitResult> {
  const rows = await store.query("rate_limit_buckets", { key });
  const existing = rows[0];

  if (existing && Date.parse(existing.resetAt) > now) {
    if (existing.count >= limit) {
      return { allowed: false, remaining: 0, resetAt: Date.parse(existing.resetAt) };
    }
    const row: RateLimitBucketRecord = {
      key,
      count: existing.count + 1,
      resetAt: existing.resetAt,
    };
    await store.upsert("rate_limit_buckets", (b) => b.key === key, row);
    return { allowed: true, remaining: limit - row.count, resetAt: Date.parse(existing.resetAt) };
  }

  // New or expired window: overwrite the bucket in place.
  const resetAt = now + windowMs;
  const row: RateLimitBucketRecord = { key, count: 1, resetAt: new Date(resetAt).toISOString() };
  await store.upsert("rate_limit_buckets", (b) => b.key === key, row);
  return { allowed: true, remaining: limit - 1, resetAt };
}

/**
 * Pick the right backend for this deployment: the shared store when Postgres
 * is live (multi-instance safe), in-memory otherwise. Routes should call this
 * one, not the backends directly.
 */
export async function checkRateLimitAuto(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): Promise<RateLimitResult> {
  if (activeStoreKind() === "postgres") {
    return checkRateLimitShared(key, limit, windowMs, now);
  }
  return checkRateLimit(key, limit, windowMs, now);
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
