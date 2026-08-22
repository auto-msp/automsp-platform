import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  billingConfigured,
  billingOverview,
  getPlan,
  PLANS,
  recordUsage,
  usageTotals,
} from "@/server/billing";
import { store } from "@/server/db/store";

const ORG = "org-billing-test";

async function clearUsage() {
  const rows = await store.find("usage_records", (r) => r.organizationId === ORG);
  for (const r of rows) await store.remove("usage_records", r.id);
}

describe("plan catalog", () => {
  it("prices match the published offer", () => {
    expect(getPlan("sprint")?.monthlyPriceUsd).toBe(0);
    expect(getPlan("operations")?.monthlyPriceUsd).toBe(1450);
    expect(getPlan("platform")?.includedExecutions).toBeNull();
    expect(getPlan("nope")).toBeNull();
  });

  it("every plan has entitlements and copy", () => {
    for (const p of PLANS) {
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.blurb.length).toBeGreaterThan(0);
    }
  });
});

describe("billingConfigured", () => {
  const original = process.env.STRIPE_SECRET_KEY;
  afterEach(() => {
    if (original === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = original;
  });

  it("is false without a key, true with one", () => {
    delete process.env.STRIPE_SECRET_KEY;
    expect(billingConfigured()).toBe(false);
    process.env.STRIPE_SECRET_KEY = "sk_test_dummy";
    expect(billingConfigured()).toBe(true);
    process.env.STRIPE_SECRET_KEY = "   ";
    expect(billingConfigured()).toBe(false);
  });
});

describe("usageTotals", () => {
  beforeEach(clearUsage);

  it("sums real usage rows per meter for the current period", async () => {
    await recordUsage(ORG, "executions", 120);
    await recordUsage(ORG, "tokens", 540_000, 0.0009); // cents per token
    const totals = await usageTotals(ORG);
    const exec = totals.find((t) => t.meter === "executions");
    const tokens = totals.find((t) => t.meter === "tokens");
    expect(exec?.total).toBe(120);
    // no unit price on the executions rows → cost unknown, never invented
    expect(exec?.estimatedCostUsd).toBeNull();
    expect(tokens?.total).toBe(540_000);
    expect(tokens?.estimatedCostUsd).toBeCloseTo(4.86, 2);
  });

  it("reports null cost when only some rows carry a unit price", async () => {
    await recordUsage(ORG, "tokens", 1000, 0.001);
    await recordUsage(ORG, "tokens", 1000); // unpriced row
    const totals = await usageTotals(ORG);
    const tokens = totals.find((t) => t.meter === "tokens");
    expect(tokens?.total).toBe(2000);
    expect(tokens?.estimatedCostUsd).toBeNull();
  });

  it("ignores other organizations' usage", async () => {
    await recordUsage("org-other", "executions", 999);
    const totals = await usageTotals(ORG);
    expect(totals.find((t) => t.meter === "executions")?.total).toBe(0);
  });
});

describe("billingOverview", () => {
  it("is honest when nothing is configured: no fabricated subscription", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const overview = await billingOverview(ORG);
    expect(overview.configured).toBe(false);
    expect(overview.subscription).toBeNull();
    expect(overview.plan).toBeNull();
    expect(overview.invoices).toEqual([]);
    expect(overview.usage).toHaveLength(3);
  });
});
