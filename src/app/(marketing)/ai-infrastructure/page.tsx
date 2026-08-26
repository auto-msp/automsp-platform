import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow, Section, Shell } from "@/components/ui/shell";

export const metadata: Metadata = {
  title: { absolute: "AI Infrastructure Services for Mid-Market Companies | AutoMSP" },
  description:
    "Secure model access, enterprise RAG, integrations, and cost-transparent AI infrastructure — designed, deployed, and operated by AutoMSP. Book a free audit.",
  alternates: { canonical: "/ai-infrastructure" },
};

const pillars = [
  {
    title: "Provider-neutral model access",
    body: "We select the right model per task across Anthropic, OpenAI, and Google — routed by complexity and cost. No single-vendor lock-in; when providers change pricing or capabilities, your stack adapts without a rebuild.",
  },
  {
    title: "Enterprise RAG that admits uncertainty",
    body: "Your documents are chunked, embedded, and retrieved with semantic search — with lexical fallback when embeddings are unavailable. Retrieval always reports which method served an answer, so grounded and ungrounded responses are never confused.",
  },
  {
    title: "Credentials that never touch the client",
    body: "API keys live server-side in a credential vault. They are never returned to browsers, never written to client-visible stores, never logged. Provider errors surface status codes, not secrets.",
  },
  {
    title: "Cost transparency at list price",
    body: "Every model call is recorded with token counts and estimated USD cost at public list prices. You see what AI actually costs per workflow — the invoice reconciles against recorded runs, not estimates.",
  },
];

const faqs = [
  {
    q: "Which cloud do you deploy on?",
    a: "Client-selected infrastructure: major clouds, private environments, or hybrid. The architecture is portable — model providers, databases, and orchestration layers are chosen per security requirements rather than dictated by us.",
  },
  {
    q: "How do you prevent vendor lock-in on models?",
    a: "The platform abstracts model providers behind one interface. Agents reference model keys, not vendor APIs, so switching providers is configuration — not a rewrite.",
  },
  {
    q: "How is our data isolated from other clients?",
    a: "Every tenant's resources carry organization-scoped identifiers enforced at the database layer. Knowledge bases, credentials, run history, and documents are partitioned per organization by design.",
  },
];

export default function AiInfrastructurePage() {
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
        eyebrow="AI Infrastructure"
        title="A foundation for production AI that survives due diligence."
        lede="AutoMSP designs and operates the layer most companies skip: managed model access, enterprise retrieval, integration plumbing, access controls, and per-call cost visibility — built to pass your CTO's review, not just a demo."
      />

      <Section>
        <Shell>
          <div className="max-w-3xl">
            <Eyebrow>Architecture principles</Eyebrow>
            <h2 className="font-display mt-6 text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
              Four decisions that separate production from prototype.
            </h2>
          </div>
          <ul className="mt-12 grid gap-px border border-fog bg-fog sm:grid-cols-2">
            {pillars.map((p) => (
              <li key={p.title} className="bg-paper p-7 sm:p-8">
                <h3 className="text-[16px] font-semibold tracking-tight text-ink">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate">{p.body}</p>
              </li>
            ))}
          </ul>
        </Shell>
      </Section>

      <Section className="hairline-t bg-haze/60">
        <Shell>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
            <div>
              <Eyebrow>Controls</Eyebrow>
              <h2 className="font-display mt-6 text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
                Built-in, not bolted on.
              </h2>
            </div>
            <ul className="divide-y divide-fog border-y border-fog">
              {[
                "Role-based access with least-privilege grants per agent and tool",
                "Human approval gates on every consequential action by default",
                "Sandbox mode: nothing external dispatches until you opt out",
                "Full run transcripts — every prompt, tool call, and output recorded",
                "Evaluation suites with recorded pass rates before and after changes",
              ].map((item) => (
                <li key={item} className="py-4 text-sm leading-relaxed text-graphite">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Shell>
      </Section>

      <Section className="hairline-t">
        <Shell>
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-20">
            <div>
              <Eyebrow>FAQ</Eyebrow>
              <h2 className="font-display mt-6 text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
                Technical questions, direct answers.
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
            <ButtonLink href="/security" variant="ghost" withArrow>
              Review our security approach
            </ButtonLink>
          </div>
        </Shell>
      </Section>
    </>
  );
}
