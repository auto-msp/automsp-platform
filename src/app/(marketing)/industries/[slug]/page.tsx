import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { AuditCta } from "@/components/marketing/audit-cta";
import { Section, Shell, Eyebrow } from "@/components/ui/shell";
import { JsonLd } from "@/components/seo/json-ld";
import { getIndustry, industries } from "@/lib/content";
import { breadcrumbSchema, jsonLdGraph, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return industries.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) return {};
  return pageMetadata({
    // Sector name alone is too generic for a search result; the topical
    // qualifier carries the actual intent of the page.
    title: `${industry.title} — AI Automation`,
    description: industry.summary,
    path: `/industries/${industry.slug}`,
  });
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) notFound();

  return (
    <>
      {/* No Service node here: an industry page describes how our services apply
          to a sector, it is not itself a distinct offering. Breadcrumbs only. */}
      <JsonLd
        data={jsonLdGraph(
          breadcrumbSchema([
            ["Home", "/"],
            ["Industries", "/industries"],
            [industry.title, `/industries/${industry.slug}`],
          ]),
        )}
      />
      <PageHeader eyebrow="Industry" title={industry.title} lede={industry.summary} />

      <Section>
        <Shell>
          <Link
            href="/industries"
            className="mb-10 inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.08em] text-slate uppercase hover:text-ink"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden />
            All industries
          </Link>
          <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">
            <div>
              <Eyebrow>Where time is lost</Eyebrow>
              <ul className="mt-5 space-y-3">
                {industry.pains.map((p) => (
                  <li key={p} className="border-l-2 border-ink/15 pl-4 text-sm text-graphite">
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Eyebrow>Systems we work with</Eyebrow>
              <div className="mt-5 flex flex-wrap gap-2">
                {industry.systems.map((s) => (
                  <span
                    key={s}
                    className="border border-fog px-3 py-1.5 text-xs font-medium tracking-[0.08em] text-slate uppercase"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <Eyebrow>Our note</Eyebrow>
              <p className="mt-5 text-[15px] leading-relaxed text-slate">{industry.note}</p>
            </div>
          </div>

          <p className="mt-14 text-sm text-slate">
            Related:{" "}
            <Link href="/solutions" className="underline underline-offset-4 hover:text-ink">
              solution patterns
            </Link>{" "}
            and{" "}
            <Link href="/results" className="underline underline-offset-4 hover:text-ink">
              how we measure outcomes
            </Link>
            .
          </p>
        </Shell>
      </Section>

      <AuditCta />
    </>
  );
}
