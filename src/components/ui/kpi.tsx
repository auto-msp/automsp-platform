import { cn } from "@/lib/utils";

/** Large form-index numeral with a caption — Swiss editorial KPI. */
export function Kpi({
  value,
  label,
  className,
}: {
  value: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("tnum", className)}>
      <div className="font-display text-5xl leading-none sm:text-6xl">{value}</div>
      <div className="mt-3 text-sm text-slate">{label}</div>
    </div>
  );
}
