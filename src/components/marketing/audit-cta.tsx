import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Eyebrow, Section, Shell } from "@/components/ui/shell";

export function AuditCta() {
  return (
    <Section className="bg-ink py-20 text-paper sm:py-28">
      <Shell>
        <div className="grid items-end gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <Eyebrow tone="dark">Book a free AI opportunity audit</Eyebrow>
            <h2 className="font-display mt-6 text-5xl leading-[1.05] tracking-tight sm:text-6xl">
              Get your 3 prioritized AI opportunities.
            </h2>
          </div>
          <div>
            <p className="text-[15px] leading-relaxed text-white/70">
              A focused assessment for COOs, CIOs, CTOs, and operations leaders seeking practical
              AI that drives measurable results.
            </p>
            <Link
              href="/book-audit"
              className="group mt-8 inline-flex h-[52px] items-center gap-3 bg-paper px-8 text-[13px] font-medium tracking-[0.08em] text-ink uppercase transition-colors hover:bg-white"
            >
              Book your audit now
              <ArrowRight
                className="size-4 transition-transform duration-300 ease-(--ease-out-soft) group-hover:translate-x-1"
                strokeWidth={1.75}
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </Shell>
    </Section>
  );
}
