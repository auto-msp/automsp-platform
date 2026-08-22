"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { AuditStatus, OpportunityStage } from "@/server/db/types";
import { updateAuditStatusAction, updateOpportunityStageAction } from "./actions";

const SELECT =
  "border border-fog bg-paper px-2 py-1 text-[12px] text-ink focus:border-ink focus:outline-none disabled:opacity-60";

/** Stage picker that persists immediately on change. */
export function StagePicker({
  opportunityId,
  stage,
  options,
}: {
  opportunityId: string;
  stage: OpportunityStage;
  options: { key: OpportunityStage; label: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-col gap-1">
      <select
        aria-label="Stage"
        className={SELECT}
        defaultValue={stage}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as OpportunityStage;
          setError(null);
          startTransition(async () => {
            try {
              await updateOpportunityStageAction(opportunityId, next);
            } catch {
              setError("Not permitted.");
            }
          });
        }}
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-[11px] text-risk">{error}</span> : null}
    </span>
  );
}

/** Status picker for the audits inbox; persists on change. */
export function AuditStatusPicker({
  auditId,
  status,
  options,
}: {
  auditId: string;
  status: AuditStatus;
  options: { key: AuditStatus; label: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <span className="inline-flex flex-col gap-1">
      <select
        aria-label="Status"
        className={SELECT}
        defaultValue={status}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as AuditStatus;
          setError(null);
          startTransition(async () => {
            try {
              await updateAuditStatusAction(auditId, next);
            } catch {
              setError("Not permitted.");
            }
          });
        }}
      >
        {options.map((o) => (
          <option key={o.key} value={o.key}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? <span className="text-[11px] text-risk">{error}</span> : null}
    </span>
  );
}

/** Expand/collapse for the long free-text answers on an audit request. */
export function ExpandableText({ text, limit = 140 }: { text: string; limit?: number }) {
  const [open, setOpen] = useState(false);
  if (text.length <= limit) return <span>{text}</span>;
  return (
    <span>
      {open ? text : `${text.slice(0, limit)}…`}{" "}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="font-medium text-accent hover:text-ink"
      >
        {open ? "less" : "more"}
      </button>
    </span>
  );
}

/**
 * The marketing funnel is public, so new audit requests can arrive while this
 * page is open. Poll-based refresh (30 s) — not simulated realtime.
 */
export function InboxAutoRefresh() {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => router.refresh(), 30_000);
    return () => clearInterval(t);
  }, [router]);
  return null;
}
