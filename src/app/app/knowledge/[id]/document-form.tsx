"use client";

import { useActionState } from "react";
import { addDocumentAction, type KnowledgeFormState } from "../actions";

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
          className="w-full border border-fog bg-paper px-3 py-2 text-sm text-ink placeholder:text-mute focus:border-ink focus:outline-none"
        />
        {state?.fieldErrors?.filename ? (
          <span className="mt-1 block text-[12px] text-risk">{state.fieldErrors.filename.join(" ")}</span>
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
          className="w-full border border-fog bg-paper px-3 py-2 text-sm text-ink placeholder:text-mute focus:border-ink focus:outline-none font-mono text-[13px]"
        />
        {state?.fieldErrors?.content ? (
          <span className="mt-1 block text-[12px] text-risk">{state.fieldErrors.content.join(" ")}</span>
        ) : null}
        <span className="mt-1 block text-[11px] text-mute">
          Chunked immediately (~900 characters, paragraph-aware). Stored in the platform database — object
          storage is a later slice.
        </span>
      </label>

      {state?.error ? (
        <p className="border border-risk/30 bg-risk/5 px-4 py-3 text-[13px] text-risk" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center bg-ink px-5 text-[12px] font-medium tracking-[0.08em] text-paper uppercase transition-colors hover:bg-graphite disabled:opacity-50"
        >
          {pending ? "Chunking…" : "Add document"}
        </button>
        {state && !state.error ? <span className="text-[12px] text-ok">Added and indexed.</span> : null}
      </div>
    </form>
  );
}
