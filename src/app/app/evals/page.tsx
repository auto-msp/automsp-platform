import type { Metadata } from "next";
import Link from "next/link";
import { AppPageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { listAgents } from "@/server/ai/agents";
import { listSuites } from "@/server/ai/evals";
import { providerStatus } from "@/server/ai/provider";
import { can, getSessionContext } from "@/server/auth/session";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Evaluations" };
export const dynamic = "force-dynamic";

const SCORER_LABELS: Record<string, string> = {
  exact: "exact match",
  contains: "contains expected",
  llm_judge: "LLM judge (model opinion)",
};

export default async function EvalsPage() {
  const ctx = await getSessionContext();
  if (!ctx) return null;
  if (!can(ctx, "evals.view")) {
    return (
      <EmptyState
        title="No access"
        description="Your role does not include evaluations. Ask an organization owner or admin."
      />
    );
  }

  const [rows, agents] = await Promise.all([listSuites(ctx.organization.id), listAgents(ctx.organization.id)]);
  const agentNames = new Map(agents.map((a) => [a.id, a.name]));
  const canRun = can(ctx, "evals.run");
  const provider = providerStatus();

  return (
    <div>
      <AppPageHeader
        title="Evaluations"
        description="Named sets of input/expected cases pinned to an agent. Runs record actual pass rates over time — no pass is claimed without a recorded score."
      >
        {canRun ? (
          <Link
            href="/app/evals/new"
            className="inline-flex h-10 items-center bg-ink px-4 text-[12px] font-medium tracking-[0.08em] text-paper uppercase transition-colors hover:bg-graphite"
          >
            New suite
          </Link>
        ) : null}
      </AppPageHeader>

      {!provider.configured ? (
        <div className="mb-6 border border-fog bg-haze px-4 py-3">
          <p className="text-[13px] text-slate">
            <span className="font-medium text-warn">No AI provider configured.</span> Suites and cases are
            fully editable, but a run cannot produce answers to score — it is recorded as{" "}
            <span className="text-ink">blocked</span> with the reason, never as zero passes.
          </p>
        </div>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState
          title="No evaluation suites yet"
          description="A suite pins an agent to a set of cases with a scorer (exact, contains, or LLM judge). Running it produces a real, recorded pass rate."
          action={canRun ? { href: "/app/evals/new", label: "Create the first suite" } : undefined}
        />
      ) : (
        <div className="border border-fog">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-fog text-[11px] tracking-[0.1em] text-mute uppercase">
                <th className="px-4 py-2.5 font-medium">Suite</th>
                <th className="px-4 py-2.5 font-medium">Agent</th>
                <th className="px-4 py-2.5 font-medium">Scorer</th>
                <th className="px-4 py-2.5 font-medium">Cases</th>
                <th className="px-4 py-2.5 font-medium">Latest run</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-fog last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/app/evals/${row.id}`} className="font-medium text-ink hover:underline">
                      {row.name}
                    </Link>
                    {row.description ? <p className="mt-0.5 text-[12px] text-slate">{row.description}</p> : null}
                  </td>
                  <td className="px-4 py-3 text-slate">
                    {row.agentId ? (agentNames.get(row.agentId) ?? "removed agent") : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate">{SCORER_LABELS[row.scorer] ?? row.scorer}</td>
                  <td className="tnum px-4 py-3 text-slate">{row.caseCount}</td>
                  <td className="px-4 py-3 text-slate">
                    {row.lastRun ? (
                      <span>
                        {row.lastRun.status === "blocked" ? (
                          <span className="text-warn">blocked</span>
                        ) : (
                          <span className="tnum text-ink">
                            {row.lastRun.passed}/{row.lastRun.total} passed
                          </span>
                        )}{" "}
                        · <span className="tnum text-mute">{formatDateTime(row.lastRun.startedAt)}</span>
                      </span>
                    ) : (
                      "never run"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
