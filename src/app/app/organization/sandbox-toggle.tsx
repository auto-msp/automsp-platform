"use client";

import { useActionState } from "react";
import { toggleSandboxModeAction, type OrgFormState } from "./actions";
import { Notice } from "@/components/ui/notice";
import { ShieldCheck, ShieldOff } from "lucide-react";

export function SandboxToggle({ sandboxed }: { sandboxed: boolean }) {
  const [state, formAction, pending] = useActionState<OrgFormState | null, FormData>(
    toggleSandboxModeAction,
    null,
  );

  return (
    <div className="border border-fog bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <h2 className="flex items-center gap-2.5 text-[15px] leading-5 font-semibold text-ink">
            Sandbox mode
            <span
              className={
                sandboxed
                  ? "inline-flex items-center gap-1 rounded-(--radius-chip) bg-ok-soft px-2 py-0.5 text-xs font-semibold text-ok"
                  : "inline-flex items-center gap-1 rounded-(--radius-chip) bg-risk-soft px-2 py-0.5 text-xs font-semibold text-risk"
              }
            >
              {sandboxed ? <ShieldCheck aria-hidden className="size-3.5" strokeWidth={2} /> : <ShieldOff aria-hidden className="size-3.5" strokeWidth={2} />}
              {sandboxed ? "On" : "Off"}
            </span>
          </h2>
          <p className="mt-1.5 text-[13px] leading-relaxed text-slate">
            {sandboxed
              ? "Agents and automations run end-to-end, but every consequential action — publishing, sending, spending, deploying — pauses for a human decision. Nothing leaves the building."
              : "Consequential actions that you approve now dispatch to real external systems. You own everything that goes out under your name."}
          </p>
        </div>

        <form action={formAction}>
          <input type="hidden" name="enabled" value={sandboxed ? "off" : "on"} />
          <button
            type="submit"
            disabled={pending}
            className={
              sandboxed
                ? "btn btn-sm border-risk bg-transparent text-risk hover:bg-risk hover:text-surface"
                : "btn btn-secondary btn-sm"
            }
          >
            {pending ? "Saving…" : sandboxed ? "Take live" : "Re-enable sandbox"}
          </button>
        </form>
      </div>
      {state?.error ? (
        <Notice tone="risk" alert className="mt-3">
          {state.error}
        </Notice>
      ) : null}
      {state?.success ? (
        <p className="mt-3 border border-ok/30 bg-ok/5 px-4 py-3 text-sm text-ok" role="status">
          {state.success}
        </p>
      ) : null}
    </div>
  );
}
