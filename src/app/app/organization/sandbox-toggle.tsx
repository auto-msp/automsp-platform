"use client";

import { useActionState } from "react";
import { toggleSandboxModeAction, type OrgFormState } from "./actions";

export function SandboxToggle({ sandboxed }: { sandboxed: boolean }) {
  const [state, formAction, pending] = useActionState<OrgFormState | null, FormData>(
    toggleSandboxModeAction,
    null,
  );

  return (
    <div className="card card-pad">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <h2 className="flex items-center gap-2.5 text-sm font-semibold text-ink">
            Sandbox mode
            <span
              className={
                sandboxed
                  ? "rounded-sm bg-ok-soft px-2 py-0.5 text-xs font-semibold text-ok"
                  : "rounded-sm bg-risk-soft px-2 py-0.5 text-xs font-semibold text-risk"
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
                : "btn btn-danger btn-sm"
            }
          >
            {pending ? "Saving…" : sandboxed ? "Take live" : "Re-enable sandbox"}
          </button>
        </form>
      </div>
      {state?.error ? (
        <p className="form-alert mt-3" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="form-notice mt-3" role="status">
          {state.success}
        </p>
      ) : null}
    </div>
  );
}
