import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { AppPageHeader, SectionHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { StatusPill } from "@/components/app/status-pill";
import { formatDateTime, truncateId } from "@/lib/format";
import { getSessionContext } from "@/server/auth/session";
import { getDashboardMetrics } from "@/server/dashboard";

export const metadata: Metadata = { title: "Dashboard" };

export const dynamic = "force-dynamic";

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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <StatCard
          label="Systems connected"
          value={String(m.systemsTotal)}
          method="counted from your system registry"
          basis="Actual"
        />
        <StatCard
          label="Active automations"
          value={String(m.automationsActive)}
          method={`${m.automationsTotal} defined in total`}
          basis="Actual"
        />
        <StatCard
          label="Executions · 30 days"
          value={String(m.executions30d)}
          method="counted from execution records"
          basis="Actual"
          tone="accent"
        />
        <StatCard
          label="Pending approvals"
          value={String(m.pendingApprovals)}
          method="runs paused awaiting a decision"
          basis="Actual"
          tone={m.pendingApprovals > 0 ? "brand" : "default"}
        />
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:mt-4 sm:gap-4 lg:grid-cols-2">
        <StatCard
          label="Run success rate · 30 days"
          value={m.successRate30d === null ? "—" : `${Math.round(m.successRate30d * 100)}%`}
          method={
            m.successRate30d === null
              ? "no completed or failed runs yet"
              : "completed runs ÷ (completed + failed runs)"
          }
          basis="Actual"
        />
        <StatCard
          label="Estimated hours saved · 30 days"
          value={m.estHoursSaved30d === 0 ? "—" : m.estHoursSaved30d.toFixed(1)}
          method={`completed runs × the minutes-saved estimate you set per automation${
            m.executionsWithEstimate === 0 ? "; no runs carry an estimate yet" : ""
          }`}
          basis="Estimated"
        />
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
          <SectionHeader title="Recent executions">
            <Link
              href="/app/operations"
              className="-mr-2 inline-flex min-h-11 items-center gap-0.5 px-2 text-[13px] font-medium text-accent hover:text-accent-hover"
            >
              View all
              <ChevronRight aria-hidden className="size-4" strokeWidth={2} />
            </Link>
          </SectionHeader>
          {m.recentExecutions.length === 0 ? (
            <EmptyState
              title="No executions yet"
              description="Automations run manually from the Automations page in the current release. Scheduled triggers are not configured."
              action={{ href: "/app/automations", label: "Open automations" }}
            />
          ) : (
            <div className="table-wrap">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Execution</th>
                    <th>Automation</th>
                    <th>Status</th>
                    <th>Started</th>
                  </tr>
                </thead>
                <tbody>
                  {m.recentExecutions.map((run) => (
                    <tr key={run.id}>
                      <td className="tnum text-slate">
                        <Link href={`/app/operations/${run.id}`} className="row-link row-link-id">
                          {truncateId(run.id)}
                        </Link>
                      </td>
                      <td className="text-ink">{run.automationName}</td>
                      <td>
                        <StatusPill status={run.status} />
                      </td>
                      <td className="tnum text-slate">{formatDateTime(run.startedAt)}</td>
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
