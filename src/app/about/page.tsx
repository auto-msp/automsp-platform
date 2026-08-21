import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/marketing/page-header";
import { AuditCta } from "@/components/marketing/audit-cta";
import { Section, Shell, Eyebrow } from "@/components/ui/shell";

export const metadata: Metadata = {
  title: "About",
  description:
    "AutoMSP is a Managed AI Systems Partner. We design, build, integrate, operate, and continuously improve AI-powered business systems.",
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About AutoMSP"
        title="The operating partner for your AI layer."
        lede="Most businesses don't need an AI department. They need AI systems that work — designed, deployed, and operated with the same rigor as any other critical infrastructure."
      />

      <Section>
        <Shell>
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
            <div className="space-y-6 text-[15px] leading-relaxed text-slate">
              <p>
                AutoMSP exists because the gap between <em className="font-display not-italic text-ink">AI demos</em> and{" "}
                <em className="font-display not-italic text-ink">AI operations</em> is where most
                initiatives die. A prototype that summarizes a document is not a system. A system
                is something that runs every day, fails visibly, gets fixed, and reports what it
                did.
              </p>
              <p>
                We are builders and operators. We architect the data foundations, wire the
                integrations, ship the workflows and agents, and then — critically — we stay. We
                monitor every execution, investigate every failure, and report business impact in
                numbers your CFO can follow.
              </p>
              <p>
                Our operating principles are simple: security is architectural, humans approve
                consequential actions, every system connects to a business outcome, and nothing we
                report is fabricated. If a metric can&rsquo;t show its calculation method, we
                don&rsquo;t report it.
              </p>
            </div>
            <div className="flex flex-col items-start gap-6">
              <Image
                src="/brand/automsp-logo.png"
                alt="AutoMSP company logo"
                width={180}
                height={180}
                className="size-44 rounded-full"
              />
              <div>
                <Eyebrow>What the rings represent</Eyebrow>
                <ul className="mt-4 space-y-2 text-sm text-graphite">
                  <li>AI Infrastructure</li>
                  <li>AI Automation</li>
                  <li>Fully Agentic AI</li>
                  <li>AEO — LLM visibility</li>
                </ul>
              </div>
            </div>
          </div>
        </Shell>
      </Section>

      <AuditCta />
    </>
  );
}
