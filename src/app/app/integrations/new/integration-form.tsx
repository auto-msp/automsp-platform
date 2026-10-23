"use client";

import { useActionState } from "react";
import { addIntegrationAction, type IntegrationFormState } from "../actions";
import { Notice } from "@/components/ui/notice";

const inputCls =
  "field w-full";

export function IntegrationForm({
  providers,
}: {
  providers: { key: string; name: string; category: string }[];
}) {
  const [state, formAction, pending] = useActionState<IntegrationFormState | null, FormData>(
    addIntegrationAction,
    null,
  );

  return (
    <form action={formAction} noValidate className="max-w-xl border border-fog bg-surface px-6 py-6">
      <div className="mb-5">
        <label htmlFor="providerKey" className="field-label">
          Provider
        </label>
        <select id="providerKey" name="providerKey" className={inputCls} required>
          {providers.map((p) => (
            <option key={p.key} value={p.key}>
              {p.name} — {p.category}
            </option>
          ))}
        </select>
        {state?.fieldErrors?.providerKey ? (
          <p className="field-error">{state.fieldErrors.providerKey[0]}</p>
        ) : null}
      </div>

      <div className="mb-5">
        <label htmlFor="name" className="field-label">
          Credential name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder='e.g. "HubSpot production token"'
          className={inputCls}
        />
        <p className="mt-1 text-xs text-mute">
          Shown to your team when this credential is attached to a workflow step.
        </p>
        {state?.fieldErrors?.name ? (
          <p className="field-error">{state.fieldErrors.name[0]}</p>
        ) : null}
      </div>

      <div className="mb-6">
        <label htmlFor="secret" className="field-label">
          Secret (API token / bearer key)
        </label>
        <input
          id="secret"
          name="secret"
          type="password"
          required
          autoComplete="off"
          minLength={8}
          className={inputCls}
        />
        <p className="mt-1 text-xs text-mute">
          Sealed with AES-256-GCM before storage. Only the last 4 characters are ever displayed for
          recognition.
        </p>
        {state?.fieldErrors?.secret ? (
          <p className="field-error">{state.fieldErrors.secret[0]}</p>
        ) : null}
      </div>

      {state?.error ? (
        <Notice tone="risk" alert className="mb-5">
          {state.error}
        </Notice>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary"
      >
        {pending ? "Sealing…" : "Seal and store"}
      </button>
    </form>
  );
}
