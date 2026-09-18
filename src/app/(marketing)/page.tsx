import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";
import { TrustStrip } from "@/components/marketing/trust-strip";
import { ProblemSection } from "@/components/marketing/problem-section";
import { CapabilitiesList } from "@/components/marketing/capabilities-list";
import { UseCases } from "@/components/marketing/use-cases";
import { ApproachSteps } from "@/components/marketing/approach-steps";
import { CaseStudySection } from "@/components/marketing/case-study";
import { SecuritySection } from "@/components/marketing/security-section";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { AuditCta } from "@/components/marketing/audit-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { ORG_ID, absoluteUrl, jsonLdGraph, pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "AI Automation & Managed AI Infrastructure",
  description:
    "AutoMSP designs, deploys, and operates AI infrastructure, workflow automations, and production-ready agents for mid-market companies. Book an AI opportunity audit.",
  path: "/",
});

/**
 * Homepage entity. The Organization node itself lives in the marketing layout's
 * site-wide graph — declaring it twice would give crawlers two competing
 * descriptions of the same @id, so this node only adds what is specific to the
 * homepage: the professional-service offering and its published price points.
 */
const homeService = jsonLdGraph({
  "@type": "ProfessionalService",
  "@id": `${absoluteUrl("/")}#service`,
  name: site.name,
  url: site.url,
  description: site.description,
  serviceType: [
    "AI infrastructure",
    "Workflow automation",
    "AI agent development",
    "Managed AI operations",
    "Answer engine optimization (AEO)",
  ],
  areaServed: { "@type": "Country", name: "United States" },
  parentOrganization: { "@id": ORG_ID },
  makesOffer: [
    {
      "@type": "Offer",
      name: "AI Opportunity Audit",
      description: "Free discovery session with three prioritized opportunities.",
      price: "0",
      priceCurrency: "USD",
    },
    {
      "@type": "Offer",
      name: "AI Automation Pilot",
      description: "One production workflow, starting at $7,500.",
      price: "7500",
      priceCurrency: "USD",
    },
    {
      "@type": "Offer",
      name: "Managed AI Infrastructure",
      description: "Ongoing managed capability, starting at $12,000 per month.",
      price: "12000",
      priceCurrency: "USD",
    },
  ],
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={homeService} />
      <Hero />
      <TrustStrip />
      <ProblemSection />
      <CapabilitiesList />
      <UseCases />
      <ApproachSteps />
      <CaseStudySection />
      <SecuritySection />
      <PricingSection />
      <FaqSection />
      <AuditCta />
    </>
  );
}
