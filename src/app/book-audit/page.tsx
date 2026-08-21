import type { Metadata } from "next";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { Section, Shell, Eyebrow } from "@/components/ui/shell";
import { AuditForm } from "./audit-form";

export const metadata: Metadata = {
  title: "Book a Free AI Opportunity Audit",
  description:
    "Tell us about your operations and receive three prioritized AI opportunities with impact and feasibility assessment — plus a high-level implementation path. Free, no obligations.",
};

const youGet = [
  "3 prioritized AI opportunities, tailored to your business",
  "Impact vs. effort assessment for each opportunity",
  "A high-level implementation path and recommendations",
  "No obligations. Just clarity.",
];

export default function BookAuditPage() {
  return (
    <>
      <PageHeader
        eyebrow="Free AI opportunity audit"
        title="Get your 3 prioritized AI opportunities."
        lede="A focused assessment for COOs, CIOs, CTOs, and operations leaders seeking practical AI that drives measurable results."
      />

      <Section>
        <Shell>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
            <aside>
              <Eyebrow>What you receive</Eyebrow>
              <ul className="mt-6 space-y-4">
                {youGet.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[15px] text-graphite">
                    <Check className="mt-0.5 size-4 shrink-0 text-ink" strokeWidth={2.25} aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-8 border-l-2 border-ink/15 pl-5 text-sm leading-relaxed text-slate">
                This is a human-led assessment. We review your submission, and if your operations
                look like a fit, we schedule a 30-minute working session with an AutoMSP
                strategist. We do not claim AI has analyzed your business until we actually do the
                work.
              </p>
            </aside>

            <AuditForm />
          </div>
        </Shell>
      </Section>
    </>
  );
}
