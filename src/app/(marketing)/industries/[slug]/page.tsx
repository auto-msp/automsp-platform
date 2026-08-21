import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/marketing/page-header";
import { AuditCta } from "@/components/marketing/audit-cta";
import { Section, Shell, Eyebrow } from "@/components/ui/shell";
import { getIndustry, industries } from "@/lib/content";

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
  return { title: industry.title, description: industry.summary };
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
      <PageHeader eyebrow="Industry" title={industry.title} lede={industry.summary} />

      <Section>
        <Shell>
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
                    className="border border-fog px-3 py-1.5 text-[11px] font-medium tracking-[0.08em] text-slate uppercase"
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
        </Shell>
      </Section>

      <AuditCta />
    </>
  );
}
