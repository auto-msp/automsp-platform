import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/app/empty-state";
import { AppPageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";
import { formatDateTime, truncateId } from "@/lib/format";
import { getSessionContext } from "@/server/auth/session";
import { getDashboardMetrics } from "@/server/dashboard";

export const metadata: Metadata = { title: "Dashboard" };

export const dynamic = "force-dynamic";

function Stat({
  label,
  value,
  method,
  basis,
}: {
  label: string;
  value: string;
  method: string;
  basis: "Actual" | "Estimated";
}) {
  return (
    <div className="border border-fog bg-surface p-5">
      <p className="text-[11px] font-medium tracking-[0.12em] text-mute uppercase">{label}</p>
      <p className="tnum mt-2 text-3xl font-semibold text-ink">{value}</p>
      <p className="mt-2 text-[11px] leading-relaxed text-mute">
        <span className={basis === "Actual" ? "font-medium text-ok" : "font-medium text-warn"}>
          {basis}
        </span>{" "}
        — {method}
      </p>
    </div>
  );
}

export default async function DashboardPage() {
  const ctx = await getSessionContext();
  if (!ctx) return null; // layout guarantees a session; keep the compiler honest

  const m = await getDashboardMetrics(ctx.organization.id);
  const isEmpty = m.systemsTotal === 0 && m.automationsTotal === 0;

  return (
    <div>
      <AppPageHeader
        title="Dashboard"
        description={`Operational overview for ${ctx.organization.name}.`}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label="Systems connected"
          value={String(m.systemsTotal)}
          method="counted from your system registry"
          basis="Actual"
        />
        <Stat
          label="Active automations"
          value={String(m.automationsActive)}
          method={`${m.automationsTotal} defined in total`}
          basis="Actual"
        />
        <Stat
          label="Executions · 30 days"
          value={String(m.executions30d)}
          method="counted from execution records"
          basis="Actual"
        />
        <Stat
          label="Pending approvals"
          value={String(m.pendingApprovals)}
          method="runs paused awaiting a decision"
          basis="Actual"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="border border-fog bg-surface p-5">
          <p className="text-[11px] font-medium tracking-[0.12em] text-mute uppercase">
            Run success rate · 30 days
          </p>
          <p className="tnum mt-2 text-3xl font-semibold text-ink">
            {m.successRate30d === null ? "—" : `${Math.round(m.successRate30d * 100)}%`}
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-mute">
            <span className="font-medium text-ok">Actual</span> —{" "}
            {m.successRate30d === null
              ? "no completed or failed runs yet"
              : "completed runs ÷ (completed + failed runs)"}
          </p>
        </div>
        <div className="border border-fog bg-surface p-5">
          <p className="text-[11px] font-medium tracking-[0.12em] text-mute uppercase">
            Estimated hours saved · 30 days
          </p>
          <p className="tnum mt-2 text-3xl font-semibold text-ink">
            {m.estHoursSaved30d === 0 ? "—" : m.estHoursSaved30d.toFixed(1)}
          </p>
          <p className="mt-2 text-[11px] leading-relaxed text-mute">
            <span className="font-medium text-warn">Estimated</span> — completed runs × the
            minutes-saved estimate you set per automation
            {m.executionsWithEstimate === 0 ? "; no runs carry an estimate yet" : ""}
          </p>
        </div>
      </div>

      {isEmpty ? (
        <div className="mt-8">
          <EmptyState
            title="Your workspace is ready — define your first system"
            description="A system is a set of automations tied to one business outcome. Once a system exists, you can build automations on it and watch executions land here."
            action={{ href: "/app/systems/new", label: "Create a system" }}
          />
        </div>
      ) : (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Recent executions</h2>
            <Link href="/app/operations" className="text-[13px] text-slate hover:text-ink">
              View all →
            </Link>
          </div>
          {m.recentExecutions.length === 0 ? (
            <EmptyState
              title="No executions yet"
              description="Automations run manually from the Automations page in the current release. Scheduled triggers are not configured."
              action={{ href: "/app/automations", label: "Open automations" }}
            />
          ) : (
            <div className="overflow-hidden border border-fog">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-fog bg-haze text-left text-[11px] font-medium tracking-[0.1em] text-mute uppercase">
                    <th className="px-4 py-2.5">Execution</th>
                    <th className="px-4 py-2.5">Automation</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Started</th>
                  </tr>
                </thead>
                <tbody>
                  {m.recentExecutions.map((run) => (
                    <tr key={run.id} className="border-b border-fog last:border-0">
                      <td className="tnum px-4 py-2.5 text-slate">
                        <Link href={`/app/operations/${run.id}`} className="hover:text-ink hover:underline">
                          {truncateId(run.id)}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-ink">{run.automationName}</td>
                      <td className="px-4 py-2.5">
                        <StatusPill status={run.status} />
                      </td>
                      <td className="tnum px-4 py-2.5 text-slate">{formatDateTime(run.startedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
