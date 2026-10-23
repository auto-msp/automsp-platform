"use client";

import { useActionState, useState } from "react";
import { addCaseAction, deleteCaseAction, runSuiteAction, type EvalFormState } from "../actions";

const inputCls =
  "field";

export function CaseForm({ suiteId }: { suiteId: string }) {
  const bound = addCaseAction.bind(null, suiteId);
  const [state, formAction, pending] = useActionState<EvalFormState | null, FormData>(bound, null);

  return (
    <form action={formAction} className="space-y-4 border border-fog bg-paper p-6 rounded-lg">
      <h2 className="text-base font-medium text-ink">Add a case</h2>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink">Input</span>
        <textarea name="input" rows={2} required maxLength={8000} className={inputCls} />
        {state?.fieldErrors?.input ? (
          <span className="field-error block">{state.fieldErrors.input.join(" ")}</span>
        ) : null}
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink">Expected answer</span>
        <textarea name="expected" rows={2} required maxLength={8000} className={inputCls} />
        {state?.fieldErrors?.expected ? (
          <span className="field-error block">{state.fieldErrors.expected.join(" ")}</span>
        ) : null}
      </label>

      {state?.error ? (
        <p className="form-alert" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-secondary btn-sm"
        >
          {pending ? "Adding…" : "Add case"}
        </button>
        {state && !state.error ? <span className="text-xs text-ok">Added.</span> : null}
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
      className="btn btn-danger btn-sm shrink-0"
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
      className="btn btn-primary btn-sm"
    >
      {running ? "Running…" : "Run suite"}
    </button>
  );
}
