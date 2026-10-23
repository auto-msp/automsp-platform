import {
  Archive,
  Ban,
  CircleCheck,
  CircleDashed,
  CircleDot,
  CirclePause,
  CircleX,
  Clock,
  FlaskConical,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "ok" | "warn" | "risk" | "info" | "neutral";

// Solid tint + text pairs, each measured at >= 6:1 (see docs/design-system.md).
const TONE_CLS: Record<Tone, string> = {
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  risk: "bg-risk-soft text-risk",
  info: "bg-accent-soft text-accent-strong",
  neutral: "bg-haze text-slate",
};

/** Status is never colour-only: every status has its own icon and label. */
const TONES: Record<string, { label: string; tone: Tone; icon: LucideIcon }> = {
  // execution
  queued: { label: "Queued", tone: "neutral", icon: Clock },
  running: { label: "Running", tone: "info", icon: CircleDot },
  waiting: { label: "Waiting", tone: "warn", icon: Clock },
  completed: { label: "Completed", tone: "ok", icon: CircleCheck },
  failed: { label: "Failed", tone: "risk", icon: CircleX },
  cancelled: { label: "Cancelled", tone: "neutral", icon: Ban },
  // system
  healthy: { label: "Healthy", tone: "ok", icon: CircleCheck },
  paused: { label: "Paused", tone: "neutral", icon: CirclePause },
  incident: { label: "Incident", tone: "risk", icon: TriangleAlert },
  warning: { label: "Warning", tone: "warn", icon: TriangleAlert },
  // automation
  draft: { label: "Draft", tone: "neutral", icon: CircleDashed },
  active: { label: "Active", tone: "ok", icon: CircleCheck },
  archived: { label: "Archived", tone: "neutral", icon: Archive },
  // approval
  pending: { label: "Pending", tone: "warn", icon: Clock },
  approved: { label: "Approved", tone: "ok", icon: CircleCheck },
  rejected: { label: "Rejected", tone: "risk", icon: CircleX },
  // integration
  revoked: { label: "Revoked", tone: "risk", icon: Ban },
  // agent
  testing: { label: "Testing", tone: "info", icon: FlaskConical },
  production: { label: "Production", tone: "ok", icon: CircleCheck },
  // document
  indexed: { label: "Indexed", tone: "ok", icon: CircleCheck },
  // eval run
  blocked: { label: "Blocked", tone: "warn", icon: Ban },
};

export function StatusPill({ status }: { status: string }) {
  const t = TONES[status] ?? { label: status, tone: "neutral" as Tone, icon: CircleDot };
  const Icon = t.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-sm px-1.5 py-0.5 text-xs font-medium leading-4",
        TONE_CLS[t.tone],
      )}
    >
      <Icon aria-hidden strokeWidth={2} className="size-3" />
      {t.label}
    </span>
  );
}

const RISK: Record<string, { label: string; tone: Tone; icon: LucideIcon }> = {
  low: { label: "Low risk", tone: "ok", icon: ShieldCheck },
  medium: { label: "Medium risk", tone: "warn", icon: ShieldAlert },
  high: { label: "High risk", tone: "risk", icon: ShieldAlert },
};

/** Risk level of a consequential action: tint + icon + words. */
export function RiskPill({ level }: { level: string }) {
  const r = RISK[level] ?? { label: `${level} risk`, tone: "neutral" as Tone, icon: ShieldCheck };
  const Icon = r.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-sm px-1.5 py-0.5 text-xs font-medium leading-4",
        TONE_CLS[r.tone],
      )}
    >
      <Icon aria-hidden strokeWidth={2} className="size-3" />
      {r.label}
    </span>
  );
}

/** Neutral label chip (kind, type, scope). */
export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-sm bg-haze px-1.5 py-0.5 text-xs font-medium leading-4 text-slate">
      {children}
    </span>
  );
}
