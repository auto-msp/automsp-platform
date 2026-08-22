import "server-only";
import { store } from "@/server/db/store";
import type { IntegrationRecord } from "@/server/db/types";

/**
 * Integration catalog. These are the providers a customer can store
 * credentials for. "Catalog entry" ≠ "working connector": storing a
 * credential makes it injectable into http workflow steps; fully managed
 * connectors (OAuth flows, sync) are a later slice and are NOT claimed here.
 */
export interface ProviderSpec {
  key: string;
  name: string;
  category: string;
  /** How the credential is normally presented */
  defaultHeader: string;
  scheme: string | null;
}

export const PROVIDERS: ProviderSpec[] = [
  { key: "slack", name: "Slack", category: "Messaging", defaultHeader: "Authorization", scheme: "Bearer" },
  { key: "hubspot", name: "HubSpot", category: "CRM", defaultHeader: "Authorization", scheme: "Bearer" },
  { key: "salesforce", name: "Salesforce", category: "CRM", defaultHeader: "Authorization", scheme: "Bearer" },
  { key: "airtable", name: "Airtable", category: "Data", defaultHeader: "Authorization", scheme: "Bearer" },
  { key: "notion", name: "Notion", category: "Docs", defaultHeader: "Authorization", scheme: "Bearer" },
  { key: "stripe", name: "Stripe", category: "Payments", defaultHeader: "Authorization", scheme: "Bearer" },
  { key: "google", name: "Google Workspace", category: "Productivity", defaultHeader: "Authorization", scheme: "Bearer" },
  { key: "microsoft", name: "Microsoft 365", category: "Productivity", defaultHeader: "Authorization", scheme: "Bearer" },
  { key: "generic-http", name: "Custom HTTP endpoint", category: "Generic", defaultHeader: "Authorization", scheme: "Bearer" },
];

export function providerByKey(key: string): ProviderSpec | undefined {
  return PROVIDERS.find((p) => p.key === key);
}

/** List credentials for an org — metadata only, records never carry plaintext. */
export async function listIntegrations(organizationId: string): Promise<IntegrationRecord[]> {
  const rows = await store.query("integrations", { organizationId });
  return rows.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

/** Tenant-guarded lookup. Always check the org, no exceptions. */
export async function getIntegration(
  organizationId: string,
  id: string,
): Promise<IntegrationRecord | null> {
  const row = await store.get("integrations", id);
  if (!row || row.organizationId !== organizationId) return null;
  return row;
}

/** Active credentials usable as http-step auth sources. */
export async function listUsableCredentials(
  organizationId: string,
): Promise<Pick<IntegrationRecord, "id" | "name" | "providerKey">[]> {
  const rows = await store.query("integrations", { organizationId, status: "active" });
  return rows
    .map((r) => ({ id: r.id, name: r.name, providerKey: r.providerKey }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
