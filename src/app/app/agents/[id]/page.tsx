import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppPageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";
import { getAgent, getCurrentVersion, listVersions } from "@/server/ai/agents";
import { listAgentRuns } from "@/server/ai/agent-runner";
import { modelInfo, providerStatus } from "@/server/ai/provider";
import { AGENT_TOOL_CATALOG } from "@/server/ai/tools";
import { listAiRuns } from "@/server/ai/usage";
import { can, getSessionContext } from "@/server/auth/session";
import { formatDateTime } from "@/lib/format";
import { AgentForm } from "../agent-form";
import { MODELS } from "@/server/ai/provider";
import { Playground } from "./playground";
import { StatusButtons } from "./status-buttons";

export const metadata: Metadata = { title: "Agent" };
export const dynamic = "force-dynamic";

const RUN_STATUS_CLS: Record<string, string> = {
  completed: "text-ok",
  failed: "text-risk",
  rejected: "text-risk",
  waiting_approval: "text-warn",
  running: "text-warn",
};

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getSessionContext();
  if (!ctx) return null;

  const { id } = await params;
  const agent = await getAgent(ctx.organization.id, id);
  if (!agent) notFound();
  if (!can(ctx, "agents.view")) {
    return (
      <AppPageHeader title={agent.name} description="Your role does not include viewing agents." />
    );
  }

  const canManage = can(ctx, "agents.manage");
  const [current, versions, runs, agentRuns] = await Promise.all([
    getCurrentVersion(agent.id),
    listVersions(agent.id),
    listAiRuns(ctx.organization.id, { agentId: agent.id, limit: 10 }),
    listAgentRuns(ctx.organization.id, { agentId: agent.id, limit: 5 }),
  ]);
  const provider = providerStatus();
  const toolOptions = AGENT_TOOL_CATALOG.map((t) => ({
    name: t.name,
    description: t.description,
    scope: t.scope,
    consequential: t.consequential,
  }));
  const grantedScopes = current?.permissionScopes ?? [];

  return (
    <div>
      <AppPageHeader
        title={agent.name}
        description={agent.purpose || agent.description || "Agent"}
      >
        <StatusPill status={agent.status} />
        {canManage ? <StatusButtons agentId={agent.id} status={agent.status} /> : null}
      </AppPageHeader>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          {canManage ? (
            <AgentForm
              agentId={agent.id}
              models={MODELS.map((m) => ({ key: m.key, label: `${m.label} (${m.providerKey})` }))}
              tools={toolOptions}
              initial={{
                name: agent.name,
                purpose: agent.purpose ?? "",
                description: agent.description,
                model: current?.model ?? MODELS[0].key,
                systemInstructions: current?.systemInstructions ?? "",
                scopes: grantedScopes,
              }}
            />
          ) : (
            <div className="border border-fog bg-paper p-6">
              <p className="text-[13px] font-medium text-ink">System instructions (current version)</p>
              <pre className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-slate">
                {current?.systemInstructions ?? "—"}
              </pre>
            </div>
          )}

          <div className="border border-fog bg-paper p-6">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-base font-medium text-ink">Playground</h2>
              <p className="text-[11px] text-mute">
                {provider.configured ? `Calls go to ${provider.provider}.` : "Provider not configured — runs report that honestly."}
              </p>
            </div>
            {canManage ? (
              <Playground agentId={agent.id} />
            ) : (
              <p className="text-[13px] text-slate">Only owners and admins can run the playground.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-fog bg-paper p-5">
            <h3 className="mb-3 text-[13px] font-medium tracking-wide text-ink uppercase">Versions</h3>
            <ul className="space-y-2">
              {versions.map((v) => (
                <li key={v.id} className="flex items-baseline justify-between border-b border-fog pb-2 text-[13px] last:border-0">
                  <span className="font-medium text-ink">
                    v{v.version}
                    {current?.id === v.id ? <span className="ml-2 text-[10px] tracking-[0.1em] text-accent uppercase">current</span> : null}
                  </span>
                  <span className="text-slate">{modelInfo(v.model)?.label ?? v.model}</span>
                  <span className="tnum text-mute">{formatDateTime(v.createdAt)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t border-fog pt-3">
              <p className="mb-1.5 text-[11px] font-medium tracking-wide text-ink uppercase">Granted scopes (current version)</p>
              {grantedScopes.length === 0 ? (
                <p className="text-[12px] text-mute">No tools granted — this version answers with text only.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {grantedScopes.map((scope) => {
                    const tool = AGENT_TOOL_CATALOG.find((t) => t.scope === scope);
                    return (
                      <span
                        key={scope}
                        className="border border-fog bg-haze px-1.5 py-px text-[11px] text-graphite"
                        title={tool?.description}
                      >
                        {tool?.name ?? scope}
                        {tool?.consequential ? " ⏸" : ""}
                      </span>
                    );
                  })}
                </div>
              )}
              <p className="mt-2 text-[11px] leading-relaxed text-mute">
                Approval policy: consequential actions (⏸) require human approval — the reviewer sees
                and authorizes the exact tool arguments.
              </p>
            </div>
          </div>

          <div className="border border-fog bg-paper p-5">
            <h3 className="mb-3 text-[13px] font-medium tracking-wide text-ink uppercase">Agent runs</h3>
            {agentRuns.length === 0 ? (
              <p className="text-[13px] text-slate">No tool-enabled runs yet.</p>
            ) : (
              <ul className="space-y-2.5">
                {agentRuns.map((run) => (
                  <li key={run.id} className="text-[12px]">
                    <div className="flex items-baseline justify-between">
                      <span className="font-medium text-ink">
                        {run.source}
                        <span className={`ml-2 ${RUN_STATUS_CLS[run.status] ?? "text-slate"}`}>
                          {run.status.replace("_", " ")}
                        </span>
                      </span>
                      <span className="tnum text-mute">{formatDateTime(run.createdAt)}</span>
                    </div>
                    <p className="tnum mt-0.5 text-slate">
                      {run.turns} turn{run.turns === 1 ? "" : "s"} · {run.invocations.length} tool call
                      {run.invocations.length === 1 ? "" : "s"}
                    </p>
                    {run.status === "waiting_approval" ? (
                      <p className="mt-0.5 text-warn">
                        Paused at {run.pendingToolCalls[0]?.name ?? "a tool"} —{" "}
                        <Link href="/app/approvals" className="underline underline-offset-2">
                          decide in Approvals
                        </Link>
                      </p>
                    ) : null}
                    {run.error ? <p className="mt-0.5 text-risk">{run.error}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border border-fog bg-paper p-5">
            <h3 className="mb-3 text-[13px] font-medium tracking-wide text-ink uppercase">Recent model runs</h3>
            {runs.length === 0 ? (
              <p className="text-[13px] text-slate">No recorded calls for this agent yet.</p>
            ) : (
              <ul className="space-y-2.5">
                {runs.map((run) => (
                  <li key={run.id} className="text-[12px]">
                    <div className="flex items-baseline justify-between">
                      <span className="font-medium text-ink">
                        {run.source}
                        <span className={run.status === "completed" ? "ml-2 text-ok" : "ml-2 text-risk"}>
                          {run.status}
                        </span>
                      </span>
                      <span className="tnum text-mute">{formatDateTime(run.createdAt)}</span>
                    </div>
                    <p className="tnum mt-0.5 text-slate">
                      {run.promptTokens + run.completionTokens} tokens ·{" "}
                      {run.costEstimatedUsd !== null ? `$${run.costEstimatedUsd.toFixed(5)} (est.)` : "cost n/a"} ·{" "}
                      {run.latencyMs}ms
                    </p>
                    {run.error ? <p className="mt-0.5 text-risk">{run.error}</p> : null}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 border-t border-fog pt-3 text-[11px] leading-relaxed text-mute">
              Tokens are provider-reported (actual). USD is an estimate at list price.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
