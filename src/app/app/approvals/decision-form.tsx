"use client";

import { useState, useActionState } from "react";
import { decideApprovalAction, type ApprovalFormState } from "./actions";

export function DecisionButtons({ approvalId }: { approvalId: string }) {
  const approve = decideApprovalAction.bind(null, approvalId, "approved");
  const reject = decideApprovalAction.bind(null, approvalId, "rejected");
  const [approveState, approveAction, approvePending] = useActionState<
    ApprovalFormState | null,
    FormData
  >(approve, null);
  const [rejectState, rejectAction, rejectPending] = useActionState<
    ApprovalFormState | null,
    FormData
  >(reject, null);
  const [note, setNote] = useState("");

  const pending = approvePending || rejectPending;

  return (
    <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:gap-3">
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Decision note (required to reject)"
        className="field w-full sm:w-64"
      />
      <form action={approveAction}>
        <input type="hidden" name="note" value={note} />
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary btn-sm"
        >
          {approvePending ? "Approving…" : "Approve"}
        </button>
      </form>
      <form action={rejectAction}>
        <input type="hidden" name="note" value={note} />
        <button
          type="submit"
          disabled={pending}
          className="btn btn-sm border-risk bg-transparent text-risk hover:bg-risk hover:text-surface"
        >
          {rejectPending ? "Rejecting…" : "Reject"}
        </button>
      </form>
      {approveState?.error || rejectState?.error ? (
        <p className="field-error w-full sm:justify-end" role="alert">
          {approveState?.error ?? rejectState?.error}
        </p>
      ) : null}
    </div>
  );
}
