import { ButtonLink } from "@/components/ui/button";
import { Eyebrow, Section, Shell } from "@/components/ui/shell";

const tiers: readonly {
  name: string;
  price: string;
  for: string;
  featured?: boolean;
  items: readonly string[];
  cta: { label: string; href: string };
}[] = [
  {
    name: "AI Opportunity Audit",
    price: "Free",
    for: "For companies deciding where AI can produce practical operational value.",
    items: [
      "Discovery session",
      "Three prioritized opportunities",
      "High-level impact assessment",
      "Recommended implementation path",
    ],
    cta: { label: "Book your audit", href: "/book-audit" },
  },
  {
    name: "AI Automation Pilot",
    price: "Starting at $7,500",
    for: "For proving one high-value workflow before expanding.",
    items: [
      "One production workflow",
      "Defined system integrations",
      "Testing and documentation",
      "Human approval controls",
      "Post-launch support",
    ],
    cta: { label: "Discuss a pilot", href: "/contact" },
  },
  {
    name: "Managed AI Infrastructure",
    price: "Starting at $12,000/month",
    featured: true,
    for: "For companies adopting AI as an ongoing operational capability.",
    items: [
      "Managed AI infrastructure",
      "Automation and agent development",
      "RAG and system integrations",
      "Monitoring and evaluation",
      "Ongoing engineering support",
    ],
    cta: { label: "Book a strategy call", href: "/book-audit" },
  },
  {
    name: "AI Department as a Service",
    price: "Custom",
    for: "For organizations requiring a dedicated, ongoing AI delivery partner.",
    items: [
      "AI roadmap and architecture",
      "Prioritized development capacity",
      "Multi-agent and voice systems",
      "Governance and LLM operations",
      "Service-level commitments",
      "Executive strategy reviews",
    ],
    cta: { label: "Contact AutoMSP", href: "/contact" },
  },
] as const;

export function PricingSection() {
  return (
    <Section className="hairline-t">
      <Shell>
        <div className="max-w-3xl">
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="font-display mt-6 text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
            Start with a defined opportunity, then scale what works.
          </h2>
        </div>

        <ul className="mt-12 grid gap-px border border-fog bg-fog sm:grid-cols-2 xl:grid-cols-4">
          {tiers.map((t) => (
            <li key={t.name} className={`flex flex-col p-7 ${t.featured ? "bg-surface" : "bg-paper"}`}>
              <h3 className="text-[15px] font-semibold tracking-tight text-ink">{t.name}</h3>
              <p className="tnum font-display mt-4 text-2xl text-ink">{t.price}</p>
              <p className="mt-2 text-[13px] leading-snug text-slate">{t.for}</p>
              <ul className="mt-5 flex-1 space-y-2 border-t border-fog pt-5">
                {t.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] leading-snug text-graphite">
                    <span aria-hidden className="mt-0.5 text-mute">·</span>
                    {item}
                  </li>
                ))}
              </ul>
              <ButtonLink
                href={t.cta.href}
                variant={t.featured ? "primary" : "secondary"}
                className="mt-6 w-full justify-center"
              >
                {t.cta.label}
              </ButtonLink>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-mute">
          Starting prices reflect typical scope; final pricing depends on integrations, data
          readiness, and security requirements.
        </p>
      </Shell>
    </Section>
  );
}
