import "server-only";
import { runAgentCompletion } from "@/server/ai/agents";
import { newId } from "@/server/db/id";
import { store } from "@/server/db/store";
import { notify } from "@/server/notifications";
import { openSecret } from "@/server/vault";
import type {
  ApprovalRecord,
  AutomationVersionRecord,
  ExecutionRecord,
  WorkflowNodeRecord,
} from "@/server/db/types";
import { nodeByKey, nextNodeKey, validateDefinition } from "./definition";
import { getPath, interpolate, interpolateMapping, type RunContext } from "./interpolate";

/**
 * Execution engine v1.
 * Linear graphs, manual trigger, synchronous walk. Each node writes a step
 * record and log lines; approval nodes pause the run with a resume cursor.
 */

async function log(
  executionId: string,
  level: "info" | "warn" | "error",
  message: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await store.insert("execution_logs", {
    id: newId(),
    executionId,
    level,
    message,
    metadata,
    createdAt: new Date().toISOString(),
  });
}

export type ExecutionTrigger = "manual" | "schedule";

async function notifyRunFailed(execution: ExecutionRecord, error: string): Promise<void> {
  await notify({
    organizationId: execution.organizationId,
    kind: "workflow_failure",
    title: `Run failed — ${execution.automationName}`,
    body: error,
    href: `/app/operations/${execution.id}`,
  });
}

async function notifyRunCompleted(execution: ExecutionRecord): Promise<void> {
  await notify({
    organizationId: execution.organizationId,
    kind: "execution",
    title:
      execution.trigger === "schedule"
        ? `Scheduled run completed — ${execution.automationName}`
        : `Run completed — ${execution.automationName}`,
    body: `Version ${execution.version} finished successfully.`,
    href: `/app/operations/${execution.id}`,
  });
}

/** Resolve a vault credential for an http step. Secret never leaves this process. */
async function loadCredentialHeader(
  organizationId: string,
  config: Record<string, unknown>,
): Promise<{ header: string; value: string } | { error: string }> {
  const credentialId = String(config.credentialId ?? "");
  if (!credentialId) return { error: "No credential selected" };

  const integration = await store.get("integrations", credentialId);
  if (!integration || integration.organizationId !== organizationId) {
    return { error: "Credential not found" };
  }
  if (integration.status === "revoked") {
    return { error: `Credential "${integration.name}" was revoked` };
  }

  const secret = await openSecret(integration.sealedSecret);
  if (secret === null) return { error: `Credential "${integration.name}" could not be unsealed` };
  await store.update("integrations", integration.id, { lastUsedAt: new Date().toISOString() });

  const header = String(config.headerName ?? "").trim() || "Authorization";
  const scheme = String(config.scheme ?? "").trim();
  return { header, value: scheme ? `${scheme} ${secret}` : secret };
}

interface NodeResult {
  /** Continue to the successor node */
  proceed?: boolean;
  /** Context to persist on the resume cursor */
  context?: RunContext;
  /** Run paused at an approval gate */
  waiting?: ApprovalRecord;
  /** Run finished (output or early exit on false condition) */
  finished?: { output?: Record<string, unknown> };
  /** Step failed — stop the run */
  failed?: { error: string };
  /** Free-form summary stored on the step record */
  output?: unknown;
}

