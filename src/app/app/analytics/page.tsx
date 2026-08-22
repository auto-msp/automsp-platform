import type { Metadata } from "next";
import Link from "next/link";
import { AppPageHeader } from "@/components/app/page-header";
import { listAiRuns } from "@/server/ai/usage";
import { getSessionContext } from "@/server/auth/session";
import { store } from "@/server/db/store";
import { computeOpsMetrics, makePeriod } from "@/server/ops/metrics";
import { computeRoi, laborRateForOrg } from "@/server/ops/roi";

export const metadata: Metadata = { title: "Analytics" };

export const dynamic = "force-dynamic";

const BASIS_CLS: Record<string, string> = {
  actual: "text-ok",
  estimated: "text-warn",
  projected: "text-accent",
};

function BasisTag({ basis }: { basis: string }) {
  return (
    <span className={`font-medium capitalize ${BASIS_CLS[basis] ?? "text-slate"}`}>{basis}</span>
  );
}

export default async function AnalyticsPage() {
  const ctx = await getSessionContext();
  if (!ctx) return null;
  const orgId = ctx.organization.id;

  const period = makePeriod(30);
  const [ops, laborRate, recentRuns, executions] = await Promise.all([
    computeOpsMetrics(orgId, period),
    laborRateForOrg(orgId),
    listAiRuns(orgId, { limit: 10 }),
    store.find("executions", (e) => e.organizationId === orgId),
  ]);
  const estMinutesSaved = ops.automations.reduce((s, a) => s + a.estMinutesSaved, 0);
  const roi = computeRoi({ estMinutesSaved, aiCostEstimatedUsd: ops.ai.costEstimatedUsd }, laborRate);

  // Runs per day — last 14 days (Actual: counted from execution records)
  const days: { label: string; count: number }[] = [];
  const now = new Date();
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      label: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      count: executions.filter((e) => e.createdAt.slice(0, 10) === key).length,
    });
  }
  const maxCount = Math.max(1, ...days.map((d) => d.count));

  return (
    <div>
      <AppPageHeader
        title="Analytics"
        description="Operational metrics and ROI, with the measurement basis on every number: Actual (counted), Estimated (from your assumptions or list pricing), Projected (a measured rate extended forward)."
      />

      {/* Fleet health — headline KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {ops.metrics
          .filter((m) => ["executions_total", "success_rate", "hours_saved", "ai_cost_usd"].includes(m.key))
          .map((m) => (
            <div key={m.key} className="border border-fog bg-surface p-4">
              <p className="text-[11px] font-medium tracking-[0.1em] text-mute uppercase">{m.label}</p>
              <p className="tnum mt-1.5 text-2xl font-semibold text-ink">
                {m.unit === "USD" ? `$${m.value.toFixed(2)}` : m.unit === "%" ? `${m.value}%` : m.value}
              </p>
              <p className="mt-1 text-[11px]">
                <BasisTag basis={m.basis} />
              </p>
            </div>
          ))}
      </div>
      {ops.metrics.some((m) => m.basis === "projected") ? (
        <div className="mt-4 grid grid-cols-2 gap-4">
          {ops.metrics
            .filter((m) => m.basis === "projected")
            .map((m) => (
              <div key={m.key} className="border border-fog bg-surface p-4">
                <p className="text-[11px] font-medium tracking-[0.1em] text-mute uppercase">{m.label}</p>
                <p className="tnum mt-1.5 text-2xl font-semibold text-ink">
                  {m.value} {m.unit}
                </p>
                <p className="mt-1 text-[11px]">
                  <BasisTag basis={m.basis} /> <span className="text-mute">— {m.calculation.method}</span>
                </p>
              </div>
            ))}
        </div>
      ) : null}

      {/* ROI panel */}
      <div className="mt-6 border border-fog bg-surface p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-ink">Return on automation · last 30 days</h2>
          <p className="text-[11px] text-mute">
            All figures <BasisTag basis="estimated" /> — planning numbers, not booked savings
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="tnum text-2xl font-semibold text-ink">{roi.estHoursSaved} h</p>
            <p className="mt-0.5 text-[12px] text-slate">Time avoided</p>
          </div>
          <div>
            <p className="tnum text-2xl font-semibold text-ink">${roi.estLaborValueUsd.toFixed(2)}</p>
            <p className="mt-0.5 text-[12px] text-slate">Labor value @ ${roi.laborRateUsdPerHour}/h</p>
          </div>
          <div>
            <p className="tnum text-2xl font-semibold text-ink">
              {roi.aiCostEstimatedUsd !== null ? `$${roi.aiCostEstimatedUsd.toFixed(4)}` : "n/a"}
            </p>
            <p className="mt-0.5 text-[12px] text-slate">AI cost (list price)</p>
          </div>
          <div>
            <p className="tnum text-2xl font-semibold text-ink">
              {roi.netValueUsd !== null ? `$${roi.netValueUsd.toFixed(2)}` : "n/a"}
              {roi.roiMultiple !== null ? (
                <span className="ml-1.5 text-sm font-normal text-ok">{roi.roiMultiple}×</span>
              ) : null}
            </p>
            <p className="mt-0.5 text-[12px] text-slate">Estimated net value</p>
          </div>
        </div>
        <div className="mt-4 space-y-1 border-t border-fog pt-3">
          {roi.methods.map((m) => (
            <p key={m.label} className="text-[12px] leading-relaxed text-mute">
              <span className="font-medium text-slate">{m.label}:</span> {m.method}
            </p>
          ))}
          <p className="text-[12px] text-mute">
            Set your own labor rate from the{" "}
            <Link href="/app/organization" className="text-ink underline">
              organization page
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Runs per day */}
      <div className="mt-6 border border-fog bg-surface p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-ink">Runs per day · last 14 days</h2>
          <p className="text-[11px] text-mute">
            <BasisTag basis="actual" /> — counted from execution records
          </p>
        </div>
        <div className="mt-4 flex h-32 items-end gap-1.5">
          {days.map((d) => (
            <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="tnum text-[10px] text-slate">{d.count > 0 ? d.count : ""}</span>
              <div
                className={`w-full ${d.count > 0 ? "bg-accent" : "bg-haze"}`}
                style={{ height: `${Math.max(4, (d.count / maxCount) * 100)}%` }}
              />
              <span className="hidden text-[9px] text-mute sm:block">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Automation performance */}
      <div className="mt-6">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-ink">Automation performance · last 30 days</h2>
          <p className="text-[11px] text-mute">
            Counts <BasisTag basis="actual" /> · time avoided <BasisTag basis="estimated" />
          </p>
        </div>
        <div className="overflow-hidden border border-fog">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-fog bg-haze text-left text-[11px] font-medium tracking-[0.1em] text-mute uppercase">
                <th className="px-4 py-2.5">Automation</th>
                <th className="px-4 py-2.5">Runs</th>
                <th className="px-4 py-2.5">Failed</th>
                <th className="px-4 py-2.5">Waiting</th>
                <th className="px-4 py-2.5">Success rate</th>
                <th className="px-4 py-2.5">Est. time avoided</th>
                <th className="px-4 py-2.5">Avg duration</th>
              </tr>
            </thead>
            <tbody>
              {ops.automations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-mute">
                    No automations yet.
                  </td>
                </tr>
              ) : (
                ops.automations.map((row) => (
                  <tr key={row.automationId} className="border-b border-fog last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/app/automations/${row.automationId}`}
                        className="font-medium text-ink hover:underline"
                      >
                        {row.name}
                      </Link>
                    </td>
                    <td className="tnum px-4 py-3 text-slate">{row.runs}</td>
                    <td className="tnum px-4 py-3 text-slate">
                      {row.failed > 0 ? <span className="text-risk">{row.failed}</span> : 0}
                    </td>
                    <td className="tnum px-4 py-3 text-slate">{row.waitingApproval}</td>
                    <td className="tnum px-4 py-3 text-slate">
                      {row.successRatePct === null ? "—" : `${row.successRatePct}%`}
                    </td>
                    <td className="tnum px-4 py-3 text-slate">
                      {row.estMinutesSaved > 0 ? `${Math.round((row.estMinutesSaved / 60) * 10) / 10} h` : "—"}
                    </td>
                    <td className="tnum px-4 py-3 text-slate">
                      {row.avgDurationMs === null
                        ? "—"
                        : row.avgDurationMs < 1000
                          ? `${row.avgDurationMs} ms`
                          : `${(row.avgDurationMs / 1000).toFixed(1)} s`}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approvals SLA + incidents */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="border border-fog bg-surface p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-ink">Approval responsiveness</h2>
            <p className="text-[11px] text-mute">
              <BasisTag basis="actual" />
            </p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <p className="tnum text-2xl font-semibold text-ink">
                {ops.approvals.meanDecisionHours !== null ? `${ops.approvals.meanDecisionHours} h` : "—"}
              </p>
              <p className="mt-0.5 text-[12px] text-slate">Mean decision time (period)</p>
            </div>
            <div>
              <p className="tnum text-2xl font-semibold text-ink">{ops.approvals.pending}</p>
              <p className="mt-0.5 text-[12px] text-slate">
                Pending
                {ops.approvals.pendingOldestHours !== null
                  ? ` · oldest ${ops.approvals.pendingOldestHours} h`
                  : ""}
              </p>
            </div>
          </div>
          <p className="mt-3 border-t border-fog pt-2 text-[12px] text-mute">
            {ops.approvals.approved} approved · {ops.approvals.rejected} rejected (all time). Mean
            decision time is computed from approvals created in the period.
          </p>
        </div>

        <div className="border border-fog bg-surface p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-ink">Incidents</h2>
            <p className="text-[11px] text-mute">
              <BasisTag basis="actual" />
            </p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <p className={`tnum text-2xl font-semibold ${ops.incidents.open > 0 ? "text-risk" : "text-ink"}`}>
                {ops.incidents.open}
              </p>
              <p className="mt-0.5 text-[12px] text-slate">Open</p>
            </div>
            <div>
              <p className="tnum text-2xl font-semibold text-ink">
                {ops.incidents.meanResolutionHours !== null ? `${ops.incidents.meanResolutionHours} h` : "—"}
              </p>
              <p className="mt-0.5 text-[12px] text-slate">Mean resolution (period)</p>
            </div>
          </div>
          <p className="mt-3 border-t border-fog pt-2 text-[12px] text-mute">
            {ops.incidents.resolvedInPeriod} resolved in the period. Incident tracking begins when a
            failure is confirmed by the workflow engine.
          </p>
        </div>
      </div>

      {/* AI usage & cost */}
      <div className="mt-6 border border-fog bg-surface p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-ink">AI usage &amp; cost · last 30 days</h2>
          <p className="text-[11px] text-mute">
            Calls/tokens <BasisTag basis="actual" /> (provider-reported) · USD{" "}
            <BasisTag basis="estimated" /> (list price × tokens)
          </p>
        </div>
        {ops.ai.callsCompleted + ops.ai.callsFailed === 0 ? (
          <p className="mt-2 text-[13px] text-slate">
            No model calls recorded in the period — workflow AI steps, agent playground runs, and
            evaluation runs all record here.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="tnum text-2xl font-semibold text-ink">
                {ops.ai.callsCompleted}
                <span className="text-sm font-normal text-mute"> / {ops.ai.callsFailed} failed</span>
              </p>
              <p className="mt-0.5 text-[12px] text-slate">Model calls</p>
            </div>
            <div>
              <p className="tnum text-2xl font-semibold text-ink">{ops.ai.tokensIn.toLocaleString()}</p>
              <p className="mt-0.5 text-[12px] text-slate">Input tokens</p>
            </div>
            <div>
              <p className="tnum text-2xl font-semibold text-ink">{ops.ai.tokensOut.toLocaleString()}</p>
              <p className="mt-0.5 text-[12px] text-slate">Output tokens</p>
            </div>
            <div>
              <p className="tnum text-2xl font-semibold text-ink">
                {ops.ai.costEstimatedUsd !== null ? `$${ops.ai.costEstimatedUsd.toFixed(4)}` : "n/a"}
              </p>
              <p className="mt-0.5 text-[12px] text-slate">Estimated cost</p>
            </div>
          </div>
        )}
        {recentRuns.length > 0 ? (
          <div className="mt-4 overflow-hidden border border-fog">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-fog bg-haze text-left text-[11px] font-medium tracking-[0.1em] text-mute uppercase">
                  <th className="px-4 py-2.5">When</th>
                  <th className="px-4 py-2.5">Source</th>
                  <th className="px-4 py-2.5">Model</th>
                  <th className="px-4 py-2.5">Tokens</th>
                  <th className="px-4 py-2.5">Est. cost</th>
                </tr>
              </thead>
              <tbody>
                {recentRuns.map((run) => (
                  <tr key={run.id} className="border-b border-fog last:border-0">
                    <td className="tnum px-4 py-2 text-slate">{run.createdAt.slice(0, 16).replace("T", " ")}</td>
                    <td className="px-4 py-2 text-slate">
                      {run.source}
                      {run.status === "failed" ? <span className="ml-1 text-risk">(failed)</span> : null}
                    </td>
                    <td className="px-4 py-2 text-slate">{run.model}</td>
                    <td className="tnum px-4 py-2 text-slate">{run.promptTokens + run.completionTokens}</td>
                    <td className="tnum px-4 py-2 text-slate">
                      {run.costEstimatedUsd !== null ? `$${run.costEstimatedUsd.toFixed(5)}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <p className="mt-6 text-[12px] leading-relaxed text-mute">
        These numbers feed generated reports. Open the{" "}
        <Link href="/app/reports" className="text-ink underline">
          reports page
        </Link>{" "}
        to generate a shareable weekly-ops, monthly-impact, AI-cost, or incident document from the
        same data, with method text attached.
      </p>
    </div>
  );
}
