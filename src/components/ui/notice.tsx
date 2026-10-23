import { CircleAlert, CircleCheck, Info, TriangleAlert, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "info" | "ok" | "warn" | "risk";

const TONE: Record<Tone, { box: string; icon: LucideIcon; iconClass: string }> = {
  info: { box: "border-accent bg-accent-soft", icon: Info, iconClass: "text-accent" },
  ok: { box: "border-ok bg-ok-soft", icon: CircleCheck, iconClass: "text-ok" },
  warn: { box: "border-warn-fill bg-warn-soft", icon: TriangleAlert, iconClass: "text-warn" },
  risk: { box: "border-risk-fill bg-risk-soft", icon: CircleAlert, iconClass: "text-risk" },
};

/**
 * Inline banner for environment state ("no provider configured"), warnings and
 * errors. Icon + left rule + text, so tone is never carried by colour alone.
 * Use role="alert" (via the `alert` prop) only for errors that appear after an action.
 */
export function Notice({
  tone = "info",
  alert = false,
  className,
  children,
}: {
  tone?: Tone;
  alert?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const t = TONE[tone];
  const Icon = t.icon;
  return (
    <div
      role={alert ? "alert" : undefined}
      className={cn("flex items-start gap-3 border-l-4 px-4 py-3 text-sm leading-relaxed text-graphite", t.box, className)}
    >
      <Icon aria-hidden className={cn("mt-0.5 size-[18px] shrink-0", t.iconClass)} strokeWidth={2} />
      <div className="min-w-0 flex-1 [&_a]:font-medium [&_a]:text-accent [&_a]:underline [&_code]:rounded-(--radius-chip) [&_code]:bg-surface/70 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.8125em]">
        {children}
      </div>
    </div>
  );
}
