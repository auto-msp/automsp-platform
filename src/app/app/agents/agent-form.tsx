"use client";

import { useActionState } from "react";
import { createAgentAction, saveAgentAction, type AgentFormState } from "./actions";

const inputCls =
  "w-full border border-fog bg-paper px-3 py-2 text-sm text-ink placeholder:text-mute focus:border-ink focus:outline-none";

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string[];
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-mute">{hint}</span> : null}
      {error?.length ? <span className="mt-1 block text-[12px] text-risk">{error.join(" ")}</span> : null}
    </label>
  );
}

export function AgentForm({
  models,
  agentId,
  initial,
}: {
  models: { key: string; label: string }[];
  agentId?: string;
  initial?: {
    name: string;
    purpose: string;
    description: string;
    model: string;
    systemInstructions: string;
  };
}) {
  const action = agentId ? saveAgentAction.bind(null, agentId) : createAgentAction;
  const [state, formAction, pending] = useActionState<AgentFormState | null, FormData>(action, null);

  return (
    <form action={formAction} className="space-y-5 border border-fog bg-paper p-6" noValidate={false}>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[1fr_1fr]">
        <Field label="Name" error={state?.fieldErrors?.name}>
          <input name="name" required maxLength={120} defaultValue={initial?.name ?? ""} className={inputCls} />
        </Field>
        <Field
          label="Model"
          hint={
            state?.fieldErrors?.model
              ? undefined
              : "Catalog list prices drive Estimated cost; the provider serving the call is the one whose key is configured."
          }
          error={state?.fieldErrors?.model}
        >
          <select name="model" defaultValue={initial?.model ?? models[0]?.key} className={inputCls}>
            {models.map((model) => (
              <option key={model.key} value={model.key}>
                {model.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
        label="Purpose (one line)"
        hint="What outcome this agent serves, e.g. “Drafts first-pass replies for the support queue.”"
        error={state?.fieldErrors?.purpose}
      >
        <input name="purpose" maxLength={200} defaultValue={initial?.purpose ?? ""} className={inputCls} />
      </Field>

      <Field label="Description (internal)" error={state?.fieldErrors?.description}>
        <textarea name="description" rows={2} maxLength={2000} defaultValue={initial?.description ?? ""} className={inputCls} />
      </Field>

      <Field
        label="System instructions"
        hint="Role, boundaries, and tone. Consequential actions stay behind workflow approval steps regardless."
        error={state?.fieldErrors?.systemInstructions}
      >
        <textarea
          name="systemInstructions"
          rows={8}
          required
          maxLength={12000}
          defaultValue={initial?.systemInstructions ?? ""}
          className={`${inputCls} font-mono text-[13px]`}
        />
      </Field>

      {state?.error ? (
        <p className="border border-risk/30 bg-risk/5 px-4 py-3 text-[13px] text-risk" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center bg-ink px-5 text-[12px] font-medium tracking-[0.08em] text-paper uppercase transition-colors hover:bg-graphite disabled:opacity-50"
        >
          {pending ? "Saving…" : agentId ? "Save as new version" : "Create agent"}
        </button>
        {agentId && !state?.error && state !== null ? (
          <span className="text-[12px] text-ok">Saved.</span>
        ) : null}
      </div>
    </form>
  );
}
