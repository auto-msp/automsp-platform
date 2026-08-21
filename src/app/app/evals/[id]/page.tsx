import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppPageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { StatusPill } from "@/components/app/status-pill";
import { getAgent } from "@/server/ai/agents";
import { getRun, getSuite, listCases, listResults, listRuns } from "@/server/ai/evals";
import { providerStatus } from "@/server/ai/provider";
import { can, getSessionContext } from "@/server/auth/session";
import { formatDateTime } from "@/lib/format";
import { CaseForm, DeleteCaseButton, RunButton } from "./case-forms";

export const metadata: Metadata = { title: "Evaluation suite" };
export const dynamic = "force-dynamic";

const SCORER_LABELS: Record<string, string> = {
  exact: "exact",
  contains: "contains",
  llm_judge: "LLM judge",
};

export default async function EvalSuitePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ run?: string }>;
}) {
  const ctx = await getSessionContext();
  if (!ctx) return null;

  const { id } = await params;
  const { run: runId } = await searchParams;
  const suite = await getSuite(ctx.organization.id, id);
  if (!suite) notFound();
  if (!can(ctx, "evals.view")) {
    return <AppPageHeader title={suite.name} description="Your role does not include viewing evaluations." />;
  }

  const canRun = can(ctx, "evals.run");
  const [cases, runs, agent] = await Promise.all([
    listCases(suite.id),
    listRuns(ctx.organization.id, suite.id),
    suite.agentId ? getAgent(ctx.organization.id, suite.agentId) : Promise.resolve(null),
  ]);
  const selectedRun = runId ? await getRun(ctx.organization.id, runId) : runs[0] ?? null;
  const results = selectedRun ? await listResults(selectedRun.id) : [];
  const caseMap = new Map(cases.map((c) => [c.id, c]));
  const provider = providerStatus();

  return (
    <div>
      <AppPageHeader
        title={suite.name}
        description={`${suite.description || "Evaluation suite"} — scoring: ${SCORER_LABELS[suite.scorer] ?? suite.scorer}${agent ? ` · agent: ${agent.name}` : ""}.`}
      >
        {canRun ? <RunButton suiteId={suite.id} disabled={!provider.configured} /> : null}
      </AppPageHeader>

      {!provider.configured ? (
        <div className="mb-6 border border-fog bg-haze px-4 py-3">
          <p className="text-[13px] text-slate">
            <span className="font-medium text-warn">Runs are blocked:</span> no AI provider is configured,
            so no answers can be produced to score. Blocked runs record the reason, not zero passes.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_22rem]">
        <div>
          {canRun ? (
            <div className="mb-6">
              <CaseForm suiteId={suite.id} />
            </div>
          ) : null}

          {cases.length === 0 ? (
            <EmptyState
              title="No cases yet"
              description="Each case is one input plus the expected answer. Runs score every case and record the outcome."
            />
          ) : (
            <div className="space-y-3">
              {cases.map((testCase) => (
                <div key={testCase.id} className="border border-fog bg-paper p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 text-[13px]">
                      <p className="font-medium text-ink">Input</p>
                      <p className="mt-0.5 whitespace-pre-wrap text-slate">{testCase.input}</p>
                      <p className="mt-2 font-medium text-ink">Expected</p>
                      <p className="mt-0.5 whitespace-pre-wrap text-slate">{testCase.expected}</p>
                    </div>
                    {canRun ? <DeleteCaseButton suiteId={suite.id} caseId={testCase.id} /> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="border border-fog bg-paper p-5">
            <h3 className="mb-3 text-[13px] font-medium tracking-wide text-ink uppercase">Runs</h3>
            {runs.length === 0 ? (
              <p className="text-[13px] text-slate">No runs yet.</p>
            ) : (
              <ul className="space-y-2">
                {runs.map((run) => (
                  <li key={run.id}>
                    <a
                      href={`/app/evals/${suite.id}?run=${run.id}`}
                      className={`block border px-3 py-2 text-[12px] transition-colors ${
                        selectedRun?.id === run.id ? "border-ink" : "border-fog hover:border-slate"
                      }`}
                    >
                      <span className="flex items-baseline justify-between">
                        <span className="font-medium text-ink">
                          {run.status === "blocked" ? (
                            <span className="text-warn">blocked</span>
                          ) : run.status === "completed" ? (
                            <span>
                              {run.passed}/{run.total} passed
                            </span>
                          ) : (
                            run.status
                          )}
                        </span>
                        <span className="tnum text-mute">{formatDateTime(run.startedAt)}</span>
                      </span>
                      <span className="mt-0.5 block text-slate">
                        {run.scorerUsed ? `${run.scorerUsed} scorer` : "no scorer"}{run.model ? ` · ${run.model}` : ""}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedRun ? (
            <div className="border border-fog bg-paper p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[13px] font-medium tracking-wide text-ink uppercase">Run detail</h3>
                <StatusPill status={selectedRun.status} />
              </div>
              {selectedRun.status === "blocked" ? (
                <div className="border border-warn/40 bg-warn/10 px-3 py-2.5">
                  <p className="text-[12px] font-medium text-warn">Blocked</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-slate">{selectedRun.blockedReason}</p>
                </div>
              ) : (
                <>
                  <p className="tnum mb-3 text-sm text-ink">
                    {selectedRun.passed} passed · {selectedRun.failed} failed · scorer{" "}
                    {selectedRun.scorerUsed ?? "—"}
                  </p>
                  <ul className="space-y-3">
                    {results.map((result) => {
                      const testCase = caseMap.get(result.caseId);
                      return (
                        <li key={result.id} className="border-t border-fog pt-3 text-[12px]">
                          <div className="flex items-baseline justify-between">
                            <span
                              className={
                                result.passed === true
                                  ? "font-medium text-ok"
                                  : result.passed === false
                                    ? "font-medium text-risk"
                                    : "font-medium text-warn"
                              }
                            >
                              {result.passed === true ? "passed" : result.passed === false ? "failed" : "unscored"}
                            </span>
                            {result.latencyMs !== null ? <span className="tnum text-mute">{result.latencyMs}ms</span> : null}
                          </div>
                          {testCase ? (
                            <p className="mt-1 truncate text-mute" title={testCase.input}>
                              {testCase.input}
                            </p>
                          ) : null}
                          {result.output !== null ? (
                            <p className="mt-1 whitespace-pre-wrap text-slate">{result.output.slice(0, 400)}{result.output.length > 400 ? "…" : ""}</p>
                          ) : null}
                          {result.reason ? <p className="mt-1 text-slate">— {result.reason}</p> : null}
                        </li>
                      );
                    })}
                  </ul>
                  {selectedRun.scorerUsed === "llm_judge" ? (
                    <p className="mt-3 border-t border-fog pt-2 text-[11px] leading-relaxed text-mute">
                      LLM-judge scores are another model&rsquo;s opinion of the answer, not ground truth. Judge
                      tokens are recorded as evaluation AI runs.
                    </p>
                  ) : null}
                </>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
