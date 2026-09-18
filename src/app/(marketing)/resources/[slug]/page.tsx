import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { AuditCta } from "@/components/marketing/audit-cta";
import { Section, Shell } from "@/components/ui/shell";
import { JsonLd } from "@/components/seo/json-ld";
import { getArticle, articles } from "@/lib/content";
import { articleSchema, breadcrumbSchema, jsonLdGraph, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return pageMetadata({
    title: article.title,
    description: article.description,
    path: `/resources/${article.slug}`,
    ogType: "article",
  });
}

export default async function ResourceArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <>
      <JsonLd
        data={jsonLdGraph(
          articleSchema({
            headline: article.title,
            description: article.description,
            path: `/resources/${article.slug}`,
          }),
          breadcrumbSchema([
            ["Home", "/"],
            ["Resources", "/resources"],
            [article.title, `/resources/${article.slug}`],
          ]),
        )}
      />
      <PageHeader eyebrow={article.type} title={article.title} lede={article.description} />

      <Section>
        <Shell>
          <div className="mx-auto max-w-2xl">
            <Link
              href="/resources"
              className="mb-10 inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.08em] text-slate uppercase hover:text-ink"
            >
              <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden />
              All resources
            </Link>
            {article.sections.map((s) => (
              <section key={s.heading} className="mb-12">
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

      <AuditCta />
    </>
  );
}
