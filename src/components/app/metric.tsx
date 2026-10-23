import { Calculator, CircleCheck, TrendingUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type Basis = "actual" | "estimated" | "projected";

const BASIS: Record<Basis, { label: string; icon: LucideIcon; cls: string }> = {
  actual: { label: "Actual", icon: CircleCheck, cls: "bg-ok-soft text-ok" },
  estimated: { label: "Estimated", icon: Calculator, cls: "bg-warn-soft text-warn" },
  projected: { label: "Projected", icon: TrendingUp, cls: "bg-accent-soft text-accent-strong" },
};

/**
 * The product rule "never blur the basis of a number" as UI: every figure that
 * is derived carries one of these, with an icon so it is not colour-only.
 */
export function BasisBadge({ basis, className }: { basis: string; className?: string }) {
  const b = BASIS[basis.toLowerCase() as Basis];
  if (!b) return <span className={cn("text-xs font-medium text-slate", className)}>{basis}</span>;
  const Icon = b.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs font-semibold leading-4",
        b.cls,
        className,
      )}
    >
      <Icon aria-hidden strokeWidth={2} className="size-3" />
      {b.label}
    </span>
  );
}

/** A single figure with its label, basis and calculation method. */
export function Metric({
  label,
  value,
  basis,
  method,
  size = "sm",
}: {
  label: string;
  value: string;
  basis: Basis;
  method: string;
  size?: "lg" | "sm";
}) {
  return (
    <div className={cn("card flex flex-col", size === "lg" ? "card-pad sm:p-6" : "card-pad-sm")}>
      <p className="text-[13px] font-medium text-slate">{label}</p>
      <p
        className={cn(
          "tnum font-semibold tracking-tight text-ink",
          size === "lg" ? "mt-2 text-4xl leading-tight sm:text-5xl" : "mt-1.5 text-3xl leading-tight",
        )}
      >
        {value}
      </p>
      <div className="mt-auto flex flex-wrap items-start gap-x-2 gap-y-1 pt-3">
        <BasisBadge basis={basis} />
        <span className="min-w-0 flex-1 basis-40 text-xs leading-relaxed text-mute">{method}</span>
      </div>
    </div>
  );
}
