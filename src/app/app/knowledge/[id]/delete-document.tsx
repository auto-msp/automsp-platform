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
      className="btn btn-danger btn-sm"
    >
      Delete
    </button>
  );
}
