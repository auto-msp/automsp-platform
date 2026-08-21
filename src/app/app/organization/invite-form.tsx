"use client";

import { useActionState } from "react";
import { inviteMemberAction, type OrgFormState } from "./actions";

const inputCls =
  "border border-fog bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-mute transition-colors focus:border-ink focus:outline-none";

export function InviteForm() {
  const [state, formAction, pending] = useActionState<OrgFormState | null, FormData>(
    inviteMemberAction,
    null,
  );

  return (
    <form action={formAction} className="flex flex-wrap items-start gap-3" noValidate>
      <div className="min-w-56 flex-1">
        <input
          type="email"
          name="email"
          required
          placeholder="colleague@yourcompany.com"
          className={`${inputCls} w-full`}
          aria-label="Email"
        />
        {state?.fieldErrors?.email?.[0] ? (
          <p className="mt-1.5 text-xs text-risk">{state.fieldErrors.email[0]}</p>
        ) : null}
      </div>
      <select name="role" defaultValue="customer_member" className={inputCls} aria-label="Role">
        <option value="customer_admin">Admin</option>
        <option value="customer_member">Member</option>
        <option value="customer_viewer">Viewer</option>
      </select>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-[42px] items-center bg-ink px-5 text-[13px] font-medium tracking-[0.08em] text-paper uppercase transition-colors hover:bg-graphite disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add member"}
      </button>
      {state?.error ? (
        <p className="w-full border border-risk/30 bg-risk/5 px-4 py-3 text-sm text-risk" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="w-full border border-ok/30 bg-ok/5 px-4 py-3 text-sm text-ok" role="status">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
