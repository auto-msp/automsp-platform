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
        <p className="form-alert mb-3" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="btn btn-danger"
      >
        {pending ? "Deleting…" : "Delete automation"}
      </button>
    </form>
  );
}
