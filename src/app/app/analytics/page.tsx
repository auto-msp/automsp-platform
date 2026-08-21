import type { Metadata } from "next";
import Link from "next/link";
import { AppPageHeader } from "@/components/app/page-header";
import { usageSummary, listAiRuns } from "@/server/ai/usage";
import { getSessionContext } from "@/server/auth/session";
import { store } from "@/server/db/store";

export const metadata: Metadata = { title: "Analytics" };

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const ctx = await getSessionContext();
  if (!ctx) return null;
  const orgId = ctx.organization.id;

  const [automations, executions, approvals, aiUsage, recentRuns] = await Promise.all([
    store.find("automations", (a) => a.organizationId === orgId),
    store.find("executions", (e) => e.organizationId === orgId),
    store.find("approvals", (a) => a.organizationId === orgId),
    usageSummary(orgId),
    listAiRuns(orgId, { limit: 10 }),
  ]);

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

  // Per-automation rollups
  const byAutomation = automations.map((a) => {
    const runs = executions.filter((e) => e.automationId === a.id);
    const completed = runs.filter((e) => e.status === "completed");
    const failed = runs.filter((e) => e.status === "failed");
    const decidedCount = completed.length + failed.length;
    const estHours = Math.round(((completed.length * a.estMinutesPerRun) / 60) * 10) / 10;
    return {
      automation: a,
      runs: runs.length,
      success: decidedCount > 0 ? Math.round((completed.length / decidedCount) * 100) : null,
      estHours,
    };
  });

  const decisions = approvals.filter((a) => a.status !== "pending");

  return (
    <div>
      <AppPageHeader
        title="Analytics"
        description="Every number below shows whether it is counted (Actual) or derived from your own estimates (Estimated)."
      />

      <div className="border border-fog bg-surface p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-ink">Runs per day · last 14 days</h2>
          <p className="text-[11px] text-mute">
            <span className="font-medium text-ok">Actual</span> — counted from execution records
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

      <div className="mt-6">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-ink">By automation</h2>
          <p className="text-[11px] text-mute">Hours saved are Estimated — runs × your per-run estimate</p>
        </div>
        <div className="overflow-hidden border border-fog">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-fog bg-haze text-left text-[11px] font-medium tracking-[0.1em] text-mute uppercase">
                <th className="px-4 py-2.5">Automation</th>
                <th className="px-4 py-2.5">Runs</th>
                <th className="px-4 py-2.5">Success rate</th>
                <th className="px-4 py-2.5">Est. hours saved</th>
              </tr>
            </thead>
            <tbody>
              {byAutomation.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-mute">
                    No automations yet.
                  </td>
                </tr>
              ) : (
                byAutomation.map((row) => (
                  <tr key={row.automation.id} className="border-b border-fog last:border-0">
                    <td className="px-4 py-3">
                      <Link
                        href={`/app/automations/${row.automation.id}`}
                        className="font-medium text-ink hover:underline"
                      >
                        {row.automation.name}
                      </Link>
                    </td>
                    <td className="tnum px-4 py-3 text-slate">{row.runs}</td>
                    <td className="tnum px-4 py-3 text-slate">
                      {row.success === null ? "—" : `${row.success}%`}
                    </td>
                    <td className="tnum px-4 py-3 text-slate">
                      {row.estHours > 0 ? row.estHours.toFixed(1) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 border border-fog bg-surface p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-ink">Approval decisions</h2>
          <p className="text-[11px] text-mute">
            <span className="font-medium text-ok">Actual</span> — counted from approval records
          </p>
        </div>
        <p className="tnum mt-2 text-3xl font-semibold text-ink">{decisions.length}</p>
        <p className="mt-1 text-[13px] text-slate">
          {approvals.filter((a) => a.status === "pending").length} currently pending.
        </p>
      </div>

      <div className="mt-6 border border-fog bg-surface p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold text-ink">AI usage & cost</h2>
          <p className="text-[11px] text-mute">
            Calls/tokens <span className="font-medium text-ok">Actual</span> (provider-reported) · USD{" "}
            <span className="font-medium text-warn">Estimated</span> (list price × tokens; invoice is the actual)
          </p>
        </div>
        {aiUsage.callsCompleted + aiUsage.callsFailed === 0 ? (
          <p className="mt-2 text-[13px] text-slate">
            No model calls recorded yet — workflow AI steps, agent playground runs, and evaluation runs all
            record here.
          </p>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="tnum text-2xl font-semibold text-ink">
                  {aiUsage.callsCompleted}
                  <span className="text-sm font-normal text-mute"> / {aiUsage.callsFailed} failed</span>
                </p>
                <p className="mt-0.5 text-[12px] text-slate">Model calls</p>
              </div>
              <div>
                <p className="tnum text-2xl font-semibold text-ink">{aiUsage.tokensIn.toLocaleString()}</p>
                <p className="mt-0.5 text-[12px] text-slate">Input tokens</p>
              </div>
              <div>
                <p className="tnum text-2xl font-semibold text-ink">{aiUsage.tokensOut.toLocaleString()}</p>
                <p className="mt-0.5 text-[12px] text-slate">Output tokens</p>
              </div>
              <div>
                <p className="tnum text-2xl font-semibold text-ink">
                  {aiUsage.costEstimatedUsd !== null ? `$${aiUsage.costEstimatedUsd.toFixed(4)}` : "n/a"}
                </p>
                <p className="mt-0.5 text-[12px] text-slate">
                  Estimated cost{aiUsage.costEstimatedUsd === null ? " (unknown model pricing)" : ""}
                </p>
              </div>
            </div>
            {aiUsage.byModel.length > 0 ? (
              <p className="tnum mt-4 border-t border-fog pt-3 text-[12px] text-slate">
                {aiUsage.byModel.map((m) => `${m.model}: ${m.calls} calls, ${m.tokens.toLocaleString()} tokens`).join(" · ")}
              </p>
            ) : null}
          </>
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
    </div>
  );
}
