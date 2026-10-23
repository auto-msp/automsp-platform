import { BookOpen, ChartColumn, FileText, Headset, Mic, TrendingUp, type LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow, Section, Shell } from "@/components/ui/shell";

const useCases: readonly { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Headset,
    title: "Customer operations",
    body: "Classify requests, retrieve relevant information, draft responses, update systems, and escalate exceptions to the right person.",
  },
  {
    icon: FileText,
    title: "Document processing",
    body: "Extract, validate, reconcile, and route information from invoices, forms, contracts, reports, and operational records.",
  },
  {
    icon: BookOpen,
    title: "Internal knowledge",
    body: "Give employees permission-aware access to answers grounded in company documents, policies, and systems.",
  },
  {
    icon: TrendingUp,
    title: "Revenue operations",
    body: "Support research, lead qualification, follow-up preparation, CRM hygiene, and account intelligence.",
  },
  {
    icon: Mic,
    title: "Voice operations",
    body: "Handle qualification, scheduling, intake, status requests, and routine service calls with controlled escalation.",
  },
  {
    icon: ChartColumn,
    title: "Reporting and analysis",
    body: "Combine operational data, generate recurring reports, identify anomalies, and surface actionable insights.",
  },
];

export function UseCases() {
  return (
    <Section className="hairline-t">
      <Shell>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>Use cases</Eyebrow>
            <h2 className="font-display mt-6 max-w-xl text-balance text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
              Start with a workflow that has measurable value.
            </h2>
          </div>
          <ButtonLink href="/book-audit" variant="ghost" withArrow className="shrink-0 self-start sm:self-auto">
            Discuss your workflow
          </ButtonLink>
        </div>

        {/* Open cards: a heavy top rule and an icon, no enclosing boxes. */}
        <ul className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((u) => (
            <li key={u.title} className="border-t-2 border-ink pt-6">
              <u.icon aria-hidden className="size-6 text-accent" strokeWidth={1.5} />
              <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">{u.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate">{u.body}</p>
            </li>
          ))}
        </ul>
      </Shell>
    </Section>
  );
}
