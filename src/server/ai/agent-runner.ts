import "server-only";
import { writeAuditLog } from "@/server/audit";
import { newId } from "@/server/db/id";
import { store } from "@/server/db/store";
import type {
  AgentRunRecord,
  AgentTranscriptMessage,
  AgentToolCallRecord,
  AgentToolInvocationRecord,
  AgentVersionRecord,
  ApprovalRecord,
} from "@/server/db/types";
import { notify } from "@/server/notifications";
import { DEFAULT_APPROVAL_POLICY, DEFAULT_LIMITS, getAgent, getCurrentVersion } from "./agents";
import { DEFAULT_MODEL_BY_PROVIDER, getProvider, modelInfo, type AiProvider, type ToolSchema } from "./provider";
import { executeTool, toolByName, toolsForScopes } from "./tools";
import { recordAiRun } from "./usage";

/**
 * Agent tool runner. A run is a multi-turn loop: the model completes a turn,
 * may request tool calls, and the runner executes them under two gates —
 *
 *  1. Scope gate: the tool's scope must be granted on the running agent
 *     version. A denied call is fed back to the model as a tool result so it
 *     can react (it is never executed).
 *  2. Approval gate: consequential tools pause the run. The persisted
 *     ApprovalRecord pins the EXACT arguments the model supplied; approving
 *     executes those recorded arguments verbatim — the tool is never re-asked
 *     of the model, so nothing a reviewer approved can silently change.
 *
 * Every model call records an AiRun (source "agent", linked by agentRunId).
 * With no provider key the run is not created and callers get the honest
 * notConfigured signal — nothing is simulated.
 */

export const AGENT_RUN_MAX_TURNS = 6;

/** tool result text fed back into the transcript (truncated) */
const TOOL_MESSAGE_LIMIT = 2_000;
/** invocation preview stored on the run record */
const INVOCATION_PREVIEW = 400;

export interface StartAgentRunInput {
  organizationId: string;
  agentId: string;
  prompt: string;
  source: "playground";
  createdBy: string | null;
}

export type StartAgentRunResult =
  | { ok: true; run: AgentRunRecord }
  | { ok: false; notConfigured?: boolean; error: string };

export async function startAgentRun(
  input: StartAgentRunInput,
  /** test seam: scripted provider for verification runs; production uses getProvider() */
  providerOverride?: AiProvider,
): Promise<StartAgentRunResult> {
  const provider = providerOverride ?? getProvider();
  if (!provider) {
    return {
      ok: false,
      notConfigured: true,
      error:
        "No AI provider is configured for this environment. Set one of ANTHROPIC_API_KEY, OPENAI_API_KEY, or GOOGLE_GENERATIVE_AI_API_KEY (server-side) to enable model calls.",
    };
  }

  const agent = await getAgent(input.organizationId, input.agentId);
  if (!agent) return { ok: false, error: "The referenced agent does not exist in this organization." };
  const version = await getCurrentVersion(agent.id);
  if (!version) return { ok: false, error: "This agent has no saved version yet." };

  // Granted scopes without tool-call support would silently degrade the
  // agent — fail honestly instead so operators can switch providers.
  const granted = toolsForScopes(version.permissionScopes);
  if (granted.length > 0 && !provider.supportsTools) {
    return {
      ok: false,
      error: `The configured provider (${provider.key}) does not support tool calling in this release. Remove the granted tool scopes from this agent version, or use an Anthropic or OpenAI key.`,
    };
  }

  const now = new Date().toISOString();
  const run: AgentRunRecord = {
    id: newId(),
    organizationId: input.organizationId,
    agentId: agent.id,
    agentVersionId: version.id,
    status: "running",
    messages: [{ role: "user", content: input.prompt }],
    invocations: [],
    pendingToolCalls: [],
    finalText: null,
    error: null,
    turns: 0,
    maxTurns: AGENT_RUN_MAX_TURNS,
    source: input.source,
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
  };
  await store.insert("agent_runs", run);

  await driveRun(run.id, providerOverride);
  const final = await store.get("agent_runs", run.id);
  return { ok: true, run: final ?? run };
}

