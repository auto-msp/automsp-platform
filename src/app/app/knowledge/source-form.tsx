"use client";

import { useActionState } from "react";
import { createSourceAction, type KnowledgeFormState } from "./actions";

export function SourceForm() {
  const [state, formAction, pending] = useActionState<KnowledgeFormState | null, FormData>(
    createSourceAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-5 border border-fog bg-paper p-6">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink">Name</span>
        <input
          name="name"
          required
          maxLength={120}
          placeholder="e.g. Client handbook, SLA catalogue"
          className="w-full border border-fog bg-paper px-3 py-2 text-sm text-ink placeholder:text-mute focus:border-ink focus:outline-none"
        />
        {state?.fieldErrors?.name ? (
          <span className="mt-1 block text-[12px] text-risk">{state.fieldErrors.name.join(" ")}</span>
        ) : null}
      </label>

      {state?.error ? (
        <p className="border border-risk/30 bg-risk/5 px-4 py-3 text-[13px] text-risk" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 items-center bg-ink px-5 text-[12px] font-medium tracking-[0.08em] text-paper uppercase transition-colors hover:bg-graphite disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create source"}
      </button>
    </form>
  );
}
