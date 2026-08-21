import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { AuditCta } from "@/components/marketing/audit-cta";
import { Section, Shell } from "@/components/ui/shell";

const articles: Record<
  string,
  {
    title: string;
    description: string;
    sections: { heading: string; body: string[] }[];
  }
> = {
  "ai-opportunity-guide": {
    title: "How to Identify AI Opportunities Worth Building",
    description:
      "A practical framework for scoring automation candidates on impact, frequency, feasibility, and strategic fit.",
    sections: [
      {
        heading: "Start with the work, not the technology",
        body: [
          "The worst way to find AI opportunities is to ask 'where can we use AI?' The right question is: where does skilled human time disappear into repetitive, rules-adjacent work? List the processes that consume the most hours, break most often, or block growth. That list — not a model catalog — is your opportunity inventory.",
          "Good candidates share three traits: high volume (they happen daily or weekly), structured context (the inputs exist in systems, documents, or defined formats), and tolerable error profiles (a draft can be wrong if a human approves it; a financial posting cannot).",
        ],
      },
      {
        heading: "Score on four dimensions",
        body: [
          "Score each candidate on Business Impact (hours, cost, revenue touched), Frequency (how often it runs), Feasibility (data availability, integration reality, edge-case density), and Strategic Fit (does it compound toward a capability you want?). We multiply rather than add: a zero in any dimension disqualifies the candidate this quarter.",
          "The exact weights should reflect your business. A 2% process improvement at a 50,000-order company beats a 40% improvement at a 200-order company.",
        ],
      },
      {
        heading: "Pick three. Not thirty.",
        body: [
          "The failure mode of AI programs is a long roadmap of half-built things. Choose the top three opportunities, design them properly, and ship one before expanding. Momentum and internal trust come from operational systems, not slide progress.",
          "This is exactly what the AutoMSP AI Opportunity Audit produces: three scored, scoped opportunities with an implementation path for the first.",
        ],
      },
    ],
  },
  "human-in-the-loop": {
    title: "Human-in-the-Loop: Designing Approval Gates That Work",
    description:
      "Where to place approval gates, how to route exceptions, and how to keep people in control without creating bottlenecks.",
    sections: [
      {
        heading: "Approvals belong on consequential, irreversible actions",
        body: [
          "An approval gate costs a human waking minute. Spend those minutes where a mistake is expensive or irreversible: external communications, financial movements, permission changes, deletions. Summaries, classifications, and drafts rarely need gates; sends, posts, and payments always do.",
          "Design the gate with full context: the reviewer should see what triggered the action, the inputs, the proposed output, and the risk level — approving blind is rubber-stamping, not control.",
        ],
      },
      {
        heading: "Route exceptions explicitly, never implicitly",
        body: [
          "Low confidence, missing data, contradictory inputs, novel cases — these must escalate by design. The anti-pattern is a workflow that 'does its best' when uncertain and buries the result in a log nobody reads.",
          "Define the exception queue, its owner, its SLA, and what the system does while waiting (pause, not guess). Then every decision — approve, reject, request changes — gets logged with reviewer identity and timestamp.",
        ],
      },
      {
        heading: "Calibrate over time",
        body: [
          "As evaluation data accumulates, some gated actions earn auto-approval within defined bounds — and some auto-approved actions earn gates back when drift appears. Human-in-the-loop is a dial you tune with evidence, not a switch you set once.",
        ],
      },
    ],
  },
  "measuring-ai-roi": {
    title: "Measuring AI Automation ROI Without Fooling Yourself",
    description:
      "Calculation methods for hours saved, cost avoided, and cycle-time reduction — with the caveats that keep numbers honest.",
    sections: [
      {
        heading: "Anchor every metric to a measured baseline",
        body: [
          "Before automating, measure current handling time, volume, error rate, and rework. Without a baseline, 'hours saved' is astrology. Instrument the process for four weeks if you can; accept ranges, not point estimates.",
          "Then label every reported number: Actual (measured from execution logs), Estimated (extrapolated from measured samples), or Projected (modeled from assumptions). Blend them and nobody will — or should — trust the report.",
        ],
      },
      {
        heading: "Hours saved ≠ value created",
        body: [
          "An hour saved only matters if it converts to throughput, quality, or cost. Report the conversion: did ticket capacity rise without hiring? Did close rates improve? Did overtime fall? Hours saved is the input; business movement is the outcome.",
        ],
      },
      {
        heading: "Count the costs honestly",
        body: [
          "Include integration maintenance, monitoring time, model spend, and the human minutes spent on approvals and exception handling. A workflow that saves ten hours and consumes two hours of review is still an 8-hour win — but only if you count the two.",
        ],
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(articles).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = articles[slug];
  if (!article) return {};
  return { title: article.title, description: article.description };
}

export default async function ResourceArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = articles[slug];
  if (!article) {
    const { notFound } = await import("next/navigation");
    notFound();
  }

  return (
    <>
      <PageHeader eyebrow="Resource" title={article.title} lede={article.description} />

      <Section>
        <Shell>
          <div className="mx-auto max-w-2xl">
            <Link
              href="/resources"
              className="mb-10 inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.08em] text-slate uppercase hover:text-ink"
            >
              <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden />
              All resources
            </Link>
            {article.sections.map((s) => (
              <section key={s.heading} className="mb-12">
                <h2 className="text-2xl font-semibold tracking-tight text-ink">{s.heading}</h2>
                {s.body.map((p, i) => (
                  <p key={i} className="mt-4 text-[15px] leading-relaxed text-slate">
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </Shell>
      </Section>

      <AuditCta />
    </>
  );
}
