"use server";

import { revalidatePath } from "next/cache";
import { getSessionContext, requirePermission } from "@/server/auth/session";
import type { ReportType } from "@/server/db/types";
import { generateReport } from "@/server/ops/reports";

export interface GenerateReportState {
  error?: string;
  reportId?: string;
}

const ALLOWED: ReportType[] = [
  "weekly_ops",
  "monthly_impact",
  "ai_cost",
  "incident",
  "system_health",
  "automation_performance",
];

export async function generateReportAction(
  _prev: GenerateReportState | null,
  formData: FormData,
): Promise<GenerateReportState> {
  const ctx = await getSessionContext();
  if (!ctx) return { error: "Sign in required." };
  try {
    requirePermission(ctx, "reports.generate");
  } catch {
    return { error: "Your role cannot generate reports." };
  }

  const type = String(formData.get("type") ?? "") as ReportType;
  if (!ALLOWED.includes(type)) return { error: "Unknown report type." };

  const report = await generateReport(ctx.organization.id, type, {
    createdByName: ctx.user.name,
  });
  revalidatePath("/app/reports");
  return { reportId: report.id };
}
