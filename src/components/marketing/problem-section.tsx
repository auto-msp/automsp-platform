import { Eyebrow, Section, Shell } from "@/components/ui/shell";

const problems = [
  {
    title: "Disconnected systems",
    body: "We connect AI capabilities to the CRM, ERP, support, communication, and data tools your teams already use.",
  },
  {
    title: "Manual knowledge work",
    body: "We convert repetitive, document-heavy, and rules-based processes into monitored AI-assisted workflows.",
  },
  {
    title: "Limited internal capacity",
    body: "You gain an experienced AI delivery function without recruiting an entire infrastructure and automation team.",
  },
  {
    title: "Production risk",
    body: "We design approval gates, access controls, logging, evaluations, and escalation paths into the system from the start.",
  },
] as const;

export function ProblemSection() {
  return (
    <Section>
      <Shell>
        <div className="max-w-3xl">
          <Eyebrow>The gap</Eyebrow>
          <h2 className="font-display mt-6 text-4xl leading-[1.08] tracking-tight text-ink sm:text-5xl">
            AI initiatives often stall between prototype and production.
          </h2>
          <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-slate">
            Launching an AI demo is easy. Building a reliable system that connects to business
            data, respects permissions, handles exceptions, and continues improving is much
            harder. AutoMSP closes that gap — strategy, infrastructure, automation engineering,
            and ongoing operations in one accountable delivery team.
          </p>
        </div>

        <ul className="mt-14 grid gap-px border border-fog bg-fog sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((p) => (
            <li key={p.title} className="bg-paper p-7">
              <h3 className="text-[15px] font-semibold tracking-tight text-ink">{p.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate">{p.body}</p>
            </li>
          ))}
        </ul>
      </Shell>
    </Section>
  );
}
