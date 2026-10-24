import type { Metadata } from "next";
import { AppPageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";
import { formatDateTime } from "@/lib/format";
import { can, getSessionContext } from "@/server/auth/session";
import { store } from "@/server/db/store";
import { DecisionButtons } from "./decision-form";
import { RiskPill, Tag } from "@/components/app/status-pill";
import { TextLink } from "@/components/app/text-link";

export const metadata: Metadata = { title: "Approvals" };

export const dynamic = "force-dynamic";

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
            <div key={approval.id} className="card card-pad">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-medium text-ink">{approval.action}</p>
                <RiskPill level={approval.riskLevel} />
                <Tag>{approval.kind === "agent_tool" ? "agent tool" : "workflow"}</Tag>
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
              <div className="mt-3 flex items-center justify-between gap-4">
                {approval.kind === "agent_tool" ? (
                  typeof approval.payload.agentId === "string" ? (
                    <TextLink href={`/app/agents/${approval.payload.agentId}`}>Open agent</TextLink>
                  ) : (
                    <span />
                  )
                ) : (
                  <TextLink href={`/app/operations/${approval.executionId}`}>Open execution</TextLink>
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
        <div className="table-wrap" tabIndex={0}>
          <table className="data-table">
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
                <tr key={approval.id} className="border-b border-fog last:border-0">
                  <td className="text-ink">{approval.action}</td>
                  <td>
                    <StatusPill status={approval.status} />
                  </td>
                  <td className="text-slate">
                    {approval.reviewerId ? (userNames.get(approval.reviewerId) ?? "—") : "—"}
                  </td>
                  <td className="max-w-56 truncate text-slate">
                    {approval.decisionNote ?? "—"}
                  </td>
                  <td className="tnum text-slate">
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
