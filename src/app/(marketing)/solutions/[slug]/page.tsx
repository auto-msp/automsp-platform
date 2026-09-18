import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowDown, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { AuditCta } from "@/components/marketing/audit-cta";
import { Section, Shell, Eyebrow } from "@/components/ui/shell";
import { JsonLd } from "@/components/seo/json-ld";
import { getSolution, solutions } from "@/lib/content";
import { breadcrumbSchema, jsonLdGraph, pageMetadata, serviceSchema } from "@/lib/seo";

export function generateStaticParams() {
  return solutions.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) return {};
  return pageMetadata({
    title: solution.title,
    description: solution.summary,
    path: `/solutions/${solution.slug}`,
  });
}

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const solution = getSolution(slug);
  if (!solution) notFound();

  return (
    <>
      <JsonLd
        data={jsonLdGraph(
          serviceSchema({
            name: solution.title,
            description: solution.summary,
            path: `/solutions/${solution.slug}`,
            serviceType: solution.title,
          }),
          breadcrumbSchema([
            ["Home", "/"],
            ["Solutions", "/solutions"],
            [solution.title, `/solutions/${solution.slug}`],
          ]),
        )}
      />
      <PageHeader eyebrow="Solution" title={solution.title} lede={solution.summary} />

      <Section>
        <Shell>
          <Link
            href="/solutions"
            className="mb-10 inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.08em] text-slate uppercase hover:text-ink"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden />
            All solutions
          </Link>
          <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">
            <div>
              <Eyebrow>The problem</Eyebrow>
              <p className="mt-5 text-[15px] leading-relaxed text-slate">{solution.problem}</p>
            </div>
            <div>
              <Eyebrow>What we build</Eyebrow>
              <ul className="mt-5 space-y-3">
                {solution.whatWeBuild.map((item) => (
                  <li key={item} className="border-l-2 border-ink/15 pl-4 text-sm text-graphite">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Eyebrow>Expected outcomes</Eyebrow>
              <ul className="mt-5 space-y-3">
                {solution.outcomes.map((item) => (
                  <li key={item} className="border-l-2 border-ink/15 pl-4 text-sm text-graphite">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Shell>
      </Section>

      <Section className="hairline-t bg-night text-paper">
        <Shell>
          <Eyebrow tone="dark">Example workflow</Eyebrow>
          <div className="mt-8 max-w-xl">
            {solution.exampleWorkflow.map((step, i, arr) => (
              <div key={step}>
                <div className="flex items-center gap-5 border border-nline bg-night-2 px-5 py-4">
                  <span className="tnum text-xs font-medium tracking-[0.2em] text-white/50">
                    0{i + 1}
                  </span>
                  <span className="text-sm text-white/90">{step}</span>
                </div>
                {i < arr.length - 1 ? (
                  <div className="flex justify-center py-1" aria-hidden>
                    <ArrowDown className="size-4 text-trail" strokeWidth={1.5} />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          {/* Related pattern — keeps the solution cluster connected instead of
              each page dead-ending into the CTA. */}
          <p className="mt-10 text-sm text-white/70">
            Related:{" "}
            <Link href="/industries" className="underline underline-offset-4 hover:text-paper">
              industry playbooks
            </Link>{" "}
            and{" "}
            <Link
              href="/how-it-works"
              className="underline underline-offset-4 hover:text-paper"
            >
              how the nightly cycle runs
            </Link>
            .
          </p>
        </Shell>
      </Section>

      <AuditCta />
    </>
  );
}
