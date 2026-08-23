import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { AuditCta } from "@/components/marketing/audit-cta";
import { Eyebrow, Section, Shell } from "@/components/ui/shell";

export const metadata: Metadata = {
  title: "How It Works — The Nightly Cycle",
  description:
    "Agents wake on their own, check your business, pick the highest-leverage move, execute it behind approval gates, and email you a structured report every morning.",
};

const steps = [
  {
    n: "01",
    time: "Overnight",
    title: "Agents wake on their own",
    body: "No prompting. On a schedule you control, each specialist agent checks its domain — inbox, campaigns, competitors, revenue — and decides what deserves attention tonight.",
  },
  {
    n: "02",
    time: "Overnight",
    title: "They pick the highest-leverage move",
    body: "The orchestrator weighs what every agent found against your KPIs and mission doc, then chooses what your business actually needs next — not just what is easy.",
  },
  {
    n: "03",
    time: "Overnight",
    title: "They execute behind approval gates",
    body: "Drafts get written, research gets run, code gets built. Anything consequential — publishing, spending, sending, deploying — pauses in your approvals center with exact arguments pinned for a human yes or no.",
  },
  {
    n: "04",
    time: "Morning",
    title: "You get one structured report",
    body: "A morning briefing in plain language: what ran, what it found, what it did, what it needs from you. Read it like a briefing from a small team — not a finished workday.",
  },
] as const;

const dayOne = [
  { label: "Mission document", note: "Drafted from your idea within minutes" },
  { label: "Market research", note: "Web-grounded competitive landscape" },
  { label: "First social draft", note: "Queued for your review, never auto-published" },
  { label: "Project inbox", note: "Welcome email ready to send" },
  { label: "Your website", note: "Built and deployed by the engineering agent" },
] as const;

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        eyebrow="The nightly cycle"
        title="AI that works while you sleep."
        lede="Every night the agents check on your business, pick something worth doing, do it, and leave a report on your desk by morning. You provide the judgment; they provide the execution."
      />

      <Section>
        <Shell>
          <div className="grid gap-x-16 gap-y-14 lg:grid-cols-2">
            {steps.map((step) => (
              <article key={step.n} className="border-t border-fog pt-8">
                <span className="tnum text-xs font-medium tracking-[0.2em] text-mute">
                  {step.n} — {step.time}
                </span>
                <h2 className="font-display mt-4 text-3xl leading-tight tracking-tight text-ink">
                  {step.title}
                </h2>
                <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-slate">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </Shell>
      </Section>

      <Section className="bg-night text-paper">
        <Shell>
          <Eyebrow tone="dark">Day one</Eyebrow>
          <h2 className="font-display mt-6 max-w-2xl text-4xl leading-[1.1] tracking-tight sm:text-5xl">
            Real artifacts in hours, not weeks.
          </h2>
          <ul className="mt-12 grid gap-x-10 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
            {dayOne.map((item) => (
              <li key={item.label} className="border-t border-white/15 py-5">
                <p className="text-[15px] font-medium">{item.label}</p>
                <p className="mt-1 text-[13px] leading-snug text-white/60">{item.note}</p>
              </li>
            ))}
          </ul>
          <p className="mt-12 max-w-xl text-[14px] leading-relaxed text-white/70">
            Autonomy has limits — roughly 80% of execution runs itself today. Strategy,
            positioning, taste, and the final yes stay with you. That is by design.
          </p>
        </Shell>
      </Section>

      <AuditCta />
    </>
  );
}
