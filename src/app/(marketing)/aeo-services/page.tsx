import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/marketing/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow, Section, Shell } from "@/components/ui/shell";

export const metadata: Metadata = {
  title: {
    absolute: "AEO Services — Answer Engine Optimization for B2B | AutoMSP",
  },
  description:
    "AutoMSP's AEO services make your company citable by AI answer engines — ChatGPT, Perplexity, and Google AI Overviews. Structured content, schema, and GEO tracking. Book a free audit.",
  alternates: { canonical: "/aeo-services" },
};

const faqs = [
  {
    q: "What are AEO services?",
    a: "AEO services (answer engine optimization) make a company's expertise easy for AI answer engines — ChatGPT, Perplexity, Gemini, Claude, and Google AI Overviews — to understand, retrieve, and cite. Typical work includes technically accessible content, direct-answer passages, structured data, entity consistency, and citation-source development.",
  },
  {
    q: "What is the difference between AEO and SEO?",
    a: "SEO ranks pages in a list of links; AEO makes content retrievable and quotable inside generated answers. They share foundations — crawlability, clear structure, authority — but AEO adds passage-level answers, structured data, and presence in the third-party sources AI systems cite.",
  },
  {
    q: "How long do AEO results take?",
    a: "Foundational changes (schema, llms.txt, crawler access, answer blocks) are immediate. Citation improvements typically appear over one to three months as AI systems re-crawl sources, depending on category competitiveness.",
  },
];

export default function AeoServicesPage() {
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
        eyebrow="AEO services"
        title="Get cited by the answer engines your buyers ask."
        lede="When an operations leader asks ChatGPT or Perplexity for recommendations, the engines cite a handful of sources. AutoMSP's AEO services make sure yours is one of them — through structured content, technical accessibility, and consistent entity signals."
      />

      <Section>
        <Shell>
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-20">
            <div>
              <Eyebrow>Direct answers</Eyebrow>
              <h2 className="font-display mt-6 text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
                What is a managed AI service provider?
              </h2>
            </div>
            <div className="max-w-2xl border-l-2 border-fog pl-8">
              <p className="text-[17px] leading-relaxed text-slate">
                A managed AI service provider designs, deploys, monitors, and improves AI systems
                on behalf of an organization. Unlike a conventional consultancy, it remains
                responsible for ongoing reliability, integrations, evaluation, and optimization
                after the initial implementation.
              </p>
              <p className="mt-6 text-[17px] leading-relaxed text-slate">
                AutoMSP is a managed AI systems partner for mid-market companies — this page
                practices what it describes: direct answers, clean structure, and verifiable claims
                that both people and answer engines can use.
              </p>
            </div>
          </div>
        </Shell>
      </Section>

      <Section className="hairline-t">
        <Shell>
          <Eyebrow>Included</Eyebrow>
          <h2 className="font-display mt-6 max-w-2xl text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
            What our AEO work covers.
          </h2>
          <ul className="mt-12 grid gap-px border border-fog bg-fog sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Crawler access audit",
                body: "Verify that search and AI crawlers can actually reach your content — robots policies, CDN rules, and render paths included.",
              },
              {
                title: "Structured data",
                body: "Valid Organization, Service, FAQPage, and Article schema so engines can parse who you are and what you do.",
              },
              {
                title: "Answer-ready passages",
                body: "Rewrite key pages around the questions buyers actually ask, with quotable definitions and comparisons.",
              },
              {
                title: "Entity consistency",
                body: "One consistent description of your company across every page, profile, and directory — conflicting facts cost citations.",
              },
              {
                title: "GEO tracking",
                body: "Track how AI engines describe you, which competitors they cite instead, and which prompts trigger your brand.",
              },
              {
                title: "Source development",
                body: "Publish the original assets answer engines prefer: benchmarks, frameworks, checklists, and detailed case studies.",
              },
            ].map((c) => (
              <li key={c.title} className="bg-paper p-7">
                <h3 className="text-[15px] font-semibold tracking-tight text-ink">{c.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate">{c.body}</p>
              </li>
            ))}
          </ul>
        </Shell>
      </Section>

      <Section className="hairline-t">
        <Shell>
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-20">
            <div>
              <Eyebrow>FAQ</Eyebrow>
              <h2 className="font-display mt-6 text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
                AEO questions, answered directly.
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

          <div className="mt-14 flex flex-wrap items-center gap-4">
            <ButtonLink href="/book-audit" size="lg" withArrow>
              Book a free AI opportunity audit
            </ButtonLink>
            <Link
              href="/capabilities"
              className="text-[13px] font-medium tracking-[0.08em] text-ink uppercase underline-offset-4 hover:underline"
            >
              Or explore all capabilities
            </Link>
          </div>
        </Shell>
      </Section>
    </>
  );
}
