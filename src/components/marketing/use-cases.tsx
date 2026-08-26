import { ButtonLink } from "@/components/ui/button";
import { Eyebrow, Section, Shell } from "@/components/ui/shell";

const useCases = [
  {
    title: "Customer operations",
    body: "Classify requests, retrieve relevant information, draft responses, update systems, and escalate exceptions to the right person.",
  },
  {
    title: "Document processing",
    body: "Extract, validate, reconcile, and route information from invoices, forms, contracts, reports, and operational records.",
  },
  {
    title: "Internal knowledge",
    body: "Give employees permission-aware access to answers grounded in company documents, policies, and systems.",
  },
  {
    title: "Revenue operations",
    body: "Support research, lead qualification, follow-up preparation, CRM hygiene, and account intelligence.",
  },
  {
    title: "Voice operations",
    body: "Handle qualification, scheduling, intake, status requests, and routine service calls with controlled escalation.",
  },
  {
    title: "Reporting and analysis",
    body: "Combine operational data, generate recurring reports, identify anomalies, and surface actionable insights.",
  },
] as const;

export function UseCases() {
  return (
    <Section className="hairline-t">
      <Shell>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>Use cases</Eyebrow>
            <h2 className="font-display mt-6 max-w-xl text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
              Start with a workflow that has measurable value.
            </h2>
          </div>
          <ButtonLink href="/book-audit" variant="ghost" withArrow className="shrink-0">
            Discuss your workflow
          </ButtonLink>
        </div>

        <ul className="mt-12 grid gap-px border border-fog bg-fog sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((u) => (
            <li key={u.title} className="bg-paper p-7">
              <h3 className="text-[15px] font-semibold tracking-tight text-ink">{u.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate">{u.body}</p>
            </li>
          ))}
        </ul>
      </Shell>
    </Section>
  );
}
