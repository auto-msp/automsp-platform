import type { Metadata } from "next";
import Link from "next/link";
import { AppPageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";
import { formatDateTime } from "@/lib/format";
import { can, getSessionContext } from "@/server/auth/session";
import { store } from "@/server/db/store";
import { DecisionButtons } from "./decision-form";
import { ArrowRight, CircleCheck, OctagonAlert, TriangleAlert, type LucideIcon } from "lucide-react";

export const metadata: Metadata = { title: "Approvals" };

export const dynamic = "force-dynamic";

// Risk is shown with an icon and a word, never colour alone.
const RISK: Record<string, { cls: string; icon: LucideIcon }> = {
  low: { cls: "bg-ok-soft text-ok", icon: CircleCheck },
  medium: { cls: "bg-warn-soft text-warn", icon: TriangleAlert },
  high: { cls: "bg-risk-soft text-risk", icon: OctagonAlert },
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

      <h2 className="mb-3 text-[15px] leading-5 font-semibold text-ink">Pending ({pending.length})</h2>
      {pending.length === 0 ? (
        <p className="empty-note">
          Nothing waiting on a decision.
        </p>
      ) : (
        <div className="space-y-3">
          {pending.map((approval) => (
            <div key={approval.id} className="border border-fog border-l-4 border-l-brand bg-surface p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-medium text-ink">{approval.action}</p>
                {(() => {
                  const risk = RISK[approval.riskLevel] ?? RISK.medium;
                  const RiskIcon = risk.icon;
                  return (
                    <span
                      className={`inline-flex items-center gap-1 rounded-(--radius-chip) px-2 py-0.5 text-xs font-semibold capitalize ${risk.cls}`}
                    >
                      <RiskIcon aria-hidden className="size-3.5" strokeWidth={2} />
                      {approval.riskLevel} risk
                    </span>
                  );
                })()}
                <span className="rounded-(--radius-chip) bg-haze px-2 py-0.5 text-xs font-medium text-graphite">
                  {approval.kind === "agent_tool" ? "agent tool" : "workflow"}
                </span>
                <span className="tnum ml-auto text-xs text-mute">
                  requested {formatDateTime(approval.createdAt)}
                </span>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-slate">{approval.rationale}</p>
              {Object.keys(approval.payload).length > 0 ? (
                <pre className="tnum mt-3 max-h-40 overflow-auto bg-haze p-3 text-xs leading-relaxed text-graphite">
                  {JSON.stringify(approval.payload, null, 2)}
                </pre>
              ) : null}
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                {approval.kind === "agent_tool" ? (
                  typeof approval.payload.agentId === "string" ? (
                    <Link
                      href={`/app/agents/${approval.payload.agentId}`}
                      className="inline-flex min-h-11 items-center text-[13px] font-medium text-accent hover:underline"
                    >
                      Open agent<ArrowRight aria-hidden className="ml-1 inline size-4 align-[-0.2em]" strokeWidth={2} />
                    </Link>
                  ) : (
                    <span />
                  )
                ) : (
                  <Link
                    href={`/app/operations/${approval.executionId}`}
                    className="inline-flex min-h-11 items-center text-[13px] font-medium text-accent hover:underline"
                  >
                    Open execution<ArrowRight aria-hidden className="ml-1 inline size-4 align-[-0.2em]" strokeWidth={2} />
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

      <h2 className="mt-10 mb-3 text-[15px] leading-5 font-semibold text-ink">Decided</h2>
      {decided.length === 0 ? (
        <p className="empty-note">
          No decisions recorded yet.
        </p>
      ) : (
        <div className="table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Decision</th>
                <th>Reviewer</th>
                <th>Note</th>
                <th>Decided</th>
              </tr>
            </thead>
            <tbody>
              {decided.map((approval) => (
                <tr key={approval.id}>
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
