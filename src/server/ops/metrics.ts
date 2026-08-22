import "server-only";
import { newId } from "@/server/db/id";
import { store } from "@/server/db/store";
import type { MetricBasis, MetricRecord, ReportType } from "@/server/db/types";

/**
 * Operational metrics. The one rule that governs everything here: a number
 * must never blur its basis. Counts taken from records are ACTUAL; anything
 * derived from user-supplied assumptions (per-run time estimates) or list
 * pricing is ESTIMATED; a forward-looking extension of a measured rate is
 * PROJECTED. Every metric carries { source, method } text so a reader can
 * reconstruct how the number was produced.
 */

export interface MetricCalculation {
  source: string;
  method: string;
}

export interface Metric {
  key: string;
  label: string;
  value: number;
  /** display unit, e.g. "runs" | "%" | "hours" | "USD" | "minutes" */
  unit: string;
  basis: MetricBasis;
  calculation: MetricCalculation;
}

export interface AutomationPerformance {
  automationId: string;
  name: string;
  status: string;
  runs: number;
  succeeded: number;
  failed: number;
  waitingApproval: number;
  /** null when not a single run has finished — never show a fake 0% */
  successRatePct: number | null;
  estMinutesSaved: number;
  avgDurationMs: number | null;
}

export interface ApprovalOps {
  decided: number;
  approved: number;
  rejected: number;
  pending: number;
  pendingOldestHours: number | null;
  /** mean hours from createdAt → decidedAt for decided approvals */
  meanDecisionHours: number | null;
}

export interface AiOps {
  callsCompleted: number;
  callsFailed: number;
  tokensIn: number;
  tokensOut: number;
  costEstimatedUsd: number | null;
}

export interface IncidentOps {
  open: number;
  resolvedInPeriod: number;
  meanResolutionHours: number | null;
}

export interface MetricsPeriod {
  periodStart: string;
  periodEnd: string;
  /** hours in the period — projection horizon */
  periodHours: number;
}

/** [start, end) window; end defaults to now. */
export function makePeriod(days: number, end?: Date): MetricsPeriod {
  const periodEnd = (end ?? new Date()).toISOString();
  const periodStart = new Date(Date.parse(periodEnd) - days * 86400_000).toISOString();
  return { periodStart, periodEnd, periodHours: days * 24 };
}

function inPeriod(iso: string, p: MetricsPeriod): boolean {
  return iso >= p.periodStart && iso < p.periodEnd;
}

function round(value: number, places = 2): number {
  const f = 10 ** places;
  return Math.round(value * f) / f;
}

export interface OpsMetrics {
  period: MetricsPeriod;
  metrics: Metric[];
  automations: AutomationPerformance[];
  approvals: ApprovalOps;
  ai: AiOps;
  incidents: IncidentOps;
  metricsAvailable: boolean;
}

/**
 * Compute the operational picture for one organization over a window.
 * Org-scoped: every store query filters on organizationId.
 */
