"use client";

import { deleteDocumentAction } from "../actions";

export function DeleteDocumentButton({
  sourceId,
  documentId,
  name,
}: {
  sourceId: string;
  documentId: string;
  name: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (window.confirm(`Delete "${name}" and its chunks? This cannot be undone.`)) {
          void deleteDocumentAction(sourceId, documentId);
        }
      }}
      className="inline-flex min-h-11 items-center text-xs font-medium text-risk hover:underline"
    >
      Delete
    </button>
  );
}
