"use client";

import { useActionState } from "react";
import type { AutomationFormState } from "./actions";
import { Field } from "@/components/ui/field";

const inputCls =
  "field";

type BoundAction = (prev: AutomationFormState | null, data: FormData) => Promise<AutomationFormState>;

export function AutomationSettingsForm({
  action,
  submitLabel,
  systems,
  defaultValues,
  defaultSystemId,
  showStatus,
}: {
  action: BoundAction;
  submitLabel: string;
  systems: { id: string; name: string }[];
  defaultValues?: {
    name: string;
    description: string;
    estMinutesPerRun: number;
    status: string;
  };
  defaultSystemId?: string;
  showStatus?: boolean;
}) {
  const [state, formAction, pending] = useActionState<AutomationFormState | null, FormData>(
    action,
    null,
  );

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <Field label="Automation name" error={state?.fieldErrors?.name?.[0]}>
        <input
          name="name"
          required
          defaultValue={defaultValues?.name}
          placeholder='e.g. "Daily invoice digest"'
          className={inputCls}
        />
      </Field>
      <Field label="Description" error={state?.fieldErrors?.description?.[0]}>
        <textarea
          name="description"
          rows={3}
          defaultValue={defaultValues?.description}
          placeholder="What this automation does, and when a human needs to be involved."
          className={inputCls}
        />
      </Field>
      <Field label="System">
        <select name="systemId" defaultValue={defaultSystemId ?? ""} className={inputCls}>
          <option value="">— No system —</option>
          {systems.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </Field>
      <Field
        label="Estimated minutes saved per run"
        error={state?.fieldErrors?.estMinutesPerRun?.[0]}
      >
        <input
          name="estMinutesPerRun"
          type="number"
          min={0}
          step={1}
          defaultValue={defaultValues?.estMinutesPerRun ?? 0}
          className={inputCls}
        />
        <p className="hint">
          Your estimate of human time avoided per completed run. Shown as an estimate wherever it is
          reported.
        </p>
      </Field>

      {showStatus ? (
        <Field label="Status">
          <select name="status" defaultValue={defaultValues?.status ?? "draft"} className={inputCls}>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
      ) : null}

      {state?.error ? (
        <p className="form-alert" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary"
      >
        {pending ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}

