import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/app/empty-state";
import { AppPageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";
import { formatDateTime, truncateId } from "@/lib/format";
import { getSessionContext } from "@/server/auth/session";
import { store } from "@/server/db/store";

export const metadata: Metadata = { title: "Operations" };

export const dynamic = "force-dynamic";

function duration(run: { startedAt: string; finishedAt?: string }): string {
  if (!run.finishedAt) return "—";
  const ms = Date.parse(run.finishedAt) - Date.parse(run.startedAt);
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

export default async function OperationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; automation?: string }>;
}) {
  const ctx = await getSessionContext();
  if (!ctx) return null;
  const orgId = ctx.organization.id;

  const { status, automation } = await searchParams;
  const [executions, automations] = await Promise.all([
    store.find("executions", (e) => e.organizationId === orgId),
    store.find("automations", (a) => a.organizationId === orgId),
  ]);

  let rows = executions.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  if (status) rows = rows.filter((e) => e.status === status);
  if (automation) rows = rows.filter((e) => e.automationId === automation);

  return (
    <div>
      <AppPageHeader
        title="Operations"
        description="Every run, its steps, and its logs — the execution trail."
      />

      <form method="get" className="mb-5 flex flex-wrap items-center gap-3">
        <select
          name="status"
          defaultValue={status ?? ""}
          className="border border-fog bg-surface px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
        >
          <option value="">All statuses</option>
          {["queued", "running", "waiting", "completed", "failed", "cancelled"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          name="automation"
          defaultValue={automation ?? ""}
          className="border border-fog bg-surface px-3 py-2 text-sm text-ink focus:border-ink focus:outline-none"
        >
          <option value="">All automations</option>
          {automations.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="border border-ink px-4 py-2 text-[12px] font-medium tracking-[0.08em] text-ink uppercase transition-colors hover:bg-ink hover:text-paper"
        >
          Filter
        </button>
      </form>

      {rows.length === 0 ? (
        <EmptyState
          title="No executions match"
          description="Runs appear here when an automation is started manually from its page."
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
                <th className="px-4 py-2.5">Version</th>
                <th className="px-4 py-2.5">Duration</th>
                <th className="px-4 py-2.5">Started</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 100).map((run) => (
                <tr key={run.id} className="border-b border-fog last:border-0">
                  <td className="tnum px-4 py-3 text-slate">
                    <Link href={`/app/operations/${run.id}`} className="hover:text-ink hover:underline">
                      {truncateId(run.id)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink">{run.automationName}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={run.status} />
                  </td>
                  <td className="tnum px-4 py-3 text-slate">v{run.version}</td>
                  <td className="tnum px-4 py-3 text-slate">{duration(run)}</td>
                  <td className="tnum px-4 py-3 text-slate">{formatDateTime(run.startedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
