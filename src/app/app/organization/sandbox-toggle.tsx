"use client";

import { useActionState } from "react";
import { toggleSandboxModeAction, type OrgFormState } from "./actions";
import { Notice } from "@/components/ui/notice";

export function SandboxToggle({ sandboxed }: { sandboxed: boolean }) {
  const [state, formAction, pending] = useActionState<OrgFormState | null, FormData>(
    toggleSandboxModeAction,
    null,
  );

  return (
    <div className="border border-fog bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <h2 className="flex items-center gap-2.5 text-sm font-semibold text-ink">
            Sandbox mode
            <span
              className={
                sandboxed
                  ? "border border-ok/40 bg-ok/10 px-2 py-0.5 text-xs font-medium text-ok"
                  : "border border-risk/40 bg-risk/10 px-2 py-0.5 text-xs font-medium text-risk"
              }
            >
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
                ? "btn btn-primary btn-sm"
                : "inline-flex h-9 items-center border border-risk px-4 text-xs font-medium text-risk transition-colors hover:bg-risk hover:text-paper disabled:opacity-60"
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
