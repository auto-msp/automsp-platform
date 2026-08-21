import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { AuditCta } from "@/components/marketing/audit-cta";
import { Section, Shell, Eyebrow } from "@/components/ui/shell";

export const metadata: Metadata = {
  title: "Approach",
  description:
    "From opportunity to operational impact: Discover, Prioritize, Design & Build, Operate & Optimize. The AutoMSP delivery model for managed AI systems.",
};

const phases = [
  {
    n: "01",
    title: "Discover",
    duration: "Week 1–2",
    body: "We learn your business, your workflows, your systems, and where time and money leak. Interviews with process owners, a systems inventory, and a data reality check — not a slide-ware survey.",
    deliverables: ["Process & systems map", "Opportunity long-list", "Data readiness notes"],
  },
  {
    n: "02",
    title: "Prioritize",
    duration: "Week 2–3",
    body: "We score every opportunity on business impact, frequency, feasibility, and strategic fit. You receive three prioritized opportunities — each with an impact estimate, complexity assessment, and implementation path.",
    deliverables: ["3 prioritized opportunities", "Impact × feasibility scoring", "High-level implementation path"],
  },
  {
    n: "03",
    title: "Design & Build",
    duration: "Week 3–8",
    body: "We architect for security and reversibility first: permission scopes, approval gates, evaluation harnesses. Then we build, integrate, and test against real workloads — with you reviewing at defined checkpoints.",
    deliverables: ["Solution architecture", "Working system in staging", "Evaluation & test evidence"],
  },
  {
    n: "04",
    title: "Operate & Optimize",
    duration: "Ongoing",
    body: "Deployment is the midpoint, not the finish. We monitor executions, investigate failures, tune models and prompts, and report business impact monthly. When better models ship, your systems get better.",
    deliverables: ["24/7 monitoring & incident response", "Monthly impact report", "Continuous model & workflow optimization"],
  },
] as const;

export default function ApproachPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our approach"
        title="From opportunity to operational impact."
        lede="A disciplined path that keeps you in control at every step — and keeps improving your systems after go-live."
      />

      <div className="hairline-b">
        {phases.map((p, i) => (
          <Section key={p.n} className={i > 0 ? "hairline-t" : undefined}>
            <Shell>
              <div className="grid gap-8 lg:grid-cols-[0.5fr_1.5fr_1fr] lg:gap-16">
                <div>
                  <span className="tnum font-display text-7xl leading-none text-fog">{p.n}</span>
                  <p className="mt-4 text-[11px] font-medium tracking-[0.18em] text-mute uppercase">
                    {p.duration}
                  </p>
                </div>
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight text-ink">{p.title}</h2>
                  <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate">{p.body}</p>
                </div>
                <div>
                  <Eyebrow>What you receive</Eyebrow>
                  <ul className="mt-4 space-y-3">
                    {p.deliverables.map((d) => (
                      <li key={d} className="border-l-2 border-ink/15 pl-4 text-sm text-graphite">
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Shell>
          </Section>
        ))}
      </div>

      <AuditCta />
    </>
  );
}
