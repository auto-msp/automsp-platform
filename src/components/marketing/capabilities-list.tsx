import { ArrowUpRight, Database, MonitorCog, Route, Sparkles, Workflow } from "lucide-react";
import Link from "next/link";
import { Eyebrow, Section, Shell } from "@/components/ui/shell";

const capabilities = [
  {
    id: "ai-opportunity-architecture",
    icon: Route,
    title: "AI Opportunity and Architecture",
    description:
      "Identify where AI can create measurable value before committing — workflow assessment, prioritization, feasibility, data-readiness, ROI roadmap.",
  },
  {
    id: "infrastructure",
    icon: Database,
    title: "AI Infrastructure",
    description:
      "A secure, observable foundation for production AI: cloud and model infrastructure, enterprise RAG, integrations, access controls, evaluation.",
  },
  {
    id: "workflow-automation",
    icon: Workflow,
    title: "Workflow Automation",
    description:
      "Automate repeatable work across your existing systems — documents, reporting, reconciliation, CRM workflows, approvals, exception routing.",
  },
  {
    id: "agents",
    icon: Sparkles,
    title: "AI Agents",
    description:
      "Task-focused agents with defined tools, permissions, and escalation rules — support, knowledge assistants, revenue ops, research, voice.",
  },
  {
    id: "managed-operations",
    icon: MonitorCog,
    title: "Managed AI Operations",
    description:
      "Keep production systems reliable as models, data, and requirements change — monitoring, optimization, incident response, new use cases.",
  },
] as const;

export function CapabilitiesList() {
  return (
    <Section className="hairline-t">
      <Shell>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <div>
            <Eyebrow>Solutions</Eyebrow>
            <h2 className="font-display mt-6 text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
              One partner from opportunity discovery to ongoing operation.
            </h2>
            <Link
              href="/capabilities"
              className="mt-8 inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.08em] text-ink uppercase underline-offset-4 hover:underline"
            >
              Explore all capabilities
              <ArrowUpRight className="size-4" strokeWidth={1.75} aria-hidden />
            </Link>
          </div>

          <ul className="divide-y divide-fog border-y border-fog">
            {capabilities.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/capabilities#${c.id}`}
                  className="group flex items-center gap-5 py-6 transition-colors hover:bg-surface/70 sm:gap-8 sm:py-7"
                >
                  <c.icon className="size-6 shrink-0 text-graphite" strokeWidth={1.4} aria-hidden />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[17px] font-semibold tracking-tight text-ink">{c.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate">{c.description}</p>
                  </div>
                  <span
                    className="grid size-9 shrink-0 place-items-center text-xl font-light text-mute transition-all duration-300 ease-(--ease-out-soft) group-hover:text-ink group-hover:[transform:rotate(45deg)]"
                    aria-hidden
                  >
                    +
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Shell>
    </Section>
  );
}
