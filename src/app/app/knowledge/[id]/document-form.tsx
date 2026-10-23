"use client";

import { useActionState } from "react";
import { addDocumentAction, type KnowledgeFormState } from "../actions";
import { Notice } from "@/components/ui/notice";

export function DocumentForm({ sourceId }: { sourceId: string }) {
  const bound = addDocumentAction.bind(null, sourceId);
  const [state, formAction, pending] = useActionState<KnowledgeFormState | null, FormData>(bound, null);

  return (
    <form action={formAction} className="space-y-4 border border-fog bg-paper p-6">
      <h2 className="text-base font-medium text-ink">Add a document</h2>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink">Filename</span>
        <input
          name="filename"
          required
          maxLength={200}
          placeholder="handbook-2026.md"
          className="field w-full"
        />
        {state?.fieldErrors?.filename ? (
          <span className="field-error">{state.fieldErrors.filename.join(" ")}</span>
        ) : null}
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-ink">Content (text or markdown)</span>
        <textarea
          name="content"
          rows={7}
          required
          maxLength={200000}
          placeholder="Paste the document body…"
          className="field w-full font-mono"
        />
        {state?.fieldErrors?.content ? (
          <span className="field-error">{state.fieldErrors.content.join(" ")}</span>
        ) : null}
        <span className="mt-1 block text-xs text-mute">
          Chunked immediately (~900 characters, paragraph-aware). Stored in the platform database — object
          storage is a later slice.
        </span>
      </label>

      {state?.error ? (
        <Notice tone="risk" alert>
          {state.error}
        </Notice>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary"
        >
          {pending ? "Chunking…" : "Add document"}
        </button>
        {state && !state.error ? <span className="text-xs text-ok">Added and indexed.</span> : null}
      </div>
    </form>
  );
}
