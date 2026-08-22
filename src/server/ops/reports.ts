import "server-only";
import { newId } from "@/server/db/id";
import { store } from "@/server/db/store";
import type { ReportRecord, ReportType } from "@/server/db/types";
import { notify } from "@/server/notifications";
import {
  computeOpsMetrics,
  makePeriod,
  recordMetrics,
  REPORT_TYPE_LABELS,
  type Metric,
  type OpsMetrics,
} from "./metrics";
import { computeRoi, laborRateForOrg, roiAsMetric, type RoiResult } from "./roi";

/**
 * Report generation. A report is a point-in-time, org-scoped document:
 * structured sections (kpi rows, narratives, metric breakdowns) baked into a
 * JSON payload plus MetricRecord snapshots, so the document still explains
 * itself — basis, source, method — long after the underlying data changed.
 */

export interface ReportKpi {
  label: string;
  value: string;
  basis: "actual" | "estimated" | "projected";
  note?: string;
}

export interface ReportSection {
  title: string;
  narrative?: string;
  kpis?: ReportKpi[];
  /** full basis/method transparency for derived numbers on this report */
  metrics?: Metric[];
  table?: { headers: string[]; rows: string[][] };
}

export interface ReportPayload {
  title: string;
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  basisNote: string;
  sections: ReportSection[];
}

export const REPORT_PERIODS_DAYS: Record<ReportType, number> = {
  weekly_ops: 7,
  monthly_impact: 30,
  system_health: 30,
  automation_performance: 30,
  ai_cost: 30,
  incident: 30,
};

const fmtUsd = (n: number) => `$${n.toFixed(2)}`;

function kpiValue(m: Metric): string {
  if (m.unit === "USD") return fmtUsd(m.value);
  if (m.unit === "%") return `${m.value}%`;
  return `${m.value} ${m.unit}`;
}

function basisKpi(m: Metric, note?: string): ReportKpi {
  return { label: m.label, value: kpiValue(m), basis: m.basis, note };
}

async function buildShared(organizationId: string, days: number) {
  const period = makePeriod(days);
  const ops = await computeOpsMetrics(organizationId, period);
  const laborRate = await laborRateForOrg(organizationId);
  const estMinutesSaved =
    ops.automations.reduce((s, a) => s + a.estMinutesSaved, 0);
  const roi = computeRoi({ estMinutesSaved, aiCostEstimatedUsd: ops.ai.costEstimatedUsd }, laborRate);
  return { period, ops, roi };
}

function opsSections(ops: OpsMetrics, roi: RoiResult): ReportSection[] {
  const runMetric = ops.metrics.find((m) => m.key === "executions_total");
  const successMetric = ops.metrics.find((m) => m.key === "success_rate");
  const hoursMetric = ops.metrics.find((m) => m.key === "hours_saved");
  const sections: ReportSection[] = [];

  sections.push({
    title: "Headline",
    narrative: narrativeFor(ops),
    kpis: [
      ...(runMetric ? [basisKpi(runMetric)] : []),
      ...(successMetric ? [basisKpi(successMetric, "excludes runs waiting on approval")] : []),
      ...(hoursMetric ? [basisKpi(hoursMetric)] : []),
      ...(ops.ai.costEstimatedUsd !== null
        ? [{ label: "AI cost", value: fmtUsd(ops.ai.costEstimatedUsd), basis: "estimated" as const, note: "list price × tokens" }]
        : []),
      ...(roi.netValueUsd !== null
        ? [{ label: "Estimated net value", value: fmtUsd(roi.netValueUsd), basis: "estimated" as const, note: "labor value − AI cost" }]
        : []),
    ],
  });

  sections.push({
    title: "Automation performance",
    table: {
      headers: ["Automation", "Runs", "Succeeded", "Failed", "Success rate", "Est. time avoided"],
      rows: ops.automations.map((a) => [
        a.name,
        String(a.runs),
        String(a.succeeded),
        String(a.failed),
        a.successRatePct === null ? "—" : `${a.successRatePct}%`,
        `${Math.round((a.estMinutesSaved / 60) * 10) / 10} h`,
      ]),
    },
  });

  sections.push({
    title: "Approvals",
    kpis: [
      { label: "Decisions in period", value: String(ops.approvals.decided), basis: "actual" },
      { label: "Approved", value: String(ops.approvals.approved), basis: "actual" },
      { label: "Rejected", value: String(ops.approvals.rejected), basis: "actual" },
      { label: "Pending now", value: String(ops.approvals.pending), basis: "actual" },
      ...(ops.approvals.meanDecisionHours !== null
        ? [{ label: "Mean decision time", value: `${ops.approvals.meanDecisionHours} h`, basis: "actual" as const }]
        : []),
    ],
  });

  sections.push({
    title: "Metric detail — basis & method",
    metrics: [...ops.metrics, roiAsMetric(roi)],
    narrative:
      "Every derived number above is reproduced here with its basis and calculation method, per AutoMSP's measurement policy.",
  });

  return sections;
}

function narrativeFor(ops: OpsMetrics): string {
  const runs = ops.metrics.find((m) => m.key === "executions_total")?.value ?? 0;
  const success = ops.metrics.find((m) => m.key === "success_rate");
  const failed = ops.automations.reduce((s, a) => s + a.failed, 0);
  const parts = [
    `${runs} workflow run${runs === 1 ? "" : "s"} in the period`,
  ];
  if (success && runs > 0) parts.push(`${success.value}% of decided runs completed successfully`);
  if (failed > 0) parts.push(`${failed} run${failed === 1 ? "" : "s"} failed and need review`);
  if (ops.approvals.pending > 0)
    parts.push(`${ops.approvals.pending} approval${ops.approvals.pending === 1 ? "" : "s"} awaiting a decision`);
  if (ops.incidents.open > 0)
    parts.push(`${ops.incidents.open} open incident${ops.incidents.open === 1 ? "" : "s"}`);
  return parts.join("; ") + ".";
}

