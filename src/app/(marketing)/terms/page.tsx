import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { Section, Shell } from "@/components/ui/shell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing use of the AutoMSP website and services.",
};

const sections = [
  {
    heading: "The website",
    body: [
      "This website provides information about AutoMSP services. Content is provided in good faith for evaluation purposes. Benchmark figures shown are typical ranges, not guarantees of results for any specific organization.",
    ],
  },
  {
    heading: "The AI Opportunity Audit",
    body: [
      "The audit is a free, no-obligation assessment. Submitting a request does not create a client relationship. Assessments are prepared by AutoMSP strategists based on the information you provide; accuracy depends on the completeness of that information.",
    ],
  },
  {
    heading: "Engagements",
    body: [
      "Paid services are governed by individual Master Services Agreements and Statements of Work executed between AutoMSP and the client organization. Those agreements govern scope, deliverables, service levels, liability, and data handling.",
    ],
  },
  {
    heading: "Intellectual property",
    body: [
      "The AutoMSP name, logo, and site content are the property of AutoMSP. Systems built under engagement are governed by the IP terms of the applicable agreement.",
    ],
  },
] as const;

export default function TermsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        lede="The plain-language version. Executed agreements govern all paid engagements."
      />
      <Section>
        <Shell>
          <div className="mx-auto max-w-2xl">
            <p className="text-xs text-mute">Last updated: August 2026</p>
            {sections.map((s) => (
              <section key={s.heading} className="mt-12">
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
    </>
  );
}
