"use client";

import { useActionState } from "react";
import { seedFleetAction, type SeedFleetState } from "./actions";

export function SeedFleetButton() {
  const [state, formAction, pending] = useActionState<SeedFleetState | null, FormData>(
    seedFleetAction,
    null,
  );

  return (
    <form action={formAction} className="contents">
      <button
        type="submit"
        disabled={pending}
        className="btn btn-secondary btn-sm"
      >
        {pending ? "Seeding…" : "Seed starter fleet"}
      </button>
      {state?.error ? (
        <p className="form-alert w-full" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="form-notice w-full" role="status">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
