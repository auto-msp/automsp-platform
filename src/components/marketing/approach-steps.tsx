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
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-20">
          <div>
            <Eyebrow>Process</Eyebrow>
            <h2 className="font-display mt-6 text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
              A controlled path from opportunity to production.
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
              <li key={s.n} className="flex flex-col bg-paper p-6 sm:p-7">
                <span className="tnum text-xs font-medium tracking-[0.2em] text-mute">{s.n}</span>
                <h3 className="mt-6 text-lg font-semibold tracking-tight text-ink">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate">{s.body}</p>
                <p className="mt-4 border-t border-fog pt-3 text-[12px] leading-snug text-graphite">
                  <span className="font-medium tracking-[0.08em] text-mute uppercase">Deliverable</span>
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
