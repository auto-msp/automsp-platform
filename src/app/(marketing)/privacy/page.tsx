import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { Section, Shell } from "@/components/ui/shell";
import { PRIVACY_POLICY_HTML } from "./policy-html";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How AutoMSP collects, uses, shares, and protects personal information.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        lede="How and why we collect, use, share, and protect your personal information when you use AutoMSP services."
      />
      <Section>
        <Shell>
          <div
            className="mx-auto max-w-2xl"
            dangerouslySetInnerHTML={{ __html: PRIVACY_POLICY_HTML }}
          />
        </Shell>
      </Section>
    </>
  );
}
