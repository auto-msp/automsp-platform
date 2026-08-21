import "server-only";
import type { WorkflowDefinition, WorkflowNodeRecord } from "@/server/db/types";

/**
 * Static validation for workflow definitions. Runs on every save of an
 * automation version and again before each execution.
 * v1 graphs are linear: trigger → …steps… → end. Conditions can short-circuit
 * a run to completion; approvals pause it.
 */
export function validateDefinition(
  def: WorkflowDefinition,
): { ok: true } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const { nodes, edges } = def;

  if (nodes.length === 0) errors.push("The workflow has no steps.");

  const keys = new Set<string>();
  for (const node of nodes) {
    if (!node.key || !/^[a-z0-9][a-z0-9-_]*$/.test(node.key)) {
      errors.push(`Step key "${node.key}" must be lowercase letters, numbers, dashes.`);
    }
    if (keys.has(node.key)) errors.push(`Duplicate step key "${node.key}".`);
    keys.add(node.key);
  }

  const triggers = nodes.filter((n) => n.type === "trigger");
  if (triggers.length !== 1) errors.push("Exactly one trigger step is required.");
  const trigger = triggers[0];

  for (const edge of edges) {
    if (!keys.has(edge.from)) errors.push(`Edge starts from unknown step "${edge.from}".`);
    if (!keys.has(edge.to)) errors.push(`Edge points to unknown step "${edge.to}".`);
  }
  if (trigger && edges.some((e) => e.to === trigger.key)) {
    errors.push("The trigger cannot have incoming edges.");
  }

  // v1: linear — no node may fan out to more than one successor.
  const outCount = new Map<string, number>();
  for (const edge of edges) {
    outCount.set(edge.from, (outCount.get(edge.from) ?? 0) + 1);
  }
  for (const [from, count] of outCount) {
    if (count > 1) errors.push(`Step "${from}" has more than one outgoing edge (branching is not yet supported).`);
  }

  for (const node of nodes) errors.push(...validateNodeConfig(node));

  return errors.length > 0 ? { ok: false, errors } : { ok: true };
}

function validateNodeConfig(node: WorkflowNodeRecord): string[] {
  const c = node.config;
  const errs: string[] = [];
  const label = `Step "${node.key}"`;

  switch (node.type) {
    case "trigger":
      if (c.triggerType === "manual") break;
      if (c.triggerType === "schedule") {
        const every = Number(c.every);
        if (!Number.isInteger(every) || every < 1 || every > 10000) {
          errs.push(`${label}: schedule interval must be a whole number between 1 and 10000.`);
        }
        if (!["minutes", "hours", "days"].includes(String(c.unit))) {
          errs.push(`${label}: schedule unit must be minutes, hours, or days.`);
        }
        break;
      }
      errs.push(`${label}: trigger type must be manual or schedule.`);
      break;
    case "condition": {
      if (typeof c.field !== "string" || !c.field) errs.push(`${label}: a field is required.`);
      if (!["equals", "not_equals", "contains", "exists"].includes(String(c.operator)))
        errs.push(`${label}: operator must be equals, not_equals, contains, or exists.`);
      break;
    }
    case "template":
    case "output": {
      if (typeof c.values !== "object" || c.values === null || Array.isArray(c.values))
        errs.push(`${label}: a values mapping is required.`);
      break;
    }
    case "approval": {
      if (typeof c.action !== "string" || !c.action) errs.push(`${label}: an action name is required.`);
      if (typeof c.rationale !== "string" || !c.rationale) errs.push(`${label}: a rationale is required.`);
      if (c.riskLevel && !["low", "medium", "high"].includes(String(c.riskLevel)))
        errs.push(`${label}: risk level must be low, medium, or high.`);
      break;
    }
    case "log":
      if (typeof c.message !== "string" || !c.message) errs.push(`${label}: a message is required.`);
      break;
    case "ai":
      if (typeof c.prompt !== "string" || !c.prompt) errs.push(`${label}: a prompt is required.`);
      break;
    case "http": {
      if (c.url !== undefined && c.url !== "") {
        try {
          const url = new URL(String(c.url));
          if (!["http:", "https:"].includes(url.protocol)) errs.push(`${label}: URL must be http or https.`);
        } catch {
          errs.push(`${label}: URL is not valid.`);
        }
      }
      break;
    }
  }
  return errs;
}

/** Successor of a node in the linear graph, or null when it's the last step. */
export function nextNodeKey(def: WorkflowDefinition, key: string): string | null {
  return def.edges.find((e) => e.from === key)?.to ?? null;
}

export function nodeByKey(def: WorkflowDefinition, key: string): WorkflowNodeRecord | null {
  return def.nodes.find((n) => n.key === key) ?? null;
}
