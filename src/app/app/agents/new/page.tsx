import type { Metadata } from "next";
import { AppPageHeader } from "@/components/app/page-header";
import { MODELS } from "@/server/ai/provider";
import { AGENT_TOOL_CATALOG } from "@/server/ai/tools";
import { can, getSessionContext } from "@/server/auth/session";
import { redirect } from "next/navigation";
import { AgentForm } from "../agent-form";

export const metadata: Metadata = { title: "New agent" };
export const dynamic = "force-dynamic";

export default async function NewAgentPage() {
  const ctx = await getSessionContext();
  if (!ctx) return null;
  if (!can(ctx, "agents.manage")) redirect("/app/agents");

  return (
    <div>
      <AppPageHeader
        title="New agent"
        description="Creates the agent with version 1 — every later save adds an auditable version."
      />
      <AgentForm
        models={MODELS.map((m) => ({ key: m.key, label: `${m.label} (${m.providerKey})` }))}
        tools={AGENT_TOOL_CATALOG.map((t) => ({
          name: t.name,
          description: t.description,
          scope: t.scope,
          consequential: t.consequential,
        }))}
      />
    </div>
  );
}
