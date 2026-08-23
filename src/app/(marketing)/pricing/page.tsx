import type { Metadata } from "next";
import { Check, Minus } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow, Section, Shell } from "@/components/ui/shell";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "One plan. A full autonomous agent team running your business operations, with sandbox mode, approval gates, and morning reports included.",
};

const included = [
  "All nine specialist agents",
  "Nightly autonomous cycle + morning report",
  "Sandbox mode — nothing real goes out until you say so",
  "Human approval gates on every consequential action",
  "Versioned automations and execution history",
  "Knowledge base with retrieval",
  "Credential vault — keys never touch the client",
  "Evaluation suites with recorded pass rates",
  "Usage-based AI cost tracking (actual token counts)",
];

const notIncluded = [
  "Connected ad spend (billed directly by Google/Meta)",
  "Your email or social platform subscriptions",
];

const faqs = [
  {
    q: "What counts as a transaction?",
    a: "Revenue that flows through systems your agents operate — for example a sale on the storefront they built or manage. Ad spend is always excluded; you pay Google and Meta directly.",
  },
  {
    q: "Do I need my own API keys?",
    a: "No. Model usage is metered into your plan. If you want to bring your own provider key later, workspaces support Anthropic, OpenAI, and Google with server-side keys only.",
  },
  {
    q: "Can the agents spend money without asking?",
    a: "No. Every consequential action — spending, publishing, sending, deploying — pauses in your approvals center with the exact arguments recorded. Approve, reject, or tighten the guardrails.",
  },
  {
    q: "What happens if I hit my approval queue before coffee?",
    a: "Nothing ships without your yes. Agents keep working on non-consequential steps and hold everything else until you review.",
  },
] as const;

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="One plan. A whole team."
        lede="A flat subscription for the platform and a share of the revenue it helps create. No seats, no per-agent fees, no surprise model bills."
      />

      <Section>
        <Shell>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
            <div className="border border-fog bg-paper p-8 sm:p-10">
              <Eyebrow>Platform</Eyebrow>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-6xl tracking-tight text-ink">$50</span>
                <span className="text-[15px] text-slate">/month</span>
              </div>
              <p className="mt-3 text-[14px] leading-relaxed text-graphite">
                + 20% of revenue transacted through your business&rsquo;s agent-operated
                systems. Ad spend excluded.
              </p>
              <ButtonLink href="/sign-up" size="lg" withArrow className="mt-8 w-full justify-center">
                Start in sandbox
              </ButtonLink>
              <p className="mt-4 text-center text-[12px] text-mute">
                Sandbox first — nothing real goes out until you flip the switch.
              </p>

              <ul className="mt-10 space-y-3 border-t border-fog pt-8">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] leading-snug text-graphite">
                    <Check className="mt-0.5 size-4 shrink-0 text-ink" strokeWidth={2.25} aria-hidden />
                    {item}
                  </li>
                ))}
                {notIncluded.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-[14px] leading-snug text-mute">
                    <Minus className="mt-0.5 size-4 shrink-0" strokeWidth={2.25} aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <Eyebrow>Questions, answered plainly</Eyebrow>
              <div className="mt-8 divide-y divide-fog border-y border-fog">
                {faqs.map((faq) => (
                  <details key={faq.q} className="group py-6">
                    <summary className="flex cursor-pointer items-baseline justify-between gap-4 text-[16px] font-medium text-ink marker:content-none">
                      {faq.q}
                      <span
                        aria-hidden
                        className={cn(
                          "mt-1 shrink-0 text-xl leading-none text-mute transition-transform duration-200",
                          "group-open:rotate-45",
                        )}
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-slate">
                      {faq.a}
                    </p>
                  </details>
                ))}
              </div>
              <p className="mt-8 max-w-lg text-[13px] leading-relaxed text-mute">
                Early-stage businesses churn when they expect zero input. This platform is an
                execution layer — you still own strategy, taste, and the final call. We would
                rather say that up front.
              </p>
            </div>
          </div>
        </Shell>
      </Section>
    </>
  );
}
