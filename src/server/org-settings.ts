import "server-only";
import { store } from "@/server/db/store";
import type { OrganizationRecord } from "@/server/db/types";

/**
 * Organization runtime settings.
 *
 * Sandbox mode is the safety default for every workspace: agents and
 * automations run end-to-end, but nothing leaves the building without an
 * explicit human decision. The flag is read server-side on every consequential
 * path — it is never a client-side concern.
 */

export function isSandboxMode(org: Pick<OrganizationRecord, "sandboxMode">): boolean {
  // Absent field (pre-migration rows) means sandboxed — fail closed.
  return org.sandboxMode !== false;
}

export async function getOrgSandboxMode(organizationId: string): Promise<boolean> {
  const org = await store.get("organizations", organizationId);
  return org ? isSandboxMode(org) : true;
}

export async function setSandboxMode(
  organizationId: string,
  enabled: boolean,
): Promise<void> {
  await store.update("organizations", organizationId, { sandboxMode: enabled });
}
