/**
 * KPI tile. `basis` keeps the product rule visible on every number:
 * Actual (counted), Estimated (derived from assumptions) or Projected.
 */
export function StatCard({
  label,
  value,
  method,
  basis,
  tone = "default",
}: {
  label: string;
  value: string;
  method: string;
  basis: "Actual" | "Estimated" | "Projected";
  tone?: "default" | "brand" | "accent";
}) {
  const bar = tone === "brand" ? "bg-brand" : tone === "accent" ? "bg-accent" : "bg-ink";
  return (
    <div className="relative border border-fog bg-surface p-4 pt-5 sm:p-5">
      <span aria-hidden className={`absolute top-0 left-0 h-1 w-10 ${bar}`} />
      <p className="text-[13px] font-medium text-slate">{label}</p>
      <p className="font-display tnum mt-1 text-4xl leading-none text-ink">{value}</p>
      <p className="mt-3 text-xs leading-relaxed text-mute">
        <span className={basis === "Actual" ? "font-semibold text-ok" : "font-semibold text-warn"}>{basis}</span>
        {" · "}
        {method}
      </p>
    </div>
  );
}
