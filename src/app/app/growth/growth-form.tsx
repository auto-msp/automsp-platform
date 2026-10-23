"use client";

import { useActionState } from "react";
import { generateStrategyAction, type GrowthFormState } from "./actions";
import { Notice } from "@/components/ui/notice";

export function StrategyForm({ providerConfigured }: { providerConfigured: boolean }) {
  const [state, formAction, pending] = useActionState<GrowthFormState | null, FormData>(
    generateStrategyAction,
    null,
  );

  const docs = state?.result?.docs ?? [];

  return (
    <div className="space-y-5">
      <form action={formAction} className="space-y-5 border border-fog bg-paper p-6">
        {!providerConfigured ? (
          <p className="border border-warn/30 bg-warn/5 px-4 py-3 text-[13px] text-warn" role="alert">
            No AI provider is configured on this environment — set ANTHROPIC_API_KEY,
            OPENAI_API_KEY, or GOOGLE_GENERATIVE_AI_API_KEY server-side to enable generation.
            Nothing will be simulated in the meantime.
          </p>
        ) : null}

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">Business name</span>
            <input
              name="businessName"
              required
              maxLength={120}
              placeholder="e.g. Northbeam Coffee Co."
              className="field w-full"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-ink">Website (optional)</span>
            <input
              name="website"
              type="url"
              maxLength={300}
              placeholder="https://…"
              className="field w-full"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-ink">What does the business do?</span>
          <textarea
            name="description"
            required
            rows={4}
            maxLength={8_000}
            placeholder="What you sell, who buys it, and why it exists. The more specific, the better every downstream agent performs."
            className="field w-full"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[13px] font-medium text-ink">Audience notes (optional)</span>
          <textarea
            name="audience"
            rows={2}
            maxLength={4_000}
            placeholder="Segments, channels they live on, objections you hear."
            className="field w-full"
          />
        </label>

        {state?.error ? (
          <Notice tone="risk" alert>
            {state.error}
          </Notice>
        ) : null}
        {state?.notice ? (
          <p className="border border-ok/30 bg-ok/5 px-4 py-3 text-[13px] text-ok" role="status">
            {state.notice}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary"
        >
          {pending ? "Researching…" : "Generate strategy documents"}
        </button>
      </form>

      {docs.length > 0 ? (
        <div className="border border-fog bg-haze p-4">
          <p className="mb-2 text-xs text-slate">Last run</p>
          <ul className="space-y-1">
            {docs.map((d) => (
              <li key={d.key} className="flex items-center justify-between text-[13px]">
                <span className="text-ink">{d.title}</span>
                <span className={d.status === "generated" ? "text-ok" : "text-risk"}>
                  {d.status === "generated"
                    ? `generated${d.costEstimatedUsd != null ? ` · ~$${d.costEstimatedUsd.toFixed(4)}` : ""}`
                    : `failed — ${d.error ?? "unknown error"}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
