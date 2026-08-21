"use client";

import { setAgentStatusAction } from "../actions";

const NEXT: Record<string, { label: string; to: "testing" | "approved" | "production" | "paused" | "draft" }[]> = {
  draft: [{ label: "Move to testing", to: "testing" }],
  testing: [
    { label: "Approve", to: "approved" },
    { label: "Back to draft", to: "draft" },
  ],
  approved: [{ label: "Put in production", to: "production" }],
  production: [{ label: "Pause", to: "paused" }],
  paused: [{ label: "Return to production", to: "production" }],
  archived: [{ label: "Back to draft", to: "draft" }],
};

export function StatusButtons({ agentId, status }: { agentId: string; status: string }) {
  const options = NEXT[status] ?? [];
  if (options.length === 0) return null;
  return (
    <div className="flex items-center gap-2">
      {options.map((opt) => (
        <button
          key={opt.to}
          type="button"
          onClick={() => void setAgentStatusAction(agentId, opt.to)}
          className="inline-flex h-9 items-center border border-fog px-3 text-[12px] font-medium tracking-[0.06em] text-slate uppercase transition-colors hover:border-ink hover:text-ink"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
