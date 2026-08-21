import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppPageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";
import { formatDate, formatDateTime } from "@/lib/format";
import { can, getSessionContext } from "@/server/auth/session";
import { getAutomation, getCurrentDefinition, listVersions } from "@/server/automations";
import { store } from "@/server/db/store";
import { RunForm } from "./run-form";

export const metadata: Metadata = { title: "Automation" };

export const dynamic = "force-dynamic";

export default async function AutomationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await getSessionContext();
  if (!ctx) return null;
  const orgId = ctx.organization.id;

  const { id } = await params;
  const automation = await getAutomation(orgId, id);
  if (!automation) notFound();

  const [current, versions, executions, system] = await Promise.all([
    getCurrentDefinition(id),
    listVersions(id),
    store.find("executions", (e) => e.organizationId === orgId && e.automationId === id),
    automation.systemId ? store.get("systems", automation.systemId) : Promise.resolve(null),
  ]);

  const runs = executions.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 10);
  const canManage = can(ctx, "automations.manage");

  return (
    <div>
      <AppPageHeader
        title={automation.name}
        description={automation.description || "No description provided."}
      >
        <StatusPill status={automation.status} />
        <Link
          href={`/app/automations/${automation.id}/build`}
          className="inline-flex h-10 items-center bg-ink px-4 text-[13px] font-medium tracking-[0.08em] text-paper uppercase transition-colors hover:bg-graphite"
        >
          Open builder
        </Link>
        {canManage ? (
          <Link
            href={`/app/automations/${automation.id}/edit`}
            className="inline-flex h-10 items-center border border-fog px-4 text-[13px] font-medium text-slate transition-colors hover:border-ink hover:text-ink"
          >
            Settings
          </Link>
        ) : null}
      </AppPageHeader>

      <dl className="grid grid-cols-2 gap-4 border border-fog bg-surface p-5 sm:grid-cols-4">
        <div>
          <dt className="text-[11px] font-medium tracking-[0.12em] text-mute uppercase">System</dt>
          <dd className="mt-1.5 text-sm text-ink">
            {system && system.organizationId === orgId ? (
              <Link href={`/app/systems/${system.id}`} className="hover:underline">
                {system.name}
              </Link>
            ) : (
              "—"
            )}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium tracking-[0.12em] text-mute uppercase">Version</dt>
          <dd className="tnum mt-1.5 text-sm text-ink">v{current?.version.version ?? 0}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium tracking-[0.12em] text-mute uppercase">
            Est. minutes / run
          </dt>
          <dd className="tnum mt-1.5 text-sm text-ink">
            {automation.estMinutesPerRun > 0 ? automation.estMinutesPerRun : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium tracking-[0.12em] text-mute uppercase">Created</dt>
          <dd className="tnum mt-1.5 text-sm text-ink">{formatDate(automation.createdAt)}</dd>
        </div>
      </dl>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-ink">
            Steps — v{current?.version.version ?? 0}
          </h2>
          {current && current.definition.nodes.length > 0 ? (
            <ol className="space-y-2">
              {current.definition.nodes.map((node, i) => (
                <li key={node.key} className="flex items-center gap-3 border border-fog bg-surface px-4 py-3">
                  <span className="tnum text-[11px] font-medium text-mute">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium text-ink">{node.key}</span>
                  <span className="ml-auto text-[11px] font-medium tracking-[0.1em] text-slate uppercase">
                    {node.type}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="border border-dashed border-fog px-6 py-8 text-center text-sm text-mute">
              No steps defined yet.
            </p>
          )}
          <div className="mt-4">
            <h3 className="mb-2 text-[11px] font-medium tracking-[0.12em] text-mute uppercase">
              Version history
            </h3>
            <ul className="text-[13px] text-slate">
              {versions.map((v) => (
                <li key={v.id} className="flex justify-between border-b border-fog py-1.5 last:border-0">
                  <span className="tnum">v{v.version}</span>
                  <span className="tnum">{formatDateTime(v.createdAt)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-8">
          <RunForm
            automationId={automation.id}
            canRun={can(ctx, "automations.run")}
            status={automation.status}
          />

          <div>
            <h2 className="mb-3 text-sm font-semibold text-ink">Recent runs</h2>
            {runs.length === 0 ? (
              <p className="border border-dashed border-fog px-6 py-8 text-center text-sm text-mute">
                No runs yet.
              </p>
            ) : (
              <div className="overflow-hidden border border-fog">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-fog bg-haze text-left text-[11px] font-medium tracking-[0.1em] text-mute uppercase">
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Version</th>
                      <th className="px-4 py-2.5">Started</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runs.map((run) => (
                      <tr key={run.id} className="border-b border-fog last:border-0">
                        <td className="px-4 py-3">
                          <Link href={`/app/operations/${run.id}`} className="hover:underline">
                            <StatusPill status={run.status} />
                          </Link>
                        </td>
                        <td className="tnum px-4 py-3 text-slate">v{run.version}</td>
                        <td className="tnum px-4 py-3 text-slate">{formatDateTime(run.startedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
