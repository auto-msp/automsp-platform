"use client";

import { useActionState } from "react";
import type { SystemFormState } from "./actions";

const inputCls =
  "w-full border border-fog bg-surface px-4 py-3 text-sm text-ink placeholder:text-mute transition-colors focus:border-ink focus:outline-none";

type BoundAction = (prev: SystemFormState | null, data: FormData) => Promise<SystemFormState>;

export function SystemForm({
  action,
  submitLabel,
  defaultValues,
  showStatus,
}: {
  action: BoundAction;
  submitLabel: string;
  defaultValues?: {
    name: string;
    description: string;
    businessOutcome: string;
    ownerName: string;
    status: string;
  };
  showStatus?: boolean;
}) {
  const [state, formAction, pending] = useActionState<SystemFormState | null, FormData>(
    action,
    null,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <Field label="System name" error={state?.fieldErrors?.name?.[0]}>
        <input
          name="name"
          required
          defaultValue={defaultValues?.name}
          placeholder='e.g. "Invoice processing"'
          className={inputCls}
        />
      </Field>
      <Field label="Description" error={state?.fieldErrors?.description?.[0]}>
        <textarea
          name="description"
          rows={3}
          defaultValue={defaultValues?.description}
          placeholder="What this system does, in one or two sentences."
          className={inputCls}
        />
      </Field>
      <Field label="Business outcome" error={state?.fieldErrors?.businessOutcome?.[0]}>
        <input
          name="businessOutcome"
          defaultValue={defaultValues?.businessOutcome}
          placeholder='e.g. "Cut invoice turnaround from 3 days to same-day"'
          className={inputCls}
        />
        <p className="mt-1.5 text-xs text-mute">
          Every roll-up metric on this system is reported against this outcome.
        </p>
      </Field>
      <Field label="Owner" error={state?.fieldErrors?.ownerName?.[0]}>
        <input
          name="ownerName"
          defaultValue={defaultValues?.ownerName}
          placeholder="Who is accountable for this system"
          className={inputCls}
        />
      </Field>

      {showStatus ? (
        <Field label="Status">
          <select name="status" defaultValue={defaultValues?.status ?? "draft"} className={inputCls}>
            <option value="draft">Draft</option>
            <option value="healthy">Healthy</option>
            <option value="warning">Warning</option>
            <option value="paused">Paused</option>
            <option value="incident">Incident</option>
          </select>
        </Field>
      ) : null}

      {state?.error ? (
        <p className="border border-risk/30 bg-risk/5 px-4 py-3 text-sm text-risk" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center bg-ink px-6 text-[13px] font-medium tracking-[0.08em] text-paper uppercase transition-colors hover:bg-graphite disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-[13px] font-medium text-graphite">{label}</label>
      {children}
      {error ? <p className="mt-1.5 text-xs text-risk">{error}</p> : null}
    </div>
  );
}
