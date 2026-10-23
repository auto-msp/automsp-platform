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
    store.query("executions", { organizationId: orgId }),
    store.query("automations", { organizationId: orgId }),
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
          className="field"
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
          className="field"
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
          className="btn btn-secondary"
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
        <div className="table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th>Execution</th>
                <th>Automation</th>
                <th>Status</th>
                <th>Version</th>
                <th>Duration</th>
                <th>Started</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 100).map((run) => (
                <tr key={run.id}>
                  <td className="tnum px-4 py-3 text-slate">
                    <Link href={`/app/operations/${run.id}`} className="row-link row-link-id">
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
