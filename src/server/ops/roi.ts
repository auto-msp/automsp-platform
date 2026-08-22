import "server-only";
import { newId } from "@/server/db/id";
import { store } from "@/server/db/store";
import type { Metric } from "./metrics";

/**
 * ROI math. Both sides of the comparison are ESTIMATES and are labeled as
 * such: time avoided relies on the per-automation assumption the customer
 * sets; labor value multiplies that by an hourly rate the customer supplies;
 * AI cost is list price × provider-reported tokens. Nothing here is
 * presented as measured fact.
 */

/** Default blended labor rate (USD/hour) when the org has not set one. */
export const DEFAULT_LABOR_RATE_USD = 45;

export interface RoiInputs {
  /** completed runs × estMinutesPerRun, from metrics */
  estMinutesSaved: number;
  /** list-price × tokens, or null when model pricing is unknown */
  aiCostEstimatedUsd: number | null;
}

export interface RoiResult {
  estHoursSaved: number;
  laborRateUsdPerHour: number;
  /** estimated value of avoided human time */
  estLaborValueUsd: number;
  aiCostEstimatedUsd: number | null;
  /** labor value − AI cost; null when cost is not computable */
  netValueUsd: number | null;
  /** labor value ÷ AI cost; null when cost is zero/unknown */
  roiMultiple: number | null;
  /** per-line { source, method } for transparency rendering */
  methods: { label: string; basis: "estimated"; method: string }[];
}

export function computeRoi(
  inputs: RoiInputs,
  laborRateUsdPerHour: number = DEFAULT_LABOR_RATE_USD,
): RoiResult {
  const hours = Math.round((inputs.estMinutesSaved / 60) * 10) / 10;
  const laborValue = Math.round(hours * laborRateUsdPerHour * 100) / 100;
  const cost = inputs.aiCostEstimatedUsd;

  return {
    estHoursSaved: hours,
    laborRateUsdPerHour,
    estLaborValueUsd: laborValue,
    aiCostEstimatedUsd: cost,
    netValueUsd: cost !== null ? Math.round((laborValue - cost) * 100) / 100 : null,
    roiMultiple: cost !== null && cost > 0 ? Math.round((laborValue / cost) * 10) / 10 : null,
    methods: [
      {
        label: "Time avoided",
        basis: "estimated",
        method:
          "Completed runs × the estimated minutes each run replaces (an assumption set per automation).",
      },
      {
        label: "Labor value",
        basis: "estimated",
        method: `Time avoided × $${laborRateUsdPerHour}/hour blended rate. Set your own rate on the organization page to match your team's cost.`,
      },
      {
        label: "AI cost",
        basis: "estimated",
        method:
          cost !== null
            ? "Provider-reported tokens × model list price. The provider invoice is the actual figure."
            : "Not computable — pricing for the models used is unknown. Token counts are still recorded.",
      },
    ],
  };
}

/**
 * Derived ROI as a metric row, so it can be snapshotted into reports with
 * the same basis/method discipline as every other number.
 */
export function roiAsMetric(roi: RoiResult): Metric {
  return {
    key: "estimated_net_value_usd",
    label: "Estimated net value",
    value: roi.netValueUsd ?? 0,
    unit: "USD",
    basis: "estimated",
    calculation: {
      source: "execution records × per-automation estimate × labor rate, minus list-price AI cost",
      method: `Estimated labor value ($${roi.estLaborValueUsd}) minus estimated AI cost (${
        roi.aiCostEstimatedUsd !== null ? `$${roi.aiCostEstimatedUsd}` : "unknown"
      }). Both inputs are estimates; this is a planning figure, not booked savings.`,
    },
  };
}

const LABOR_RATE_METRIC_KEY = "assumption_labor_rate_usd_per_hour";

/**
 * The org's labor-rate assumption, stored as a metric row so it is org-scoped,
 * self-describing, and auditable like every other number. Most recent wins.
 */
export async function laborRateForOrg(organizationId: string): Promise<number> {
  const rows = await store.query("metrics", { organizationId, key: LABOR_RATE_METRIC_KEY });
  if (rows.length === 0) return DEFAULT_LABOR_RATE_USD;
  const latest = rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  return latest.value > 0 ? latest.value : DEFAULT_LABOR_RATE_USD;
}

export async function setLaborRateForOrg(
  organizationId: string,
  rateUsdPerHour: number,
): Promise<void> {
  const now = new Date().toISOString();
  await store.insert("metrics", {
    id: newId(),
    organizationId,
    key: LABOR_RATE_METRIC_KEY,
    value: rateUsdPerHour,
    basis: "estimated",
    periodStart: now,
    periodEnd: now,
    calculation: {
      source: "user-supplied assumption",
      method:
        "Blended hourly cost of the people whose work the automations replace, set by an organization administrator.",
    },
    createdAt: now,
  });
}
