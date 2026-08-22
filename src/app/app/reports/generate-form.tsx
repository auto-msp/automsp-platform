"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { generateReportAction, type GenerateReportState } from "./actions";

const TYPES: { value: string; label: string; blurb: string }[] = [
  { value: "weekly_ops", label: "Weekly operations", blurb: "Runs, success, approvals, incidents — last 7 days" },
  { value: "monthly_impact", label: "Monthly impact", blurb: "Time avoided, labor value, AI cost, ROI — last 30 days" },
  { value: "ai_cost", label: "AI cost", blurb: "Model calls, tokens, estimated spend — last 30 days" },
  { value: "automation_performance", label: "Automation performance", blurb: "Per-automation reliability and volume" },
  { value: "system_health", label: "System health", blurb: "Operational posture and open work" },
  { value: "incident", label: "Incident review", blurb: "Incidents, resolution time, contributing failures" },
];

export function GenerateReportForm({ canGenerate }: { canGenerate: boolean }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<GenerateReportState | null, FormData>(
    generateReportAction,
    null,
  );

  useEffect(() => {
    if (state?.reportId) router.push(`/app/reports/${state.reportId}`);
  }, [state?.reportId, router]);

  if (!canGenerate) return null;

  return (
    <div className="border border-fog bg-surface p-5">
      <h2 className="text-sm font-semibold text-ink">Generate a report</h2>
      <p className="mt-1 text-[13px] text-slate">
        Snapshots your current operational data into a shareable document. Every derived number
        carries its basis and calculation method.
      </p>
      <form action={formAction} className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="submit"
            name="type"
            value={t.value}
            disabled={pending}
            className="border border-fog p-3 text-left transition-colors hover:border-ink disabled:opacity-50"
          >
            <p className="text-[13px] font-medium text-ink">{t.label}</p>
            <p className="mt-0.5 text-[12px] leading-snug text-mute">{t.blurb}</p>
          </button>
        ))}
      </form>
      {state?.error ? <p className="mt-3 text-[13px] text-risk">{state.error}</p> : null}
      {pending ? <p className="mt-3 text-[13px] text-slate">Generating…</p> : null}
    </div>
  );
}
