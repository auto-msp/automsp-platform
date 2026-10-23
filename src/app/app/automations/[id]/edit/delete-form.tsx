"use client";

import { useActionState } from "react";
import { deleteAutomationAction, type AutomationFormState } from "../../actions";
import { Notice } from "@/components/ui/notice";

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
        <Notice tone="risk" alert className="mb-3">
          {state.error}
        </Notice>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="btn border-risk bg-transparent text-risk hover:bg-risk hover:text-surface"
      >
        {pending ? "Deleting…" : "Delete automation"}
      </button>
    </form>
  );
}
