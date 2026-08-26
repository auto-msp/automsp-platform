import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow, Section, Shell } from "@/components/ui/shell";

export const metadata: Metadata = {
  title: { absolute: "Managed AI Operations — Monitoring, Evaluation & Maintenance | AutoMSP" },
  description:
    "AutoMSP keeps production AI systems reliable after launch: nightly operational cycles, morning briefs, monitoring, evaluation suites, and continuous optimization. Book a free audit.",
  alternates: { canonical: "/managed-ai-operations" },
};

const activities = [
  {
    title: "Nightly operating cycle",
    body: "Once per day your workspace runs a full cycle: agents execute scheduled work, an orchestrator reviews what moved and what stalled, and you receive a structured morning brief — what ran, what we learned, what needs your decision.",
  },
  {
    title: "Monitoring with real numbers",
    body: "Execution counts, failure rates, approval latency, agent-run volume, and estimated model cost per workflow — recorded from actual operations, never fabricated. Your audit establishes the baseline.",
  },
  {
    title: "Evaluation before and after every change",
    body: "Changes to prompts, models, or workflows pass evaluation suites with recorded pass rates against known cases. A regression is caught in evaluation — not by your customers.",
  },
  {
    title: "Incident and failure handling",
    body: "Failed executions are surfaced, not swallowed. Repeated failures across clients become engineering fixes pushed to the platform — one tenant's edge case hardens everyone's system.",
  },
  {
    title: "Optimization against real usage",
    body: "Prompts, retrieval settings, and model routing are tuned based on recorded outcomes and cost data — cheaper where quality holds, stronger where it doesn't.",
  },
];

const faqs = [
  {
    q: "What exactly do I receive each day?",
    a: "A structured brief covering what ran overnight, what completed or failed, what was learned, and what requires your decision — including any items waiting in your approvals queue. Nothing consequential ships without your review regardless.",
  },
  {
    q: "How quickly are failures addressed?",
    a: "Failures are visible immediately in your workspace with retry and root-cause context. Committed response-time SLAs belong to managed engagements and are documented in the agreement rather than implied on a website.",
  },
  {
    q: "What if we want to change or expand a system later?",
    a: "That's the point of managed operations. New use cases are prioritized through the same discover-design-deploy path, building on existing integrations and infrastructure rather than starting over.",
  },
];

export default function ManagedAiOperationsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        eyebrow="Managed AI Operations"
        title="Deployment is day one. Operation is the product."
        lede="Models change, data drifts, business requirements move. AutoMSP monitors, evaluates, maintains, and improves production AI systems as an ongoing service — so reliability doesn't depend on whoever built it staying around."
      />

      <Section>
        <Shell>
          <div className="max-w-3xl">
            <Eyebrow>What ongoing operation includes</Eyebrow>
            <h2 className="font-display mt-6 text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
              The work that starts after launch.
            </h2>
          </div>
          <ul className="mt-12 grid gap-px border border-fog bg-fog sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((a) => (
              <li key={a.title} className="bg-paper p-7">
                <h3 className="text-[15px] font-semibold tracking-tight text-ink">{a.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate">{a.body}</p>
              </li>
            ))}
          </ul>
        </Shell>
      </Section>

      <Section className="hairline-t bg-haze/60">
        <Shell>
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <div>
              <Eyebrow>Why it matters</Eyebrow>
              <h2 className="font-display mt-6 text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
                Most AI systems fail quietly.
              </h2>
            </div>
            <div className="max-w-xl space-y-5 text-[16px] leading-relaxed text-slate">
              <p>
                An unmonitored automation doesn&rsquo;t announce its decay. Retrieval quality slips as
                documents change. A provider adjusts a model and outputs shift. Exceptions pile up
                in a queue nobody watches until someone asks why the numbers look wrong.
              </p>
              <p>
                Managed operations exists to catch that. Recorded runs, evaluation gates on every
                change, and a daily operating rhythm mean degradation is measured and corrected —
                not discovered at quarter end.</p>
            </div>
          </div>
        </Shell>
      </Section>

      <Section className="hairline-t">
        <Shell>
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-20">
            <div>
              <Eyebrow>FAQ</Eyebrow>
              <h2 className="font-display mt-6 text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
                Operating questions, answered.
              </h2>
            </div>
            <dl className="divide-y divide-fog border-y border-fog">
              {faqs.map((f) => (
                <div key={f.q} className="py-6">
                  <dt className="text-[15px] font-semibold tracking-tight text-ink">{f.q}</dt>
                  <dd className="mt-2 max-w-2xl text-sm leading-relaxed text-slate">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-14 flex flex-wrap items-center gap-6">
            <ButtonLink href="/book-audit" size="lg" withArrow>
              Book a free AI opportunity audit
            </ButtonLink>
            <ButtonLink href="/pricing" variant="ghost" withArrow>
              See engagement models
            </ButtonLink>
          </div>
        </Shell>
      </Section>
    </>
  );
}
