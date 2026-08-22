import "server-only";
import { newId } from "@/server/db/id";
import { store } from "@/server/db/store";
import type { AgentRecord, AgentVersionRecord, AiRunSource } from "@/server/db/types";
import { retrieve } from "./knowledge";
import { DEFAULT_MODEL_BY_PROVIDER, getProvider, modelInfo } from "./provider";
import { recordAiRun } from "./usage";

/**
 * Versioned agents: every save creates a new AgentVersion, so instructions,
 * model choices, and granted tool scopes are auditable like automation
 * definitions. Tool scopes are least-privilege grants from the registry in
 * ./tools — a version without a scope can never execute that tool, and the
 * agent runner enforces the grant server-side.
 */

export const DEFAULT_APPROVAL_POLICY = { consequentialActions: "require_approval" } as const;
export const DEFAULT_LIMITS = { maxOutputTokens: 1024, timeoutMs: 30_000 } as const;

export async function listAgents(organizationId: string): Promise<(AgentRecord & { currentModel: string | null })[]> {
  const agents = await store.query("agents", { organizationId });
  const versions = await store.all("agent_versions");
  return agents
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .map((agent) => {
      const current = versions.filter((v) => v.agentId === agent.id).sort((a, b) => b.version - a.version)[0];
      return { ...agent, currentModel: current?.model ?? null };
    });
}

export async function getAgent(organizationId: string, id: string): Promise<AgentRecord | null> {
  const agent = await store.get("agents", id);
  if (!agent || agent.organizationId !== organizationId) return null;
  return agent;
}

export async function getCurrentVersion(agentId: string): Promise<AgentVersionRecord | null> {
  const versions = await store.query("agent_versions", { agentId });
  return versions.sort((a, b) => b.version - a.version)[0] ?? null;
}

export async function listVersions(agentId: string): Promise<AgentVersionRecord[]> {
  const versions = await store.query("agent_versions", { agentId });
  return versions.sort((a, b) => b.version - a.version);
}

export async function createAgent(
  organizationId: string,
  input: {
    name: string;
    purpose: string;
    description: string;
    model: string;
    systemInstructions: string;
    permissionScopes?: string[];
  },
  createdBy: string,
): Promise<AgentRecord> {
  const now = new Date().toISOString();
  const agent: AgentRecord = {
    id: newId(),
    organizationId,
    systemId: null,
    name: input.name,
    purpose: input.purpose || null,
    description: input.description,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    createdBy,
  };
  await store.insert("agents", agent);
  await store.insert("agent_versions", {
    id: newId(),
    agentId: agent.id,
    version: 1,
    model: input.model,
    systemInstructions: input.systemInstructions,
    permissionScopes: input.permissionScopes ?? [],
    approvalPolicy: DEFAULT_APPROVAL_POLICY,
    limits: DEFAULT_LIMITS,
    createdAt: now,
    createdBy,
  });
  return agent;
}

/** Every material save is a new version — instructions/models/scopes are auditable. */
export async function saveAgentVersion(
  organizationId: string,
  agentId: string,
  input: {
    model: string;
    systemInstructions: string;
    name?: string;
    purpose?: string;
    description?: string;
    /** granted tool scopes; omit to carry the current version's grants forward */
    permissionScopes?: string[];
  },
  createdBy: string,
): Promise<AgentVersionRecord | null> {
  const agent = await getAgent(organizationId, agentId);
  if (!agent) return null;
  const current = await getCurrentVersion(agentId);
  const version: AgentVersionRecord = {
    id: newId(),
    agentId,
    version: (current?.version ?? 0) + 1,
    model: input.model,
    systemInstructions: input.systemInstructions,
    permissionScopes: input.permissionScopes ?? current?.permissionScopes ?? [],
    approvalPolicy: current?.approvalPolicy ?? DEFAULT_APPROVAL_POLICY,
    limits: current?.limits ?? DEFAULT_LIMITS,
    createdAt: new Date().toISOString(),
    createdBy,
  };
  await store.insert("agent_versions", version);
  await store.update("agents", agentId, {
    name: input.name ?? agent.name,
    purpose: input.purpose ?? agent.purpose,
    description: input.description ?? agent.description,
    updatedAt: version.createdAt,
  });
  return version;
}

export async function setAgentStatus(
  organizationId: string,
  agentId: string,
  status: AgentRecord["status"],
): Promise<boolean> {
  const agent = await getAgent(organizationId, agentId);
  if (!agent) return false;
  await store.update("agents", agentId, { status, updatedAt: new Date().toISOString() });
  return true;
}

// ── The one call path for completions ───────────────────────────────────────

