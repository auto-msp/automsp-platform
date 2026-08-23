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
        className="inline-flex h-10 items-center border border-ink px-4 text-[12px] font-medium tracking-[0.08em] text-ink uppercase transition-colors hover:bg-ink hover:text-paper disabled:opacity-60"
      >
        {pending ? "Seeding…" : "Seed starter fleet"}
      </button>
      {state?.error ? (
        <p className="w-full border border-risk/30 bg-risk/5 px-4 py-3 text-sm text-risk" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="w-full border border-ok/30 bg-ok/5 px-4 py-3 text-sm text-ok" role="status">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
