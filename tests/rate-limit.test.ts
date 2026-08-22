import { describe, expect, it } from "vitest";
import { checkRateLimit, clientIp, rateLimitHeaders, resetRateLimits } from "@/server/rate-limit";

describe("checkRateLimit", () => {
  it("allows up to the limit per window, then blocks with a reset time", () => {
    resetRateLimits();
    const now = 1_000_000;
    for (let i = 1; i <= 3; i++) {
      const r = checkRateLimit("k", 3, 60_000, now + i);
      expect(r.allowed).toBe(true);
      expect(r.remaining).toBe(3 - i);
    }
    const blocked = checkRateLimit("k", 3, 60_000, now + 10);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetAt).toBeGreaterThan(now);
  });

  it("resets after the window expires", () => {
    resetRateLimits();
    const now = 2_000_000;
    checkRateLimit("k2", 1, 60_000, now);
    expect(checkRateLimit("k2", 1, 60_000, now + 1).allowed).toBe(false);
    expect(checkRateLimit("k2", 1, 60_000, now + 60_001).allowed).toBe(true);
  });

  it("keeps keys independent", () => {
    resetRateLimits();
    const now = 3_000_000;
    checkRateLimit("a", 1, 60_000, now);
    expect(checkRateLimit("b", 1, 60_000, now).allowed).toBe(true);
  });
});

describe("clientIp", () => {
  it("takes the first X-Forwarded-For entry, falls back to unknown", () => {
    const req = new Request("http://localhost/x", {
      headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" },
    });
    expect(clientIp(req)).toBe("203.0.113.7");
    expect(clientIp(new Request("http://localhost/x"))).toBe("unknown");
  });
});

describe("rateLimitHeaders", () => {
  it("adds Retry-After only when blocked", () => {
    const ok = rateLimitHeaders({ allowed: true, remaining: 2, resetAt: Date.now() + 1000 }, 3);
    expect(ok["Retry-After"]).toBeUndefined();
    const blocked = rateLimitHeaders({ allowed: false, remaining: 0, resetAt: Date.now() + 5000 }, 3);
    expect(Number(blocked["Retry-After"])).toBeGreaterThanOrEqual(0);
  });
});
