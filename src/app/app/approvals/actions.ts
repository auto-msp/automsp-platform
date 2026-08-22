"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { resumeAgentRunFromApproval } from "@/server/ai/agent-runner";
import { writeAuditLog } from "@/server/audit";
import { getSessionContext, requirePermission } from "@/server/auth/session";
import { store } from "@/server/db/store";
import { resumeExecution } from "@/server/engine/executor";

export interface ApprovalFormState {
  error?: string;
}

export async function decideApprovalAction(
  approvalId: string,
  decision: "approved" | "rejected",
  _prev: ApprovalFormState | null,
  formData: FormData,
): Promise<ApprovalFormState> {
  const ctx = await getSessionContext();
  if (!ctx) redirect("/sign-in");

  try {
    requirePermission(ctx, "approvals.decide");
  } catch {
    return { error: "Your role cannot decide approvals." };
  }

  const approval = await store.get("approvals", approvalId);
  if (!approval || approval.organizationId !== ctx.organization.id) {
    return { error: "Approval not found." };
  }
  if (approval.status !== "pending") {
    return { error: "This approval has already been decided." };
  }

  const decisionNote = String(formData.get("note") ?? "").trim() || undefined;
  if (decision === "rejected" && !decisionNote) {
    return { error: "A rejection needs a note for the audit trail." };
  }

  await store.update("approvals", approvalId, {
    status: decision,
    reviewerId: ctx.user.id,
    decidedAt: new Date().toISOString(),
    decisionNote,
  });

  // Workflow approvals resume the paused execution; agent-tool approvals
  // execute the exact recorded tool call and drive the agent run forward.
  const isAgentTool = approval.kind === "agent_tool";
  const result = isAgentTool
    ? await resumeAgentRunFromApproval(approval, decision, ctx.user.name, decisionNote)
    : approval.executionId
      ? await resumeExecution(approval.executionId, decision, ctx.user.name, decisionNote)
      : { ok: false as const, error: "This approval is not linked to an execution." };

  await writeAuditLog({
    organizationId: ctx.organization.id,
    actorId: ctx.user.id,
    action: `approval.${decision}`,
    resource: "approval",
    resourceId: approvalId,
    metadata: {
      kind: approval.kind,
      executionId: approval.executionId,
      agentRunId: approval.agentRunId,
      action: approval.action,
    },
  });

  revalidatePath("/app/approvals");
  revalidatePath("/app/operations");
  if (approval.executionId) revalidatePath(`/app/operations/${approval.executionId}`);
  if (isAgentTool) {
    const agentId = typeof approval.payload.agentId === "string" ? approval.payload.agentId : null;
    if (agentId) revalidatePath(`/app/agents/${agentId}`);
  }

  if (!result.ok) return { error: result.error };

  redirect("/app/approvals");
}
