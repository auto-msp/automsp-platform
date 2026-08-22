import "server-only";
import { store } from "@/server/db/store";
import type { ExecutionRecord } from "@/server/db/types";

export interface DashboardMetrics {
  systemsTotal: number;
  systemsHealthy: number;
  automationsActive: number;
  automationsTotal: number;
  executions30d: number;
  /** Actual: completed / (completed + failed) over 30d; null when no runs */
  successRate30d: number | null;
  /** Estimated: completed 30d runs × per-automation estMinutesPerRun, in hours */
  estHoursSaved30d: number;
  executionsWithEstimate: number;
  pendingApprovals: number;
  recentExecutions: ExecutionRecord[];
}

export async function getDashboardMetrics(organizationId: string): Promise<DashboardMetrics> {
  const [systems, automations, executions, approvals] = await Promise.all([
    store.query("systems", { organizationId }),
    store.query("automations", { organizationId }),
    store.query("executions", { organizationId }),
    store.query("approvals", { organizationId, status: "pending" }),
  ]);

  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recent = executions.filter((e) => Date.parse(e.createdAt) >= cutoff);
  const completed = recent.filter((e) => e.status === "completed");
  const failed = recent.filter((e) => e.status === "failed");
  const decided = completed.length + failed.length;

  const minutesByAutomation = new Map(automations.map((a) => [a.id, a.estMinutesPerRun]));
  let estMinutes = 0;
  let executionsWithEstimate = 0;
  for (const run of completed) {
    const minutes = minutesByAutomation.get(run.automationId);
    if (minutes !== undefined) {
      estMinutes += minutes;
      executionsWithEstimate += 1;
    }
  }

  const recentExecutions = [...recent]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 8);

  return {
    systemsTotal: systems.length,
    systemsHealthy: systems.filter((s) => s.status === "healthy").length,
    automationsActive: automations.filter((a) => a.status === "active").length,
    automationsTotal: automations.length,
    executions30d: recent.length,
    successRate30d: decided > 0 ? completed.length / decided : null,
    estHoursSaved30d: Math.round((estMinutes / 60) * 10) / 10,
    executionsWithEstimate,
    pendingApprovals: approvals.length,
    recentExecutions,
  };
}
