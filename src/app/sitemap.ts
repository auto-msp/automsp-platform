import type { MetadataRoute } from "next";
import { articles, industries, solutions } from "@/lib/content";
import { canonicalUrl } from "@/lib/seo";

/**
 * Sitemap for every indexable public URL.
 *
 * Excluded on purpose: `/app/*` (authenticated control plane),
 * `/sign-in` and `/sign-up` (utility pages, marked noindex), and `/api/*`.
 * A sitemap entry for a noindex URL is a contradiction crawlers report as an
 * error, so those routes are omitted rather than listed and disowned.
 *
 * `lastModified` is deliberately absent. The content model carries no real
 * publication or revision dates, and stamping every build time onto every URL
 * produces a lastmod that is always "just now" — which Google learns to
 * distrust. Omitting it is neutral; a false one is a negative signal. Add real
 * dates to the content model and they can be surfaced here.
 *
 * `changeFrequency` and `priority` are hints that Google ignores; Bing and
 * other consumers still read them, so they are set from page role rather than
 * guessed per URL.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/capabilities", priority: 0.9, changeFrequency: "monthly" },
    { path: "/ai-infrastructure", priority: 0.9, changeFrequency: "monthly" },
    { path: "/ai-agents", priority: 0.9, changeFrequency: "monthly" },
    { path: "/managed-ai-operations", priority: 0.9, changeFrequency: "monthly" },
    { path: "/aeo-services", priority: 0.9, changeFrequency: "monthly" },
    { path: "/solutions", priority: 0.8, changeFrequency: "monthly" },
    { path: "/industries", priority: 0.8, changeFrequency: "monthly" },
    { path: "/pricing", priority: 0.8, changeFrequency: "monthly" },
    { path: "/results", priority: 0.8, changeFrequency: "monthly" },
    { path: "/security", priority: 0.8, changeFrequency: "monthly" },
    { path: "/how-it-works", priority: 0.8, changeFrequency: "monthly" },
    { path: "/approach", priority: 0.8, changeFrequency: "monthly" },
    { path: "/agents", priority: 0.8, changeFrequency: "monthly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
    { path: "/book-audit", priority: 0.8, changeFrequency: "monthly" },
    { path: "/resources", priority: 0.7, changeFrequency: "weekly" },
    { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  ];

  return [
    ...staticRoutes.map((r) => ({
      url: canonicalUrl(r.path),
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...solutions.map((s) => ({
      url: canonicalUrl(`/solutions/${s.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...industries.map((i) => ({
      url: canonicalUrl(`/industries/${i.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...articles.map((a) => ({
      url: canonicalUrl(`/resources/${a.slug}`),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
