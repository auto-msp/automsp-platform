import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { AuditCta } from "@/components/marketing/audit-cta";
import { Eyebrow, Section, Shell } from "@/components/ui/shell";

export const metadata: Metadata = {
  title: "The Agent Team",
  description:
    "Nine specialized AI agents that run your business operations on a schedule — research, outreach, social, support, ads, finance, planning, engineering, and orchestration.",
};

const agents = [
  {
    n: "01",
    name: "Orchestrator",
    role: "Runs the whole operation",
    schedule: "Nightly",
    detail:
      "Wakes every night, reviews what every other agent did and found, picks the highest-leverage move for your business, writes the morning report you actually read.",
  },
  {
    n: "02",
    name: "Business Planning",
    role: "Strategy & KPIs",
    schedule: "Daily",
    detail:
      "Keeps the mission doc, tracks KPIs against targets, recommends growth moves, and flags when strategy and reality diverge.",
  },
  {
    n: "03",
    name: "Competitor Research",
    role: "Market intelligence",
    schedule: "Daily",
    detail:
      "Searches the web for competitor moves, pricing changes, and market shifts. Updates your positioning profile so every other agent works from current facts.",
  },
  {
    n: "04",
    name: "Social Media",
    role: "Content & posting",
    schedule: "Every 2 hours",
    detail:
      "Drafts and schedules social posts in your brand voice. Everything lands in your approval queue first — nothing publishes without a human yes unless you say otherwise.",
  },
  {
    n: "05",
    name: "Email Outreach",
    role: "Prospecting & sequences",
    schedule: "Every 3 hours",
    detail:
      "Finds prospects that match your ICP, personalizes cold email sequences, manages replies, and respects suppression lists automatically.",
  },
  {
    n: "06",
    name: "Customer Support",
    role: "Inbox & replies",
    schedule: "Every 3 hours",
    detail:
      "Reads the support inbox, drafts replies grounded in your knowledge base, escalates anything sensitive to a human instead of guessing.",
  },
  {
    n: "07",
    name: "Ads Management",
    role: "Paid campaigns",
    schedule: "Every 6 hours",
    detail:
      "Launches and optimizes Google and Meta campaigns within budgets you set. Consequential spend actions always pause for approval.",
  },
  {
  n: "08",
    name: "Finance",
    role: "Revenue & spend",
    schedule: "Every 6 hours",
    detail:
      "Syncs Stripe revenue, tracks spend across connected tools, reconciles numbers nightly, and reports margin in plain language.",
  },
  {
    n: "09",
    name: "Engineering",
    role: "Ships product work",
    schedule: "On demand",
    detail:
      "Implements features on your own site or product, opens pull requests, and never deploys to production without passing QA checks and your approval gate.",
  },
] as const;

const principles = [
  {
    title: "Specialists, not one chatbot",
    body: "A small org chart beats a single general-purpose agent. Each one has a narrow job, its own knowledge, and its own guardrails.",
  },
  {
    title: "Humans approve consequential actions",
    body: "Publishing, spending, sending, deploying — every consequential step pauses in your approvals center with the exact arguments pinned.",
  },
  {
    title: "Sandbox by default",
    body: "New workspaces start in sandbox mode: agents run end-to-end but nothing real goes out until you flip the switch deliberately.",
  },
] as const;

export default function AgentsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Your autonomous team"
        title="A team of specialists. An org chart of agents."
        lede="Not one chatbot — nine specialized agents that hand work to each other, run on a schedule, and report every morning. You stay the founder; they do the execution."
      />

      <Section>
        <Shell>
          <div className="hairline-b grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <article key={agent.n} className="border-t border-fog pt-6">
                <div className="flex items-baseline justify-between">
                  <span className="tnum text-xs font-medium tracking-[0.2em] text-mute">
                    {agent.n}
                  </span>
                  <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-mute">
                    {agent.schedule}
                  </span>
                </div>
                <h2 className="font-display mt-4 text-2xl tracking-tight text-ink">
                  {agent.name}
                </h2>
                <p className="mt-1 text-[13px] font-medium text-graphite">{agent.role}</p>
                <p className="mt-4 text-[14px] leading-relaxed text-slate">{agent.detail}</p>
              </article>
            ))}
          </div>
        </Shell>
      </Section>

      <Section className="bg-night text-paper">
        <Shell>
          <Eyebrow tone="dark">How we keep it safe</Eyebrow>
          <div className="mt-12 grid gap-12 lg:grid-cols-3">
            {principles.map((p) => (
              <div key={p.title} className="border-l border-white/15 pl-6">
                <h3 className="font-display text-xl tracking-tight">{p.title}</h3>
                <p className="mt-4 text-[14px] leading-relaxed text-white/70">{p.body}</p>
              </div>
            ))}
          </div>
        </Shell>
      </Section>

      <AuditCta />
    </>
  );
}
