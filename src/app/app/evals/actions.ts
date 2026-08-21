"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getAgent } from "@/server/ai/agents";
import { addCase, createSuite, deleteCase, runSuite } from "@/server/ai/evals";
import { writeAuditLog } from "@/server/audit";
import { getSessionContext, requirePermission } from "@/server/auth/session";

export interface EvalFormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

const suiteSchema = z.object({
  name: z.string().trim().min(2, "Give the suite a name").max(120),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  agentId: z.string().trim().max(60).optional().or(z.literal("")),
  scorer: z.enum(["exact", "contains", "llm_judge"]),
});

export async function createSuiteAction(
  _prev: EvalFormState | null,
  formData: FormData,
): Promise<EvalFormState> {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");
  try {
    requirePermission(ctx, "evals.run");
  } catch {
    return { error: "Your role cannot manage evaluations." };
  }

  const parsed = suiteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const agentId = parsed.data.agentId || null;
  if (agentId) {
    const agent = await getAgent(ctx.organization.id, agentId);
    if (!agent) return { error: "The selected agent does not exist in this organization." };
  }

  const suite = await createSuite(
    ctx.organization.id,
    {
      name: parsed.data.name,
      description: parsed.data.description ?? "",
      agentId,
      scorer: parsed.data.scorer,
    },
    ctx.user.id,
  );
  await writeAuditLog({
    organizationId: ctx.organization.id,
    actorId: ctx.user.id,
    action: "eval.suite_created",
    resource: "eval_suite",
    resourceId: suite.id,
    metadata: { name: suite.name, scorer: suite.scorer },
  });
  redirect(`/app/evals/${suite.id}`);
}

const caseSchema = z.object({
  input: z.string().trim().min(1, "An input is required").max(8000),
  expected: z.string().trim().min(1, "An expected answer is required").max(8000),
});

export async function addCaseAction(
  suiteId: string,
  _prev: EvalFormState | null,
  formData: FormData,
): Promise<EvalFormState> {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");
  try {
    requirePermission(ctx, "evals.run");
  } catch {
    return { error: "Your role cannot manage evaluations." };
  }

  const parsed = caseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const record = await addCase(ctx.organization.id, suiteId, parsed.data);
  if (!record) return { error: "Eval suite not found." };
  revalidatePath(`/app/evals/${suiteId}`);
  return {};
}

export async function deleteCaseAction(suiteId: string, caseId: string): Promise<void> {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");
  requirePermission(ctx, "evals.run");
  await deleteCase(ctx.organization.id, suiteId, caseId);
  revalidatePath(`/app/evals/${suiteId}`);
}

export async function runSuiteAction(suiteId: string): Promise<void> {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");
  requirePermission(ctx, "evals.run");
  const run = await runSuite(ctx.organization.id, suiteId, ctx.user.id);
  if (run) {
    await writeAuditLog({
      organizationId: ctx.organization.id,
      actorId: ctx.user.id,
      action: "eval.run_executed",
      resource: "eval_run",
      resourceId: run.id,
      metadata: { suiteId, status: run.status, passed: run.passed, total: run.total },
    });
  }
  revalidatePath(`/app/evals/${suiteId}`);
}
