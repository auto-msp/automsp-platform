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

export interface ToolOption {
  name: string;
  description: string;
  scope: string;
  consequential: boolean;
}

export function AgentForm({
  models,
  tools,
  agentId,
  initial,
}: {
  models: { key: string; label: string }[];
  tools: ToolOption[];
  agentId?: string;
  initial?: {
    name: string;
    purpose: string;
    description: string;
    model: string;
    systemInstructions: string;
    scopes: string[];
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
        hint="Role, boundaries, and tone. Consequential actions stay behind human approvals regardless."
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

      <fieldset>
        <legend className="mb-1.5 block text-[13px] font-medium text-ink">Tool scopes</legend>
        <p className="mb-3 text-[11px] leading-relaxed text-mute">
          Grant the least the agent needs. Scopes are enforced server-side on every tool call.
          Consequential tools always pause for human approval with the exact arguments recorded.
        </p>
        <div className="space-y-2.5">
          {tools.map((tool) => {
            const checked = initial?.scopes.includes(tool.scope) ?? false;
            return (
              <label
                key={tool.scope}
                className="flex cursor-pointer items-start gap-3 border border-fog bg-surface px-3 py-2.5"
              >
                <input
                  type="checkbox"
                  name="scope"
                  value={tool.scope}
                  defaultChecked={checked}
                  className="mt-0.5 h-4 w-4 accent-current"
                />
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-ink">
                    {tool.name}
                    <code className="tnum text-[11px] text-mute">{tool.scope}</code>
                    {tool.consequential ? (
                      <span className="border border-warn/40 bg-warn/10 px-1.5 py-px text-[10px] font-medium tracking-[0.08em] text-warn uppercase">
                        approval required
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block text-[12px] leading-relaxed text-slate">{tool.description}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

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
