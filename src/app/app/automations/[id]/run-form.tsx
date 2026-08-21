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
      <div className="border border-fog bg-haze p-5">
        <h2 className="text-sm font-semibold text-ink">Run manually</h2>
        <p className="mt-2 text-[13px] text-slate">Your role cannot start runs.</p>
      </div>
    );
  }

  if (status === "archived") {
    return (
      <div className="border border-fog bg-haze p-5">
        <h2 className="text-sm font-semibold text-ink">Run manually</h2>
        <p className="mt-2 text-[13px] text-slate">This automation is archived.</p>
      </div>
    );
  }

  return (
    <div className="border border-fog bg-surface p-5">
      <h2 className="text-sm font-semibold text-ink">Run manually</h2>
      <p className="mt-1.5 text-[13px] text-slate">
        Provide test input as a JSON object. Scheduled triggers are not configured in this
        environment.
      </p>
      <form action={formAction} className="mt-4 space-y-4" noValidate>
        <div>
          <label htmlFor="input" className="mb-2 block text-[13px] font-medium text-graphite">
            Input (JSON)
          </label>
          <textarea
            id="input"
            name="input"
            rows={4}
            spellCheck={false}
            placeholder='{ "invoiceId": "INV-1042", "amount": 12500 }'
            className="w-full border border-fog bg-paper px-4 py-3 font-mono text-[13px] text-ink placeholder:text-mute focus:border-ink focus:outline-none"
          />
          {state?.fieldErrors?.input?.[0] ? (
            <p className="mt-1.5 text-xs text-risk">{state.fieldErrors.input[0]}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="idempotencyKey" className="mb-2 block text-[13px] font-medium text-graphite">
            Idempotency key <span className="font-normal text-mute">(optional)</span>
          </label>
          <input
            id="idempotencyKey"
            name="idempotencyKey"
            placeholder='e.g. "inv-1042-run-1"'
            className="w-full border border-fog bg-paper px-4 py-3 text-sm text-ink placeholder:text-mute focus:border-ink focus:outline-none"
          />
          <p className="mt-1.5 text-xs text-mute">
            Repeating a key returns the original run instead of starting a duplicate.
          </p>
        </div>

        {state?.error ? (
          <p className="border border-risk/30 bg-risk/5 px-4 py-3 text-sm text-risk" role="alert">
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 w-full items-center justify-center bg-ink text-[13px] font-medium tracking-[0.08em] text-paper uppercase transition-colors hover:bg-graphite disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Running…" : "Run automation"}
        </button>
      </form>
    </div>
  );
}
