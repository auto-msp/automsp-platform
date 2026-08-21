import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/marketing/page-header";
import { AuditCta } from "@/components/marketing/audit-cta";
import { Section, Shell } from "@/components/ui/shell";
import { industries } from "@/lib/content";

export const metadata: Metadata = {
  title: "Industries",
  description:
    "AutoMSP industry focus: manufacturing, logistics, professional services, healthcare operations, and financial services.",
};

export default function IndustriesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Industries"
        title="Built for operations-heavy businesses."
        lede="We focus where workflow volume, system complexity, and compliance requirements make managed AI systems pay for themselves."
      />

      <Section>
        <Shell>
          <div className="grid gap-px border border-fog bg-fog md:grid-cols-2">
            {industries.map((ind) => (
              <Link
                key={ind.slug}
                href={`/industries/${ind.slug}`}
                className="group bg-surface p-8 transition-colors hover:bg-haze/50 sm:p-10"
              >
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-semibold tracking-tight text-ink">{ind.title}</h2>
                  <ArrowUpRight
                    className="size-5 shrink-0 text-mute transition-colors group-hover:text-ink"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </div>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-slate">{ind.summary}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {ind.systems.map((s) => (
                    <span
                      key={s}
                      className="border border-fog px-3 py-1 text-[11px] font-medium tracking-[0.08em] text-slate uppercase"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
          <p className="mt-8 text-sm text-slate">
            Your industry isn&rsquo;t listed? The operating model transfers —{" "}
            <Link href="/book-audit" className="font-medium text-ink underline-offset-4 hover:underline">
              book an audit
            </Link>{" "}
            and we&rsquo;ll assess fit.
          </p>
        </Shell>
      </Section>

      <AuditCta />
    </>
  );
}
