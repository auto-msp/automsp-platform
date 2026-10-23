"use client";

import Link from "next/link";
import { useActionState } from "react";
import { runPlaygroundAction, type PlaygroundState } from "../actions";

const INV_CLS: Record<string, string> = {
  executed: "text-ok",
  denied_scope: "text-warn",
  failed: "text-risk",
  skipped: "text-mute",
};

export function Playground({ agentId }: { agentId: string }) {
  const bound = runPlaygroundAction.bind(null, agentId);
  const [state, formAction, pending] = useActionState<PlaygroundState | null, FormData>(bound, null);

  const run = state?.run;

  return (
    <div>
      <form action={formAction} className="space-y-3">
        <textarea
          name="prompt"
          rows={3}
          required
          maxLength={8000}
          placeholder="Write a prompt to test this agent's current version…"
          className="field w-full"
        />
        <button
          type="submit"
          disabled={pending}
          className="btn btn-secondary btn-sm"
        >
          {pending ? "Running…" : "Run"}
        </button>
      </form>

      {state?.notConfigured ? (
        <div className="mt-4 border border-warn bg-warn-soft px-4 py-3">
          <p className="text-[13px] font-medium text-warn">AI provider not configured</p>
          <p className="mt-1 text-[13px] text-slate">{state.error}</p>
        </div>
      ) : state?.error ? (
        <div className="form-alert mt-4" role="alert">
          <p className="text-[13px] text-risk">{state.error}</p>
        </div>
      ) : null}

      {run ? (
        <div
          className={`mt-4 rounded-lg border px-4 py-3 ${
            run.status === "completed"
              ? "border-fog bg-haze"
              : run.status === "waiting_approval"
                ? "border-warn bg-warn-soft"
                : run.status === "failed" || run.status === "rejected"
                  ? "border-risk bg-risk-soft"
                  : "border-fog bg-haze"
          }`}
        >
          {run.status === "waiting_approval" ? (
            <>
              <p className="text-[13px] font-medium text-warn">Paused — waiting on approval</p>
              <p className="mt-1 text-[13px] text-slate">
                The agent requested a consequential tool. A person must review the exact arguments
                before anything executes.{" "}
                <Link href="/app/approvals" className="underline underline-offset-2">
                  Decide in Approvals
                </Link>
              </p>
            </>
          ) : run.status === "rejected" ? (
            <>
              <p className="text-[13px] font-medium text-risk">Tool call rejected</p>
              <p className="mt-1 text-[13px] text-slate">{run.error}</p>
            </>
          ) : run.status === "failed" ? (
            <>
              <p className="text-[13px] font-medium text-risk">Run failed</p>
              <p className="mt-1 text-[13px] text-slate">{run.error}</p>
            </>
          ) : (
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-ink">
              {run.finalText ?? "(no text)"}
            </p>
          )}

          {run.invocations.length > 0 ? (
            <div className="mt-3 border-t border-fog pt-2">
              <p className="mb-1.5 text-xs font-medium tracking-wide text-mute">
                Tool calls
              </p>
              <ul className="space-y-1.5">
                {run.invocations.map((inv, i) => (
                  <li key={i} className="text-xs">
                    <span className="font-medium text-ink">{inv.name}</span>
                    <span className={`ml-2 ${INV_CLS[inv.status] ?? "text-slate"}`}>
                      {inv.status.replace("_", " ")}
                    </span>
                    {inv.error ? <p className="mt-0.5 text-slate">{inv.error}</p> : null}
                    {inv.resultPreview ? (
                      <pre className="tnum mt-1 max-h-24 overflow-auto bg-paper p-2 text-xs text-graphite">
                        {inv.resultPreview}
                      </pre>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="tnum mt-3 border-t border-fog pt-2 text-xs text-slate">
            run {run.id} · {run.turns} turn{run.turns === 1 ? "" : "s"} · model calls recorded under
            Recent model runs (tokens actual, USD estimated)
          </p>
        </div>
      ) : null}
    </div>
  );
}