export async function generateReport(
  organizationId: string,
  type: ReportType,
  opts: { createdByName?: string } = {},
): Promise<ReportRecord> {
  const days = REPORT_PERIODS_DAYS[type];
  const { period, ops, roi } = await buildShared(organizationId, days);

  const payload: ReportPayload = {
    title: `${REPORT_TYPE_LABELS[type]} — ${period.periodStart.slice(0, 10)} to ${period.periodEnd.slice(0, 10)}`,
    generatedAt: new Date().toISOString(),
    periodStart: period.periodStart,
    periodEnd: period.periodEnd,
    basisNote:
      "Actual = counted from records. Estimated = derived from assumptions you set (per-run time, labor rate) or list pricing. Projected = a measured rate extended forward. Method text accompanies every derived figure.",
    sections: sectionsFor(type, ops, roi),
  };

  const report: ReportRecord = {
    id: newId(),
    organizationId,
    type,
    periodStart: period.periodStart,
    periodEnd: period.periodEnd,
    payload,
    storageKey: null,
    createdAt: new Date().toISOString(),
  };
  await store.insert("reports", report);

  // Snapshot every derived metric so the report remains auditable later.
  await recordMetrics(organizationId, [...ops.metrics, roiAsMetric(roi)], period);

  // userId: null → visible to every member of the organization
  await notify({
    organizationId,
    kind: "report",
    title: `${REPORT_TYPE_LABELS[type]} report ready${opts.createdByName ? ` — requested by ${opts.createdByName}` : ""}`,
    body: payload.title,
    href: `/app/reports/${report.id}`,
  });

  return report;
}

function sectionsFor(type: ReportType, ops: OpsMetrics, roi: RoiResult): ReportSection[] {
  switch (type) {
    case "weekly_ops":
      return opsSections(ops, roi);
    case "monthly_impact": {
      const sections = opsSections(ops, roi);
      sections.splice(1, 0, {
        title: "Impact & ROI",
        kpis: [
          { label: "Time avoided", value: `${roi.estHoursSaved} h`, basis: "estimated" },
          {
            label: `Labor value @ $${roi.laborRateUsdPerHour}/h`,
            value: fmtUsd(roi.estLaborValueUsd),
            basis: "estimated",
          },
          ...(ops.ai.costEstimatedUsd !== null
            ? [{ label: "AI cost", value: fmtUsd(ops.ai.costEstimatedUsd), basis: "estimated" as const }]
            : []),
          ...(roi.netValueUsd !== null
            ? [{ label: "Net value", value: fmtUsd(roi.netValueUsd), basis: "estimated" as const }]
            : []),
          ...(roi.roiMultiple !== null
            ? [{ label: "Return multiple", value: `${roi.roiMultiple}×`, basis: "estimated" as const, note: "labor value ÷ AI cost" }]
            : []),
        ],
        narrative:
          "All impact figures are estimates: time avoided assumes your per-run minute settings; value uses your labor-rate assumption; AI cost uses list pricing. They are planning figures, not booked savings.",
      });
      return sections;
    }
    case "ai_cost":
      return [
        {
          title: "AI usage & cost",
          kpis: [
            { label: "Model calls (completed / failed)", value: `${ops.ai.callsCompleted} / ${ops.ai.callsFailed}`, basis: "actual" },
            { label: "Input tokens", value: ops.ai.tokensIn.toLocaleString(), basis: "actual" },
            { label: "Output tokens", value: ops.ai.tokensOut.toLocaleString(), basis: "actual" },
            ...(ops.ai.costEstimatedUsd !== null
              ? [{ label: "Estimated cost", value: fmtUsd(ops.ai.costEstimatedUsd), basis: "estimated" as const, note: "list price × actual tokens" }]
              : []),
          ],
          narrative:
            "Token counts are reported by the providers and are actual. The dollar figure multiplies those tokens by published list pricing — treat the provider invoice as the actual cost.",
          metrics: ops.metrics.filter((m) => m.key === "ai_cost_usd"),
        },
      ];
    case "incident":
      return [
        {
          title: "Incidents",
          kpis: [
            { label: "Open now", value: String(ops.incidents.open), basis: "actual" },
            { label: "Resolved in period", value: String(ops.incidents.resolvedInPeriod), basis: "actual" },
            ...(ops.incidents.meanResolutionHours !== null
              ? [{ label: "Mean time to resolve", value: `${ops.incidents.meanResolutionHours} h`, basis: "actual" as const }]
              : []),
          ],
          metrics: [],
        },
        ...opsSections(ops, roi).slice(1),
      ];
    case "system_health":
    case "automation_performance":
    default:
      return opsSections(ops, roi);
  }
}

export async function listReports(organizationId: string): Promise<ReportRecord[]> {
  const rows = await store.find("reports", (r) => r.organizationId === organizationId);
  return rows.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function getReport(
  organizationId: string,
  reportId: string,
): Promise<ReportRecord | null> {
  // Org-scoped: a report from another tenant must be invisible, never 403-able.
  const row = await store.get("reports", reportId);
  return row && row.organizationId === organizationId ? row : null;
}
