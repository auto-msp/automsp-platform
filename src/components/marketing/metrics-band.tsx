import { Kpi } from "@/components/ui/kpi";
import { Section, Shell } from "@/components/ui/shell";

/**
 * Representative engagement benchmarks — published as typical ranges from
 * managed-AI delivery programs, not as audited customer results.
 */
const metrics = [
  { value: "100+", label: "AI systems designed & deployed" },
  { value: "30–50%", label: "Process cycle-time reduction, typical range" },
  { value: "4–12×", label: "ROI typically realized within 12 months" },
  { value: "99.9%", label: "System reliability target under management" },
] as const;

export function MetricsBand() {
  return (
    <Section className="hairline-t py-14 sm:py-16">
      <Shell>
        <div className="grid gap-px border border-fog bg-fog sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label} className="bg-surface p-8 sm:p-10">
              <Kpi value={m.value} label={m.label} />
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-mute">
          Typical ranges across managed AI automation engagements. Your audit establishes a
          baseline specific to your operations.
        </p>
      </Shell>
    </Section>
  );
}
