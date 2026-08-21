"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAgent, runAgentCompletion, saveAgentVersion, setAgentStatus } from "@/server/ai/agents";
import { MODELS } from "@/server/ai/provider";
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

  const version = await saveAgentVersion(
    ctx.organization.id,
    agentId,
    {
      name: parsed.data.name,
      purpose: parsed.data.purpose ?? "",
      description: parsed.data.description ?? "",
      model: parsed.data.model,
      systemInstructions: parsed.data.systemInstructions,
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
    metadata: { version: version.version, model: parsed.data.model },
  });
  revalidatePath(`/app/agents/${agentId}`);
  return {};
}

export interface PlaygroundState {
  error?: string;
  notConfigured?: boolean;
  result?: {
    text: string;
    model: string;
    promptTokens: number;
    completionTokens: number;
    costEstimatedUsd: number | null;
    latencyMs: number;
    retrieval: { method: string; chunks: number } | null;
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

  const result = await runAgentCompletion({
    organizationId: ctx.organization.id,
    agentId,
    prompt: parsed.data.prompt,
    source: "playground",
  });
  if (!result.ok) {
    return { error: result.error, notConfigured: result.notConfigured === true };
  }
  return {
    result: {
      text: result.text,
      model: result.model,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      costEstimatedUsd: result.costEstimatedUsd,
      latencyMs: result.latencyMs,
      retrieval: result.retrieval,
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
