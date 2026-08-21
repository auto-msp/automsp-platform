"use client";

import { useActionState } from "react";
import { runPlaygroundAction, type PlaygroundState } from "../actions";

export function Playground({ agentId }: { agentId: string }) {
  const bound = runPlaygroundAction.bind(null, agentId);
  const [state, formAction, pending] = useActionState<PlaygroundState | null, FormData>(bound, null);

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

      {state?.result ? (
        <div className="mt-4 border border-fog bg-haze px-4 py-3">
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-ink">{state.result.text}</p>
          <p className="tnum mt-3 border-t border-fog pt-2 text-[11px] text-slate">
            {state.result.model} · {state.result.promptTokens}+{state.result.completionTokens} tokens ·{" "}
            {state.result.costEstimatedUsd !== null
              ? `$${state.result.costEstimatedUsd.toFixed(5)} (Estimated — list price)`
              : "cost not computable (unknown model)"}{" "}
            · {state.result.latencyMs}ms
            {state.result.retrieval
              ? ` · retrieval: ${state.result.retrieval.method} (${state.result.retrieval.chunks} chunks)`
              : ""}
          </p>
        </div>
      ) : null}
    </div>
  );
}