export async function computeOpsMetrics(
  organizationId: string,
  period: MetricsPeriod,
): Promise<OpsMetrics> {
  const [executions, automations, approvals, aiRuns, incidents] = await Promise.all([
    store.find("executions", (e) => e.organizationId === organizationId),
    store.find("automations", (a) => a.organizationId === organizationId),
    store.find("approvals", (a) => a.organizationId === organizationId),
    store.find("ai_runs", (r) => r.organizationId === organizationId),
    store.find("incidents", (i) => i.organizationId === organizationId),
  ]);

  const runsInPeriod = executions.filter((e) => inPeriod(e.createdAt, period));
  const succeeded = runsInPeriod.filter((e) => e.status === "completed");
  const failed = runsInPeriod.filter((e) => e.status === "failed");
  const decidedCount = succeeded.length + failed.length;

  const estMinutesByAutomation = new Map(automations.map((a) => [a.id, a.estMinutesPerRun]));
  const estMinutesSaved = succeeded.reduce(
    (sum, e) => sum + (estMinutesByAutomation.get(e.automationId) ?? 0),
    0,
  );

  const decided = approvals.filter((a) => a.status !== "pending" && a.decidedAt);
  const decidedInPeriod = decided.filter((a) => inPeriod(a.createdAt, period));
  const pending = approvals.filter((a) => a.status === "pending");
  const nowMs = Date.parse(period.periodEnd);
  const pendingOldestHours =
    pending.length > 0
      ? round(
          Math.max(
            ...pending.map((a) => (nowMs - Date.parse(a.createdAt)) / 3600_000),
          ),
          1,
        )
      : null;
  const decisionLatencies = decidedInPeriod.map(
    (a) => (Date.parse(a.decidedAt!) - Date.parse(a.createdAt)) / 3600_000,
  );
  const meanDecisionHours =
    decisionLatencies.length > 0
      ? round(decisionLatencies.reduce((s, v) => s + v, 0) / decisionLatencies.length, 1)
      : null;

  const aiInPeriod = aiRuns.filter((r) => inPeriod(r.createdAt, period));
  const aiCompleted = aiInPeriod.filter((r) => r.status === "completed");
  let cost = 0;
  let anyCost = false;
  for (const r of aiInPeriod) {
    if (r.costEstimatedUsd !== null) {
      cost += r.costEstimatedUsd;
      anyCost = true;
    }
  }
  const ai: AiOps = {
    callsCompleted: aiCompleted.length,
    callsFailed: aiInPeriod.length - aiCompleted.length,
    tokensIn: aiInPeriod.reduce((s, r) => s + r.promptTokens, 0),
    tokensOut: aiInPeriod.reduce((s, r) => s + r.completionTokens, 0),
    costEstimatedUsd: anyCost ? round(cost, 4) : null,
  };

  const openIncidents = incidents.filter((i) => i.status !== "resolved");
  const resolvedInPeriod = incidents.filter((i) => i.resolvedAt && inPeriod(i.resolvedAt, period));
  const resolutionHours = resolvedInPeriod.map(
    (i) => (Date.parse(i.resolvedAt!) - Date.parse(i.startedAt)) / 3600_000,
  );

  // Per-automation performance
  const perf: AutomationPerformance[] = automations
    .map((a) => {
      const runs = runsInPeriod.filter((e) => e.automationId === a.id);
      const done = runs.filter((e) => e.status === "completed");
      const bad = runs.filter((e) => e.status === "failed");
      const decidedRuns = done.length + bad.length;
      const durations = runs
        .filter((e) => e.finishedAt)
        .map((e) => Date.parse(e.finishedAt!) - Date.parse(e.startedAt));
      return {
        automationId: a.id,
        name: a.name,
        status: a.status,
        runs: runs.length,
        succeeded: done.length,
        failed: bad.length,
        waitingApproval: runs.filter((e) => e.status === "waiting").length,
        successRatePct:
          decidedRuns > 0 ? round((done.length / decidedRuns) * 100, 1) : null,
        estMinutesSaved: done.length * a.estMinutesPerRun,
        avgDurationMs:
          durations.length > 0
            ? Math.round(durations.reduce((s, v) => s + v, 0) / durations.length)
            : null,
      };
    })
    .sort((a, b) => b.runs - a.runs);

  const actualSource = "execution records";
  const metrics: Metric[] = [
    {
      key: "executions_total",
      label: "Workflow runs",
      value: runsInPeriod.length,
      unit: "runs",
      basis: "actual",
      calculation: {
        source: actualSource,
        method: "Count of workflow execution records created in the period.",
      },
    },
    {
      key: "success_rate",
      label: "Success rate",
      value: decidedCount > 0 ? round((succeeded.length / decidedCount) * 100, 1) : 0,
      unit: "%",
      basis: "actual",
      calculation: {
        source: actualSource,
        method:
          "Completed runs ÷ (completed + failed) runs in the period. Runs still waiting on approval are excluded from the denominator.",
      },
    },
    {
      key: "hours_saved",
      label: "Human time avoided",
      value: round(estMinutesSaved / 60, 1),
      unit: "hours",
      basis: "estimated",
      calculation: {
        source: "execution records × per-automation estimate",
        method:
          "Completed runs × the estimated minutes of human work each run replaces (an assumption set on each automation).",
      },
    },
    {
      key: "ai_cost_usd",
      label: "AI cost",
      value: ai.costEstimatedUsd ?? 0,
      unit: "USD",
      basis: "estimated",
      calculation: {
        source: "AI run records × published list pricing",
        method:
          "Σ (provider-reported tokens × model list price). Token counts are actual; the dollar figure is an estimate — the provider invoice is the actual.",
      },
    },
    {
      key: "approval_decisions",
      label: "Approval decisions",
      value: decidedInPeriod.length,
      unit: "decisions",
      basis: "actual",
      calculation: {
        source: "approval records",
        method: "Count of approvals created in the period that have been approved or rejected.",
      },
    },
  ];

  // Projected run-rate: extend this period's measured cadence to 30 days.
  // Only meaningful with a decent sample; flagged in the method text.
  const daysInPeriod = period.periodHours / 24;
  if (runsInPeriod.length >= 5 && daysInPeriod >= 1) {
    const runRate = runsInPeriod.length / daysInPeriod;
    metrics.push({
      key: "projected_monthly_runs",
      label: "Projected monthly runs",
      value: Math.round(runRate * 30),
      unit: "runs",
      basis: "projected",
      calculation: {
        source: actualSource,
        method: `Measured ${round(runRate, 1)} runs/day over this period, extended to 30 days. A projection — actual volume depends on triggers and usage.`,
      },
    });
    const minutesPerDay = estMinutesSaved / daysInPeriod;
    metrics.push({
      key: "projected_monthly_hours_saved",
      label: "Projected monthly time avoided",
      value: round((minutesPerDay * 30) / 60, 1),
      unit: "hours",
      basis: "projected",
      calculation: {
        source: "execution records × per-automation estimate",
        method:
          "This period's estimated-time-avoided rate extended to 30 days. Compounds two assumptions: the per-run estimate and a constant run rate.",
      },
    });
  }

  return {
    period,
    metrics,
    automations: perf,
    approvals: {
      decided: decided.length,
      approved: decided.filter((a) => a.status === "approved").length,
      rejected: decided.filter((a) => a.status === "rejected").length,
      pending: pending.length,
      pendingOldestHours,
      meanDecisionHours,
    },
    ai,
    incidents: {
      open: openIncidents.length,
      resolvedInPeriod: resolvedInPeriod.length,
      meanResolutionHours:
        resolutionHours.length > 0
          ? round(resolutionHours.reduce((s, v) => s + v, 0) / resolutionHours.length, 1)
          : null,
    },
    metricsAvailable: true,
  };
}

