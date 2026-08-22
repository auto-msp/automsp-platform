import "server-only";
import { newId } from "@/server/db/id";
import { store } from "@/server/db/store";
import type { NotificationRecord } from "@/server/db/types";

/**
 * In-app notifications. Email delivery is intentionally not attempted until a
 * mail provider is configured — nothing is simulated.
 *
 * Targeting: `userId` set → that member only. `userId: null` → all members of
 * the organization see it. Tenant rule: every record carries organizationId.
 */
export async function notify(entry: {
  organizationId: string;
  userId?: string | null;
  kind: string;
  title: string;
  body: string;
  href?: string | null;
}): Promise<NotificationRecord> {
  const record: NotificationRecord = {
    id: newId(),
    organizationId: entry.organizationId,
    userId: entry.userId ?? null,
    kind: entry.kind,
    title: entry.title,
    body: entry.body,
    href: entry.href ?? null,
    readAt: null,
    createdAt: new Date().toISOString(),
  };
  return store.insert("notifications", record);
}

/** Notifications visible to this user: org-wide + targeted to them. */
export async function listNotifications(
  organizationId: string,
  userId: string,
): Promise<NotificationRecord[]> {
  // Org filter pushed into the store (SQL where on Postgres); the recipient
  // OR (org-wide vs personal) stays in memory.
  const rows = await store.query("notifications", { organizationId });
  const visible = rows.filter((n) => n.userId === null || n.userId === userId);
  return visible.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function unreadCount(organizationId: string, userId: string): Promise<number> {
  const rows = await store.query("notifications", { organizationId, readAt: null });
  return rows.filter((n) => n.userId === null || n.userId === userId).length;
}

/** Mark one notification read. Caller passes orgId — tenant guard. */
export async function markNotificationRead(
  organizationId: string,
  userId: string,
  id: string,
): Promise<void> {
  const row = await store.get("notifications", id);
  if (!row || row.organizationId !== organizationId) return;
  if (row.userId !== null && row.userId !== userId) return;
  if (row.readAt !== null) return;
  await store.update("notifications", id, { readAt: new Date().toISOString() });
}

export async function markAllNotificationsRead(
  organizationId: string,
  userId: string,
): Promise<number> {
  const unread = await store.query("notifications", { organizationId, readAt: null });
  const rows = unread.filter((n) => n.userId === null || n.userId === userId);
  const now = new Date().toISOString();
  for (const row of rows) await store.update("notifications", row.id, { readAt: now });
  return rows.length;
}
