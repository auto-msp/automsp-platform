import "server-only";
import { newId } from "@/server/db/id";
import { store } from "@/server/db/store";
import type { ReportRecord } from "@/server/db/types";
import { getOrgSandboxMode } from "@/server/org-settings";
import { notify } from "@/server/notifications";
import { listAgents } from "@/server/ai/agents";
import { startAgentRun } from "@/server/ai/agent-runner";

/**
 * The nightly cycle.
 *
 * Once per organization per day (checked against the most recent
 * morning_brief report), the cycle:
 *  1. gathers 24h operational facts from real records — never fabricated
 *  2. runs the Orchestrator agent over those facts when an AI provider is
 *     configured (the agent writes the narrative)
 *  3. persists a morning_brief Report and posts one org-wide notification
 *
 * Sandbox mode changes dispatch, not analysis: in sandbox nothing is sent
 * beyond the in-app report/notification, which is true whether or not
 * external channels are configured (email delivery is not attempted until a
 * provider exists).
 */

const CYCLE_SOURCE = "nightly-cycle";

interface DayFacts {
  executionsTotal: number;
  executionsCompleted: number;
  executionsFailed: number;
  approvalsPending: number;
  agentRuns: number;
}

async function gatherDayFacts(organizationId: string, sinceIso: string): Promise<DayFacts> {
  const [executions, approvals, agentRuns] = await Promise.all([
    store.query("executions", { organizationId }),
    store.query("approvals", { organizationId }),
    store.query("agent_runs", { organizationId }),
  ]);

  const since = Date.parse(sinceIso);
  const recent = executions.filter((e) => Date.parse(e.createdAt) >= since);

  return {
    executionsTotal: recent.length,
    executionsCompleted: recent.filter((e) => e.status === "completed").length,
    executionsFailed: recent.filter((e) => e.status === "failed").length,
    approvalsPending: approvals.filter((a) => a.status === "pending").length,
    agentRuns: agentRuns.filter((r) => Date.parse(r.createdAt) >= since).length,
  };
}

function factsToPrompt(facts: DayFacts, sandboxed: boolean): string {
  const lines = [
    "Nightly cycle. Here are the last 24 hours of recorded operations for this business:",
    `- Workflow executions started: ${facts.executionsTotal} (${facts.executionsCompleted} completed, ${facts.executionsFailed} failed/timed out)`,
    `- Agent runs: ${facts.agentRuns}`,
    `- Approvals currently waiting on a human: ${facts.approvalsPending}`,
    sandboxed
      ? "- NOTE: this workspace is in SANDBOX MODE. No consequential action may leave the building."
      : "- Sandbox mode is OFF: approved consequential actions dispatch externally.",
    "",
    "Write the morning brief now: What ran / What we learned / What I did / What I need from you.",
  ];
  return lines.join("\n");
}

/** Has today's brief already been written for this org? */
async function hasBriefToday(organizationId: string, now: Date): Promise<boolean> {
  const briefs = await store.query("reports", { organizationId });
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return briefs.some(
    (r) => r.type === "morning_brief" && Date.parse(r.createdAt) >= dayStart,
  );
}

export async function runNightlyCycleForOrg(
  organizationId: string,
): Promise<{ ok: boolean; reason?: string }> {
  const now = new Date();
  if (await hasBriefToday(organizationId, now)) {
    return { ok: false, reason: "already-run" };
  }

  const sandboxed = await getOrgSandboxMode(organizationId);
  const periodStart = new Date(now.getTime() - 24 * 3600_000);
  const facts = await gatherDayFacts(organizationId, periodStart.toISOString());

  // Orchestrator narrative — only when a provider is configured AND the
  // workspace actually has an Orchestrator agent with a saved version.
  let narrative: string | null = null;
  let narrativeNote: string;
  const agents = await listAgents(organizationId);
  const orchestrator = agents.find((a) => a.name.toLowerCase() === "orchestrator");

  if (!orchestrator) {
    narrativeNote = "No Orchestrator agent in this workspace yet — seed the starter fleet.";
  } else {
    const result = await startAgentRun(
      {
        organizationId,
        agentId: orchestrator.id,
        prompt: factsToPrompt(facts, sandboxed),
        source: CYCLE_SOURCE,
        createdBy: null,
      },
    );
    if (result.ok && result.run.finalText) {
      narrative = result.run.finalText;
      narrativeNote = `Orchestrator run ${result.run.id}`;
    } else if (!result.ok) {
      narrativeNote =
        result.notConfigured
          ? "No AI provider configured — set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GOOGLE_GENERATIVE_AI_API_KEY to enable the narrative."
          : result.error;
    } else {
      narrativeNote = "Orchestrator run completed without a final answer.";
    }
  }

  // Shaped like generated reports (ReportPayload) so the existing report
  // detail renderer displays it without special-casing.
  const report: ReportRecord = {
    id: newId(),
    organizationId,
    type: "morning_brief",
    periodStart: periodStart.toISOString(),
    periodEnd: now.toISOString(),
    payload: {
      title: `Morning brief — ${now.toDateString()}`,
      basisNote: sandboxed
        ? "Sandbox mode is ON — nothing left the building overnight."
        : "All figures come from recorded runs and approvals.",
      sections: [
        {
          title: "Last 24 hours",
          narrative:
            (narrative ? `${narrative}\n\n` : "") +
            (narrative ? `(${narrativeNote})` : narrativeNote),
          kpis: [
            { label: "Runs completed", value: `${facts.executionsCompleted}/${facts.executionsTotal}`, basis: "actual" },
            { label: "Failures", value: String(facts.executionsFailed), basis: "actual" },
            { label: "Agent runs", value: String(facts.agentRuns), basis: "actual" },
            { label: "Approvals waiting", value: String(facts.approvalsPending), basis: "actual" },
          ],
        },
      ],
    },
    storageKey: null,
    createdAt: now.toISOString(),
  };
  await store.insert("reports", report);

  await notify({
    organizationId,
    kind: "report",
    title: "Morning brief is ready",
    body:
      `${facts.executionsCompleted}/${facts.executionsTotal} runs completed · ` +
      `${facts.approvalsPending} approval(s) waiting` +
      (narrative ? "" : " · narrative unavailable (see report)"),
    href: "/app/reports",
  });

  return { ok: true };
}

/** Called from the scheduler tick; walks every customer workspace. */
export async function maybeRunNightlyCycles(): Promise<void> {
  const orgs = await store.all("organizations");
  for (const org of orgs) {
    try {
      await runNightlyCycleForOrg(org.id);
    } catch (err) {
      console.error(
        `[nightly-cycle] org ${org.id} failed:`,
        err instanceof Error ? err.message : err,
      );
    }
  }
}
