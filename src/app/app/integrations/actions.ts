"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { writeAuditLog } from "@/server/audit";
import { getSessionContext, requirePermission } from "@/server/auth/session";
import { getIntegration, providerByKey } from "@/server/integrations";
import { notify } from "@/server/notifications";
import { revokeCredential, storeCredential } from "@/server/vault";

export interface IntegrationFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

const addSchema = z.object({
  providerKey: z.string().trim().min(2).max(60),
  name: z.string().trim().min(2, "Give this credential a name").max(120),
  secret: z.string().min(8, "Secret looks too short").max(4000),
});

export async function addIntegrationAction(
  _prev: IntegrationFormState | null,
  formData: FormData,
): Promise<IntegrationFormState> {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");
  try {
    requirePermission(ctx, "integrations.manage");
  } catch {
    return { error: "Your role cannot manage integrations." };
  }

  const parsed = addSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const provider = providerByKey(parsed.data.providerKey);
  if (!provider) return { error: "Unknown provider." };

  // The secret is sealed inside storeCredential and is never returned,
  // logged, or written to the audit trail.
  const record = await storeCredential({
    organizationId: ctx.organization.id,
    providerKey: provider.key,
    name: parsed.data.name,
    authType: "api_token",
    secret: parsed.data.secret,
    createdBy: ctx.user.id,
  });

  await writeAuditLog({
    organizationId: ctx.organization.id,
    actorId: ctx.user.id,
    action: "integration.credential_added",
    resource: "integration",
    resourceId: record.id,
    metadata: { providerKey: provider.key, name: record.name },
  });
  await notify({
    organizationId: ctx.organization.id,
    kind: "integration",
    title: `Integration added — ${record.name}`,
    body: `${provider.name} credentials stored in the vault (…${record.secretPreview}). HTTP workflow steps can now use them.`,
    href: "/app/integrations",
  });

  revalidatePath("/app/integrations");
  redirect("/app/integrations");
}

export async function revokeIntegrationAction(
  integrationId: string,
  prev: IntegrationFormState | null,
  formData: FormData,
): Promise<IntegrationFormState> {
  void prev;
  void formData;
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");
  try {
    requirePermission(ctx, "integrations.manage");
  } catch {
    return { error: "Your role cannot manage integrations." };
  }

  const existing = await getIntegration(ctx.organization.id, integrationId);
  if (!existing) return { error: "Integration not found." };

  const ok = await revokeCredential(ctx.organization.id, integrationId);
  if (!ok) return { error: "Integration not found." };

  await writeAuditLog({
    organizationId: ctx.organization.id,
    actorId: ctx.user.id,
    action: "integration.credential_revoked",
    resource: "integration",
    resourceId: integrationId,
    metadata: { providerKey: existing.providerKey, name: existing.name },
  });

  revalidatePath("/app/integrations");
  redirect("/app/integrations");
}
