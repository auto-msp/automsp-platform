import "server-only";
import { newId } from "@/server/db/id";
import { store } from "@/server/db/store";
import type {
  AutomationRecord,
  AutomationStatus,
  AutomationVersionRecord,
  WorkflowDefinition,
  WorkflowNodeRecord,
} from "@/server/db/types";
import { validateDefinition } from "@/server/engine/definition";

export interface AutomationInput {
  name: string;
  description: string;
  systemId: string | null;
  estMinutesPerRun: number;
}

export async function listAutomations(organizationId: string): Promise<AutomationRecord[]> {
  const rows = await store.find("automations", (a) => a.organizationId === organizationId);
  return rows.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

/** Tenant guard baked in. */
export async function getAutomation(
  organizationId: string,
  id: string,
): Promise<AutomationRecord | null> {
  const row = await store.get("automations", id);
  if (!row || row.organizationId !== organizationId) return null;
  return row;
}

export async function getCurrentDefinition(
  automationId: string,
): Promise<{ version: AutomationVersionRecord; definition: WorkflowDefinition } | null> {
  const versions = await store.find("automation_versions", (v) => v.automationId === automationId);
  const latest = versions.sort((a, b) => b.version - a.version)[0];
  if (!latest) return null;
  return { version: latest, definition: latest.definition };
}

export async function listVersions(automationId: string): Promise<AutomationVersionRecord[]> {
  const versions = await store.find("automation_versions", (v) => v.automationId === automationId);
  return versions.sort((a, b) => b.version - a.version);
}

const DEFAULT_DEFINITION: WorkflowDefinition = {
  nodes: [{ key: "trigger", type: "trigger", config: { triggerType: "manual" } }],
  edges: [],
};

export async function createAutomation(
  organizationId: string,
  input: AutomationInput,
  createdBy: string,
): Promise<AutomationRecord> {
  const now = new Date().toISOString();
  const record: AutomationRecord = {
    id: newId(),
    organizationId,
    systemId: input.systemId,
    name: input.name,
    description: input.description,
    status: "draft",
    estMinutesPerRun: Math.max(0, Math.round(input.estMinutesPerRun)),
    createdAt: now,
    updatedAt: now,
  };
  await store.insert("automations", record);
  await store.insert("automation_versions", {
    id: newId(),
    automationId: record.id,
    version: 1,
    definition: DEFAULT_DEFINITION,
    createdAt: now,
    createdBy,
  });
  return record;
}

/** Ordered steps become a linear graph: each step links to the next. */
export function stepsToDefinition(
  steps: { key: string; type: WorkflowNodeRecord["type"]; config: Record<string, unknown> }[],
): WorkflowDefinition {
  const nodes: WorkflowNodeRecord[] = steps.map((s) => ({
    key: s.key,
    type: s.type,
    config: s.config,
  }));
  return {
    nodes,
    edges: nodes.slice(1).map((n, i) => ({ from: nodes[i].key, to: n.key })),
  };
}

export type SaveDefinitionResult =
  | { ok: true; version: AutomationVersionRecord }
  | { ok: false; errors: string[] };

export async function saveDefinition(
  organizationId: string,
  automationId: string,
  definition: WorkflowDefinition,
  createdBy: string,
): Promise<SaveDefinitionResult> {
  const automation = await getAutomation(organizationId, automationId);
  if (!automation) return { ok: false, errors: ["Automation not found."] };

  const check = validateDefinition(definition);
  if (!check.ok) return { ok: false, errors: check.errors };

  const versions = await listVersions(automationId);
  const nextVersion = (versions[0]?.version ?? 0) + 1;
  const record: AutomationVersionRecord = {
    id: newId(),
    automationId,
    version: nextVersion,
    definition,
    createdAt: new Date().toISOString(),
    createdBy,
  };
  await store.insert("automation_versions", record);
  await store.update("automations", automationId, { updatedAt: record.createdAt });
  return { ok: true, version: record };
}

export async function updateAutomation(
  organizationId: string,
  id: string,
  patch: Partial<AutomationInput> & { status?: AutomationStatus },
): Promise<AutomationRecord | null> {
  const existing = await getAutomation(organizationId, id);
  if (!existing) return null;
  if (patch.systemId) {
    const system = await store.get("systems", patch.systemId);
    if (!system || system.organizationId !== organizationId) return null;
  }
  if (patch.estMinutesPerRun !== undefined) {
    patch.estMinutesPerRun = Math.max(0, Math.round(patch.estMinutesPerRun));
  }
  return store.update("automations", id, { ...patch, updatedAt: new Date().toISOString() });
}

/** Runs already recorded against an automation keep it from hard deletion. */
export async function deleteAutomation(
  organizationId: string,
  id: string,
): Promise<{ ok: true } | { ok: false; reason: "not_found" | "has_executions"; count?: number }> {
  const existing = await getAutomation(organizationId, id);
  if (!existing) return { ok: false, reason: "not_found" };

  const executions = await store.find(
    "executions",
    (e) => e.organizationId === organizationId && e.automationId === id,
  );
  if (executions.length > 0) return { ok: false, reason: "has_executions", count: executions.length };

  const versions = await store.find("automation_versions", (v) => v.automationId === id);
  for (const v of versions) await store.remove("automation_versions", v.id);
  await store.remove("automations", id);
  return { ok: true };
}
