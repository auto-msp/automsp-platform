import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/marketing/page-header";
import { Section, Shell, Eyebrow } from "@/components/ui/shell";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to AutoMSP about managed AI systems for your business.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Tell us what you're trying to improve."
        lede="The fastest way to evaluate fit is the AI Opportunity Audit. For everything else, write to us directly."
      />

      <Section>
        <Shell>
          <div className="grid gap-px border border-fog bg-fog sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-surface p-8 sm:p-10">
              <Eyebrow>Fastest path</Eyebrow>
              <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                AI Opportunity Audit
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                Structured assessment, three prioritized opportunities, implementation path. Free.
              </p>
              <Link
                href="/book-audit"
                className="group mt-6 inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.08em] text-ink uppercase underline-offset-4 hover:underline"
              >
                Book an audit
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.75} aria-hidden />
              </Link>
            </div>
            <div className="bg-surface p-8 sm:p-10">
              <Eyebrow>Direct</Eyebrow>
              <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">Email us</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                For partnerships, security reviews, or general questions.
              </p>
              <a
                href={`mailto:${site.email}`}
                className="mt-6 inline-block text-[13px] font-medium tracking-[0.08em] text-ink uppercase underline-offset-4 hover:underline"
              >
                {site.email}
              </a>
            </div>
            <div className="bg-surface p-8 sm:p-10 sm:col-span-2 lg:col-span-1">
              <Eyebrow>Existing clients</Eyebrow>
              <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">Client portal</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                The client portal is provisioned per engagement. Contact your engagement lead for
                access.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.08em] text-mute uppercase">
                Available with engagements
              </span>
            </div>
          </div>
        </Shell>
      </Section>
    </>
  );
}
