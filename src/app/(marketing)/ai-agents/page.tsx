import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow, Section, Shell } from "@/components/ui/shell";

export const metadata: Metadata = {
  title: { absolute: "Production AI Agents With Human Approval Controls | AutoMSP" },
  description:
    "Task-focused AI agents with defined tools, permissions, and escalation rules — deployed, monitored, and operated by AutoMSP for mid-market companies. Book a free audit.",
  alternates: { canonical: "/ai-agents" },
};

const agentRoles = [
  {
    title: "Customer support agents",
    body: "Classify requests, draft grounded replies citing the knowledge source used, update systems of record, and escalate billing disputes, security reports, or angry customers to a human — never guess.",
  },
  {
    title: "Internal knowledge assistants",
    body: "Permission-aware answers grounded in your documents and policies. When retrieval can't support an answer, the assistant says so instead of improvising.",
  },
  {
    title: "Revenue operations agents",
    body: "Prospect research with verifiable facts only, outreach drafts personalized around something true about the recipient, CRM hygiene, and follow-up preparation — sending stays a human decision.",
  },
  {
    title: "Research and analysis agents",
    body: "Market monitoring and competitive research that separates verified facts from inference, labels assumptions explicitly, and dates every observation.",
  },
];

const faqs = [
  {
    q: "What stops an agent from doing something harmful?",
    a: "Three layers. Agents hold least-privilege tool grants — a version without a scope physically cannot execute that tool. Consequential actions (spending, publishing, sending, deploying) require explicit human approval with exact arguments recorded. And sandbox mode keeps everything internal until you deliberately enable external dispatch.",
  },
  {
    q: "How do you keep agent quality from degrading over time?",
    a: "Agents are versioned like software: every instruction, model choice, and permission change creates a new auditable version. Evaluation suites run recorded pass rates against golden cases before and after changes, so regressions are caught before production.",
  },
  {
    q: "What happens when an agent encounters something outside its scope?",
    a: "It escalates. Agents are instructed to route ambiguous, sensitive, or out-of-scope situations to a human rather than improvise — and every escalation lands in an approvals queue with full context for review.",
  },
];

export default function AiAgentsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        eyebrow="AI Agents"
        title="Agents that act inside boundaries you set."
        lede="AutoMSP deploys task-focused agents with defined tools, explicit permissions, human approval gates on consequential actions, and documented escalation paths. Capable where it's safe — stopped where it isn't."
      />

      <Section>
        <Shell>
          <div className="max-w-3xl">
            <Eyebrow>Where agents earn their keep</Eyebrow>
            <h2 className="font-display mt-6 text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
              Four roles we deploy most.
            </h2>
          </div>
          <ul className="mt-12 grid gap-px border border-fog bg-fog sm:grid-cols-2">
            {agentRoles.map((r) => (
              <li key={r.title} className="bg-paper p-7 sm:p-8">
                <h3 className="text-[16px] font-semibold tracking-tight text-ink">{r.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate">{r.body}</p>
              </li>
            ))}
          </ul>
        </Shell>
      </Section>

      <Section className="hairline-t bg-haze/60">
        <Shell>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
            <div>
              <Eyebrow>The control model</Eyebrow>
              <h2 className="font-display mt-6 text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
                Autonomy is earned, not assumed.
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate">
                Every agent operates inside the same control model, tuned per workflow:
                least-privilege tool access, approval gates on consequential steps, sandbox-first
                rollout, and complete run transcripts you can audit at any time.
              </p>
            </div>
            <ol className="divide-y divide-fog border-y border-fog">
              {[
                {
                  n: "01",
                  t: "Scoped grant",
                  d: "The agent receives exactly the tools its role requires — enforced server-side, not prompted.",
                },
                {
                  n: "02",
                  t: "Approval gate",
                  d: "Anything consequential pauses with exact arguments pinned for review. Approve, reject, or edit before it runs.",
                },
                {
                  n: "03",
                  t: "Sandbox rollout",
                  d: "New workflows start fully internal. External dispatch is a deliberate owner decision, never a default.",
                },
                {
                  n: "04",
                  t: "Audited operation",
                  d: "Every run is versioned and transcribed — who did what, why, with which inputs and outputs.",
                },
              ].map((s) => (
                <li key={s.n} className="flex gap-5 py-5">
                  <span className="tnum shrink-0 text-xs font-medium tracking-[0.2em] text-mute">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="text-[15px] font-semibold tracking-tight text-ink">{s.t}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Shell>
      </Section>

      <Section className="hairline-t">
        <Shell>
          <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-20">
            <div>
              <Eyebrow>FAQ</Eyebrow>
              <h2 className="font-display mt-6 text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
                The hard questions first.
              </h2>
            </div>
            <dl className="divide-y divide-fog border-y border-fog">
              {faqs.map((f) => (
                <div key={f.q} className="py-6">
                  <dt className="text-[15px] font-semibold tracking-tight text-ink">{f.q}</dt>
                  <dd className="mt-2 max-w-2xl text-sm leading-relaxed text-slate">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-14 flex flex-wrap items-center gap-6">
            <ButtonLink href="/book-audit" size="lg" withArrow>
              Book a free AI opportunity audit
            </ButtonLink>
            <ButtonLink href="/managed-ai-operations" variant="ghost" withArrow>
              See how we operate them
            </ButtonLink>
          </div>
        </Shell>
      </Section>
    </>
  );
}
