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

export const metadata: Metadata = {
  title: {
    absolute: "Managed AI Infrastructure & Automation for Mid-Market Companies | AutoMSP",
  },
  description:
    "AutoMSP designs, deploys, and operates AI infrastructure, workflow automations, and production-ready agents for mid-market companies. Book an AI opportunity audit.",
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://automsp.cloud/#organization",
        name: "AutoMSP",
        url: "https://automsp.cloud",
        description:
          "Managed AI systems partner for mid-market companies. AutoMSP designs, deploys, and operates AI infrastructure, workflow automations, and production-ready agents.",
      },
      {
        "@type": "ProfessionalService",
        "@id": "https://automsp.cloud/#service",
        name: "AutoMSP",
        url: "https://automsp.cloud",
        serviceType: [
          "AI infrastructure",
          "Workflow automation",
          "AI agent development",
          "Managed AI operations",
          "Answer engine optimization (AEO)",
        ],
        areaServed: "North America",
        parentOrganization: { "@id": "https://automsp.cloud/#organization" },
        makesOffer: [
          { "@type": "Offer", name: "Free AI Opportunity Audit", price: "0", priceCurrency: "USD" },
          { "@type": "Offer", name: "AI Automation Pilot", price: "7500", priceCurrency: "USD" },
          {
            "@type": "Offer",
            name: "Managed AI Infrastructure",
            price: "12000",
            priceCurrency: "USD",
            unitText: "MONTH",
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
