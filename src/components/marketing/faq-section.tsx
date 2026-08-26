import Link from "next/link";
import { Eyebrow, Section, Shell } from "@/components/ui/shell";

const faqs = [
  {
    q: "What does AutoMSP do?",
    a: "AutoMSP designs, deploys, and operates AI infrastructure, workflow automations, and task-focused agents for mid-market companies. We work across strategy, engineering, integration, monitoring, and ongoing improvement.",
  },
  {
    q: "How is AutoMSP different from an AI consultancy?",
    a: "A consultancy may deliver recommendations or a prototype. AutoMSP remains responsible for deployment, integration, monitoring, maintenance, and continuous optimization after launch.",
  },
  {
    q: "Do you work with our existing systems?",
    a: "Yes. AutoMSP connects AI workflows with existing CRM, ERP, support, communication, cloud, and data platforms. Feasibility depends on available APIs, permissions, data quality, and security requirements.",
  },
  {
    q: "What is the difference between AI automation and an AI agent?",
    a: "AI automation follows a defined process for repeatable work. An AI agent can interpret context and choose among permitted tools or actions. Production solutions often use agents inside controlled automated workflows.",
  },
  {
    q: "How long does implementation take?",
    a: "A focused pilot may be delivered in several weeks. Larger multi-system deployments are implemented in phases. Timing depends on integrations, data readiness, security review, and testing requirements.",
  },
  {
    q: "Can a person approve an AI-generated action?",
    a: "Yes. Sensitive steps can be configured to require human review before an email is sent, a record is modified, or another consequential action is executed.",
  },
  {
    q: "What is AEO?",
    a: "Answer engine optimization improves how clearly a company and its expertise can be understood, retrieved, and cited by AI-assisted search and answer systems. It combines technically accessible content, structured information, authority, and direct answers to relevant questions.",
  },
] as const;

export function FaqSection() {
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
    <Section className="hairline-t">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Shell>
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-20">
          <div>
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="font-display mt-6 text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
              Questions buyers ask first.
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

        <p className="mt-8 text-xs text-mute">
          Commercial terms — including code ownership, data handling, and post-contract access —
          are documented during engagement. See{" "}
          <Link href="/security" className="underline underline-offset-4 hover:text-graphite">
            security
          </Link>{" "}
          and{" "}
          <Link href="/terms" className="underline underline-offset-4 hover:text-graphite">
            terms
          </Link>
          .
        </p>
      </Shell>
    </Section>
  );
}
