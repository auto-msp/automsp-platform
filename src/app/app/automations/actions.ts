"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { writeAuditLog } from "@/server/audit";
import { getSessionContext, requirePermission } from "@/server/auth/session";
import {
  createAutomation,
  deleteAutomation,
  getAutomation,
  saveDefinition,
  stepsToDefinition,
  updateAutomation,
} from "@/server/automations";
import { startExecution } from "@/server/engine/executor";
import type { NodeType } from "@/server/db/types";

export interface AutomationFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  errors?: string[];
}

const automationSchema = z.object({
  name: z.string().trim().min(2, "Give the automation a name").max(80),
  description: z.string().trim().max(500).optional().default(""),
  systemId: z.string().optional().default(""),
  estMinutesPerRun: z.coerce.number().min(0, "Cannot be negative").max(10000).optional().default(0),
});

async function requireCtx(permission: "automations.manage" | "automations.run") {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");
  requirePermission(ctx, permission);
  return ctx;
}

export async function createAutomationAction(
  _prev: AutomationFormState | null,
  formData: FormData,
): Promise<AutomationFormState> {
  let ctx;
  try {
    ctx = await requireCtx("automations.manage");
  } catch {
    return { error: "Your role cannot create automations." };
  }

  const parsed = automationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const systemId = parsed.data.systemId || null;
  const automation = await createAutomation(
    ctx.organization.id,
    { ...parsed.data, systemId },
    ctx.user.id,
  );
  await writeAuditLog({
    organizationId: ctx.organization.id,
    actorId: ctx.user.id,
    action: "automation.created",
    resource: "automation",
    resourceId: automation.id,
    metadata: { name: automation.name },
  });

  redirect(`/app/automations/${automation.id}/build`);
}

export async function updateAutomationAction(
  automationId: string,
  _prev: AutomationFormState | null,
  formData: FormData,
): Promise<AutomationFormState> {
  let ctx;
  try {
    ctx = await requireCtx("automations.manage");
  } catch {
    return { error: "Your role cannot update automations." };
  }

  const parsed = automationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const statusRaw = formData.get("status");
  const status = ["draft", "active", "paused", "archived"].includes(String(statusRaw))
    ? (statusRaw as "draft" | "active" | "paused" | "archived")
    : undefined;

  const updated = await updateAutomation(ctx.organization.id, automationId, {
    ...parsed.data,
    systemId: parsed.data.systemId || null,
    status,
  });
  if (!updated) return { error: "Automation not found." };

  await writeAuditLog({
    organizationId: ctx.organization.id,
    actorId: ctx.user.id,
    action: "automation.updated",
    resource: "automation",
    resourceId: automationId,
    metadata: { name: updated.name, status: updated.status },
  });

  revalidatePath(`/app/automations/${automationId}`);
  revalidatePath("/app/automations");
  redirect(`/app/automations/${automationId}`);
}

export async function deleteAutomationAction(
  automationId: string,
  prev: AutomationFormState | null,
  formData: FormData,
): Promise<AutomationFormState> {
  void prev;
  void formData;
  let ctx;
  try {
    ctx = await requireCtx("automations.manage");
  } catch {
    return { error: "Your role cannot delete automations." };
  }

  const existing = await getAutomation(ctx.organization.id, automationId);
  if (!existing) return { error: "Automation not found." };

  const result = await deleteAutomation(ctx.organization.id, automationId);
  if (!result.ok) {
    if (result.reason === "has_executions") {
      return {
        error: `This automation has ${result.count} recorded run${result.count === 1 ? "" : "s"}. Archive it instead — execution history is immutable.`,
      };
    }
    return { error: "Automation not found." };
  }

  await writeAuditLog({
    organizationId: ctx.organization.id,
    actorId: ctx.user.id,
    action: "automation.deleted",
    resource: "automation",
    resourceId: automationId,
    metadata: { name: existing.name },
  });

  revalidatePath("/app/automations");
  redirect("/app/automations");
}

