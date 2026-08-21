"use client";

import { useActionState } from "react";
import { deleteAutomationAction, type AutomationFormState } from "../../actions";

export function DeleteAutomationForm({
  automationId,
  automationName,
}: {
  automationId: string;
  automationName: string;
}) {
  const bound = deleteAutomationAction.bind(null, automationId);
  const [state, formAction, pending] = useActionState<AutomationFormState | null, FormData>(
    bound,
    null,
  );

  return (
    <form
      action={formAction}
      className="mt-4"
      onSubmit={(e) => {
        if (!window.confirm(`Delete "${automationName}"? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      {state?.error ? (
        <p className="mb-3 border border-risk/30 bg-risk/5 px-4 py-3 text-sm text-risk" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center border border-risk px-4 text-[13px] font-medium text-risk transition-colors hover:bg-risk hover:text-paper disabled:opacity-60"
      >
        {pending ? "Deleting…" : "Delete automation"}
      </button>
    </form>
  );
}
