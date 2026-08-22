import { describe, expect, it } from "vitest";
import {
  createAuditFromFunnel,
  createOpportunity,
  getAudit,
  getAutomspOrg,
  getOpportunity,
  listOpportunities,
  setAuditStatus,
  summarizePipeline,
} from "@/server/commercial";
import { store } from "@/server/db/store";
import type { OpportunityRecord } from "@/server/db/types";

const OPERATOR_ORG = "org-operator";
const CUSTOMER_ORG = "org-customer";

async function ensureOperatorOrg() {
  const existing = await store.first("organizations", (o) => o.id === OPERATOR_ORG);
  if (!existing) {
    const now = new Date().toISOString();
    await store.insert("organizations", {
      id: OPERATOR_ORG,
      name: "Test Operator",
      slug: "test-operator",
      kind: "automsp",
      createdAt: now,
      updatedAt: now,
    });
  }
}

function opp(overrides: Partial<OpportunityRecord>): OpportunityRecord {
  const now = new Date().toISOString();
  return {
    id: `opp-${Math.random().toString(36).slice(2)}`,
    organizationId: OPERATOR_ORG,
    company: "Test Co",
    contactName: null,
    contactEmail: null,
    source: null,
    industry: null,
    size: null,
    estimatedValue: null,
    stage: "new",
    probability: null,
    expectedClose: null,
    owner: null,
    notes: null,
    nextAction: null,
    createdAt: now,
    updatedAt: now,
    createdBy: null,
    ...overrides,
  };
}

describe("summarizePipeline", () => {
  it("counts open stages and sums user-entered estimates", () => {
    const rows = [
      opp({ estimatedValue: 25_000, probability: 60, stage: "discovery" }),
      opp({ estimatedValue: 10_000, probability: 20, stage: "proposal" }),
      opp({ estimatedValue: 50_000, stage: "won" }), // closed — excluded
      opp({ stage: "new" }), // open but no value
    ];
    const s = summarizePipeline(rows);
    expect(s.openCount).toBe(3);
    expect(s.estimatedPipelineUsd).toBe(35_000);
    expect(s.weightedPipelineUsd).toBeCloseTo(25_000 * 0.6 + 10_000 * 0.2, 2);
    expect(s.byStage.find((b) => b.stage === "won")?.count).toBe(1);
  });

  it("returns null totals when no open opportunity carries a value — never 0", () => {
    const s = summarizePipeline([opp({ stage: "new" }), opp({ stage: "qualified" })]);
    expect(s.openCount).toBe(2);
    expect(s.estimatedPipelineUsd).toBeNull();
    expect(s.weightedPipelineUsd).toBeNull();
  });
});

describe("funnel intake", () => {
  it("writes an audit into the operator org and opens a matching opportunity", async () => {
    await ensureOperatorOrg();
    const org = await getAutomspOrg();
    expect(org?.id).toBe(OPERATOR_ORG);

    const audit = await createAuditFromFunnel({
      company: "Unit Test Logistics",
      name: "Test Person",
      email: "test@unit-test.example",
      role: "COO",
      companySize: "50–200 employees",
      industry: "Logistics & Supply Chain",
      bottlenecks: "Manual dispatch planning.",
      aiUsage: "Experiments / pilots only",
    });
    expect(audit).not.toBeNull();
    expect(audit?.organizationId).toBe(OPERATOR_ORG);
    expect(audit?.status).toBe("received");

    const auto = (await listOpportunities(OPERATOR_ORG)).find(
      (o) => o.company === "Unit Test Logistics" && o.source === "audit-funnel",
    );
    expect(auto).toBeDefined();
    expect(auto?.stage).toBe("new");
  });
});

describe("tenant isolation", () => {
  it("blocks cross-tenant reads and writes at the service layer", async () => {
    await ensureOperatorOrg();
    const created = await createOpportunity(OPERATOR_ORG, { company: "Isolated Co" });

    // another org cannot read it
    expect(await getOpportunity(CUSTOMER_ORG, created.id)).toBeNull();
    // another org cannot change an audit it doesn't own
    const audit = await createAuditFromFunnel({
      company: "Isolated Audit Co",
      name: "X",
      email: "x@isolated.example",
      role: "COO",
      companySize: "1–50 employees",
      industry: "Other",
      bottlenecks: "Everything is manual.",
      aiUsage: "No AI in production",
    });
    expect(await setAuditStatus(CUSTOMER_ORG, audit!.id, "declined")).toBeNull();
    expect((await getAudit(OPERATOR_ORG, audit!.id))?.status).toBe("received");
  });
});
