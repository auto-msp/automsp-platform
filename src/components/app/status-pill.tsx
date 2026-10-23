import {
  Archive,
  BadgeCheck,
  Ban,
  CircleCheck,
  CircleDot,
  CirclePause,
  CircleX,
  Clock,
  FlaskConical,
  PencilLine,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

type Tone = "neutral" | "info" | "ok" | "warn" | "risk";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-haze text-graphite",
  info: "bg-accent-soft text-accent",
  ok: "bg-ok-soft text-ok",
  warn: "bg-warn-soft text-warn",
  risk: "bg-risk-soft text-risk",
};

// Every status carries an icon and a word, so colour is never the only signal.
const STATUS: Record<string, { label: string; tone: Tone; icon: LucideIcon }> = {
  // execution statuses
  queued: { label: "Queued", tone: "neutral", icon: Clock },
  running: { label: "Running", tone: "info", icon: CircleDot },
  waiting: { label: "Waiting", tone: "warn", icon: Clock },
  completed: { label: "Completed", tone: "ok", icon: CircleCheck },
  failed: { label: "Failed", tone: "risk", icon: CircleX },
  cancelled: { label: "Cancelled", tone: "neutral", icon: Ban },
  // system statuses
  healthy: { label: "Healthy", tone: "ok", icon: CircleCheck },
  paused: { label: "Paused", tone: "neutral", icon: CirclePause },
  incident: { label: "Incident", tone: "risk", icon: TriangleAlert },
  warning: { label: "Warning", tone: "warn", icon: TriangleAlert },
  // automation / agent statuses
  draft: { label: "Draft", tone: "neutral", icon: PencilLine },
  active: { label: "Active", tone: "ok", icon: CircleCheck },
  archived: { label: "Archived", tone: "neutral", icon: Archive },
  testing: { label: "Testing", tone: "info", icon: FlaskConical },
  production: { label: "Production", tone: "ok", icon: BadgeCheck },
  // approval statuses
  pending: { label: "Pending", tone: "warn", icon: Clock },
  approved: { label: "Approved", tone: "ok", icon: CircleCheck },
  rejected: { label: "Rejected", tone: "risk", icon: CircleX },
  // integration / document / eval statuses
  revoked: { label: "Revoked", tone: "risk", icon: Ban },
  indexed: { label: "Indexed", tone: "ok", icon: CircleCheck },
  blocked: { label: "Blocked", tone: "warn", icon: TriangleAlert },
};

export function StatusPill({ status }: { status: string }) {
  const entry = STATUS[status] ?? { label: status, tone: "neutral" as Tone, icon: CircleDot };
  const Icon = entry.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-(--radius-chip) px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${TONE_CLASS[entry.tone]}`}
    >
      <Icon aria-hidden className="size-3.5 shrink-0" strokeWidth={2} />
      {entry.label}
    </span>
  );
}
