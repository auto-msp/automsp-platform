"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { writeAuditLog } from "@/server/audit";
import { getSessionContext, requirePermission } from "@/server/auth/session";
import { generateStrategyDocs, type StrategyRunResult } from "@/server/growth/strategy";

export interface GrowthFormState {
  error?: string;
  notice?: string;
  result?: StrategyRunResult;
}

const schema = z.object({
  businessName: z.string().trim().min(2, "Give the business a name").max(120),
  website: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || /^https?:\/\/.+/.test(v), "Website must be a full URL (https://…)")
    .optional(),
  description: z.string().trim().min(30, "Describe the business in at least a sentence or two").max(8_000),
  audience: z.string().trim().max(4_000).optional(),
});

export async function generateStrategyAction(
  _prev: GrowthFormState | null,
  formData: FormData,
): Promise<GrowthFormState> {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");
  try {
    requirePermission(ctx, "knowledge.manage");
  } catch {
    return { error: "Your role cannot manage knowledge." };
  }

  const parsed = schema.safeParse({
    businessName: formData.get("businessName") ?? "",
    website: (formData.get("website") ?? "").toString().trim() || undefined,
    description: formData.get("description") ?? "",
    audience: (formData.get("audience") ?? "").toString().trim() || undefined,
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: issue?.message ?? "Check the form and try again." };
  }

  const result = await generateStrategyDocs(
    ctx.organization.id,
    {
      businessName: parsed.data.businessName,
      website: parsed.data.website ?? null,
      description: parsed.data.description,
      audience: parsed.data.audience ?? null,
    },
    ctx.user.id,
  );

  await writeAuditLog({
    organizationId: ctx.organization.id,
    actorId: ctx.user.id,
    action: "growth.strategy_generated",
    resource: "knowledge_source",
    resourceId: result.sourceId ?? "n/a",
    metadata: {
      businessName: parsed.data.businessName,
      docsGenerated: result.docs.filter((d) => d.status === "generated").length,
      notConfigured: Boolean(result.notConfigured),
    },
  });

  revalidatePath("/app/growth");

  if (!result.ok && result.notConfigured) {
    return { error: result.error };
  }
  const generated = result.docs.filter((d) => d.status === "generated");
  const failed = result.docs.filter((d) => d.status === "failed");
  return {
    result,
    notice:
      `${generated.length}/5 strategy documents generated` +
      (failed.length > 0 ? ` · ${failed.length} failed (see below)` : ""),
  };
}
