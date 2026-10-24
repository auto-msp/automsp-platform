"use client";

import { useActionState } from "react";
import { deleteSystemAction, type SystemFormState } from "../../actions";

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
        <p className="form-alert mb-3" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="btn btn-danger"
      >
        {pending ? "Deleting…" : "Delete system"}
      </button>
    </form>
  );
}
