import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/marketing/page-header";
import { AuditCta } from "@/components/marketing/audit-cta";
import { Section, Shell } from "@/components/ui/shell";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "AutoMSP solution patterns: back-office automation, customer operations, revenue operations, document intelligence, and operational knowledge systems.",
};

const solutions = [
  {
    slug: "back-office-automation",
    title: "Back-Office Automation",
    summary: "Document processing, reconciliations, approvals, and internal requests — automated with human gates.",
    metric: "Typical: 30–50% cycle-time reduction",
  },
  {
    slug: "customer-operations",
    title: "Customer Operations",
    summary: "Triage, drafting, knowledge-grounded responses, and voice agents for service teams.",
    metric: "Typical: 60–80% of routine touches automated",
  },
  {
    slug: "revenue-operations",
    title: "Revenue Operations",
    summary: "Lead enrichment, qualification, personalized outreach drafts, and CRM hygiene — with approval before send.",
    metric: "Typical: hours-back per rep, per week",
  },
  {
    slug: "operational-knowledge",
    title: "Operational Knowledge Systems",
    summary: "Secure RAG over policies, manuals, and history so teams get cited answers, not guesses.",
    metric: "Typical: answers with sources, in seconds",
  },
] as const;

export default function SolutionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Solutions"
        title="Solutions by business problem."
        lede="Capabilities are what we build. Solutions are what they fix. Start from the problem — we map it to the right system."
      />

      <Section>
        <Shell>
          <ul className="divide-y divide-fog border-y border-fog">
            {solutions.map((s, i) => (
              <li key={s.slug}>
                <Link
                  href={`/solutions/${s.slug}`}
                  className="group grid gap-3 py-8 transition-colors hover:bg-surface/70 sm:grid-cols-[4rem_1.5fr_1fr_3rem] sm:items-center sm:gap-8"
                >
                  <span className="tnum text-xs font-medium tracking-[0.2em] text-mute">0{i + 1}</span>
                  <span>
                    <h2 className="text-xl font-semibold tracking-tight text-ink">{s.title}</h2>
                    <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate">{s.summary}</p>
                  </span>
                  <span className="text-[13px] text-mute">{s.metric}</span>
                  <ArrowUpRight
                    className="hidden size-5 text-mute transition-colors group-hover:text-ink sm:block"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Shell>
      </Section>

      <AuditCta />
    </>
  );
}
