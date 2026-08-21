import "server-only";
import { newId } from "@/server/db/id";
import { store } from "@/server/db/store";
import type { EvalCaseRecord, EvalResultRecord, EvalRunRecord, EvalSuiteRecord } from "@/server/db/types";
import { notify } from "@/server/notifications";
import { runAgentCompletion } from "./agents";
import { getProvider } from "./provider";

/**
 * Evaluations. A suite is a named set of input/expected cases pinned to an
 * agent (or to the node's inline config when no agent is set). Scorers:
 *  - exact     — normalized string equality
 *  - contains  — expected substring present (case-insensitive)
 *  - llm_judge — a second model call grades the answer; requires a provider,
 *                costs tokens (recorded like any call), and is labeled as a
 *                judge opinion rather than ground truth.
 * Without a configured provider no run can produce answers, and the run is
 * recorded as "blocked" with the reason — never as zero scores.
 */

export async function listSuites(
  organizationId: string,
): Promise<(EvalSuiteRecord & { caseCount: number; lastRun: EvalRunRecord | null })[]> {
  const suites = await store.find("eval_suites", (s) => s.organizationId === organizationId);
  const cases = await store.all("eval_cases");
  const runs = await store.find("eval_runs", (r) => r.organizationId === organizationId);
  return suites
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .map((suite) => ({
      ...suite,
      caseCount: cases.filter((c) => c.suiteId === suite.id).length,
      lastRun:
        runs
          .filter((r) => r.suiteId === suite.id)
          .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))[0] ?? null,
    }));
}

export async function getSuite(organizationId: string, id: string): Promise<EvalSuiteRecord | null> {
  const suite = await store.get("eval_suites", id);
  if (!suite || suite.organizationId !== organizationId) return null;
  return suite;
}

export async function createSuite(
  organizationId: string,
  input: { name: string; description: string; agentId: string | null; scorer: EvalSuiteRecord["scorer"] },
  createdBy: string,
): Promise<EvalSuiteRecord> {
  const now = new Date().toISOString();
  const suite: EvalSuiteRecord = {
    id: newId(),
    organizationId,
    agentId: input.agentId,
    name: input.name,
    description: input.description,
    scorer: input.scorer,
    createdAt: now,
    updatedAt: now,
    createdBy,
  };
  await store.insert("eval_suites", suite);
  return suite;
}

export async function listCases(suiteId: string): Promise<EvalCaseRecord[]> {
  const cases = await store.find("eval_cases", (c) => c.suiteId === suiteId);
  return cases.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
}

export async function addCase(
  organizationId: string,
  suiteId: string,
  input: { input: string; expected: string },
): Promise<EvalCaseRecord | null> {
  const suite = await getSuite(organizationId, suiteId);
  if (!suite) return null;
  const record: EvalCaseRecord = {
    id: newId(),
    suiteId,
    input: input.input,
    expected: input.expected,
    createdAt: new Date().toISOString(),
  };
  await store.insert("eval_cases", record);
  await store.update("eval_suites", suiteId, { updatedAt: record.createdAt });
  return record;
}

export async function deleteCase(organizationId: string, suiteId: string, caseId: string): Promise<boolean> {
  const suite = await getSuite(organizationId, suiteId);
  if (!suite) return false;
  const row = await store.get("eval_cases", caseId);
  if (!row || row.suiteId !== suiteId) return false;
  await store.remove("eval_cases", caseId);
  return true;
}

export async function listRuns(organizationId: string, suiteId: string): Promise<EvalRunRecord[]> {
  const runs = await store.find(
    "eval_runs",
    (r) => r.organizationId === organizationId && r.suiteId === suiteId,
  );
  return runs.sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt));
}

export async function getRun(organizationId: string, runId: string): Promise<EvalRunRecord | null> {
  const run = await store.get("eval_runs", runId);
  if (!run || run.organizationId !== organizationId) return null;
  return run;
}

