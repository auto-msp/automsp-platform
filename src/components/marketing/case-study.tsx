import { Eyebrow, Section, Shell } from "@/components/ui/shell";

/**
 * Format per our case-study standard: client type, original workflow,
 * implementation scope, measurement period, verified results, and
 * attribution disclosure. Publish figures only when measurement records
 * support them; label anonymized clients explicitly.
 */
export function CaseStudySection() {
  return (
    <Section className="hairline-t bg-haze/60">
      <Shell>
        <div className="max-w-3xl">
          <Eyebrow>Case study</Eyebrow>
          <h2 className="font-display mt-6 text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
            Outcomes measured in real workflows.
          </h2>
        </div>

        <div className="mt-12 border border-fog bg-paper">
          <div className="border-b border-fog p-8 sm:p-10">
            <p className="text-[12px] font-medium tracking-[0.22em] text-mute uppercase">
              Logistics operations
            </p>
            <h3 className="font-display mt-3 text-2xl tracking-tight text-ink sm:text-3xl">
              From manual intake to AI-assisted routing
            </h3>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate">
              A regional logistics provider was manually validating shipment records across three
              systems. AutoMSP implemented automated document extraction, validation against
              internal records, exception routing to human operators, and real-time status
              synchronization — with performance monitoring throughout.
            </p>
          </div>
          <div className="grid gap-px bg-fog sm:grid-cols-3">
            {[
              { value: "80%", label: "Reduction in manual correction volume" },
              { value: "30%", label: "Faster exception resolution" },
              { value: "60+", label: "Staff hours saved per month" },
            ].map((m) => (
              <div key={m.label} className="bg-surface p-7">
                <p className="tnum font-display text-3xl text-ink">{m.value}</p>
                <p className="mt-1.5 text-[13px] leading-snug text-slate">{m.label}</p>
              </div>
            ))}
          </div>
          <p className="border-t border-fog px-8 py-4 text-xs text-mute">
            Measured over 90 days of production operation. Client identity withheld under a
            confidentiality agreement.
          </p>
        </div>
      </Shell>
    </Section>
  );
}
