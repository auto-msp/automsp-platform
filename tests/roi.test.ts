import { describe, expect, it } from "vitest";
import { computeRoi, DEFAULT_LABOR_RATE_USD, laborRateForOrg, setLaborRateForOrg } from "@/server/ops/roi";

describe("computeRoi", () => {
  it("values time avoided at the labor rate and nets AI cost", () => {
    const roi = computeRoi({ estMinutesSaved: 120, aiCostEstimatedUsd: 2.5 }, 80);
    expect(roi.estHoursSaved).toBe(2);
    expect(roi.estLaborValueUsd).toBe(160);
    expect(roi.netValueUsd).toBe(157.5);
    expect(roi.roiMultiple).toBe(64);
    // every line is labeled estimated with a method a reader can check
    for (const m of roi.methods) {
      expect(m.basis).toBe("estimated");
      expect(m.method.length).toBeGreaterThan(0);
    }
  });

  it("is null-safe when model pricing is unknown — never invents a number", () => {
    const roi = computeRoi({ estMinutesSaved: 60, aiCostEstimatedUsd: null });
    expect(roi.estLaborValueUsd).toBe(DEFAULT_LABOR_RATE_USD);
    expect(roi.netValueUsd).toBeNull();
    expect(roi.roiMultiple).toBeNull();
    const costLine = roi.methods.find((m) => m.label === "AI cost");
    expect(costLine?.method).toMatch(/not computable/i);
  });

  it("does not divide by zero cost", () => {
    const roi = computeRoi({ estMinutesSaved: 60, aiCostEstimatedUsd: 0 });
    expect(roi.netValueUsd).toBe(45);
    expect(roi.roiMultiple).toBeNull();
  });
});

describe("labor rate assumption", () => {
  const ORG = "org-roi-test";

  it("defaults to $45/h and persists an org override as a metric row", async () => {
    expect(await laborRateForOrg(ORG)).toBe(45);
    await setLaborRateForOrg(ORG, 80);
    expect(await laborRateForOrg(ORG)).toBe(80);
    // most recent wins
    await setLaborRateForOrg(ORG, 95);
    expect(await laborRateForOrg(ORG)).toBe(95);
    // other orgs are unaffected
    expect(await laborRateForOrg("org-roi-other")).toBe(45);
  });
});
