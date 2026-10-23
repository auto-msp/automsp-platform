"use client";

import { useActionState } from "react";
import { testRetrievalAction, type RetrievalTestState } from "../actions";

export function RetrievalTest({ sourceId }: { sourceId: string }) {
  const bound = testRetrievalAction.bind(null, sourceId);
  const [state, formAction, pending] = useActionState<RetrievalTestState | null, FormData>(bound, null);

  return (
    <div>
      <form action={formAction} className="space-y-3">
        <input
          name="query"
          required
          maxLength={2000}
          placeholder="Ask something the docs should answer…"
          className="field w-full"
        />
        <div className="flex items-center gap-2">
          <select
            name="topK"
            defaultValue="3"
            aria-label="Chunks to return"
            className="field"
          >
            {[1, 2, 3, 5, 8].map((k) => (
              <option key={k} value={k}>
                top {k}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={pending}
            className="btn btn-secondary btn-sm"
          >
            {pending ? "Searching…" : "Retrieve"}
          </button>
        </div>
      </form>

      {state?.error ? <p className="mt-3 text-xs text-risk">{state.error}</p> : null}

      {state?.method ? (
        <p className="mt-3 text-xs text-slate">
          Method: <span className="font-medium text-ink">{state.method}</span>
          {state.method === "lexical" ? " (term matching — semantic needs an embeddings provider)" : ""}
          {state.capped ? " — corpus capped for on-the-fly embedding (pgvector migration planned)" : ""}
        </p>
      ) : null}

      {state?.results ? (
        state.results.length === 0 ? (
          <p className="mt-3 text-[13px] text-slate">No chunks matched. Add documents or broaden the query.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {state.results.map((result, i) => (
              <li key={i} className="border-l-2 border-fog pl-3">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-medium text-ink">{result.documentName}</span>
                  <span className="tnum text-mute">score {result.score.toFixed(3)}</span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-slate">{result.preview}</p>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </div>
  );
}
