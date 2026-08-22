import "server-only";
import { newId } from "@/server/db/id";
import { store } from "@/server/db/store";
import type {
  InvoiceRecord,
  SubscriptionRecord,
  UsageMeter,
  UsageRecordRecord,
} from "@/server/db/types";

/**
 * Billing. The rule that governs this module: no payment provider key ⇒ the
 * plan/subscription/invoice layer is reported as "not configured" and nothing
 * is simulated. What IS real here and always available is *metered usage* —
 * the platform already writes UsageRecords (executions, tokens, agent runs);
 * this module aggregates them. A Stripe-backed subscription only exists when
 * STRIPE_SECRET_KEY is present and a row was synced via webhook; this module
 * never fabricates one.
 */

export interface PlanEntitlement {
  key: string;
  name: string;
  /** soft monthly limits; null = unlimited. Informational until billing enforces. */
  includedExecutions: number | null;
  includedTokens: number | null;
  /** 0 = free */
  monthlyPriceUsd: number;
  blurb: string;
}

/** Static plan catalog — marketing-truth, not a live price list from a provider. */
export const PLANS: PlanEntitlement[] = [
  {
    key: "sprint",
    name: "Sprint",
    includedExecutions: 500,
    includedTokens: 1_000_000,
    /** one-off, not monthly */
    monthlyPriceUsd: 0,
    blurb: "14-Day Sprint pilot — prove value on one workflow before committing.",
  },
  {
    key: "operations",
    name: "Operations",
    includedExecutions: 5_000,
    includedTokens: 20_000_000,
    monthlyPriceUsd: 1_450,
    blurb: "A managed system of automations running core operations.",
  },
  {
    key: "platform",
    name: "Platform",
    includedExecutions: null,
    includedTokens: null,
    monthlyPriceUsd: 0,
    blurb: "Organization-wide program. Scoped per engagement.",
  },
];

export function getPlan(key: string): PlanEntitlement | null {
  return PLANS.find((p) => p.key === key) ?? null;
}

export function billingConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export interface UsageTotals {
  meter: UsageMeter;
  total: number;
  /** unit cost only when a price is configured per unit; otherwise null */
  estimatedCostUsd: number | null;
}

export interface BillingOverview {
  configured: boolean;
  /** null unless a subscription row actually exists (synced from Stripe) */
  subscription: SubscriptionRecord | null;
  plan: PlanEntitlement | null;
  currentPeriod: { start: string; end: string };
  usage: UsageTotals[];
  /** real invoices only; empty when no provider is connected */
  invoices: InvoiceRecord[];
}

/** Billing period: current calendar month. */
function currentPeriod(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start: start.toISOString(), end: end.toISOString() };
}

const METERS: UsageMeter[] = ["executions", "tokens", "agent_runs"];

/**
 * Aggregate real metered usage for the org's current billing period.
 * Optionally tags each usage row with a configured per-unit price so the
 * estimated cost is transparent about its method.
 */
export async function usageTotals(
  organizationId: string,
  period = currentPeriod(),
): Promise<UsageTotals[]> {
  // Org filter pushed into the store; the period range stays in memory
  // (equality-only pushdown).
  const orgRows = await store.query("usage_records", { organizationId });
  const rows = orgRows.filter((r) => r.recordedAt >= period.start && r.recordedAt < period.end);

  return METERS.map((meter) => {
    const inPeriod = rows.filter((r) => r.meter === meter);
    const total = inPeriod.reduce((s, r) => s + r.quantity, 0);
    // cost only when every priced row carries a unit cost; otherwise unknown
    let cost = 0;
    let anyCost = false;
    let allPriced = inPeriod.length > 0;
    for (const r of inPeriod) {
      if (r.unitCostCents !== null) {
        cost += r.quantity * (r.unitCostCents / 100);
        anyCost = true;
      } else {
        allPriced = false;
      }
    }
    return {
      meter,
      total,
      estimatedCostUsd: anyCost && allPriced ? Math.round(cost * 100) / 100 : null,
    };
  });
}

export async function billingOverview(organizationId: string): Promise<BillingOverview> {
  const orgSubs = await store.query("subscriptions", { organizationId });
  const subscription = orgSubs.find((s) => s.status !== "cancelled") ?? null;
  const invoices = await store.query("invoices", { organizationId });
  const period = currentPeriod();
  const usage = await usageTotals(organizationId, period);

  return {
    configured: billingConfigured(),
    subscription,
    plan: subscription ? getPlan(subscription.planKey) : null,
    currentPeriod: period,
    usage,
    invoices: invoices.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
  };
}

/** Record a metered consumption event. Called by the engine/AI layers. */
export async function recordUsage(
  organizationId: string,
  meter: UsageMeter,
  quantity: number,
  unitCostCents: number | null = null,
): Promise<UsageRecordRecord> {
  const record: UsageRecordRecord = {
    id: newId(),
    organizationId,
    meter,
    quantity,
    unitCostCents,
    recordedAt: new Date().toISOString(),
  };
  await store.insert("usage_records", record);
  return record;
}
