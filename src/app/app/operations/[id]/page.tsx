import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppPageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";
import { formatDateTime } from "@/lib/format";
import { getSessionContext } from "@/server/auth/session";
import { store } from "@/server/db/store";
import { Notice } from "@/components/ui/notice";

export const metadata: Metadata = { title: "Execution" };

export const dynamic = "force-dynamic";

export default async function ExecutionInspectorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await getSessionContext();
  if (!ctx) return null;
  const orgId = ctx.organization.id;

  const { id } = await params;
  const execution = await store.get("executions", id);
  if (!execution || execution.organizationId !== orgId) notFound();

  const [steps, logs, approvals, automation] = await Promise.all([
    store.query("execution_steps", { executionId: id }),
    store.query("execution_logs", { executionId: id }),
    store.query("approvals", { organizationId: orgId, executionId: id }),
    store.get("automations", execution.automationId),
  ]);

  const sortedSteps = steps.sort((a, b) => Date.parse(a.startedAt) - Date.parse(b.startedAt));
  const sortedLogs = logs.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
  const pendingApproval = approvals.find((a) => a.status === "pending");

  return (
    <div>
      <AppPageHeader back={{ href: "/app/operations", label: "Operations" }}
        title={`Execution ${execution.id.slice(0, 8)}…`}
        description={`${execution.automationName} · v${execution.version} · started ${formatDateTime(execution.startedAt)}`}
      >
        <StatusPill status={execution.status} />
        {automation ? (
          <Link
            href={`/app/automations/${automation.id}`}
            className="btn btn-quiet"
          >
            Open automation
          </Link>
        ) : null}
      </AppPageHeader>

      {execution.error ? (
        <Notice tone="risk" className="mb-6">
          {execution.error}
        </Notice>
      ) : null}

      {pendingApproval ? (
        <Notice tone="warn" className="mb-6">
          <p className="font-semibold text-ink">
            Waiting on approval — {pendingApproval.action}
          </p>
          <p className="mt-1 text-[13px] text-slate">{pendingApproval.rationale}</p>
          <Link
            href="/app/approvals"
            className="btn btn-secondary btn-sm mt-3"
          >
            Decide in Approvals
          </Link>
        </Notice>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-[15px] leading-5 font-semibold text-ink">Steps</h2>
          <ol className="space-y-2">
            {sortedSteps.map((step) => (
              <li key={step.id} className="border border-fog bg-surface px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-ink">{step.nodeKey}</span>
                  <StatusPill status={step.status} />
                </div>
                {step.error ? <p className="mt-1.5 text-[13px] text-risk">{step.error}</p> : null}
                {step.output !== undefined ? (
                  <pre className="tnum mt-2 max-h-36 overflow-auto bg-haze p-3 text-xs leading-relaxed text-graphite">
                    {JSON.stringify(step.output, null, 2)}
                  </pre>
                ) : null}
                {step.finishedAt ? (
                  <p className="tnum mt-1.5 text-xs text-mute">
                    {formatDateTime(step.startedAt)} → {formatDateTime(step.finishedAt)}
                  </p>
                ) : null}
              </li>
            ))}
          </ol>

          <h2 className="mt-6 mb-3 text-[15px] leading-5 font-semibold text-ink">Input</h2>
          <pre className="tnum overflow-auto border border-fog bg-surface p-4 text-xs leading-relaxed text-graphite">
            {JSON.stringify(execution.input, null, 2)}
          </pre>

          {execution.output !== undefined ? (
            <>
              <h2 className="mt-6 mb-3 text-[15px] leading-5 font-semibold text-ink">Output</h2>
              <pre className="tnum overflow-auto border border-fog bg-surface p-4 text-xs leading-relaxed text-graphite">
                {JSON.stringify(execution.output, null, 2)}
              </pre>
            </>
          ) : null}
        </div>

        <div>
          <h2 className="mb-3 text-[15px] leading-5 font-semibold text-ink">Run log</h2>
          <div className="border border-fog bg-night p-4">
            {sortedLogs.length === 0 ? (
              <p className="text-[13px] text-trail">No log lines.</p>
            ) : (
              <ul className="space-y-1.5 font-mono text-xs leading-relaxed">
                {sortedLogs.map((logLine) => (
                  <li key={logLine.id} className="flex gap-3">
                    <span className="tnum shrink-0 text-trail">{formatDateTime(logLine.createdAt)}</span>
                    <span
                      className={`shrink-0 uppercase ${
                        logLine.level === "error"
                          ? "text-risk"
                          : logLine.level === "warn"
                            ? "text-[#e8b04b]"
                            : "text-[#7d86a8]"
                      }`}
                    >
                      {logLine.level}
                    </span>
                    <span className="break-words text-[#c9cede]">{logLine.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <p className="mt-2 text-xs text-mute">
            Log lines record run events only. Credentials and secrets are never logged.
          </p>
        </div>
      </div>
    </div>
  );
}
