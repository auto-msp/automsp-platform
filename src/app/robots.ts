import type { MetadataRoute } from "next";
import { ORIGIN, canonicalUrl } from "@/lib/seo";

/**
 * Crawler policy tuned for both classic SEO and answer-engine visibility
 * (AEO/GEO): search indexers and real-time AI answer crawlers are welcome;
 * aggressive training-only scrapers are not. Note: when the zone is proxied
 * through Cloudflare, its "AI Audit" settings can override this file at the
 * edge — keep both in sync.
 *
 * `/sign-in` and `/sign-up` are deliberately NOT disallowed. A Disallow rule
 * stops a crawler from ever fetching the page, which means it never reads the
 * `noindex` those routes set — the URL can still be indexed from external
 * links. Blocking and noindexing are opposites, not belt and braces.
 */
export default function robots(): MetadataRoute.Robots {
  const allow = ["/"];
  const disallow = ["/api/", "/app/", "/admin/"];

  // Answer-engine and search crawlers we want reading the site.
  const welcomed = [
    "OAI-SearchBot",
    "ChatGPT-User",
    "ChatGPT",
    "PerplexityBot",
    "Perplexity-User",
    "ClaudeBot",
    "Claude-Web",
    "Claude-SearchBot",
    "anthropic-ai",
    "Google-Extended",
    "Applebot",
    "Applebot-Extended",
    "Amazonbot",
    "meta-externalagent",
    "Bingbot",
    "Googlebot",
  ];

  return {
    rules: [
      { userAgent: "*", allow, disallow },
      ...welcomed.map((userAgent) => ({ userAgent, allow, disallow })),
      // Training-first scrapers with no referral value remain excluded.
      { userAgent: "CCBot", disallow: "/" },
      { userAgent: "Bytespider", disallow: "/" },
    ],
    sitemap: canonicalUrl("/sitemap.xml"),
    host: ORIGIN,
  };
}
