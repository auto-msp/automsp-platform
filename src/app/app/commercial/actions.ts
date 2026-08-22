"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSessionContext, requirePermission } from "@/server/auth/session";
import {
  createClient,
  createOpportunity,
  createProject,
  setAuditStatus,
  updateOpportunity,
} from "@/server/commercial";
import { writeAuditLog } from "@/server/audit";
import type { AuditStatus, OpportunityStage, ProjectStage } from "@/server/db/types";

export interface ActionState {
  error?: string;
}

const opportunitySchema = z.object({
  company: z.string().trim().min(2, "Company is required").max(200),
  contactName: z.string().trim().max(120).optional().or(z.literal("")),
  contactEmail: z.string().trim().email().max(254).optional().or(z.literal("")),
  source: z.string().trim().max(120).optional().or(z.literal("")),
  estimatedValue: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => v === "" || v === undefined || (!Number.isNaN(Number(v)) && Number(v) >= 0), {
      message: "Enter a non-negative number",
    }),
  probability: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((v) => v === "" || v === undefined || (!Number.isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100), {
      message: "0–100",
    }),
  nextAction: z.string().trim().max(200).optional().or(z.literal("")),
});

export async function createOpportunityAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const ctx = await getSessionContext();
  if (!ctx) return { error: "Sign in required." };
  try {
    requirePermission(ctx, "commercial.manage");
  } catch {
    return { error: "Your role cannot manage the pipeline." };
  }

  const parsed = opportunitySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: Object.values(parsed.error.flatten().fieldErrors)[0]?.[0] ?? "Check the form." };

  const d = parsed.data;
  await createOpportunity(
    ctx.organization.id,
    {
      company: d.company,
      contactName: d.contactName || null,
      contactEmail: d.contactEmail || null,
      source: d.source || null,
      estimatedValue: d.estimatedValue ? Number(d.estimatedValue) : null,
      probability: d.probability ? Number(d.probability) : null,
      nextAction: d.nextAction || null,
    },
    ctx.user.id,
  );
  await writeAuditLog({ organizationId: ctx.organization.id, actorId: ctx.user.id, action: "commercial.opportunity.create", resource: "commercial", metadata: { detail: `Created opportunity for ${d.company}` } });
  revalidatePath("/app/commercial");
  return {};
}

export async function updateOpportunityStageAction(
  opportunityId: string,
  stage: OpportunityStage,
): Promise<void> {
  const ctx = await getSessionContext();
  if (!ctx) return;
  requirePermission(ctx, "commercial.manage");
  await updateOpportunity(ctx.organization.id, opportunityId, { stage });
  await writeAuditLog({ organizationId: ctx.organization.id, actorId: ctx.user.id, action: "commercial.opportunity.stage", resource: "commercial", metadata: { detail: `Opportunity ${opportunityId} → ${stage}` } });
  revalidatePath("/app/commercial");
}

export async function updateAuditStatusAction(auditId: string, status: AuditStatus): Promise<void> {
  const ctx = await getSessionContext();
  if (!ctx) return;
  requirePermission(ctx, "commercial.manage");
  await setAuditStatus(ctx.organization.id, auditId, status);
  await writeAuditLog({ organizationId: ctx.organization.id, actorId: ctx.user.id, action: "commercial.audit.status", resource: "commercial", metadata: { detail: `Audit ${auditId} → ${status}` } });
  revalidatePath("/app/commercial");
}

export async function createClientAction(_prev: ActionState | null, formData: FormData): Promise<ActionState> {
  const ctx = await getSessionContext();
  if (!ctx) return { error: "Sign in required." };
  try {
    requirePermission(ctx, "commercial.manage");
  } catch {
    return { error: "Your role cannot manage clients." };
  }
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Client name is required." };
  await createClient(
    ctx.organization.id,
    {
      name,
      industry: String(formData.get("industry") ?? "").trim() || null,
      size: String(formData.get("size") ?? "").trim() || null,
    },
    ctx.user.id,
  );
  await writeAuditLog({ organizationId: ctx.organization.id, actorId: ctx.user.id, action: "commercial.client.create", resource: "commercial", metadata: { detail: `Created client ${name}` } });
  revalidatePath("/app/commercial");
  return {};
}

export async function createProjectAction(_prev: ActionState | null, formData: FormData): Promise<ActionState> {
  const ctx = await getSessionContext();
  if (!ctx) return { error: "Sign in required." };
  try {
    requirePermission(ctx, "commercial.manage");
  } catch {
    return { error: "Your role cannot manage projects." };
  }
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Project name is required." };
  await createProject(
    ctx.organization.id,
    {
      name,
      clientId: String(formData.get("clientId") ?? "").trim() || null,
      stage: (String(formData.get("stage") ?? "lead") || "lead") as ProjectStage,
    },
    ctx.user.id,
  );
  await writeAuditLog({ organizationId: ctx.organization.id, actorId: ctx.user.id, action: "commercial.project.create", resource: "commercial", metadata: { detail: `Created project ${name}` } });
  revalidatePath("/app/commercial");
  return {};
}
