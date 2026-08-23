"use client";

import { useActionState } from "react";
import { toggleSandboxModeAction, type OrgFormState } from "./actions";

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
                  ? "border border-ok/40 bg-ok/10 px-2 py-0.5 text-[11px] font-medium tracking-[0.08em] text-ok uppercase"
                  : "border border-risk/40 bg-risk/10 px-2 py-0.5 text-[11px] font-medium tracking-[0.08em] text-risk uppercase"
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
                ? "inline-flex h-9 items-center bg-ink px-4 text-[12px] font-medium tracking-[0.08em] text-paper uppercase transition-colors hover:bg-graphite disabled:opacity-60"
                : "inline-flex h-9 items-center border border-risk px-4 text-[12px] font-medium tracking-[0.08em] text-risk uppercase transition-colors hover:bg-risk hover:text-paper disabled:opacity-60"
            }
          >
            {pending ? "Saving…" : sandboxed ? "Take live" : "Re-enable sandbox"}
          </button>
        </form>
      </div>
      {state?.error ? (
        <p className="mt-3 border border-risk/30 bg-risk/5 px-4 py-3 text-sm text-risk" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="mt-3 border border-ok/30 bg-ok/5 px-4 py-3 text-sm text-ok" role="status">
          {state.success}
        </p>
      ) : null}
    </div>
  );
}
