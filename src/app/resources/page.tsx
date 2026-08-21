import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/marketing/page-header";
import { AuditCta } from "@/components/marketing/audit-cta";
import { Section, Shell, Eyebrow } from "@/components/ui/shell";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Guides and playbooks for evaluating and operating AI automation in mid-market businesses.",
};

const resources = [
  {
    slug: "ai-opportunity-guide",
    type: "Guide",
    title: "How to Identify AI Opportunities Worth Building",
    description:
      "A practical framework for scoring automation candidates on impact, frequency, feasibility, and strategic fit — the same model we use in our audits.",
    readTime: "12 min read",
  },
  {
    slug: "human-in-the-loop",
    type: "Playbook",
    title: "Human-in-the-Loop: Designing Approval Gates That Work",
    description:
      "Where to place approval gates, how to route exceptions, and how to keep people in control without creating bottlenecks.",
    readTime: "9 min read",
  },
  {
    slug: "measuring-ai-roi",
    type: "Guide",
    title: "Measuring AI Automation ROI Without Fooling Yourself",
    description:
      "Calculation methods for hours saved, cost avoided, and cycle-time reduction — with the caveats that keep numbers honest.",
    readTime: "10 min read",
  },
] as const;

export default function ResourcesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Resources"
        title="Guides for operators, not hype for tourists."
        lede="Practical material on evaluating, building, and operating AI systems. No prompts-and-tricks content."
      />

      <Section>
        <Shell>
          <ul className="divide-y divide-fog border-y border-fog">
            {resources.map((r, i) => (
              <li key={r.slug}>
                <Link
                  href={`/resources/${r.slug}`}
                  className="group grid gap-2 py-8 transition-colors hover:bg-surface/70 sm:grid-cols-[4rem_6rem_1fr_auto] sm:items-baseline sm:gap-8"
                >
                  <span className="tnum text-xs font-medium tracking-[0.2em] text-mute">0{i + 1}</span>
                  <span className="text-[11px] font-medium tracking-[0.18em] text-mute uppercase">
                    {r.type}
                  </span>
                  <span>
                    <h2 className="text-lg font-semibold tracking-tight text-ink group-hover:underline group-hover:underline-offset-4">
                      {r.title}
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate">{r.description}</p>
                  </span>
                  <span className="text-xs text-mute">{r.readTime}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-14 border border-fog bg-haze/50 p-8 sm:p-10">
            <Eyebrow>Case studies &amp; customer stories</Eyebrow>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate">
              We publish customer outcomes only with written permission and only with the
              calculation methods attached. As engagements complete and clients approve publication,
              case studies will appear here — never before, never fabricated.
            </p>
          </div>
        </Shell>
      </Section>

      <AuditCta />
    </>
  );
}
