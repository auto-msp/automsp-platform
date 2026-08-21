import type { Metadata } from "next";
import { ShieldCheck, KeyRound, FileSearch, Users } from "lucide-react";
import { PageHeader } from "@/components/marketing/page-header";
import { AuditCta } from "@/components/marketing/audit-cta";
import { Section, Shell } from "@/components/ui/shell";

export const metadata: Metadata = {
  title: "Security",
  description:
    "How AutoMSP secures managed AI systems: tenant isolation, role-based access, encrypted secrets, audit logs, least-privilege integrations, and human approval for consequential actions.",
};

const pillars = [
  {
    icon: ShieldCheck,
    title: "Architectural controls",
    items: [
      "Tenant isolation enforced at the database layer, not just the UI",
      "Every external input validated server-side",
      "Rate limiting and execution budgets on AI workloads",
      "Secrets encrypted at rest; never exposed to the client",
    ],
  },
  {
    icon: Users,
    title: "Access & governance",
    items: [
      "Role-based access control across organizations, teams, and projects",
      "Human approval required for high-risk agent actions",
      "MFA support through our authentication provider",
      "Least-privilege OAuth scopes on every integration",
    ],
  },
  {
    icon: FileSearch,
    title: "Auditability",
    items: [
      "Immutable-style audit log of who changed what, when",
      "Full execution history for every automated action",
      "Before/after state captured for consequential changes",
      "Exportable evidence for your compliance needs",
    ],
  },
  {
    icon: KeyRound,
    title: "Data handling",
    items: [
      "Your data is never used to train shared models",
      "Regional data-storage options on request",
      "Signed URLs and time-limited access for files",
      "Credentials and tokens never written to logs",
    ],
  },
] as const;

export default function SecurityPage() {
  return (
    <>
      <PageHeader
        dark
        eyebrow="Security"
        title="Security is a product feature, not a checkbox."
        lede="Managed AI touches your data, your systems, and your customers. We treat that responsibility as an architectural requirement."
      />

      <Section>
        <Shell>
          <div className="grid gap-px border border-fog bg-fog md:grid-cols-2">
            {pillars.map((p) => (
              <div key={p.title} className="bg-surface p-8 sm:p-10">
                <p.icon className="size-6 text-graphite" strokeWidth={1.5} aria-hidden />
                <h2 className="mt-5 text-xl font-semibold tracking-tight text-ink">{p.title}</h2>
                <ul className="mt-5 space-y-3">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-slate">
                      <span className="mt-[7px] size-1.5 shrink-0 bg-ink" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 border border-fog bg-haze/50 p-8 sm:p-10">
            <h2 className="text-lg font-semibold tracking-tight text-ink">Security questionnaires &amp; procurement</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate">
              We support enterprise security reviews, procurement assessments, and data-processing
              discussions as part of every engagement. Contact us to start the process.
            </p>
            <a
              href="mailto:hello@automsp.us?subject=Security%20review%20request"
              className="mt-5 inline-block text-[13px] font-medium tracking-[0.08em] text-ink uppercase underline-offset-4 hover:underline"
            >
              Request security documentation
            </a>
          </div>
        </Shell>
      </Section>

      <AuditCta />
    </>
  );
}
