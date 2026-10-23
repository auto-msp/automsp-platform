"use client";

import { useActionState } from "react";
import { inviteMemberAction, type OrgFormState } from "./actions";
import { Notice } from "@/components/ui/notice";

const inputCls =
  "field";

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
          <p className="field-error">{state.fieldErrors.email[0]}</p>
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
        className="btn btn-primary"
      >
        {pending ? "Adding…" : "Add member"}
      </button>
      {state?.error ? (
        <Notice tone="risk" alert>
          {state.error}
        </Notice>
      ) : null}
      {state?.success ? (
        <p className="w-full border border-ok/30 bg-ok/5 px-4 py-3 text-sm text-ok" role="status">
          {state.success}
        </p>
      ) : null}
    </form>
  );
}
