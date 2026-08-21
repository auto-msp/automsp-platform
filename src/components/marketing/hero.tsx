import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow, Shell } from "@/components/ui/shell";
import { HeroVisual } from "@/components/marketing/hero-visual";

const proofPoints = [
  { n: "01", label: "3 prioritized AI opportunities" },
  { n: "02", label: "Impact & feasibility assessment" },
  { n: "03", label: "High-level implementation path" },
] as const;

export function Hero() {
  return (
    <div className="hairline-b">
      <Shell className="grid gap-14 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div className="flex flex-col justify-center">
          <Eyebrow>Managed AI Systems Partner</Eyebrow>

          <h1 className="font-display mt-7 text-[13.5vw] leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-[4.35rem] xl:text-[4.75rem]">
            Build an AI
            <br />
            operating layer
            <br />
            <span className="text-mute">without building</span>
            <br />
            <span className="text-mute">an AI department.</span>
          </h1>

          <p className="mt-8 max-w-md text-[17px] leading-relaxed text-slate">
            AutoMSP delivers secure, reliable, and measurable AI systems that integrate with your
            business — so your team can move faster and stay in control.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <ButtonLink href="/book-audit" size="lg" withArrow>
              Book a Free AI Opportunity Audit
            </ButtonLink>
            <ButtonLink href="/approach" variant="ghost" withArrow>
              Explore how it works
            </ButtonLink>
          </div>

          <ul className="mt-14 grid gap-6 sm:grid-cols-3 sm:gap-8">
            {proofPoints.map((p) => (
              <li key={p.n} className="border-l border-fog pl-5">
                <span className="tnum text-xs font-medium tracking-[0.2em] text-mute">{p.n}</span>
                <p className="mt-2 flex items-start gap-2 text-[13px] leading-snug text-graphite">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-ink" strokeWidth={2.25} aria-hidden />
                  {p.label}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <HeroVisual />
      </Shell>
    </div>
  );
}
