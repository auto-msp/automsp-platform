import type { Metadata } from "next";
import Link from "next/link";
import { AppPageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { StatusPill } from "@/components/app/status-pill";
import { listAgents } from "@/server/ai/agents";
import { modelInfo, providerStatus } from "@/server/ai/provider";
import { can, getSessionContext } from "@/server/auth/session";
import { formatDateTime, truncateId } from "@/lib/format";
import { SeedFleetButton } from "./seed-fleet-button";

export const metadata: Metadata = { title: "Agents" };
export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const ctx = await getSessionContext();
  if (!ctx) return null;
  if (!can(ctx, "agents.view")) {
    return (
      <EmptyState
        title="No access"
        description="Your role does not include agents. Ask an organization owner or admin."
      />
    );
  }

  const rows = await listAgents(ctx.organization.id);
  const canManage = can(ctx, "agents.manage");
  const provider = providerStatus();

  return (
    <div>
      <AppPageHeader
        title="Agents"
        description="Versioned model runners — instructions and model choices are recorded per version. Seed the nine-specialist starter fleet (Orchestrator, Social, Outreach, Support, Ads, Finance, and more), then tailor each one. Consequential tool calls always pause for approval."
      >
        <div className="flex items-start gap-3">
          {canManage ? <SeedFleetButton /> : null}
          {canManage ? (
            <Link
              href="/app/agents/new"
              className="btn btn-primary btn-sm"
            >
              New agent
            </Link>
          ) : null}
        </div>
      </AppPageHeader>

      <div className="mb-6 border border-fog bg-haze px-4 py-3 rounded-lg">
        <p className="text-[13px] text-slate">
          {provider.configured ? (
            <>
              <span className="font-medium text-ok">AI provider configured</span> — calls route through{" "}
              <span className="text-ink">{provider.provider}</span>. Token counts are actual (provider-reported); cost
              figures are list-price estimates.
            </>
          ) : (
            <>
              <span className="font-medium text-warn">No AI provider configured.</span> Agents are fully defined and
              editable, but model calls are skipped honestly — set{" "}
              <code className="text-ink">ANTHROPIC_API_KEY</code>, <code className="text-ink">OPENAI_API_KEY</code>, or{" "}
              <code className="text-ink">GOOGLE_GENERATIVE_AI_API_KEY</code> in the server environment to enable them.
            </>
          )}
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No agents yet"
          description="An agent is a named, versioned pairing of model and instructions that workflow AI steps and evaluations reference."
          action={canManage ? { href: "/app/agents/new", label: "Create the first agent" } : undefined}
        />
      ) : (
        <div className="table-wrap" tabIndex={0}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Model (current version)</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Id</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-fog last:border-0">
                  <td>
                    <Link href={`/app/agents/${row.id}`} className="font-medium text-ink hover:underline">
                      {row.name}
                    </Link>
                    {row.purpose ? <p className="mt-0.5 text-xs text-slate">{row.purpose}</p> : null}
                  </td>
                  <td className="text-slate">
                    {row.currentModel ? (modelInfo(row.currentModel)?.label ?? row.currentModel) : "—"}
                  </td>
                  <td>
                    <StatusPill status={row.status} />
                  </td>
                  <td className="tnum text-slate">{formatDateTime(row.updatedAt)}</td>
                  <td className="tnum text-mute">{truncateId(row.id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
