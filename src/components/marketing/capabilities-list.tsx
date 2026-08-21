import { ArrowUpRight, AudioLines, Database, MonitorCog, Sparkles, Workflow } from "lucide-react";
import Link from "next/link";
import { Eyebrow, Section, Shell } from "@/components/ui/shell";

const capabilities = [
  {
    id: "infrastructure",
    icon: Database,
    title: "AI Infrastructure & RAG Systems",
    description:
      "Secure data foundations, retrieval systems, and model orchestration built for your enterprise.",
  },
  {
    id: "workflow-automation",
    icon: Workflow,
    title: "Workflow Automation",
    description:
      "Eliminate manual work and accelerate processes across your organization with human approval gates.",
  },
  {
    id: "agents",
    icon: Sparkles,
    title: "Production AI Agents",
    description:
      "Task-specific agents that act within defined permissions and improve with human-in-the-loop controls.",
  },
  {
    id: "managed-operations",
    icon: MonitorCog,
    title: "Managed AI Operations",
    description:
      "Monitoring, observability, security, and continuous optimization — operated for you.",
  },
  {
    id: "voice-ai",
    icon: AudioLines,
    title: "Voice AI Systems",
    description:
      "Voice agents and assistants that improve customer and employee experiences at scale.",
  },
] as const;

export function CapabilitiesList() {
  return (
    <Section id="capabilities">
      <Shell>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <div>
            <Eyebrow>End-to-end managed AI</Eyebrow>
            <h2 className="font-display mt-6 text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
              We design, run, and optimize AI systems that deliver real business outcomes.
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
