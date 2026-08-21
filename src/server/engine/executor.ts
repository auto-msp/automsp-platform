import "server-only";
import { newId } from "@/server/db/id";
import { store } from "@/server/db/store";
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
      return { proceed: true, output: { trigger: "manual" } };

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
        executionId: "", // filled by caller
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

    case "ai":
      // Honest placeholder: no model provider is configured in this
      // environment, so no AI call is made. Recorded transparently.
      return {
        proceed: true,
        output: {
          skipped: true,
          reason: "AI provider not configured — no model call was made",
          prompt: interpolate(String(node.config.prompt), context),
        },
      };

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
        const res = await fetch(url, {
          method: node.config.method === "POST" ? "POST" : "GET",
          headers: { "content-type": "application/json" },
          signal: AbortSignal.timeout(10_000),
        });
        const text = (await res.text()).slice(0, 2048);
        const body =
          res.headers.get("content-type")?.includes("application/json") && text
            ? (JSON.parse(text) as unknown)
            : text;
        return {
          proceed: true,
          output: { status: res.status, ok: res.ok, preview: body },
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
      }
    : { input: execution.input, vars: {} };

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
}

export async function startExecution(params: {
  organizationId: string;
  automationId: string;
  input: Record<string, unknown>;
  idempotencyKey?: string;
  startedBy: string;
}): Promise<{ ok: true; execution: ExecutionRecord } | { ok: false; error: string }> {
  const { organizationId, automationId, input, idempotencyKey } = params;

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
    trigger: "manual",
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
