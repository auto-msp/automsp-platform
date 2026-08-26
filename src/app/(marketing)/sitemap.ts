import type { MetadataRoute } from "next";
import { industries, solutions } from "@/lib/content";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    "",
    "/capabilities",
    "/aeo-services",
    "/solutions",
    "/industries",
    "/approach",
    "/results",
    "/resources",
    "/about",
    "/contact",
    "/book-audit",
    "/security",
    "/pricing",
    "/how-it-works",
    "/agents",
    "/privacy",
    "/terms",
  ].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
  }));

  const solutionRoutes = solutions.map((s) => ({
    url: `${site.url}/solutions/${s.slug}`,
    lastModified: now,
  }));

  const industryRoutes = industries.map((i) => ({
    url: `${site.url}/industries/${i.slug}`,
    lastModified: now,
  }));

  return [...staticRoutes, ...solutionRoutes, ...industryRoutes];
}
