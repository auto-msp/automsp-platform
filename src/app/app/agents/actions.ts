"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { startAgentRun } from "@/server/ai/agent-runner";
import { createAgent, saveAgentVersion, setAgentStatus } from "@/server/ai/agents";
import { seedFleet } from "@/server/ai/fleet";
import { MODELS } from "@/server/ai/provider";
import { AGENT_TOOL_CATALOG } from "@/server/ai/tools";
import { writeAuditLog } from "@/server/audit";
import { getSessionContext, requirePermission } from "@/server/auth/session";

export interface AgentFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

const agentSchema = z.object({
  name: z.string().trim().min(2, "Give the agent a name").max(120),
  purpose: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  model: z.string().trim().min(2).max(120),
  systemInstructions: z.string().trim().min(10, "Instructions give the agent its role").max(12000),
});

function validModel(model: string): boolean {
  return MODELS.some((m) => m.key === model);
}

/** Repeated `scope` form fields, restricted to scopes that exist in the tool registry. */
function readScopes(formData: FormData): string[] {
  const known = new Set(AGENT_TOOL_CATALOG.map((t) => t.scope));
  return [...new Set(formData.getAll("scope").map(String))].filter((s) => known.has(s));
}

export async function createAgentAction(
  _prev: AgentFormState | null,
  formData: FormData,
): Promise<AgentFormState> {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");
  try {
    requirePermission(ctx, "agents.manage");
  } catch {
    return { error: "Your role cannot manage agents." };
  }

  const parsed = agentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  if (!validModel(parsed.data.model)) return { error: "Unknown model." };

  const agent = await createAgent(
    ctx.organization.id,
    {
      name: parsed.data.name,
      purpose: parsed.data.purpose ?? "",
      description: parsed.data.description ?? "",
      model: parsed.data.model,
      systemInstructions: parsed.data.systemInstructions,
      permissionScopes: readScopes(formData),
    },
    ctx.user.id,
  );
  await writeAuditLog({
    organizationId: ctx.organization.id,
    actorId: ctx.user.id,
    action: "agent.created",
    resource: "agent",
    resourceId: agent.id,
    metadata: { name: agent.name, model: parsed.data.model },
  });
  redirect(`/app/agents/${agent.id}`);
}

export async function saveAgentAction(
  agentId: string,
  _prev: AgentFormState | null,
  formData: FormData,
): Promise<AgentFormState> {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");
  try {
    requirePermission(ctx, "agents.manage");
  } catch {
    return { error: "Your role cannot manage agents." };
  }

  const parsed = agentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  if (!validModel(parsed.data.model)) return { error: "Unknown model." };

  const permissionScopes = readScopes(formData);
  const version = await saveAgentVersion(
    ctx.organization.id,
    agentId,
    {
      name: parsed.data.name,
      purpose: parsed.data.purpose ?? "",
      description: parsed.data.description ?? "",
      model: parsed.data.model,
      systemInstructions: parsed.data.systemInstructions,
      permissionScopes,
    },
    ctx.user.id,
  );
  if (!version) return { error: "Agent not found." };
  await writeAuditLog({
    organizationId: ctx.organization.id,
    actorId: ctx.user.id,
    action: "agent.version_saved",
    resource: "agent",
    resourceId: agentId,
    metadata: { version: version.version, model: parsed.data.model, scopes: permissionScopes },
  });
  revalidatePath(`/app/agents/${agentId}`);
  return {};
}

export interface PlaygroundInvocation {
  name: string;
  status: string;
  resultPreview: string | null;
  error: string | null;
}

export interface PlaygroundState {
  error?: string;
  notConfigured?: boolean;
  run?: {
    id: string;
    status: "running" | "waiting_approval" | "completed" | "failed" | "rejected";
    finalText: string | null;
    error: string | null;
    turns: number;
    invocations: PlaygroundInvocation[];
  };
}

const playgroundSchema = z.object({
  prompt: z.string().trim().min(2, "Write a prompt to test with").max(8000),
});

export async function runPlaygroundAction(
  agentId: string,
  _prev: PlaygroundState | null,
  formData: FormData,
): Promise<PlaygroundState> {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");
  try {
    requirePermission(ctx, "agents.manage");
  } catch {
    return { error: "Your role cannot run agents." };
  }

  const parsed = playgroundSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "A prompt is required." };
  }

  // Agent runs go through the tool runner: scope-gated tool calling with
  // consequential-action approval pauses. No tools granted → a plain
  // single-turn completion, recorded the same way.
  const result = await startAgentRun({
    organizationId: ctx.organization.id,
    agentId,
    prompt: parsed.data.prompt,
    source: "playground",
    createdBy: ctx.user.id,
  });
  if (!result.ok) {
    return { error: result.error, notConfigured: result.notConfigured === true };
  }
  const run = result.run;
  revalidatePath(`/app/agents/${agentId}`);
  return {
    run: {
      id: run.id,
      status: run.status,
      finalText: run.finalText,
      error: run.error,
      turns: run.turns,
      invocations: run.invocations.map((inv) => ({
        name: inv.call.name,
        status: inv.status,
        resultPreview: inv.resultPreview,
        error: inv.error,
      })),
    },
  };
}

export async function setAgentStatusAction(
  agentId: string,
  status: "draft" | "testing" | "approved" | "production" | "paused" | "archived",
): Promise<void> {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");
  requirePermission(ctx, "agents.manage");
  await setAgentStatus(ctx.organization.id, agentId, status);
  await writeAuditLog({
    organizationId: ctx.organization.id,
    actorId: ctx.user.id,
    action: "agent.status_changed",
    resource: "agent",
    resourceId: agentId,
    metadata: { status },
  });
  revalidatePath(`/app/agents/${agentId}`);
}

export interface SeedFleetState {
  error?: string;
  success?: string;
}

export async function seedFleetAction(
  _prev: SeedFleetState | null,
  _formData: FormData,
): Promise<SeedFleetState> {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");
  try {
    requirePermission(ctx, "agents.manage");
  } catch {
    return { error: "Your role cannot manage agents." };
  }

  const { created, skipped } = await seedFleet(ctx.organization.id, ctx.user.id);
  if (created.length === 0) {
    return { success: `Starter fleet already present — ${skipped} agent(s) skipped.` };
  }

  await writeAuditLog({
    organizationId: ctx.organization.id,
    actorId: ctx.user.id,
    action: "fleet.seeded",
    resource: "agent",
    metadata: { created: created.map((c) => c.name) },
  });
  revalidatePath("/app/agents");

  return {
    success: `Seeded ${created.length} specialist agent(s): ${created.map((c) => c.name).join(", ")}.`,
  };
}