/**
 * Persist metric snapshots. Each row records the value, its basis, and how it
 * was produced — so a report rendered months later still explains itself.
 */
export async function recordMetrics(
  organizationId: string,
  metrics: Metric[],
  period: MetricsPeriod,
): Promise<MetricRecord[]> {
  const rows: MetricRecord[] = metrics.map((m) => ({
    id: newId(),
    organizationId,
    key: m.key,
    value: m.value,
    basis: m.basis,
    periodStart: period.periodStart,
    periodEnd: period.periodEnd,
    calculation: { source: m.calculation.source, method: m.calculation.method },
    createdAt: new Date().toISOString(),
  }));
  for (const row of rows) {
    await store.insert("metrics", row);
  }
  return rows;
}

/** Latest snapshot per key — for trend display without recomputing history. */
export async function latestMetricSnapshots(
  organizationId: string,
): Promise<MetricRecord[]> {
  const rows = await store.find("metrics", (m) => m.organizationId === organizationId);
  const latest = new Map<string, MetricRecord>();
  for (const row of rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    latest.set(row.key, row);
  }
  return [...latest.values()];
}

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  weekly_ops: "Weekly operations",
  monthly_impact: "Monthly impact",
  system_health: "System health",
  automation_performance: "Automation performance",
  ai_cost: "AI cost",
  incident: "Incident review",
};
