import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppPageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";
import { EmptyState } from "@/components/app/empty-state";
import { formatDate, formatDateTime } from "@/lib/format";
import { can, getSessionContext } from "@/server/auth/session";
import { store } from "@/server/db/store";
import { getSystem } from "@/server/systems";
import { TextLink } from "@/components/app/text-link";

export const metadata: Metadata = { title: "System" };

export const dynamic = "force-dynamic";

export default async function SystemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getSessionContext();
  if (!ctx) return null;
  const orgId = ctx.organization.id;

  const { id } = await params;
  const system = await getSystem(orgId, id);
  if (!system) notFound();

  const [automations, executions] = await Promise.all([
    store.query("automations", { organizationId: orgId, systemId: id }),
    store.query("executions", { organizationId: orgId }),
  ]);

  const automationIds = new Set(automations.map((a) => a.id));
  const systemExecutions = executions
    .filter((e) => automationIds.has(e.automationId))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 10);

  return (
    <div>
      <AppPageHeader
        title={system.name}
        description={system.description || "No description provided."}
      >
        <StatusPill status={system.status} />
        {can(ctx, "systems.manage") ? (
          <Link
            href={`/app/systems/${system.id}/edit`}
            className="btn btn-secondary"
          >
            Edit
          </Link>
        ) : null}
      </AppPageHeader>

      <dl className="card card-pad grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-medium text-mute">
            Business outcome
          </dt>
          <dd className="mt-1.5 text-sm text-ink">{system.businessOutcome || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-mute">Owner</dt>
          <dd className="mt-1.5 text-sm text-ink">{system.ownerName || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-mute">Created</dt>
          <dd className="tnum mt-1.5 text-sm text-ink">{formatDate(system.createdAt)}</dd>
        </div>
      </dl>

      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink">Automations</h2>
          {can(ctx, "automations.manage") ? (
            <TextLink href={`/app/automations/new?system=${system.id}`}>Add automation</TextLink>
          ) : null}
        </div>
        {automations.length === 0 ? (
          <EmptyState
            title="No automations on this system yet"
            description="Define a step graph — trigger, conditions, actions, approval gates — to automate work on this system."
            action={
              can(ctx, "automations.manage")
                ? { href: `/app/automations/new?system=${system.id}`, label: "Define an automation" }
                : undefined
            }
          />
        ) : (
          <div className="table-wrap" tabIndex={0}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Automation</th>
                  <th>Status</th>
                  <th>Est. minutes saved / run</th>
                </tr>
              </thead>
              <tbody>
                {automations.map((automation) => (
                  <tr key={automation.id} className="border-b border-fog last:border-0">
                    <td>
                      <Link
                        href={`/app/automations/${automation.id}`}
                        className="font-medium text-ink hover:underline"
                      >
                        {automation.name}
                      </Link>
                    </td>
                    <td>
                      <StatusPill status={automation.status} />
                    </td>
                    <td className="tnum text-slate">
                      {automation.estMinutesPerRun > 0 ? automation.estMinutesPerRun : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-ink">Recent executions</h2>
        {systemExecutions.length === 0 ? (
          <p className="border border-dashed border-fog px-6 py-8 text-center text-sm text-mute">
            No executions recorded for this system yet.
          </p>
        ) : (
          <div className="table-wrap" tabIndex={0}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Automation</th>
                  <th>Status</th>
                  <th>Started</th>
                </tr>
              </thead>
              <tbody>
                {systemExecutions.map((run) => (
                  <tr key={run.id} className="border-b border-fog last:border-0">
                    <td>
                      <Link
                        href={`/app/operations/${run.id}`}
                        className="text-ink hover:underline"
                      >
                        {run.automationName}
                      </Link>
                    </td>
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
    </div>
  );
}
