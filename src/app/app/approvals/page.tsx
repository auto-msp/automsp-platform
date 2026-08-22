import type { Metadata } from "next";
import Link from "next/link";
import { AppPageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";
import { formatDateTime } from "@/lib/format";
import { can, getSessionContext } from "@/server/auth/session";
import { store } from "@/server/db/store";
import { DecisionButtons } from "./decision-form";

export const metadata: Metadata = { title: "Approvals" };

export const dynamic = "force-dynamic";

const RISK_CLS: Record<string, string> = {
  low: "border-ok/40 bg-ok/10 text-ok",
  medium: "border-warn/40 bg-warn/10 text-warn",
  high: "border-risk/40 bg-risk/10 text-risk",
};

export default async function ApprovalsPage() {
  const ctx = await getSessionContext();
  if (!ctx) return null;
  const orgId = ctx.organization.id;

  const [approvals, users] = await Promise.all([
    store.query("approvals", { organizationId: orgId }),
    store.all("users"),
  ]);
  const userNames = new Map(users.map((u) => [u.id, u.name]));

  const pending = approvals
    .filter((a) => a.status === "pending")
    .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  const decided = approvals
    .filter((a) => a.status !== "pending")
    .sort((a, b) => Date.parse(b.decidedAt ?? b.createdAt) - Date.parse(a.decidedAt ?? a.createdAt))
    .slice(0, 30);

  const canDecide = can(ctx, "approvals.decide");

  return (
    <div>
      <AppPageHeader
        title="Approvals"
        description="Consequential actions pause here until a person decides. Nothing runs without a recorded decision."
      />

      <h2 className="mb-3 text-sm font-semibold text-ink">Pending ({pending.length})</h2>
      {pending.length === 0 ? (
        <p className="border border-dashed border-fog px-6 py-8 text-center text-sm text-mute">
          Nothing waiting on a decision.
        </p>
      ) : (
        <div className="space-y-3">
          {pending.map((approval) => (
            <div key={approval.id} className="border border-fog bg-surface p-5">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-medium text-ink">{approval.action}</p>
                <span
                  className={`border px-1.5 py-px text-[11px] font-medium tracking-[0.08em] uppercase ${RISK_CLS[approval.riskLevel]}`}
                >
                  {approval.riskLevel} risk
                </span>
                <span className="border border-fog bg-haze px-1.5 py-px text-[11px] font-medium tracking-[0.08em] text-slate uppercase">
                  {approval.kind === "agent_tool" ? "agent tool" : "workflow"}
                </span>
                <span className="tnum ml-auto text-[11px] text-mute">
                  requested {formatDateTime(approval.createdAt)}
                </span>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-slate">{approval.rationale}</p>
              {Object.keys(approval.payload).length > 0 ? (
                <pre className="tnum mt-3 max-h-40 overflow-auto bg-haze p-3 text-[11px] leading-relaxed text-graphite">
                  {JSON.stringify(approval.payload, null, 2)}
                </pre>
              ) : null}
              <div className="mt-3 flex items-center justify-between gap-4">
                {approval.kind === "agent_tool" ? (
                  typeof approval.payload.agentId === "string" ? (
                    <Link
                      href={`/app/agents/${approval.payload.agentId}`}
                      className="text-[13px] text-slate hover:text-ink"
                    >
                      Open agent →
                    </Link>
                  ) : (
                    <span />
                  )
                ) : (
                  <Link
                    href={`/app/operations/${approval.executionId}`}
                    className="text-[13px] text-slate hover:text-ink"
                  >
                    Open execution →
                  </Link>
                )}
                {canDecide ? (
                  <DecisionButtons approvalId={approval.id} />
                ) : (
                  <p className="text-[13px] text-mute">Your role can view but not decide.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-10 mb-3 text-sm font-semibold text-ink">Decided</h2>
      {decided.length === 0 ? (
        <p className="border border-dashed border-fog px-6 py-8 text-center text-sm text-mute">
          No decisions recorded yet.
        </p>
      ) : (
        <div className="overflow-hidden border border-fog">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-fog bg-haze text-left text-[11px] font-medium tracking-[0.1em] text-mute uppercase">
                <th className="px-4 py-2.5">Action</th>
                <th className="px-4 py-2.5">Decision</th>
                <th className="px-4 py-2.5">Reviewer</th>
                <th className="px-4 py-2.5">Note</th>
                <th className="px-4 py-2.5">Decided</th>
              </tr>
            </thead>
            <tbody>
              {decided.map((approval) => (
                <tr key={approval.id} className="border-b border-fog last:border-0">
                  <td className="px-4 py-3 text-ink">{approval.action}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={approval.status} />
                  </td>
                  <td className="px-4 py-3 text-slate">
                    {approval.reviewerId ? (userNames.get(approval.reviewerId) ?? "—") : "—"}
                  </td>
                  <td className="max-w-56 truncate px-4 py-3 text-slate">
                    {approval.decisionNote ?? "—"}
                  </td>
                  <td className="tnum px-4 py-3 text-slate">
                    {approval.decidedAt ? formatDateTime(approval.decidedAt) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
