"use client";

import { useActionState } from "react";
import { revokeIntegrationAction, type IntegrationFormState } from "./actions";

export function RevokeButton({ integrationId, name }: { integrationId: string; name: string }) {
  const bound = revokeIntegrationAction.bind(null, integrationId);
  const [state, formAction, pending] = useActionState<IntegrationFormState | null, FormData>(
    bound,
    null,
  );

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (
          !window.confirm(
            `Revoke "${name}"? Sealed credential material is destroyed; workflow steps using it will fail until replaced.`,
          )
        ) {
          e.preventDefault();
        }
      }}
      className="inline"
    >
      <button
        type="submit"
        disabled={pending}
        className="text-[13px] text-risk underline-offset-2 hover:underline disabled:opacity-50"
      >
        {pending ? "Revoking…" : "Revoke"}
      </button>
      {state?.error ? <span className="ml-2 text-[12px] text-risk">{state.error}</span> : null}
    </form>
  );
}
