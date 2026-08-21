import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Eyebrow, Section, Shell } from "@/components/ui/shell";

const steps = [
  {
    n: "01",
    title: "Discover",
    body: "We identify high-impact AI opportunities aligned to your goals, constraints, and data reality.",
  },
  {
    n: "02",
    title: "Prioritize",
    body: "You receive three prioritized opportunities with impact and feasibility assessed for each.",
  },
  {
    n: "03",
    title: "Design & Build",
    body: "We architect, integrate, test, and deploy secure, production-ready AI systems.",
  },
  {
    n: "04",
    title: "Operate & Optimize",
    body: "We monitor, evaluate, and continuously improve every system we run for you.",
  },
] as const;

export function ApproachSteps() {
  return (
    <Section className="hairline-t">
      <Shell>
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-20">
          <div>
            <Eyebrow>Our approach</Eyebrow>
            <h2 className="font-display mt-6 text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
              Business impact first. Enterprise-grade by design.
            </h2>
            <Link
              href="/approach"
              className="mt-8 inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.08em] text-ink uppercase underline-offset-4 hover:underline"
            >
              More about our approach
              <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
            </Link>
          </div>

          <ol className="grid gap-px bg-fog sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s) => (
              <li key={s.n} className="bg-paper p-6 sm:p-7">
                <span className="tnum text-xs font-medium tracking-[0.2em] text-mute">{s.n}</span>
                <h3 className="mt-6 text-lg font-semibold tracking-tight text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </Shell>
    </Section>
  );
}
