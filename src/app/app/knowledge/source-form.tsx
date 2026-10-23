"use client";

import { useActionState } from "react";
import { createSourceAction, type KnowledgeFormState } from "./actions";
import { Notice } from "@/components/ui/notice";

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
          className="field w-full"
        />
        {state?.fieldErrors?.name ? (
          <span className="field-error">{state.fieldErrors.name.join(" ")}</span>
        ) : null}
      </label>

      {state?.error ? (
        <Notice tone="risk" alert>
          {state.error}
        </Notice>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary"
      >
        {pending ? "Creating…" : "Create source"}
      </button>
    </form>
  );
}