async function executeNode(
  node: WorkflowNodeRecord,
  context: RunContext,
): Promise<NodeResult> {
  switch (node.type) {
    case "trigger":
      return { proceed: true, output: { trigger: node.config.triggerType ?? "manual" } };

    case "log": {
      const message = interpolate(String(node.config.message), context);
      return { proceed: true, output: { message } };
    }

    case "template": {
      const values = interpolateMapping(
        (node.config.values as Record<string, unknown>) ?? {},
        context,
      );
      Object.assign(context.vars, values);
      return { proceed: true, output: { set: Object.keys(values) } };
    }

    case "condition": {
      const source =
        node.config.source === "input"
          ? context.input
          : { ...context.input, ...context.vars };
      const actual = getPath(source, String(node.config.field));
      let result = false;
      switch (String(node.config.operator)) {
        case "equals":
          result = String(actual) === String(node.config.value ?? "");
          break;
        case "not_equals":
          result = String(actual) !== String(node.config.value ?? "");
          break;
        case "contains":
          result = Array.isArray(actual)
            ? actual.includes(node.config.value)
            : String(actual ?? "").includes(String(node.config.value ?? ""));
          break;
        case "exists":
          result = actual !== undefined && actual !== null && actual !== "";
          break;
      }
      if (!result) {
        return {
          finished: {
            output: {
              earlyExit: node.key,
              reason: `Condition "${node.config.field} ${node.config.operator}" evaluated false`,
            },
          },
          output: { result },
        };
      }
      return { proceed: true, output: { result } };
    }

    case "approval": {
      const pending: ApprovalRecord = {
        id: newId(),
        organizationId: "", // filled by caller
        kind: "workflow",
        executionId: "", // filled by caller
        agentRunId: null,
        action: interpolate(String(node.config.action), context),
        rationale: interpolate(String(node.config.rationale), context),
        payload: interpolateMapping(
          (node.config.payload as Record<string, unknown>) ?? {},
          context,
        ),
        riskLevel:
          node.config.riskLevel === "medium" || node.config.riskLevel === "high"
            ? node.config.riskLevel
            : "low",
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      return { waiting: pending, context };
    }

    case "output": {
      const output = interpolateMapping(
        (node.config.values as Record<string, unknown>) ?? {},
        context,
      );
      return { finished: { output }, output };
    }

    case "ai": {
      const prompt = interpolate(String(node.config.prompt ?? ""), context);
      const agentId =
        typeof node.config.agentId === "string" && node.config.agentId ? node.config.agentId : null;
      const useKnowledge = node.config.useKnowledge === true;
      const topKRaw = Number(node.config.topK);
      const topK = Number.isFinite(topKRaw) ? Math.min(10, Math.max(1, Math.floor(topKRaw))) : 3;
      const knowledgeSourceId =
        typeof node.config.knowledgeSourceId === "string" && node.config.knowledgeSourceId
          ? node.config.knowledgeSourceId
          : undefined;

      // runAgentCompletion resolves the org-guarded agent, runs retrieval,
      // calls the configured provider, and records tokens/cost to ai_runs.
      // When no provider key exists it returns notConfigured — the step then
      // records an explicit skip, never a fabricated answer.
      const result = await runAgentCompletion({
        organizationId: context.organizationId,
        agentId,
        prompt,
        source: "workflow",
        executionId: context.executionId ?? null,
        knowledge: useKnowledge ? { sourceId: knowledgeSourceId, topK } : undefined,
      });

      if (!result.ok) {
        if (result.notConfigured) {
          return {
            proceed: true,
            output: { skipped: true, reason: result.error, prompt },
          };
        }
        return { failed: { error: `AI step failed: ${result.error}` } };
      }

      return {
        proceed: true,
        output: {
          text: result.text,
          model: result.model,
          agent: result.agentName,
          usage: {
            promptTokens: result.promptTokens,
            completionTokens: result.completionTokens,
            costEstimatedUsd: result.costEstimatedUsd,
            costMethod: "Estimated — provider list price × tokens; the invoice is the actual.",
          },
          retrieval: result.retrieval
            ? { method: result.retrieval.method, chunks: result.retrieval.chunks }
            : null,
        },
      };
    }

    case "http": {
      const url = interpolate(String(node.config.url ?? ""), context);
      if (!url) {
        return {
          proceed: true,
          output: { skipped: true, reason: "No endpoint URL configured" },
        };
      }
      try {
        const parsed = new URL(url);
        if (!["http:", "https:"].includes(parsed.protocol)) {
          return { failed: { error: "HTTP step requires an http or https URL" } };
        }
        const headers: Record<string, string> = { "content-type": "application/json" };
        let credentialNote: string | undefined;
        if (node.config.credentialId) {
          const resolved = await loadCredentialHeader(context.organizationId, node.config);
          if ("error" in resolved) return { failed: { error: `Vault: ${resolved.error}` } };
          // The secret goes straight into the request headers. It is never
          // placed in step output, run logs, or anywhere client-visible.
          headers[resolved.header] = resolved.value;
          credentialNote = `header "${resolved.header}" injected from vault`;
        }
        const res = await fetch(url, {
          method: node.config.method === "POST" ? "POST" : "GET",
          headers,
          signal: AbortSignal.timeout(10_000),
        });
        const text = (await res.text()).slice(0, 2048);
        const body =
          res.headers.get("content-type")?.includes("application/json") && text
            ? (JSON.parse(text) as unknown)
            : text;
        return {
          proceed: true,
          output: { status: res.status, ok: res.ok, preview: body, ...(credentialNote ? { credential: credentialNote } : {}) },
        };
      } catch (err) {
        return {
          failed: {
            error: err instanceof Error ? err.message : "HTTP request failed",
          },
        };
      }
    }
  }
}

async function runWalk(executionId: string, startKey: string): Promise<void> {
  const execution = await store.get("executions", executionId);
  if (!execution) return;

  const version = await store.first(
    "automation_versions",
    (v) => v.automationId === execution.automationId && v.version === execution.version,
  );
  if (!version) {
    await store.update("executions", executionId, {
      status: "failed",
      error: "Workflow version not found",
      finishedAt: new Date().toISOString(),
    });
    await log(executionId, "error", `Workflow version ${execution.version} not found`);
    return;
  }

  const def = version.definition;
  const context: RunContext = execution.resume?.context
    ? {
        input: execution.resume.context.input as Record<string, unknown>,
        vars: (execution.resume.context.vars as Record<string, unknown>) ?? {},
        organizationId: execution.organizationId,
        executionId,
      }
    : { input: execution.input, vars: {}, organizationId: execution.organizationId, executionId };

  let key: string | null = startKey;

  while (key) {
    const node = nodeByKey(def, key);
    if (!node) break;
    const stepKey = key;
    const now = new Date().toISOString();

    const step = await store.insert("execution_steps", {
      id: newId(),
      executionId,
      nodeKey: stepKey,
      status: "running",
      input: { config: node.config },
      startedAt: now,
    });

    const result = await executeNode(node, context);

    if (result.waiting) {
      await store.update("execution_steps", step.id, {
        status: "waiting",
        output: result.output ?? { action: result.waiting.action },
      });
      const approval: ApprovalRecord = {
        ...result.waiting,
        organizationId: execution.organizationId,
        executionId,
      };
      await store.insert("approvals", approval);
      await store.update("executions", executionId, {
        status: "waiting",
        resume: { nodeKey: stepKey, context: context as unknown as Record<string, unknown> },
      });
      await log(executionId, "info", `Waiting on approval: ${approval.action}`, {
        approvalId: approval.id,
        riskLevel: approval.riskLevel,
      });
      await notify({
        organizationId: execution.organizationId,
        kind: "approval",
        title: `Approval requested — ${approval.action}`,
        body: `${execution.automationName} paused for review (${approval.riskLevel} risk).`,
        href: "/app/approvals",
      });
      return;
    }

    if (result.failed) {
      await store.update("execution_steps", step.id, {
        status: "failed",
        error: result.failed.error,
        finishedAt: new Date().toISOString(),
      });
      await store.update("executions", executionId, {
        status: "failed",
        error: `Step "${stepKey}" failed: ${result.failed.error}`,
        finishedAt: new Date().toISOString(),
      });
      await log(executionId, "error", `Step ${stepKey} failed: ${result.failed.error}`);
      await notifyRunFailed(execution, `Step "${stepKey}" failed: ${result.failed.error}`);
      return;
    }

    await store.update("execution_steps", step.id, {
      status: "completed",
      output: result.output,
      finishedAt: new Date().toISOString(),
    });

    if (node.type === "log") await log(executionId, "info", (result.output as { message?: string })?.message ?? "");
    if (node.type === "ai" && (result.output as { skipped?: boolean })?.skipped) {
      await log(executionId, "warn", "AI step skipped — provider not configured");
    }
    if (node.type === "ai" && !(result.output as { skipped?: boolean })?.skipped) {
      const o = result.output as { model?: string; usage?: { promptTokens?: number; completionTokens?: number } };
      await log(
        executionId,
        "info",
        `AI step completed (${o.model ?? "model?"}, ${o.usage?.promptTokens ?? 0}+${o.usage?.completionTokens ?? 0} tokens)`,
      );
    }
    if (node.type === "condition") {
      await log(executionId, "info", `Condition evaluated ${(result.output as { result?: boolean })?.result}`);
    }

    if (result.finished) {
      await store.update("executions", executionId, {
        status: "completed",
        output: result.finished.output,
        resume: undefined,
        finishedAt: new Date().toISOString(),
      });
      await log(executionId, "info", "Run completed", result.finished.output);
      await notifyRunCompleted(execution);
      return;
    }

    key = nextNodeKey(def, stepKey);
  }

  // Reached end of chain without an explicit output node.
  await store.update("executions", executionId, {
    status: "completed",
    resume: undefined,
    finishedAt: new Date().toISOString(),
  });
  await log(executionId, "info", "Run completed (end of steps)");
  await notifyRunCompleted(execution);
}

export async function startExecution(params: {
  organizationId: string;
  automationId: string;
  input: Record<string, unknown>;
  idempotencyKey?: string;
  startedBy: string;
  trigger?: ExecutionTrigger;
}): Promise<{ ok: true; execution: ExecutionRecord } | { ok: false; error: string }> {
  const { organizationId, automationId, input, idempotencyKey } = params;
  const triggerKind: ExecutionTrigger = params.trigger ?? "manual";

  if (idempotencyKey) {
    const existing = await store.first(
      "executions",
      (e) => e.organizationId === organizationId && e.idempotencyKey === idempotencyKey,
    );
    if (existing) return { ok: true, execution: existing };
  }

  const automation = await store.get("automations", automationId);
  if (!automation || automation.organizationId !== organizationId) {
    return { ok: false, error: "Automation not found." };
  }

  if (triggerKind === "schedule") {
    // Scheduled runs only fire on active automations, and only when due —
    // the scheduler asserts this too, but the engine is the last line of
    // defence so nobody can fake a "schedule" run onto a paused automation.
    if (automation.status !== "active") {
      return { ok: false, error: "Scheduled runs require an active automation." };
    }
    if (!automation.nextRunAt || Date.parse(automation.nextRunAt) > Date.now()) {
      return { ok: false, error: "This automation is not scheduled to run yet." };
    }
  }

  const versions = await store.find("automation_versions", (v) => v.automationId === automationId);
  const latest = versions.sort((a, b) => b.version - a.version)[0];
  if (!latest) return { ok: false, error: "This automation has no workflow definition yet." };

  const check = validateDefinition(latest.definition);
  if (!check.ok) return { ok: false, error: `Invalid workflow: ${check.errors.join("; ")}` };

  const trigger = latest.definition.nodes.find((n) => n.type === "trigger");
  if (!trigger) return { ok: false, error: "Workflow has no trigger step." };

  const now = new Date().toISOString();
  const execution: ExecutionRecord = {
    id: newId(),
    organizationId,
    automationId,
    automationName: automation.name,
    version: latest.version,
    status: "queued",
    trigger: triggerKind,
    input,
    idempotencyKey,
    startedAt: now,
    createdAt: now,
  };
  await store.insert("executions", execution);
  await log(execution.id, "info", `Run started by ${params.startedBy}`, {
    version: latest.version,
  });
  await store.update("executions", execution.id, { status: "running" });

  await runWalk(execution.id, trigger.key);

  const final = await store.get("executions", execution.id);
  return { ok: true, execution: final ?? execution };
}

export async function resumeExecution(
  executionId: string,
  decision: "approved" | "rejected",
  reviewerName: string,
  decisionNote?: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const execution = await store.get("executions", executionId);
  if (!execution || execution.status !== "waiting" || !execution.resume) {
    return { ok: false, error: "This run is not waiting on an approval." };
  }

  const pauseNodeKey = execution.resume.nodeKey;
  const waitingStep = await store.first(
    "execution_steps",
    (s) => s.executionId === executionId && s.nodeKey === pauseNodeKey && s.status === "waiting",
  );
  if (waitingStep) {
    if (decision === "rejected") {
      await store.update("execution_steps", waitingStep.id, {
        status: "failed",
        error: decisionNote ? `Rejected: ${decisionNote}` : "Rejected",
        finishedAt: new Date().toISOString(),
      });
    } else {
      await store.update("execution_steps", waitingStep.id, {
        status: "completed",
        output: { decision, note: decisionNote, reviewer: reviewerName },
        finishedAt: new Date().toISOString(),
      });
    }
  }

  if (decision === "rejected") {
    await store.update("executions", executionId, {
      status: "failed",
      error: `Approval rejected by ${reviewerName}${decisionNote ? `: ${decisionNote}` : ""}`,
      resume: undefined,
      finishedAt: new Date().toISOString(),
    });
    await log(executionId, "warn", `Approval rejected by ${reviewerName}`);
    await notifyRunFailed(
      execution,
      `Approval rejected by ${reviewerName}${decisionNote ? `: ${decisionNote}` : ""}`,
    );
    return { ok: true };
  }

  await log(executionId, "info", `Approval granted by ${reviewerName}`);
  await store.update("executions", executionId, { status: "running" });

  const version: AutomationVersionRecord | null = await store.first(
    "automation_versions",
    (v) => v.automationId === execution.automationId && v.version === execution.version,
  );
  if (!version) {
    await store.update("executions", executionId, {
      status: "failed",
      error: "Workflow version not found on resume",
      finishedAt: new Date().toISOString(),
    });
    return { ok: false, error: "Workflow version not found on resume." };
  }

  const nextKey = nextNodeKey(version.definition, pauseNodeKey);
  if (!nextKey) {
    await store.update("executions", executionId, {
      status: "completed",
      resume: undefined,
      finishedAt: new Date().toISOString(),
    });
    await log(executionId, "info", "Run completed (approval was the final step)");
    return { ok: true };
  }

  await runWalk(executionId, nextKey);
  return { ok: true };
}
