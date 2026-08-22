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
          className="w-full border border-fog bg-paper px-3 py-2 text-sm text-ink placeholder:text-mute focus:border-ink focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center border border-ink px-4 text-[12px] font-medium tracking-[0.08em] text-ink uppercase transition-colors hover:bg-ink hover:text-paper disabled:opacity-50"
        >
          {pending ? "Running…" : "Run"}
        </button>
      </form>

      {state?.notConfigured ? (
        <div className="mt-4 border border-warn/40 bg-warn/10 px-4 py-3">
          <p className="text-[13px] font-medium text-warn">AI provider not configured</p>
          <p className="mt-1 text-[13px] text-slate">{state.error}</p>
        </div>
      ) : state?.error ? (
        <div className="mt-4 border border-risk/30 bg-risk/5 px-4 py-3" role="alert">
          <p className="text-[13px] text-risk">{state.error}</p>
        </div>
      ) : null}

      {run ? (
        <div
          className={`mt-4 border px-4 py-3 ${
            run.status === "completed"
              ? "border-fog bg-haze"
              : run.status === "waiting_approval"
                ? "border-warn/40 bg-warn/10"
                : run.status === "failed" || run.status === "rejected"
                  ? "border-risk/30 bg-risk/5"
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
                  Decide in Approvals →
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
              <p className="mb-1.5 text-[11px] font-medium tracking-wide text-mute uppercase">
                Tool calls
              </p>
              <ul className="space-y-1.5">
                {run.invocations.map((inv, i) => (
                  <li key={i} className="text-[12px]">
                    <span className="font-medium text-ink">{inv.name}</span>
                    <span className={`ml-2 ${INV_CLS[inv.status] ?? "text-slate"}`}>
                      {inv.status.replace("_", " ")}
                    </span>
                    {inv.error ? <p className="mt-0.5 text-slate">{inv.error}</p> : null}
                    {inv.resultPreview ? (
                      <pre className="tnum mt-1 max-h-24 overflow-auto bg-paper p-2 text-[11px] text-graphite">
                        {inv.resultPreview}
                      </pre>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="tnum mt-3 border-t border-fog pt-2 text-[11px] text-slate">
            run {run.id} · {run.turns} turn{run.turns === 1 ? "" : "s"} · model calls recorded under
            Recent model runs (tokens actual, USD estimated)
          </p>
        </div>
      ) : null}
    </div>
  );
}