// ── Definition builder ───────────────────────────────────────────────────────

const NODE_TYPES: NodeType[] = [
  "trigger",
  "condition",
  "template",
  "approval",
  "log",
  "output",
  "ai",
  "http",
];

export async function saveDefinitionAction(
  automationId: string,
  _prev: AutomationFormState | null,
  formData: FormData,
): Promise<AutomationFormState> {
  let ctx;
  try {
    ctx = await requireCtx("automations.manage");
  } catch {
    return { error: "Your role cannot edit automations." };
  }

  const raw = formData.get("definition");
  if (typeof raw !== "string" || !raw) return { error: "No definition submitted." };

  let steps: unknown;
  try {
    steps = JSON.parse(raw);
  } catch {
    return { error: "Definition is not valid JSON." };
  }
  if (!Array.isArray(steps)) return { error: "Definition must be a list of steps." };

  const cleaned = (steps as Record<string, unknown>[]).map((s, i) => {
    const key = String(s.key ?? "").trim();
    const type = s.type as NodeType;
    return {
      key: key || `step-${i + 1}`,
      type: NODE_TYPES.includes(type) ? type : ("log" as NodeType),
      config: typeof s.config === "object" && s.config !== null ? (s.config as Record<string, unknown>) : {},
    };
  });
  if (cleaned.length === 0) return { error: "Add at least a trigger step." };
  if (cleaned[0].type !== "trigger") {
    cleaned.unshift({ key: "trigger", type: "trigger", config: { triggerType: "manual" } });
  }
  // Ensure trigger config is set
  cleaned[0].config = { ...cleaned[0].config, triggerType: "manual" };

  const definition = stepsToDefinition(cleaned);
  const result = await saveDefinition(ctx.organization.id, automationId, definition, ctx.user.id);

  if (!result.ok) return { errors: result.errors };

  await writeAuditLog({
    organizationId: ctx.organization.id,
    actorId: ctx.user.id,
    action: "automation.definition_saved",
    resource: "automation",
    resourceId: automationId,
    metadata: { version: result.version.version, steps: cleaned.length },
  });

  revalidatePath(`/app/automations/${automationId}/build`);
  revalidatePath(`/app/automations/${automationId}`);
  redirect(`/app/automations/${automationId}`);
}

// ── Run ──────────────────────────────────────────────────────────────────────

export async function runAutomationAction(
  automationId: string,
  _prev: AutomationFormState | null,
  formData: FormData,
): Promise<AutomationFormState> {
  let ctx;
  try {
    ctx = await requireCtx("automations.run");
  } catch {
    return { error: "Your role cannot run automations." };
  }

  const automation = await getAutomation(ctx.organization.id, automationId);
  if (!automation) return { error: "Automation not found." };

  let input: Record<string, unknown> = {};
  const rawInput = String(formData.get("input") ?? "").trim();
  if (rawInput) {
    try {
      const parsedInput: unknown = JSON.parse(rawInput);
      if (typeof parsedInput !== "object" || parsedInput === null || Array.isArray(parsedInput)) {
        return { fieldErrors: { input: ["Input must be a JSON object"] } };
      }
      input = parsedInput as Record<string, unknown>;
    } catch {
      return { fieldErrors: { input: ["Input must be valid JSON"] } };
    }
  }

  const idempotencyKey = String(formData.get("idempotencyKey") ?? "").trim() || undefined;

  const result = await startExecution({
    organizationId: ctx.organization.id,
    automationId,
    input,
    idempotencyKey,
    startedBy: ctx.user.name,
  });

  if (!result.ok) return { error: result.error };

  await writeAuditLog({
    organizationId: ctx.organization.id,
    actorId: ctx.user.id,
    action: "automation.run_started",
    resource: "execution",
    resourceId: result.execution.id,
    metadata: { automationId, idempotencyKey },
  });

  redirect(`/app/operations/${result.execution.id}`);
}
