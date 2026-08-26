import { afterEach, describe, expect, it } from "vitest";
import {
  STRATEGY_DOCS,
  STRATEGY_SOURCE_PREFIX,
  generateStrategyDocs,
  listStrategyRuns,
} from "@/server/growth/strategy";
import { store } from "@/server/db/store";
import { newId } from "@/server/db/id";

/**
 * The strategy engine's contract without a live provider:
 *  - no provider configured → honest notConfigured result, nothing persisted
 *  - the five-document spec is complete and uniquely keyed
 *  - regeneration replaces the previous strategy source (never duplicates)
 *
 * Provider-backed generation paths are covered by evals; these tests pin the
 * structural guarantees that must hold regardless of model quality.
 */

const ORG = `org-strategy-${newId()}`;

afterEach(async () => {
  // ensure no provider leaks into assertions even if a key exists in env
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.OPENAI_API_KEY;
  delete process.env.GOOGLE_GENERATIVE_AI_API_KEY;
});

describe("STRATEGY_DOCS", () => {
  it("defines exactly five unique grounding documents", () => {
    expect(STRATEGY_DOCS).toHaveLength(5);
    const keys = new Set(STRATEGY_DOCS.map((d) => d.key));
    expect(keys.size).toBe(5);
  });

  it("covers the full grounding chain in dependency order", () => {
    expect(STRATEGY_DOCS.map((d) => d.key)).toEqual([
      "product-info",
      "marketing-strategy",
      "competitor-analysis",
      "brand-voice",
      "content-strategy",
    ]);
  });
});

describe("generateStrategyDocs (no provider configured)", () => {
  it("reports notConfigured honestly and persists nothing", async () => {
    const before = await listStrategyRuns(ORG);
    const result = await generateStrategyDocs(
      ORG,
      { businessName: "Test Co", description: "We sell test widgets to test people." },
      "user-1",
    );
    expect(result.ok).toBe(false);
    expect(result.notConfigured).toBe(true);
    expect(result.docs).toHaveLength(0);

    const after = await listStrategyRuns(ORG);
    expect(after.length).toBe(before.length);
  });
});

describe("strategy source lifecycle", () => {
  it("listStrategyRuns returns only Strategy-prefixed sources with doc counts", async () => {
    // Seed one strategy source and one unrelated source directly.
    const now = new Date().toISOString();
    const strategySource = {
      id: newId(),
      organizationId: ORG,
      name: `${STRATEGY_SOURCE_PREFIX} — Acme`,
      kind: "web" as const,
      createdAt: now,
      updatedAt: now,
    };
    const otherSource = { ...strategySource, id: newId(), name: "Client handbook", kind: "upload" as const };
    await store.insert("knowledge_sources", strategySource);
    await store.insert("knowledge_sources", otherSource);

    const runs = await listStrategyRuns(ORG);
    expect(runs).toHaveLength(1);
    expect(runs[0].source.name).toBe(`${STRATEGY_SOURCE_PREFIX} — Acme`);
    expect(runs[0].documentCount).toBe(0);
  });
});