export interface AgentCompletionInput {
  organizationId: string;
  prompt: string;
  agentId?: string | null;
  source: AiRunSource;
  executionId?: string | null;
  evalRunId?: string | null;
  /** retrieval scope; when present, top-K chunks are prepended as context */
  knowledge?: { sourceId?: string; topK: number };
}

export type AgentCompletionResult =
  | {
      ok: true;
      text: string;
      model: string;
      agentName: string | null;
      promptTokens: number;
      completionTokens: number;
      costEstimatedUsd: number | null;
      latencyMs: number;
      retrieval: { method: "semantic" | "lexical"; chunks: number } | null;
    }
  | { ok: false; notConfigured?: boolean; error: string };

/**
 * Run one completion. Returns `notConfigured` (instead of failing) when no
 * provider key exists, so callers can render the honest "provider not
 * configured" state rather than an error noise.
 */
export async function runAgentCompletion(input: AgentCompletionInput): Promise<AgentCompletionResult> {
  const provider = getProvider();
  if (!provider) {
    return {
      ok: false,
      notConfigured: true,
      error: "No AI provider is configured for this environment. Set one of ANTHROPIC_API_KEY, OPENAI_API_KEY, or GOOGLE_GENERATIVE_AI_API_KEY (server-side) to enable model calls.",
    };
  }

  // Resolve the agent (org-guarded) when referenced; a stale id is an error,
  // not a silent fallback to defaults.
  let agentName: string | null = null;
  let system = "";
  let model = DEFAULT_MODEL_BY_PROVIDER[provider.key];
  let limits: { maxOutputTokens: number; timeoutMs: number } = DEFAULT_LIMITS;
  if (input.agentId) {
    const agent = await getAgent(input.organizationId, input.agentId);
    if (!agent) return { ok: false, error: "The referenced agent does not exist in this organization." };
    const version = await getCurrentVersion(agent.id);
    if (!version) return { ok: false, error: "This agent has no saved version yet." };
    // A saved model from another provider silently swapping would be
    // dishonest: the recorded run keeps the agent's model key, and the
    // provider falls back to its default only when truly incompatible.
    const info = modelInfo(version.model);
    model = !info || info.providerKey === provider.key ? version.model : DEFAULT_MODEL_BY_PROVIDER[provider.key];
    agentName = agent.name;
    system = version.systemInstructions;
    limits = version.limits;
  }

  // Retrieval, when requested. The method used (semantic|lexical) is part of
  // the result and of the recorded run.
  let retrievalMeta: { method: "semantic" | "lexical"; chunks: number } | null = null;
  let userPrompt = input.prompt;
  if (input.knowledge) {
    const retrieved = await retrieve(input.organizationId, {
      query: input.prompt,
      sourceId: input.knowledge.sourceId,
      topK: input.knowledge.topK,
    });
    if (retrieved.chunks.length > 0) {
      const context = retrieved.chunks
        .map((c, i) => `[${i + 1}] (${c.documentName}) ${c.content}`)
        .join("\n\n");
      userPrompt = `Answer using the context below when relevant. If the context does not cover the question, say so.\n\n<context>\n${context}\n</context>\n\n${input.prompt}`;
    }
    retrievalMeta = { method: retrieved.method, chunks: retrieved.chunks.length };
  }

  try {
    const result = await provider.complete({
      model,
      system: system || undefined,
      messages: [{ role: "user", content: userPrompt }],
      maxTokens: limits.maxOutputTokens,
      temperature: 0.2,
    });
    const run = await recordAiRun({
      organizationId: input.organizationId,
      agentId: input.agentId ?? null,
      executionId: input.executionId ?? null,
      evalRunId: input.evalRunId ?? null,
      source: input.source,
      provider: provider.key,
      model: result.model,
      status: "completed",
      inputText: input.prompt,
      outputText: result.text,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      latencyMs: result.latencyMs,
      retrievalMethod: retrievalMeta?.method ?? null,
      retrievalChunks: retrievalMeta?.chunks ?? null,
    });
    return {
      ok: true,
      text: result.text,
      model: result.model,
      agentName,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      costEstimatedUsd: run.costEstimatedUsd,
      latencyMs: result.latencyMs,
      retrieval: retrievalMeta,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Model call failed";
    await recordAiRun({
      organizationId: input.organizationId,
      agentId: input.agentId ?? null,
      executionId: input.executionId ?? null,
      evalRunId: input.evalRunId ?? null,
      source: input.source,
      provider: provider.key,
      model,
      status: "failed",
      inputText: input.prompt,
      error: message,
      retrievalMethod: retrievalMeta?.method ?? null,
      retrievalChunks: retrievalMeta?.chunks ?? null,
    });
    return { ok: false, error: message };
  }
}
