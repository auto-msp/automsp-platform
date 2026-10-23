import { ButtonLink } from "@/components/ui/button";
import { Section, Shell } from "@/components/ui/shell";

/** Closing call to action — the one full-bleed orange band on each page. */
export function AuditCta() {
  return (
    <Section className="bg-brand py-20 text-ink sm:py-28">
      <Shell>
        <div className="grid items-end gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <p className="flex items-center gap-2.5 text-xs font-semibold tracking-[0.18em] uppercase">
              <span aria-hidden className="inline-block size-[5px] bg-ink" />
              Book a free AI opportunity audit
            </p>
            <h2 className="font-display mt-6 text-5xl leading-[1.05] tracking-tight sm:text-6xl">
              Find the first AI workflow worth putting into production.
            </h2>
          </div>
          <div>
            <p className="text-[16px] leading-relaxed">
              Book a 30-minute AI opportunity audit. We will identify three practical
              opportunities, prioritize them by likely impact and complexity, and recommend the
              best next step. No obligation, no generic AI presentation.
            </p>
            <ButtonLink href="/book-audit" variant="dark" size="lg" withArrow className="mt-8">
              Book your audit now
            </ButtonLink>
          </div>
        </div>
      </Shell>
    </Section>
  );
}
