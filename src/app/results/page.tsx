import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { AuditCta } from "@/components/marketing/audit-cta";
import { Section, Shell, Eyebrow } from "@/components/ui/shell";
import { Kpi } from "@/components/ui/kpi";

export const metadata: Metadata = {
  title: "Results",
  description:
    "How AutoMSP measures the business impact of managed AI systems: time saved, cycle-time reduction, cost avoidance, and reliability — with a clear calculation method for every metric.",
};

const benchmarks = [
  { value: "30–50%", label: "Process cycle-time reduction", method: "Median handling time before vs. after automation, measured over 4+ weeks of production executions." },
  { value: "4–12×", label: "First-year ROI range", method: "(Hours avoided × loaded hourly cost + error-cost avoided) ÷ total engagement cost. Conservative inputs only." },
  { value: "60–80%", label: "Routine-touch automation rate", method: "Share of items in an automated process completed without human touch, excluding flagged exceptions." },
  { value: "99.9%", label: "Reliability target", method: "Successful executions ÷ total executions, excluding planned maintenance windows, reported monthly." },
] as const;

export default function ResultsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Results that matter"
        title="Real outcomes. Measured, not asserted."
        lede="Every metric we report carries its calculation method with it. That is how you build trust in an automation program."
      />

      <Section>
        <Shell>
          <div className="grid gap-px border border-fog bg-fog sm:grid-cols-2">
            {benchmarks.map((b) => (
              <div key={b.label} className="bg-surface p-8 sm:p-10">
                <Kpi value={b.value} label={b.label} />
                <div className="mt-6 border-t border-fog pt-4">
                  <p className="text-[11px] font-medium tracking-[0.18em] text-mute uppercase">
                    How this is calculated
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-slate">{b.method}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-2xl text-xs leading-relaxed text-mute">
            Benchmarks are typical ranges from managed AI automation engagements. They are
            directional, not guarantees. Your AI Opportunity Audit produces a baseline and
            projected impact specific to your operations.
          </p>
        </Shell>
      </Section>

      <Section className="hairline-t bg-haze/50">
        <Shell>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
            <div>
              <Eyebrow>Reporting cadence</Eyebrow>
              <h2 className="font-display mt-6 text-4xl leading-[1.08] tracking-tight text-ink">
                What you see, and when.
              </h2>
            </div>
            <ul className="divide-y divide-fog border-y border-fog">
              {[
                { cadence: "Weekly", report: "AI Operations Report — executions, success rate, exceptions, pending approvals." },
                { cadence: "Monthly", report: "Business Impact Report — hours saved, cost avoided, adoption, ROI tracking." },
                { cadence: "Quarterly", report: "Portfolio Review — system health, optimization roadmap, expansion opportunities." },
                { cadence: "On incident", report: "Incident Report — what happened, blast radius, root cause, prevention." },
              ].map((r) => (
                <li key={r.cadence} className="flex flex-col gap-1 py-5 sm:flex-row sm:items-baseline sm:gap-8">
                  <span className="w-28 shrink-0 text-[13px] font-semibold tracking-tight text-ink">
                    {r.cadence}
                  </span>
                  <span className="text-sm leading-relaxed text-slate">{r.report}</span>
                </li>
              ))}
            </ul>
          </div>
        </Shell>
      </Section>

      <AuditCta />
    </>
  );
}