export async function getAgentRun(
  organizationId: string,
  id: string,
): Promise<AgentRunRecord | null> {
  const run = await store.get("agent_runs", id);
  if (!run || run.organizationId !== organizationId) return null;
  return run;
}

export async function listAgentRuns(
  organizationId: string,
  { agentId, limit }: { agentId?: string; limit?: number } = {},
): Promise<AgentRunRecord[]> {
  const rows = await store.find(
    "agent_runs",
    (r) => r.organizationId === organizationId && (!agentId || r.agentId === agentId),
  );
  return rows.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, limit ?? 20);
}

function resolveModel(version: AgentVersionRecord, provider: AiProvider): string {
  const info = modelInfo(version.model);
  return !info || info.providerKey === provider.key
    ? version.model
    : DEFAULT_MODEL_BY_PROVIDER[provider.key];
}

/**
 * Run turns until the model answers with plain text, the run waits on an
 * approval, or the turn cap is hit. Loads and persists the run record around
 * every mutation so a paused run resumes from durable state.
 */
async function driveRun(runId: string, providerOverride?: AiProvider): Promise<void> {
  let run = await store.get("agent_runs", runId);
  if (!run || run.status !== "running") return;

  const provider = providerOverride ?? getProvider();
  if (!provider) {
    await store.update("agent_runs", runId, {
      status: "failed",
      error: "No AI provider is configured for this environment — the run could not continue.",
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  const version = await store.get("agent_versions", run.agentVersionId);
  if (!version) {
    await store.update("agent_runs", runId, {
      status: "failed",
      error: "The agent version this run started from no longer exists.",
      updatedAt: new Date().toISOString(),
    });
    return;
  }

  const model = resolveModel(version, provider);
  const limits = version.limits ?? DEFAULT_LIMITS;
  const policy = version.approvalPolicy ?? DEFAULT_APPROVAL_POLICY;
  const tools: ToolSchema[] = provider.supportsTools
    ? toolsForScopes(version.permissionScopes).map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
      }))
    : [];

  while (run && run.status === "running") {
    if (run.turns >= run.maxTurns) {
      await store.update("agent_runs", runId, {
        status: "failed",
        error: `Stopped after ${run.maxTurns} turns — the agent kept requesting tools without finishing.`,
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    let result;
    try {
      result = await provider.complete({
        model,
        system: version.systemInstructions || undefined,
        messages: run.messages,
        tools: tools.length > 0 ? tools : undefined,
        maxTokens: limits.maxOutputTokens,
        temperature: 0.2,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Model call failed";
      await recordAiRun({
        organizationId: run.organizationId,
        agentId: run.agentId,
        agentRunId: run.id,
        source: "agent",
        provider: provider.key,
        model,
        status: "failed",
        inputText: preview(run.messages),
        error: message,
      });
      await store.update("agent_runs", runId, {
        status: "failed",
        error: message,
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    await recordAiRun({
      organizationId: run.organizationId,
      agentId: run.agentId,
      agentRunId: run.id,
      source: "agent",
      provider: provider.key,
      model: result.model,
      status: "completed",
      inputText: preview(run.messages),
      outputText: result.text,
      promptTokens: result.promptTokens,
      completionTokens: result.completionTokens,
      latencyMs: result.latencyMs,
    });

    const assistantMessage: AgentTranscriptMessage = {
      role: "assistant",
      content: result.text,
      ...(result.toolCalls?.length ? { toolCalls: result.toolCalls } : {}),
    };
    run = (await store.mutate("agent_runs", runId, (row) => {
      row.messages.push(assistantMessage);
      row.turns += 1;
      row.updatedAt = new Date().toISOString();
    })) ?? run;

    const calls = result.toolCalls ?? [];
    if (calls.length === 0) {
      await store.update("agent_runs", runId, {
        status: "completed",
        finalText: result.text,
        updatedAt: new Date().toISOString(),
      });
      return;
    }

    const outcome = await handleToolCalls(runId, calls, version, policy, null);
    if (outcome === "paused" || outcome === "ended") return;
    run = await store.get("agent_runs", runId);
  }
}

/**
 * Process a batch of pending tool calls in order. Non-consequential in-scope
 * calls execute immediately. The first consequential call pauses the run and
 * creates an approval; the rest stay in pendingToolCalls for the resume.
 * Returns "paused" (run waiting on approval), "ended" (run finished), or
 * "continue" (all calls processed — drive the next turn).
 */
async function handleToolCalls(
  runId: string,
  calls: AgentToolCallRecord[],
  version: AgentVersionRecord,
  policy: { consequentialActions: "require_approval" },
  resumedApprovalId: string | null,
): Promise<"paused" | "ended" | "continue"> {
  const run = await store.get("agent_runs", runId);
  if (!run || run.status !== "running") return "ended";

  for (let i = 0; i < calls.length; i++) {
    const call = calls[i];
    const spec = toolByName(call.name);

    if (!spec) {
      await applyInvocation(runId, call, async () => ({
        invocation: {
          status: "failed",
          resultPreview: null,
          error: `Unknown tool "${call.name}".`,
          approvalId: null,
          latencyMs: 0,
        },
        toolMessage: `Tool "${call.name}" does not exist. Answer the user without it.`,
      }));
      continue;
    }

    if (!version.permissionScopes.includes(spec.scope)) {
      await applyInvocation(runId, call, async () => ({
        invocation: {
          status: "denied_scope",
          resultPreview: null,
          error: `Scope "${spec.scope}" is not granted to this agent version.`,
          approvalId: null,
          latencyMs: 0,
        },
        toolMessage: `Tool "${spec.name}" was NOT executed: the agent version does not grant scope "${spec.scope}". Tell the user which scope an admin must grant, then answer without the tool.`,
      }));
      await writeAuditLog({
        organizationId: run.organizationId,
        actorId: run.createdBy,
        action: "agent.tool_denied",
        resource: "agent",
        resourceId: run.agentId,
        metadata: { runId: run.id, tool: spec.name, scope: spec.scope },
      });
      continue;
    }

    if (spec.consequential && policy.consequentialActions === "require_approval" && !resumedApprovalId) {
      // Pause. The approval pins the exact arguments the model supplied.
      const approval: ApprovalRecord = {
        id: newId(),
        organizationId: run.organizationId,
        kind: "agent_tool",
        executionId: null,
        agentRunId: run.id,
        action: `Run ${spec.name}`,
        rationale: `Agent requested the consequential tool "${spec.name}". Reviewing the exact arguments below — approving executes exactly these, nothing else.`,
        payload: { tool: spec.name, scope: spec.scope, callId: call.id, args: call.arguments, agentId: run.agentId },
        riskLevel: "medium",
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      await store.insert("approvals", approval);
      await store.mutate("agent_runs", runId, (row) => {
        row.status = "waiting_approval";
        row.pendingToolCalls = calls.slice(i);
        row.updatedAt = new Date().toISOString();
      });
      await notify({
        organizationId: run.organizationId,
        kind: "approval",
        title: `Approval requested — ${spec.name}`,
        body: `An agent run paused at a consequential action (${spec.consequential ? "medium" : "low"} risk). Approving executes the exact arguments recorded.`,
        href: "/app/approvals",
      });
      return "paused";
    }

    // Approved-at-resume calls and non-consequential in-scope calls execute.
    const started = Date.now();
    const exec = await executeTool(spec.name, call.arguments, { organizationId: run.organizationId });
    const latencyMs = Date.now() - started;
    await applyInvocation(runId, call, async () => ({
      invocation: {
        status: exec.ok ? "executed" : "failed",
        resultPreview: exec.ok ? exec.resultText.slice(0, INVOCATION_PREVIEW) : null,
        error: exec.ok ? null : exec.error,
        approvalId: resumedApprovalId,
        latencyMs,
      },
      toolMessage: exec.ok
        ? exec.resultText.slice(0, TOOL_MESSAGE_LIMIT)
        : `Tool "${spec.name}" failed: ${exec.error}`,
    }));
    await writeAuditLog({
      organizationId: run.organizationId,
      actorId: run.createdBy,
      action: exec.ok ? "agent.tool_executed" : "agent.tool_failed",
      resource: "agent",
      resourceId: run.agentId,
      metadata: {
        runId: run.id,
        tool: spec.name,
        ...(resumedApprovalId ? { approvalId: resumedApprovalId } : {}),
        latencyMs,
      },
    });
    // Only the first call of a resumed batch carries the approval id.
    resumedApprovalId = null;
  }
  return "continue";
}

/** Append one invocation + its tool message to the run, atomically. */
async function applyInvocation(
  runId: string,
  call: AgentToolCallRecord,
  build: () => Promise<{
    invocation: Omit<AgentToolInvocationRecord, "call" | "createdAt">;
    toolMessage: string;
  }>,
): Promise<void> {
  const { invocation, toolMessage } = await build();
  await store.mutate("agent_runs", runId, (row) => {
    row.invocations.push({
      call,
      ...invocation,
      createdAt: new Date().toISOString(),
    });
    row.messages.push({ role: "tool", toolCallId: call.id, name: call.name, content: toolMessage });
    row.updatedAt = new Date().toISOString();
  });
}

/**
 * Resume a run whose pending consequential tool call was just decided on.
 * Approving executes the EXACT arguments recorded in the approval; rejecting
 * ends the run as "rejected". Called by the approvals decide action, which
 * has already enforced permissions + org guard + pending status.
 */
export async function resumeAgentRunFromApproval(
  approval: ApprovalRecord,
  decision: "approved" | "rejected",
  reviewerName: string,
  decisionNote?: string,
  /** test seam, mirrors startAgentRun */
  providerOverride?: AiProvider,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!approval.agentRunId) return { ok: false, error: "This approval is not linked to an agent run." };
  const run = await store.get("agent_runs", approval.agentRunId);
  if (!run || run.status !== "waiting_approval" || run.pendingToolCalls.length === 0) {
    return { ok: false, error: "This agent run is not waiting on an approval." };
  }

  const version = await store.get("agent_versions", run.agentVersionId);
  if (!version) return { ok: false, error: "The agent version this run started from no longer exists." };

  const pending = run.pendingToolCalls[0];
  if (approval.payload.callId !== pending.id) {
    await store.update("agent_runs", run.id, {
      status: "failed",
      error: "Approval payload does not match the pending tool call — the run was stopped rather than guess.",
      updatedAt: new Date().toISOString(),
    });
    return { ok: false, error: "Approval payload does not match the pending tool call." };
  }

  if (decision === "rejected") {
    await store.mutate("agent_runs", run.id, (row) => {
      row.status = "rejected";
      row.error = `Tool "${String(approval.payload.tool)}" rejected by ${reviewerName}${decisionNote ? `: ${decisionNote}` : ""}`;
      row.pendingToolCalls = [];
      row.invocations.push({
        call: pending,
        status: "skipped",
        resultPreview: null,
        error: `Rejected by ${reviewerName}${decisionNote ? `: ${decisionNote}` : ""}`,
        approvalId: approval.id,
        latencyMs: 0,
        createdAt: new Date().toISOString(),
      });
      row.updatedAt = new Date().toISOString();
    });
    return { ok: true };
  }

  // Approved: execute the recorded arguments exactly, then continue.
  await store.mutate("agent_runs", run.id, (row) => {
    row.status = "running";
    row.pendingToolCalls = [];
    row.updatedAt = new Date().toISOString();
  });

  const policy = version.approvalPolicy ?? DEFAULT_APPROVAL_POLICY;
  const remaining = run.pendingToolCalls.slice(1);
  // The approved call executes with the approval id, then any remaining
  // pending calls are gated normally (each consequential one pauses again).
  const approvedCall: AgentToolCallRecord = {
    id: pending.id,
    name: String(approval.payload.tool ?? pending.name),
    arguments: (approval.payload.args as Record<string, unknown>) ?? pending.arguments,
  };
  const outcome = await handleToolCalls(run.id, [approvedCall, ...remaining], version, policy, approval.id);
  if (outcome === "paused" || outcome === "ended") return { ok: true };

  await store.update("agent_runs", run.id, {
    status: "running",
    updatedAt: new Date().toISOString(),
  });
  await driveRun(run.id, providerOverride);
  return { ok: true };
}

function preview(messages: AgentTranscriptMessage[]): string {
  const last = messages[messages.length - 1];
  if (!last) return "";
  return last.content ?? "";
}
