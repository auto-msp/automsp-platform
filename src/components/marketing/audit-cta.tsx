import { ButtonLink } from "@/components/ui/button";
import { Eyebrow, Section, Shell } from "@/components/ui/shell";

export function AuditCta() {
  return (
    <Section className="on-dark bg-ink py-20 text-paper sm:py-28">
      <Shell>
        <div className="grid items-end gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <Eyebrow tone="dark">Book a free AI opportunity audit</Eyebrow>
            <h2 className="font-display mt-6 text-5xl leading-[1.05] tracking-tight sm:text-6xl">
              Find the first AI workflow worth putting into production.
            </h2>
          </div>
          <div>
            <p className="text-[15px] leading-relaxed text-white/70">
              Book a 30-minute AI opportunity audit. We will identify three practical
              opportunities, prioritize them by likely impact and complexity, and recommend the
              best next step. No obligation, no generic AI presentation.
            </p>
            <ButtonLink href="/book-audit" variant="inverse" size="lg" withArrow className="mt-8">
              Book your audit now
            </ButtonLink>
          </div>
        </div>
      </Shell>
    </Section>
  );
}
