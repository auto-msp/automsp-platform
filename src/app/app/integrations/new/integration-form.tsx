"use client";

import { useActionState } from "react";
import { addIntegrationAction, type IntegrationFormState } from "../actions";

const inputCls =
  "w-full border border-fog bg-paper px-3 py-2 text-sm text-ink placeholder:text-mute focus:border-ink focus:outline-none";

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
        <label htmlFor="providerKey" className="mb-1.5 block text-[12px] font-medium text-graphite">
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
          <p className="mt-1 text-[12px] text-risk">{state.fieldErrors.providerKey[0]}</p>
        ) : null}
      </div>

      <div className="mb-5">
        <label htmlFor="name" className="mb-1.5 block text-[12px] font-medium text-graphite">
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
        <p className="mt-1 text-[11px] text-mute">
          Shown to your team when this credential is attached to a workflow step.
        </p>
        {state?.fieldErrors?.name ? (
          <p className="mt-1 text-[12px] text-risk">{state.fieldErrors.name[0]}</p>
        ) : null}
      </div>

      <div className="mb-6">
        <label htmlFor="secret" className="mb-1.5 block text-[12px] font-medium text-graphite">
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
        <p className="mt-1 text-[11px] text-mute">
          Sealed with AES-256-GCM before storage. Only the last 4 characters are ever displayed for
          recognition.
        </p>
        {state?.fieldErrors?.secret ? (
          <p className="mt-1 text-[12px] text-risk">{state.fieldErrors.secret[0]}</p>
        ) : null}
      </div>

      {state?.error ? (
        <p className="mb-5 border border-risk/30 bg-risk/5 px-4 py-3 text-sm text-risk" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center bg-ink px-6 text-[13px] font-medium tracking-[0.08em] text-paper uppercase transition-colors hover:bg-graphite disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Sealing…" : "Seal and store"}
      </button>
    </form>
  );
}
