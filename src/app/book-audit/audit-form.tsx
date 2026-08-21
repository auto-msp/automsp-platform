"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import {
  aiUsageLevels,
  auditRequestSchema,
  companySizes,
  industries,
  roles,
} from "@/lib/validation";
import { cn } from "@/lib/utils";

type FieldErrors = Partial<Record<string, string[]>>;

const inputCls =
  "w-full border border-fog bg-surface px-4 py-3 text-sm text-ink placeholder:text-mute transition-colors focus:border-ink focus:outline-none";
const labelCls = "mb-2 block text-[13px] font-medium text-graphite";

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string;
  name: string;
  error?: string[];
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className={labelCls}>
        {label}
      </label>
      {children}
      {error?.[0] ? (
        <p className="mt-1.5 text-xs text-risk" role="alert">
          {error[0]}
        </p>
      ) : null}
    </div>
  );
}

export function AuditForm() {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const data = Object.fromEntries(new FormData(e.currentTarget));
    const clientCheck = auditRequestSchema.safeParse(data);
    if (!clientCheck.success) {
      setFieldErrors(clientCheck.error.flatten().fieldErrors);
      setFormError("Please review the highlighted fields.");
      return;
    }

    setFieldErrors({});
    setPending(true);
    try {
      const res = await fetch("/api/audit-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientCheck.data),
      });
      const payload = (await res.json()) as { error?: string; fieldErrors?: FieldErrors };
      if (!res.ok) {
        setFieldErrors(payload.fieldErrors ?? {});
        setFormError(payload.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setFormError("Network error. Please try again in a moment.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="border border-fog bg-surface p-10 sm:p-14" role="status">
        <CheckCircle2 className="size-10 text-ok" strokeWidth={1.5} aria-hidden />
        <h2 className="font-display mt-6 text-4xl tracking-tight text-ink">Assessment received.</h2>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate">
          Thank you. An AutoMSP strategist will review your responses and come back to you within
          two business days with next steps for your three prioritized AI opportunities.
        </p>
        <p className="mt-6 text-xs text-mute">
          A confirmation email will follow once email delivery is configured for this environment.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="border border-fog bg-surface p-6 sm:p-10">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Company *" name="company" error={fieldErrors.company}>
          <input id="company" name="company" className={inputCls} autoComplete="organization" />
        </Field>
        <Field label="Your name *" name="name" error={fieldErrors.name}>
          <input id="name" name="name" className={inputCls} autoComplete="name" />
        </Field>
        <Field label="Work email *" name="email" error={fieldErrors.email}>
          <input id="email" name="email" type="email" className={inputCls} autoComplete="email" />
        </Field>
        <Field label="Phone" name="phone" error={fieldErrors.phone}>
          <input id="phone" name="phone" type="tel" className={inputCls} autoComplete="tel" />
        </Field>
        <Field label="Your role *" name="role" error={fieldErrors.role}>
          <select id="role" name="role" className={cn(inputCls, "bg-surface")} defaultValue="">
            <option value="" disabled>
              Select role
            </option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Company size *" name="companySize" error={fieldErrors.companySize}>
          <select id="companySize" name="companySize" className={inputCls} defaultValue="">
            <option value="" disabled>
              Select size
            </option>
            {companySizes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Industry *" name="industry" error={fieldErrors.industry}>
          <select id="industry" name="industry" className={inputCls} defaultValue="">
            <option value="" disabled>
              Select industry
            </option>
            {industries.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Current AI usage *" name="aiUsage" error={fieldErrors.aiUsage}>
          <select id="aiUsage" name="aiUsage" className={inputCls} defaultValue="">
            <option value="" disabled>
              Select usage level
            </option>
            {aiUsageLevels.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-6 grid gap-6">
        <Field
          label="Current systems (CRM, ERP, ticketing, etc.)"
          name="currentSystems"
          error={fieldErrors.currentSystems}
        >
          <input
            id="currentSystems"
            name="currentSystems"
            className={inputCls}
            placeholder="e.g., HubSpot, SAP, Zendesk, Google Workspace"
          />
        </Field>
        <Field label="Biggest operational bottlenecks *" name="bottlenecks" error={fieldErrors.bottlenecks}>
          <textarea
            id="bottlenecks"
            name="bottlenecks"
            rows={4}
            className={inputCls}
            placeholder="Which processes consume the most team time, break most often, or block growth?"
          />
        </Field>
        <Field
          label="Approximate process volume (e.g., 500 tickets/month)"
          name="processVolume"
          error={fieldErrors.processVolume}
        >
          <input id="processVolume" name="processVolume" className={inputCls} />
        </Field>
        <Field label="Desired outcomes" name="outcomes" error={fieldErrors.outcomes}>
          <textarea
            id="outcomes"
            name="outcomes"
            rows={3}
            className={inputCls}
            placeholder="What would meaningful impact look like in 6–12 months?"
          />
        </Field>
      </div>

      {formError ? (
        <p className="mt-6 border border-risk/30 bg-risk/5 px-4 py-3 text-sm text-risk" role="alert">
          {formError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="group mt-8 inline-flex h-[52px] w-full items-center justify-center gap-3 bg-ink px-8 text-[13px] font-medium tracking-[0.08em] text-paper uppercase transition-colors hover:bg-graphite disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Submitting…" : "Submit audit request"}
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.75} aria-hidden />
      </button>
    </form>
  );
}
