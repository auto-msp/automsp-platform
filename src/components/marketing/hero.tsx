import { ButtonLink } from "@/components/ui/button";
import { Eyebrow, Shell } from "@/components/ui/shell";
import { HeroVisual } from "@/components/marketing/hero-visual";

export function Hero() {
  return (
    <div className="hairline-b">
      <Shell className="grid gap-14 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div className="flex flex-col justify-center">
          <Eyebrow>Managed AI systems for mid-market companies</Eyebrow>

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
            AutoMSP designs, deploys, and operates secure AI infrastructure, workflow
            automations, and production-ready agents across your existing business systems.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <ButtonLink href="/book-audit" size="lg" withArrow>
              Book a free AI opportunity audit
            </ButtonLink>
            <ButtonLink href="/capabilities" variant="ghost" withArrow>
              Explore our solutions
            </ButtonLink>
          </div>

          <p className="mt-8 border-l border-fog pl-5 text-sm leading-relaxed text-graphite">
            Leave with three prioritized AI opportunities, estimated business impact, and a
            practical implementation path.
          </p>
        </div>

        <HeroVisual />
      </Shell>
    </div>
  );
}
