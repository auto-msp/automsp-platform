import "server-only";
import { newId } from "@/server/db/id";
import { store } from "@/server/db/store";

/**
 * Append-only audit trail. Every state-changing action in the product writes
 * one record here. Never log secrets, tokens, or credentials in metadata.
 */
export async function writeAuditLog(entry: {
  organizationId: string | null;
  actorId: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await store.insert("audit_logs", {
    id: newId(),
    organizationId: entry.organizationId,
    actorId: entry.actorId,
    action: entry.action,
    resource: entry.resource,
    resourceId: entry.resourceId ?? null,
    metadata: entry.metadata,
    createdAt: new Date().toISOString(),
  });
}
