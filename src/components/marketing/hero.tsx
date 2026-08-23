import { Check } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow, Shell } from "@/components/ui/shell";
import { HeroVisual } from "@/components/marketing/hero-visual";

const proofPoints = [
  { n: "01", label: "9 specialist agents, one org chart" },
  { n: "02", label: "Nightly cycle — execution while you sleep" },
  { n: "03", label: "Approval gates on every consequential action" },
] as const;

export function Hero() {
  return (
    <div className="hairline-b">
      <Shell className="grid gap-14 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div className="flex flex-col justify-center">
          <Eyebrow>Autonomous Business Platform</Eyebrow>

          <h1 className="font-display mt-7 text-[13.5vw] leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-[4.35rem] xl:text-[4.75rem]">
            An AI team
            <br />
            that runs your
            <br />
            business
            <span className="text-mute"> while</span>
            <br />
            <span className="text-mute">you sleep.</span>
          </h1>

          <p className="mt-8 max-w-md text-[17px] leading-relaxed text-slate">
            Nine specialized agents research your market, run outreach, post content, manage
            ads, track finance, and ship product — every night — and leave a structured report
            on your desk each morning.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <ButtonLink href="/sign-up" size="lg" withArrow>
              Start in sandbox
            </ButtonLink>
            <ButtonLink href="/how-it-works" variant="ghost" withArrow>
              See the nightly cycle
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
