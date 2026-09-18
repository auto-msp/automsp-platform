import type { Metadata } from "next";
import { site } from "@/lib/site";

/**
 * SEO primitives — one source of truth for canonical URLs, social metadata and
 * JSON-LD entity ids.
 *
 * Every indexable page builds its metadata through `pageMetadata` so a page can
 * never ship with a title but no canonical, a canonical pointing at the wrong
 * host, or an Open Graph card that inherits a generic site description. The
 * entity `@id`s here are also referenced by the site-wide graph in
 * `src/app/layout.tsx` and the page-level schema builders below, which is what
 * lets a crawler stitch Organization → WebSite → Service → Article together
 * instead of reading them as unrelated fragments.
 */

/** Stable node ids for the site-wide graph. All schema must reference these.
 * Built from `absoluteUrl("/")` so a trailing slash on NEXT_PUBLIC_SITE_URL
 * cannot produce a double-slashed id that no longer matches its definition.
 */
export const ORG_ID = `${absoluteUrl("/")}#organization`;
export const WEBSITE_ID = `${absoluteUrl("/")}#website`;

/**
 * The canonical origin with no trailing slash — the form the robots.txt `host`
 * directive and other origin-only fields require.
 */
export const ORIGIN = absoluteUrl("/").replace(/\/$/, "");

/**
 * Absolute URL for a site-relative path. Used for canonicals, Open Graph URLs
 * and sitemap entries — never hand-concatenate `site.url` at a call site.
 */
export function absoluteUrl(path = "/"): string {
  return new URL(path, site.url).toString();
}

/** Collapse duplicate slashes and drop the trailing slash (except at root). */
export function normalizePath(path: string): string {
  const trimmed = path === "" ? "/" : path;
  const collapsed = `/${trimmed.split("/").filter(Boolean).join("/")}`;
  return collapsed === "/" ? "/" : collapsed.replace(/\/+$/, "");
}

/** Canonical URL for a site-relative path, on the preferred production host. */
export function canonicalUrl(path: string): string {
  return absoluteUrl(normalizePath(path));
}

type PageMetadataInput = {
  /**
   * Page title *without* the brand suffix — the root layout template appends
   * "| AutoMSP". Keep it descriptive and under ~60 characters.
   */
  title: string;
  /** Unique summary of this specific page. Never reuse another page's copy. */
  description: string;
  /** Site-relative path, e.g. "/solutions/back-office-automation". */
  path: string;
  /** "article" switches Open Graph to the article card type. */
  ogType?: "website" | "article";
  /** Set false only for utility pages that must stay out of the index. */
  index?: boolean;
};

/** Alt text for the generated 1200×630 social card. */
export const OG_IMAGE_ALT = `${site.name} — managed AI systems for mid-market companies`;

/**
 * The build-time-generated social card (src/app/opengraph-image.tsx).
 *
 * Referenced explicitly rather than left to Next's file convention: a page that
 * sets its own `openGraph` object replaces the inherited one, and the
 * convention's image does not survive that replacement. Leaving it implicit
 * meant every marketing page shipped with no og:image at all — link previews
 * and AI answer engines got a title and nothing else.
 */
function ogImage() {
  return [
    {
      url: absoluteUrl("/opengraph-image"),
      width: 1200,
      height: 630,
      alt: OG_IMAGE_ALT,
    },
  ];
}

/**
 * Build the metadata block for an indexable page: unique title, unique
 * description, self-referencing canonical and matching social card.
 */
export function pageMetadata({
  title,
  description,
  path,
  ogType = "website",
  index = true,
}: PageMetadataInput): Metadata {
  const url = canonicalUrl(path);

  return {
    title,
    description,
    alternates: { canonical: url },
    ...(index ? {} : { robots: { index: false, follow: true } }),
    openGraph: {
      type: ogType,
      siteName: site.name,
      title,
      description,
      url,
      images: ogImage(),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage(),
    },
  };
}

/* ── JSON-LD builders ────────────────────────────────────────────────────── */

type JsonLdNode = Record<string, unknown>;

export function jsonLdGraph(...nodes: JsonLdNode[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

/** The company itself. Rendered once, site-wide. */
export function organizationSchema(): JsonLdNode {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: site.name,
    url: site.url,
    description: site.description,
    email: site.email,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/brand/logo-gravatar.png"),
      width: 256,
      height: 256,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: site.email,
      url: absoluteUrl("/contact"),
    },
  };
}

/** The site itself, tied to the organization. Rendered once, site-wide. */
export function websiteSchema(): JsonLdNode {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: site.url,
    name: site.name,
    description: site.description,
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
  };
}

/**
 * Breadcrumb trail for a page nested under a section index. `items` are
 * [label, path] pairs ordered root-first.
 */
export function breadcrumbSchema(items: [string, string][]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: canonicalUrl(path),
    })),
  };
}

/** A service AutoMSP delivers. Only for pages describing a real offering. */
export function serviceSchema({
  name,
  description,
  path,
  serviceType,
}: {
  name: string;
  description: string;
  path: string;
  serviceType: string;
}): JsonLdNode {
  return {
    "@type": "Service",
    "@id": `${canonicalUrl(path)}#service`,
    name,
    description,
    serviceType,
    url: canonicalUrl(path),
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Country", name: "United States" },
  };
}

/**
 * An editorial guide. Deliberately omits `datePublished`/`dateModified`: the
 * articles carry no real publication dates, and inventing them would put
 * fabricated data into the index. Add the dates to the content model and they
 * flow through here.
 */
export function articleSchema({
  headline,
  description,
  path,
}: {
  headline: string;
  description: string;
  path: string;
}): JsonLdNode {
  return {
    "@type": "Article",
    "@id": `${canonicalUrl(path)}#article`,
    headline,
    description,
    url: canonicalUrl(path),
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl(path) },
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
  };
}

/** Group the site-wide nodes so the layout can emit them in one script tag. */
export function siteGraph(): JsonLdNode {
  return jsonLdGraph(organizationSchema(), websiteSchema());
}
