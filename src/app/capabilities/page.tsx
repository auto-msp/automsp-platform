import type { Metadata } from "next";
import { AudioLines, Database, MonitorCog, Sparkles, Workflow, ArrowRight, Check } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { AuditCta } from "@/components/marketing/audit-cta";
import { Section, Shell, Eyebrow } from "@/components/ui/shell";

export const metadata: Metadata = {
  title: "Capabilities",
  description:
    "AI infrastructure & RAG systems, workflow automation, production AI agents, managed AI operations, and voice AI — designed, built, and operated by AutoMSP.",
};

const capabilities = [
  {
    id: "infrastructure",
    icon: Database,
    title: "AI Infrastructure & RAG Systems",
    lede: "Secure data foundations that make enterprise knowledge instantly usable.",
    points: [
      "Retrieval-augmented generation grounded in your documents and systems",
      "Vector and hybrid search with tenant-aware access controls",
      "Model orchestration across providers — no single-vendor lock-in",
      "Evaluation pipelines that measure answer quality continuously",
    ],
    outcomes: ["Search that cites sources", "Support deflection with verifiable answers", "One knowledge layer for every agent"],
  },
  {
    id: "workflow-automation",
    icon: Workflow,
    title: "Workflow Automation",
    lede: "Complex, multi-step processes automated across systems — with people in control.",
    points: [
      "Trigger → condition → AI → action → approval pipelines",
      "Human approval gates on consequential actions",
      "Idempotent execution with retries and full run history",
      "Integration across CRM, email, ERP, and line-of-business systems",
    ],
    outcomes: ["Manual handoffs eliminated", "Cycle times reduced 30–50%", "Exceptions surfaced, not hidden"],
  },
  {
    id: "agents",
    icon: Sparkles,
    title: "Production AI Agents",
    lede: "Domain-specific agents that execute work within defined permissions.",
    points: [
      "Scoped permission model — agents only do what they are granted",
      "Versioned deployments with evaluation gates before production",
      "Escalation paths to humans for low-confidence or high-risk actions",
      "Per-agent cost, latency, and quality telemetry",
    ],
    outcomes: ["Agents handle the routine; people handle judgment", "Auditable action trails", "Quality measured, not assumed"],
  },
  {
    id: "managed-operations",
    icon: MonitorCog,
    title: "Managed AI Operations",
    lede: "Your AI planted, monitored, and continuously improved — not deployed and abandoned.",
    points: [
      "24/7 monitoring of executions, failures, and drift",
      "Incident response with root-cause analysis",
      "Model and prompt optimization as better models ship",
      "Monthly business-impact reporting tied to outcomes",
    ],
    outcomes: ["Systems that improve month over month", "One accountable operations partner", "Reliability targets with reporting"],
  },
  {
    id: "voice-ai",
    icon: AudioLines,
    title: "Voice AI Systems",
    lede: "Voice agents and assistants for customer and employee workflows.",
    points: [
      "Inbound qualification, scheduling, and service triage",
      "Employee-facing assistants for operational lookups",
      "Call summarization into your systems of record",
      "Human handoff with full conversation context",
    ],
    outcomes: ["Every call answered", "Consistent qualification standards", "Calls become structured data"],
  },
] as const;

export default function CapabilitiesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Capabilities"
        title="End-to-end AI systems. Built, integrated, and operated for impact."
        lede="From data foundation to production agents to ongoing operations — one accountable partner for the full lifecycle."
      />

      <div>
        {capabilities.map((c, i) => (
          <Section
            key={c.id}
            id={c.id}
            className={i % 2 === 1 ? "bg-haze/50" : i > 0 ? "hairline-t" : ""}
          >
            <Shell>
              <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr_1fr] lg:gap-16">
                <div>
                  <div className="flex items-center gap-4">
                    <c.icon className="size-7 text-graphite" strokeWidth={1.4} aria-hidden />
                    <span className="tnum text-xs font-medium tracking-[0.2em] text-mute">
                      0{i + 1}
                    </span>
                  </div>
                  <h2 className="mt-5 text-3xl font-semibold tracking-tight text-ink">{c.title}</h2>
                  <p className="mt-3 text-[15px] leading-relaxed text-slate">{c.lede}</p>
                </div>

                <div>
                  <Eyebrow>What we deliver</Eyebrow>
                  <ul className="mt-4 space-y-3">
                    {c.points.map((p) => (
                      <li key={p} className="flex items-start gap-3 text-sm leading-relaxed text-graphite">
                        <Check className="mt-0.5 size-4 shrink-0 text-ink" strokeWidth={2} aria-hidden />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <Eyebrow>Business outcomes</Eyebrow>
                  <ul className="mt-4 space-y-3">
                    {c.outcomes.map((o) => (
                      <li key={o} className="border-l-2 border-ink/15 pl-4 text-sm text-graphite">
                        {o}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="/book-audit"
                    className="mt-6 inline-flex items-center gap-2 text-[13px] font-medium tracking-[0.08em] text-ink uppercase underline-offset-4 hover:underline"
                  >
                    Discuss this capability
                    <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
                  </a>
                </div>
              </div>
            </Shell>
          </Section>
        ))}
      </div>

      <AuditCta />
    </>
  );
}
