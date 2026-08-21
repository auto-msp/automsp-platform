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
    <div className="flex flex-wrap items-center justify-end gap-3">
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Decision note (required to reject)"
        className="w-64 border border-fog bg-paper px-3 py-2 text-sm text-ink placeholder:text-mute focus:border-ink focus:outline-none"
      />
      <form action={approveAction}>
        <input type="hidden" name="note" value={note} />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center bg-ink px-4 text-[12px] font-medium tracking-[0.08em] text-paper uppercase transition-colors hover:bg-graphite disabled:cursor-not-allowed disabled:opacity-60"
        >
          {approvePending ? "Approving…" : "Approve"}
        </button>
      </form>
      <form action={rejectAction}>
        <input type="hidden" name="note" value={note} />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-9 items-center border border-risk px-4 text-[12px] font-medium tracking-[0.08em] text-risk uppercase transition-colors hover:bg-risk hover:text-paper disabled:cursor-not-allowed disabled:opacity-60"
        >
          {rejectPending ? "Rejecting…" : "Reject"}
        </button>
      </form>
      {approveState?.error || rejectState?.error ? (
        <p className="w-full text-right text-[13px] text-risk" role="alert">
          {approveState?.error ?? rejectState?.error}
        </p>
      ) : null}
    </div>
  );
}
