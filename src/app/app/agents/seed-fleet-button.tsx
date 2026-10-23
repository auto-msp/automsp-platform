"use client";

import { useActionState } from "react";
import { seedFleetAction, type SeedFleetState } from "./actions";
import { Notice } from "@/components/ui/notice";

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
        className="btn btn-secondary"
      >
        {pending ? "Seeding…" : "Seed starter fleet"}
      </button>
      {state?.error ? (
        <Notice tone="risk" alert>
          {state.error}
        </Notice>
      ) : null}
      {state?.success ? (
        <p className="w-full border border-ok/30 bg-ok/5 px-4 py-3 text-sm text-ok" role="status">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
