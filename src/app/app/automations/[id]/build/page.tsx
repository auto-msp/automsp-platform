import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppPageHeader } from "@/components/app/page-header";
import { listAgents } from "@/server/ai/agents";
import { listSources } from "@/server/ai/knowledge";
import { can, getSessionContext } from "@/server/auth/session";
import { getAutomation, getCurrentDefinition } from "@/server/automations";
import { listUsableCredentials } from "@/server/integrations";
import type { WorkflowNodeRecord } from "@/server/db/types";
import { Builder } from "./builder";

export const metadata: Metadata = { title: "Automation builder" };

export const dynamic = "force-dynamic";

export default async function AutomationBuildPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await getSessionContext();
  if (!ctx) return null;
  const orgId = ctx.organization.id;

  const { id } = await params;
  const automation = await getAutomation(orgId, id);
  if (!automation) notFound();
  if (!can(ctx, "automations.manage")) notFound();

  const current = await getCurrentDefinition(id);
  const nodes: WorkflowNodeRecord[] = current?.definition.nodes ?? [
    { key: "trigger", type: "trigger", config: { triggerType: "manual" } },
  ];
  // Only metadata (id/name/provider) crosses to the client — never secrets.
  const credentials = await listUsableCredentials(orgId);
  const [agents, knowledgeSources] = await Promise.all([
    listAgents(orgId),
    listSources(orgId),
  ]);

  return (
    <div>
      <AppPageHeader
        title={`Builder — ${automation.name}`}
        description="Steps run top to bottom. Use {{input.field}} placeholders to reference run input; template steps set {{vars.*}}."
      >
        <span className="tnum text-sm text-slate">Current: v{current?.version.version ?? 0}</span>
        <Link href={`/app/automations/${automation.id}`} className="text-[13px] text-slate hover:text-ink">
          ← Back
        </Link>
      </AppPageHeader>

      <Builder
        automationId={automation.id}
        initialNodes={nodes}
        credentials={credentials}
        agents={agents.map((a) => ({ id: a.id, name: a.name }))}
        knowledgeSources={knowledgeSources.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