export async function listResults(runId: string): Promise<EvalResultRecord[]> {
  const results = await store.find("eval_results", (r) => r.runId === runId);
  return results.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
}

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Execute a suite end-to-end. Sequential, honest, and fully recorded. */
export async function runSuite(
  organizationId: string,
  suiteId: string,
  userId: string,
): Promise<EvalRunRecord | null> {
  const suite = await getSuite(organizationId, suiteId);
  if (!suite) return null;
  const cases = await listCases(suiteId);
  const now = new Date().toISOString();

  const run: EvalRunRecord = {
    id: newId(),
    organizationId,
    suiteId,
    agentId: suite.agentId,
    model: null,
    scorerUsed: null,
    status: "completed",
    total: cases.length,
    passed: 0,
    failed: 0,
    blockedReason: null,
    startedAt: now,
    completedAt: null,
    createdBy: userId,
  };

  const provider = getProvider();
  if (!provider) {
    run.status = "blocked";
    run.blockedReason =
      "No AI provider is configured for this environment — a run cannot produce answers to score. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GOOGLE_GENERATIVE_AI_API_KEY (server-side) to enable runs.";
    run.completedAt = new Date().toISOString();
    await store.insert("eval_runs", run);
    await notifySuiteRun(run, suite.name);
    return run;
  }
  if (cases.length === 0) {
    run.status = "blocked";
    run.blockedReason = "This suite has no cases yet — add input/expected pairs before running.";
    run.completedAt = new Date().toISOString();
    await store.insert("eval_runs", run);
    await notifySuiteRun(run, suite.name);
    return run;
  }

  run.scorerUsed = suite.scorer;
  await store.insert("eval_runs", run);

  let passed = 0;
  let failed = 0;
  for (const testCase of cases) {
    const completion = await runAgentCompletion({
      organizationId,
      prompt: testCase.input,
      agentId: suite.agentId,
      source: "evaluation",
      evalRunId: run.id,
    });
    let output: string | null = null;
    let result: boolean | null = null;
    let reason: string | null = null;
    let latencyMs: number | null = null;

    if (!completion.ok) {
      result = null;
      reason = `Run error: ${completion.error.slice(0, 200)}`;
    } else {
      output = completion.text;
      latencyMs = completion.latencyMs;
      if (!run.model) run.model = completion.model;
      if (suite.scorer === "exact") {
        result = normalize(output) === normalize(testCase.expected);
        reason = result ? "Exact match." : "Output differs from expected.";
      } else if (suite.scorer === "contains") {
        result = output.toLowerCase().includes(testCase.expected.toLowerCase());
        reason = result ? "Expected substring present." : "Expected substring missing.";
      } else {
        // llm_judge: a second model call; its tokens are recorded as an
        // evaluation AI run like any other call.
        const judgment = await runAgentCompletion({
          organizationId,
          prompt:
            `You are grading an AI answer. Reply with exactly PASS or FAIL on the first line, then one short sentence why.\n\n` +
            `Question: ${testCase.input}\nExpected answer: ${testCase.expected}\nActual answer: ${output}`,
          agentId: null,
          source: "evaluation",
          evalRunId: run.id,
        });
        if (!judgment.ok) {
          result = null;
          reason = `Judge call failed: ${judgment.error.slice(0, 200)}`;
        } else {
          const firstLine = judgment.text.trim().split("\n")[0].trim().toUpperCase();
          result = firstLine.startsWith("PASS");
          reason = `Judge (model opinion, not ground truth): ${judgment.text.trim().split("\n").slice(1).join(" ").slice(0, 240) || firstLine}`;
        }
      }
    }

    if (result === true) passed += 1;
    else failed += 1;
    await store.insert("eval_results", {
      id: newId(),
      runId: run.id,
      caseId: testCase.id,
      output,
      passed: result,
      reason,
      latencyMs,
      createdAt: new Date().toISOString(),
    });
  }

  run.passed = passed;
  run.failed = failed;
  run.completedAt = new Date().toISOString();
  await store.update("eval_runs", run.id, {
    passed,
    failed,
    model: run.model,
    scorerUsed: run.scorerUsed,
    completedAt: run.completedAt,
  });
  await notifySuiteRun({ ...run, passed, failed }, suite.name);
  return { ...run, passed, failed };
}

async function notifySuiteRun(run: EvalRunRecord, suiteName: string): Promise<void> {
  const body =
    run.status === "blocked"
      ? (run.blockedReason ?? "The run could not start.")
      : run.status === "completed"
        ? `${run.passed}/${run.total} cases passed (${run.scorerUsed} scorer).`
        : "The run failed — see the run detail.";
  await notify({
    organizationId: run.organizationId,
    kind: "eval",
    title: `${run.status === "blocked" ? "Evaluation blocked" : "Evaluation finished"} — ${suiteName}`,
    body,
    href: `/app/evals/${run.suiteId}?run=${run.id}`,
  });
}
