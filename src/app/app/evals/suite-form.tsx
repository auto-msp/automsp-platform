"use client";

import { useActionState } from "react";
import { createSuiteAction, type EvalFormState } from "./actions";

const inputCls =
  "field";

export function SuiteForm({ agents }: { agents: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState<EvalFormState | null, FormData>(
    createSuiteAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-5 border border-fog bg-paper p-6 rounded-lg">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink">Name</span>
        <input name="name" required maxLength={120} className={inputCls} />
        {state?.fieldErrors?.name ? (
          <span className="field-error block">{state.fieldErrors.name.join(" ")}</span>
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
          <span className="field-error block">{state.fieldErrors.agentId.join(" ")}</span>
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
        <p className="form-alert" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary btn-sm"
      >
        {pending ? "Creating…" : "Create suite"}
      </button>
    </form>
  );
}
