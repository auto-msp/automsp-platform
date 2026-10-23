import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Eyebrow, Section, Shell } from "@/components/ui/shell";

const steps = [
  {
    n: "01",
    title: "Discover",
    body: "We map the workflow, systems, data, bottlenecks, and business objective.",
    deliverable: "Prioritized opportunity brief",
  },
  {
    n: "02",
    title: "Design",
    body: "We define the architecture, integrations, success metrics, controls, and rollout plan.",
    deliverable: "Technical and implementation blueprint",
  },
  {
    n: "03",
    title: "Deploy",
    body: "We build, test, document, and release the system through a controlled production rollout.",
    deliverable: "Working production system",
  },
  {
    n: "04",
    title: "Operate",
    body: "We monitor outcomes, resolve failures, optimize performance, and expand successful use cases.",
    deliverable: "Ongoing performance and improvement plan",
  },
] as const;

export function ApproachSteps() {
  return (
    <Section className="hairline-t">
      <Shell>
        <div>
          <div>
            <Eyebrow>Process</Eyebrow>
            <h2 className="font-display mt-6 max-w-2xl text-balance text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
              A controlled path from opportunity to production.
            </h2>
            <Link
              href="/approach"
              className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink underline underline-offset-4 hover:text-accent"
            >
              More about our approach
              <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
            </Link>
          </div>

          {/* Timeline: a rule with a node per step; stacks to a vertical rail on small screens. */}
          <ol className="relative mt-14 grid gap-10 border-l border-line pl-8 sm:grid-cols-2 sm:gap-x-10 lg:grid-cols-4 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-8">
            {steps.map((s) => (
              <li key={s.n} className="relative flex flex-col">
                <span
                  aria-hidden
                  className="absolute top-1.5 -left-[2.4rem] size-3 rounded-full border-2 border-ink bg-paper lg:-top-[2.1rem] lg:left-0"
                />
                <span className="tnum text-xs font-medium tracking-[0.14em] text-mute">{s.n}</span>
                <h3 className="font-display mt-2 text-3xl tracking-tight text-ink">{s.title}</h3>
                <p className="mt-2 flex-1 text-[15px] leading-relaxed text-slate">{s.body}</p>
                <p className="mt-4 border-t border-fog pt-3 text-[13px] leading-snug text-graphite">
                  <span className="text-xs font-medium tracking-[0.1em] text-mute uppercase">Deliverable</span>
                  <br />
                  {s.deliverable}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </Shell>
    </Section>
  );
}
