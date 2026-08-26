import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Crawler policy tuned for both classic SEO and answer-engine visibility
 * (AEO/GEO): search indexers and real-time AI answer crawlers are welcome;
 * aggressive training-only scrapers are not. Note: when the zone is proxied
 * through Cloudflare, its "AI Audit" settings can override this file at the
 * edge — keep both in sync.
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
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
