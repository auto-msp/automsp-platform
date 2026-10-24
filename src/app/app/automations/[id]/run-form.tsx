"use client";

import { useActionState } from "react";
import { runAutomationAction, type AutomationFormState } from "../actions";

export function RunForm({
  automationId,
  canRun,
  status,
}: {
  automationId: string;
  canRun: boolean;
  status: string;
}) {
  const bound = runAutomationAction.bind(null, automationId);
  const [state, formAction, pending] = useActionState<AutomationFormState | null, FormData>(
    bound,
    null,
  );

  if (!canRun) {
    return (
      <div className="border border-fog bg-haze p-5 rounded-lg">
        <h2 className="text-sm font-semibold text-ink">Run manually</h2>
        <p className="mt-2 text-[13px] text-slate">Your role cannot start runs.</p>
      </div>
    );
  }

  if (status === "archived") {
    return (
      <div className="border border-fog bg-haze p-5 rounded-lg">
        <h2 className="text-sm font-semibold text-ink">Run manually</h2>
        <p className="mt-2 text-[13px] text-slate">This automation is archived.</p>
      </div>
    );
  }

  return (
    <div className="card card-pad">
      <h2 className="text-sm font-semibold text-ink">Run manually</h2>
      <p className="mt-1.5 text-[13px] text-slate">
        Provide test input as a JSON object. Scheduled triggers are not configured in this
        environment.
      </p>
      <form action={formAction} className="mt-4 space-y-4" noValidate>
        <div>
          <label htmlFor="input" className="label block">
            Input (JSON)
          </label>
          <textarea
            id="input"
            name="input"
            rows={4}
            spellCheck={false}
            placeholder='{ "invoiceId": "INV-1042", "amount": 12500 }'
            className="field w-full font-mono"
          />
          {state?.fieldErrors?.input?.[0] ? (
            <p className="field-error">{state.fieldErrors.input[0]}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="idempotencyKey" className="label block">
            Idempotency key <span className="font-normal text-mute">(optional)</span>
          </label>
          <input
            id="idempotencyKey"
            name="idempotencyKey"
            placeholder='e.g. "inv-1042-run-1"'
            className="field w-full"
          />
          <p className="hint">
            Repeating a key returns the original run instead of starting a duplicate.
          </p>
        </div>

        {state?.error ? (
          <p className="form-alert" role="alert">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary w-full"
        >
          {pending ? "Running…" : "Run automation"}
        </button>
      </form>
    </div>
  );
}
