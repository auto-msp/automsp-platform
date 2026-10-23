"use client";

import { useActionState } from "react";
import { deleteSystemAction, type SystemFormState } from "../../actions";
import { Notice } from "@/components/ui/notice";

export function DeleteSystemForm({ systemId, systemName }: { systemId: string; systemName: string }) {
  const bound = deleteSystemAction.bind(null, systemId);
  const [state, formAction, pending] = useActionState<SystemFormState | null, FormData>(
    bound,
    null,
  );

  return (
    <form
      action={formAction}
      className="mt-4"
      onSubmit={(e) => {
        if (!window.confirm(`Delete "${systemName}"? This cannot be undone.`)) {
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
        {pending ? "Deleting…" : "Delete system"}
      </button>
    </form>
  );
}
