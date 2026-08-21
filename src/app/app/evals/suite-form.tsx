"use client";

import { useActionState } from "react";
import { createSuiteAction, type EvalFormState } from "./actions";

const inputCls =
  "w-full border border-fog bg-paper px-3 py-2 text-sm text-ink placeholder:text-mute focus:border-ink focus:outline-none";

export function SuiteForm({ agents }: { agents: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState<EvalFormState | null, FormData>(
    createSuiteAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-5 border border-fog bg-paper p-6">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink">Name</span>
        <input name="name" required maxLength={120} className={inputCls} />
        {state?.fieldErrors?.name ? (
          <span className="mt-1 block text-[12px] text-risk">{state.fieldErrors.name.join(" ")}</span>
        ) : null}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink">Agent under test</span>
        <select name="agentId" className={inputCls} defaultValue="">
          <option value="">No agent — bare prompt (provider default model)</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
        {state?.fieldErrors?.agentId ? (
          <span className="mt-1 block text-[12px] text-risk">{state.fieldErrors.agentId.join(" ")}</span>
        ) : null}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink">Scorer</span>
        <select name="scorer" className={inputCls} defaultValue="exact">
          <option value="exact">exact — normalized string equality</option>
          <option value="contains">contains — expected text present in the answer</option>
          <option value="llm_judge">LLM judge — a model grades; an opinion, not ground truth</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink">Description (internal)</span>
        <textarea name="description" rows={2} maxLength={1000} className={inputCls} />
      </label>

      {state?.error ? (
        <p className="border border-risk/30 bg-risk/5 px-4 py-3 text-[13px] text-risk" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center bg-ink px-5 text-[12px] font-medium tracking-[0.08em] text-paper uppercase transition-colors hover:bg-graphite disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create suite"}
      </button>
    </form>
  );
}
