import { Hero } from "@/components/marketing/hero";
import { TrustStrip } from "@/components/marketing/trust-strip";
import { CapabilitiesList } from "@/components/marketing/capabilities-list";
import { ApproachSteps } from "@/components/marketing/approach-steps";
import { MetricsBand } from "@/components/marketing/metrics-band";
import { SecuritySection } from "@/components/marketing/security-section";
import { AuditCta } from "@/components/marketing/audit-cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <CapabilitiesList />
      <ApproachSteps />
      <MetricsBand />
      <SecuritySection />
      <AuditCta />
    </>
  );
}
