import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { Section, Shell } from "@/components/ui/shell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How AutoMSP collects, uses, and protects personal information.",
};

const sections = [
  {
    heading: "What we collect",
    body: [
      "When you submit an AI Opportunity Audit or contact us, we collect the information you provide: name, work email, phone number, company, role, and the operational details you share about your business.",
      "We also collect standard technical telemetry (browser type, pages visited, approximate region) to operate and improve this website.",
    ],
  },
  {
    heading: "How we use it",
    body: [
      "We use the information you provide to respond to your inquiry, prepare your assessment, and — with your consent — continue the conversation about working together. We do not sell personal information, and we do not use your business information to train shared AI models.",
    ],
  },
  {
    heading: "How we protect it",
    body: [
      "Access is limited to people who need it to serve you. Client engagement data is isolated per organization, encrypted in transit, and handled under the security practices described on our Security page.",
    ],
  },
  {
    heading: "Your choices",
    body: [
      "You can request access, correction, or deletion of your personal information at any time by writing to hello@automsp.us. We respond to data requests within 30 days.",
    ],
  },
] as const;

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        lede="Plain-language summary of what we collect, why, and the control you have over it."
      />
      <Section>
        <Shell>
          <div className="mx-auto max-w-2xl">
            <p className="text-xs text-mute">Last updated: August 2026</p>
            {sections.map((s) => (
              <section key={s.heading} className="mt-12">
                <h2 className="text-2xl font-semibold tracking-tight text-ink">{s.heading}</h2>
                {s.body.map((p, i) => (
                  <p key={i} className="mt-4 text-[15px] leading-relaxed text-slate">
                    {p}
                  </p>
                ))}
              </section>
            ))}
            <p className="mt-12 border-t border-fog pt-6 text-xs leading-relaxed text-mute">
              This summary is provided for transparency. A full executed Data Processing Agreement
              is available as part of every client engagement.
            </p>
          </div>
        </Shell>
      </Section>
    </>
  );
}
