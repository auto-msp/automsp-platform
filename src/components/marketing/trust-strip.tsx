import { Check } from "lucide-react";
import { Shell } from "@/components/ui/shell";

/**
 * Operational statements, not customer claims. Replace with verified metrics
 * or permissioned client logos only when they become available — never
 * present placeholder marks or unverified numbers as real proof.
 */
const statements = [
  "Works with your existing technology stack",
  "Human approval controls for sensitive actions",
  "Monitoring and ongoing optimization",
  "Cloud, private, and hybrid deployment options",
] as const;

export function TrustStrip() {
  return (
    <div className="bg-haze/60">
      <Shell className="py-10 sm:py-12">
        <p className="text-[12px] font-medium tracking-[0.22em] text-mute uppercase">
          Designed for production, not just demonstration
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {statements.map((s) => (
            <li key={s} className="flex items-start gap-2.5 text-[13px] leading-snug text-graphite">
              <Check className="mt-0.5 size-3.5 shrink-0 text-ink" strokeWidth={2.25} aria-hidden />
              {s}
            </li>
          ))}
        </ul>
      </Shell>
    </div>
  );
}
