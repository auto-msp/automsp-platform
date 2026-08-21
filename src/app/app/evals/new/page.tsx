import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppPageHeader } from "@/components/app/page-header";
import { listAgents } from "@/server/ai/agents";
import { can, getSessionContext } from "@/server/auth/session";
import { SuiteForm } from "../suite-form";

export const metadata: Metadata = { title: "New evaluation suite" };
export const dynamic = "force-dynamic";

export default async function NewSuitePage() {
  const ctx = await getSessionContext();
  if (!ctx) return null;
  if (!can(ctx, "evals.run")) redirect("/app/evals");

  const agents = await listAgents(ctx.organization.id);

  return (
    <div>
      <AppPageHeader
        title="New evaluation suite"
        description="Pin an agent to cases and a scorer. LLM-judge scoring consumes tokens (recorded like any call) and is a model opinion, not ground truth."
      />
      <div className="max-w-xl">
        <SuiteForm agents={agents.map((a) => ({ id: a.id, name: a.name }))} />
      </div>
    </div>
  );
}
