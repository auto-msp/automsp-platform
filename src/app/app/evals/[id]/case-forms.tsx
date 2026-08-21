"use client";

import { useActionState, useState } from "react";
import { addCaseAction, deleteCaseAction, runSuiteAction, type EvalFormState } from "../actions";

const inputCls =
  "w-full border border-fog bg-paper px-3 py-2 text-sm text-ink placeholder:text-mute focus:border-ink focus:outline-none";

export function CaseForm({ suiteId }: { suiteId: string }) {
  const bound = addCaseAction.bind(null, suiteId);
  const [state, formAction, pending] = useActionState<EvalFormState | null, FormData>(bound, null);

  return (
    <form action={formAction} className="space-y-4 border border-fog bg-paper p-6">
      <h2 className="text-base font-medium text-ink">Add a case</h2>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink">Input</span>
        <textarea name="input" rows={2} required maxLength={8000} className={inputCls} />
        {state?.fieldErrors?.input ? (
          <span className="mt-1 block text-[12px] text-risk">{state.fieldErrors.input.join(" ")}</span>
        ) : null}
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink">Expected answer</span>
        <textarea name="expected" rows={2} required maxLength={8000} className={inputCls} />
        {state?.fieldErrors?.expected ? (
          <span className="mt-1 block text-[12px] text-risk">{state.fieldErrors.expected.join(" ")}</span>
        ) : null}
      </label>

      {state?.error ? (
        <p className="border border-risk/30 bg-risk/5 px-4 py-3 text-[13px] text-risk" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center border border-ink px-4 text-[12px] font-medium tracking-[0.08em] text-ink uppercase transition-colors hover:bg-ink hover:text-paper disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add case"}
        </button>
        {state && !state.error ? <span className="text-[12px] text-ok">Added.</span> : null}
      </div>
    </form>
  );
}

export function DeleteCaseButton({ suiteId, caseId }: { suiteId: string; caseId: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (window.confirm("Delete this case?")) void deleteCaseAction(suiteId, caseId);
      }}
      className="shrink-0 text-[12px] font-medium tracking-[0.06em] text-risk uppercase hover:underline"
    >
      Delete
    </button>
  );
}

export function RunButton({ suiteId, disabled }: { suiteId: string; disabled: boolean }) {
  const [running, setRunning] = useState(false);
  return (
    <button
      type="button"
      disabled={disabled || running}
      title={disabled ? "Configure an AI provider to enable runs" : undefined}
      onClick={async () => {
        setRunning(true);
        try {
          await runSuiteAction(suiteId);
        } finally {
          setRunning(false);
        }
      }}
      className="inline-flex h-10 items-center bg-ink px-4 text-[12px] font-medium tracking-[0.08em] text-paper uppercase transition-colors hover:bg-graphite disabled:opacity-50"
    >
      {running ? "Running…" : "Run suite"}
    </button>
  );
}
