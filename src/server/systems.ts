import "server-only";
import { newId } from "@/server/db/id";
import { store } from "@/server/db/store";
import type { SystemRecord, SystemStatus } from "@/server/db/types";

export interface SystemInput {
  name: string;
  description: string;
  businessOutcome: string;
  ownerName: string;
}

export async function listSystems(organizationId: string): Promise<SystemRecord[]> {
  const systems = await store.query("systems", { organizationId });
  return systems.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

/** Tenant guard baked in: a system from another organization reads as missing. */
export async function getSystem(
  organizationId: string,
  id: string,
): Promise<SystemRecord | null> {
  const system = await store.get("systems", id);
  if (!system || system.organizationId !== organizationId) return null;
  return system;
}

export async function createSystem(
  organizationId: string,
  input: SystemInput,
): Promise<SystemRecord> {
  const now = new Date().toISOString();
  const record: SystemRecord = {
    id: newId(),
    organizationId,
    name: input.name,
    description: input.description,
    status: "draft",
    businessOutcome: input.businessOutcome,
    ownerName: input.ownerName,
    createdAt: now,
    updatedAt: now,
  };
  await store.insert("systems", record);
  return record;
}

export async function updateSystem(
  organizationId: string,
  id: string,
  patch: Partial<SystemInput> & { status?: SystemStatus },
): Promise<SystemRecord | null> {
  const existing = await getSystem(organizationId, id);
  if (!existing) return null;
  return store.update("systems", id, { ...patch, updatedAt: new Date().toISOString() });
}

export type DeleteSystemResult =
  | { ok: true }
  | { ok: false; reason: "not_found" | "has_automations"; automationCount?: number };

export async function deleteSystem(
  organizationId: string,
  id: string,
): Promise<DeleteSystemResult> {
  const existing = await getSystem(organizationId, id);
  if (!existing) return { ok: false, reason: "not_found" };

  const linked = await store.query("automations", { organizationId, systemId: id });
  if (linked.length > 0) {
    return { ok: false, reason: "has_automations", automationCount: linked.length };
  }

  await store.remove("systems", id);
  return { ok: true };
}
