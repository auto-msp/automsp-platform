"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { writeAuditLog } from "@/server/audit";
import { getSessionContext, requirePermission } from "@/server/auth/session";
import { createSystem, deleteSystem, getSystem, updateSystem } from "@/server/systems";

export interface SystemFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

const systemSchema = z.object({
  name: z.string().trim().min(2, "Give the system a name").max(80),
  description: z.string().trim().max(500).optional().default(""),
  businessOutcome: z.string().trim().max(300).optional().default(""),
  ownerName: z.string().trim().max(80).optional().default(""),
});

export async function createSystemAction(
  _prev: SystemFormState | null,
  formData: FormData,
): Promise<SystemFormState> {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");

  try {
    requirePermission(ctx, "systems.manage");
  } catch {
    return { error: "Your role cannot create systems." };
  }

  const parsed = systemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const system = await createSystem(ctx.organization.id, parsed.data);
  await writeAuditLog({
    organizationId: ctx.organization.id,
    actorId: ctx.user.id,
    action: "system.created",
    resource: "system",
    resourceId: system.id,
    metadata: { name: system.name },
  });

  redirect(`/app/systems/${system.id}`);
}

export async function updateSystemAction(
  systemId: string,
  _prev: SystemFormState | null,
  formData: FormData,
): Promise<SystemFormState> {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");

  try {
    requirePermission(ctx, "systems.manage");
  } catch {
    return { error: "Your role cannot update systems." };
  }

  const parsed = systemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const statusRaw = formData.get("status");
  const status = ["draft", "healthy", "warning", "paused", "incident"].includes(String(statusRaw))
    ? (statusRaw as "draft" | "healthy" | "warning" | "paused" | "incident")
    : undefined;

  const updated = await updateSystem(ctx.organization.id, systemId, { ...parsed.data, status });
  if (!updated) return { error: "System not found." };

  await writeAuditLog({
    organizationId: ctx.organization.id,
    actorId: ctx.user.id,
    action: "system.updated",
    resource: "system",
    resourceId: systemId,
    metadata: { name: updated.name },
  });

  revalidatePath(`/app/systems/${systemId}`);
  revalidatePath("/app/systems");
  redirect(`/app/systems/${systemId}`);
}

export async function deleteSystemAction(
  systemId: string,
  prev: SystemFormState | null,
  formData: FormData,
): Promise<SystemFormState> {
  void prev;
  void formData;
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");

  try {
    requirePermission(ctx, "systems.manage");
  } catch {
    return { error: "Your role cannot delete systems." };
  }

  // Confirm it exists in this tenant before deleting, for a clean audit trail.
  const existing = await getSystem(ctx.organization.id, systemId);
  if (!existing) return { error: "System not found." };

  const result = await deleteSystem(ctx.organization.id, systemId);
  if (!result.ok) {
    if (result.reason === "has_automations") {
      return {
        error: `This system still has ${result.automationCount} automation${result.automationCount === 1 ? "" : "s"}. Reassign or delete them first.`,
      };
    }
    return { error: "System not found." };
  }

  await writeAuditLog({
    organizationId: ctx.organization.id,
    actorId: ctx.user.id,
    action: "system.deleted",
    resource: "system",
    resourceId: systemId,
    metadata: { name: existing.name },
  });

  revalidatePath("/app/systems");
  redirect("/app/systems");
}
