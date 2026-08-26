import type { Metadata } from "next";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow, Section, Shell } from "@/components/ui/shell";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Engagement models for managed AI systems: a free AI opportunity audit, fixed-fee automation pilots from $7,500, and managed AI infrastructure from $12,000/month.",
};

const tiers = [
  {
    name: "AI Opportunity Audit",
    price: "Free",
    for: "For companies deciding where AI can produce practical operational value.",
    items: [
      "30-minute discovery session",
      "Three prioritized opportunities",
      "High-level impact and feasibility assessment",
      "Recommended implementation path",
    ],
    cta: { label: "Book your audit", href: "/book-audit" },
  },
  {
    name: "AI Automation Pilot",
    price: "Starting at $7,500",
    for: "For proving one high-value workflow before broader deployment.",
    items: [
      "One production workflow",
      "Up to three system integrations",
      "Testing and documentation",
      "Human approval controls",
      "30 days of post-launch support",
    ],
    cta: { label: "Discuss a pilot", href: "/contact" },
  },
  {
    name: "Managed AI Infrastructure",
    price: "Starting at $12,000/month",
    featured: true,
    for: "For organizations treating AI as an ongoing operating capability.",
    items: [
      "Managed cloud and AI infrastructure",
      "Multiple automations or agents",
      "RAG and enterprise data connections",
      "Monitoring and evaluation",
      "Ongoing engineering support and monthly optimization",
    ],
    cta: { label: "Book a strategy call", href: "/book-audit" },
  },
  {
    name: "AI Department as a Service",
    price: "Custom",
    for: "For organizations needing an ongoing cross-functional AI delivery team.",
    items: [
      "AI strategy and roadmap",
      "Multi-agent and voice systems",
      "Governance and LLM operations",
      "Priority development capacity",
      "Service-level commitments",
      "Quarterly executive reviews",
    ],
    cta: { label: "Contact AutoMSP", href: "/contact" },
  },
];

// What each term means commercially — removes scope ambiguity before
// procurement ever asks.
const definitions = [
  {
    term: "Workflow",
    definition:
      "One repeatable business process with a defined trigger, steps, systems touched, and exception path.",
  },
  {
    term: "Agent",
    definition:
      "Task-scoped software that uses models and tools within granted permissions, escalation rules, and human-approval requirements.",
  },
  {
    term: "Integration",
    definition:
      "One authenticated connection between your platform environment and an external system such as a CRM, ERP, or support desk.",
  },
  {
    term: "Production deployment",
    definition:
      "Running against live data with monitoring, logging, evaluation, and a documented rollback path.",
  },
];

const faqs = [
  {
    q: "Why does pricing start at a range rather than a fixed number?",
    a: "Scope depends on integration complexity, data quality, and security review. Starting prices reflect typical scope; you receive a fixed quote after discovery so there are no surprises mid-project.",
  },
  {
    q: "What is excluded from pilot pricing?",
    a: "Third-party subscriptions (model usage above included allowances, platform licenses, ad spend) are billed directly by their providers. Change requests beyond the defined workflow scope are quoted separately.",
  },
  {
    q: "Do I need my own API keys?",
    a: "No. Model usage is metered into your engagement. If you want to bring your own provider key later, workspaces support Anthropic, OpenAI, and Google with server-side keys only — keys never touch the client.",
  },
  {
    q: "Can the agents spend money without asking?",
    a: "No. Every consequential action — spending, publishing, sending, deploying — pauses in your approvals center with the exact arguments recorded. Approve, reject, or tighten the guardrails.",
  },
  {
    q: "Who owns what we build together?",
    a: "Ownership terms — code, workflow definitions, cloud accounts, and data — are documented in the engagement agreement before work begins. We address portability and post-contract access explicitly rather than in fine print.",
  },
] as const;

export default function PricingPage() {
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
        eyebrow="Pricing"
        title="Start with a defined opportunity, then scale what works."
        lede="Four engagement models, from a free audit to a fully managed AI department. Starting prices reflect typical scope; every quote is fixed after discovery."
      />

      <Section>
        <Shell>
          <ul className="grid gap-px border border-fog bg-fog sm:grid-cols-2 xl:grid-cols-4">
            {tiers.map((t) => (
              <li
                key={t.name}
                className={cn("flex flex-col p-7 sm:p-8", t.featured ? "bg-surface" : "bg-paper")}
              >
                <h2 className="text-[15px] font-semibold tracking-tight text-ink">{t.name}</h2>
                <p className="tnum font-display mt-4 text-3xl tracking-tight text-ink">{t.price}</p>
                <p className="mt-2 text-[13px] leading-snug text-slate">{t.for}</p>
                <ul className="mt-5 flex-1 space-y-2.5 border-t border-fog pt-5">
                  {t.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-[13px] leading-snug text-graphite"
                    >
                      <Check className="mt-0.5 size-3.5 shrink-0 text-ink" strokeWidth={2.25} aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
                <ButtonLink
                  href={t.cta.href}
                  variant={t.featured ? "primary" : "secondary"}
                  className="mt-7 w-full justify-center"
                >
                  {t.cta.label}
                </ButtonLink>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-mute">
            Prices exclude third-party subscriptions billed directly by providers. Final quotes are
            fixed after the discovery session.
          </p>
        </Shell>
      </Section>

      <Section className="hairline-t">
        <Shell>
          <div className="max-w-3xl">
            <Eyebrow>Definitions</Eyebrow>
            <h2 className="font-display mt-6 text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
              What our terms mean, precisely.
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate">
              Scope disputes start with vague words. These definitions appear in our proposals with
              the same wording.
            </p>
          </div>
          <dl className="mt-10 grid gap-px border border-fog bg-fog sm:grid-cols-2">
            {definitions.map((d) => (
              <div key={d.term} className="bg-paper p-6">
                <dt className="text-[14px] font-semibold tracking-tight text-ink">{d.term}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-slate">{d.definition}</dd>
              </div>
            ))}
          </dl>
        </Shell>
      </Section>

      <Section className="hairline-t">
        <Shell>
          <div className="max-w-3xl">
            <Eyebrow>Questions, answered plainly</Eyebrow>
            <h2 className="font-display mt-6 text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
              Commercial questions buyers ask first.
            </h2>
          </div>
          <div className="mt-8 max-w-3xl divide-y divide-fog border-y border-fog">
            {faqs.map((faq) => (
              <details key={faq.q} className="group py-6">
                <summary className="flex cursor-pointer items-baseline justify-between gap-4 text-[16px] font-medium text-ink marker:content-none">
                  {faq.q}
                  <span
                    aria-hidden
                    className={cn(
                      "mt-1 shrink-0 text-xl leading-none text-mute transition-transform duration-200",
                      "group-open:rotate-45",
                    )}
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-slate">{faq.a}</p>
              </details>
            ))}
          </div>
        </Shell>
      </Section>
    </>
  );
}
