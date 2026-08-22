import type { Metadata } from "next";
import Link from "next/link";
import { AppPageHeader } from "@/components/app/page-header";
import { getSessionContext } from "@/server/auth/session";
import { store } from "@/server/db/store";

export const metadata: Metadata = { title: "Setup checklist" };

export const dynamic = "force-dynamic";

function Step({
  index,
  title,
  description,
  done,
  href,
  cta,
}: {
  index: number;
  title: string;
  description: string;
  done: boolean;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="flex gap-4 border border-fog bg-surface p-5">
      <span
        className={`tnum flex h-7 w-7 shrink-0 items-center justify-center border text-[13px] font-medium ${
          done ? "border-ok bg-ok/10 text-ok" : "border-fog text-mute"
        }`}
      >
        {done ? "✓" : index}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${done ? "text-mute line-through" : "text-ink"}`}>
          {title}
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-slate">{description}</p>
        {!done && href && cta ? (
          <Link
            href={href}
            className="mt-3 inline-flex h-9 items-center border border-ink px-4 text-[12px] font-medium tracking-[0.08em] text-ink uppercase transition-colors hover:bg-ink hover:text-paper"
          >
            {cta}
          </Link>
        ) : null}
      </div>
      {done ? <StatusBadge /> : null}
    </div>
  );
}

function StatusBadge() {
  return (
    <span className="shrink-0 text-[11px] font-medium tracking-[0.1em] text-ok uppercase">
      Done
    </span>
  );
}

export default async function OnboardingPage() {
  const ctx = await getSessionContext();
  if (!ctx) return null;
  const orgId = ctx.organization.id;

  const [systems, automations, executions, members] = await Promise.all([
    store.query("systems", { organizationId: orgId }),
    store.query("automations", { organizationId: orgId }),
    store.query("executions", { organizationId: orgId }),
    store.query("memberships", { organizationId: orgId }),
  ]);

  const steps = [
    {
      title: "Account and organization created",
      description: `You're signed in as ${formatRoleInline(ctx.membership.role)} of ${ctx.organization.name}. All data in this workspace is isolated to your organization.`,
      done: true,
    },
    {
      title: "Create your first system",
      description:
        "A system groups automations around one business outcome — for example “Invoice processing” or “Client onboarding”.",
      done: systems.length > 0,
      href: "/app/systems/new",
      cta: "Create a system",
    },
    {
      title: "Define an automation",
      description:
        "An automation is a step graph: trigger, conditions, actions, and approval gates where a human decides.",
      done: automations.length > 0,
      href: "/app/automations/new",
      cta: "Define an automation",
    },
    {
      title: "Run your first execution",
      description:
        "Run an automation manually and inspect every step, log line, and output in the operations view.",
      done: executions.length > 0,
      href: "/app/automations",
      cta: "Open automations",
    },
    {
      title: "Invite your team",
      description:
        "Invite colleagues with role-based access — viewers see everything, members run automations, admins manage them.",
      done: members.length > 1,
      href: "/app/organization",
      cta: "Open organization",
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div>
      <AppPageHeader
        title="Setup checklist"
        description={`${doneCount} of ${steps.length} complete. These steps take you from an empty workspace to a running automation.`}
      />

      <div className="space-y-3">
        {steps.map((step, i) => (
          <Step key={step.title} index={i + 1} {...step} />
        ))}
      </div>

      <div className="mt-8 border border-warn/40 bg-warn/5 p-5">
        <p className="text-sm font-medium text-ink">Not configured in this environment</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] leading-relaxed text-slate">
          <li>External system integrations (connect CRM, ERP, email)</li>
          <li>Scheduled and event-driven triggers</li>
          <li>Email notifications and SSO sign-in</li>
        </ul>
        <p className="mt-3 text-[13px] leading-relaxed text-slate">
          Automations you build here run with local test inputs through the manual-run path. Managed
          deployments add the scheduled and integrated execution paths.
        </p>
      </div>
    </div>
  );
}

function formatRoleInline(role: string): string {
  return role.replace(/_/g, " ");
}
