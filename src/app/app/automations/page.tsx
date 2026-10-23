import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/app/empty-state";
import { AppPageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";
import { formatDate } from "@/lib/format";
import { can, getSessionContext } from "@/server/auth/session";
import { listAutomations, listVersions } from "@/server/automations";
import { store } from "@/server/db/store";

export const metadata: Metadata = { title: "Automations" };

export const dynamic = "force-dynamic";

export default async function AutomationsPage() {
  const ctx = await getSessionContext();
  if (!ctx) return null;
  const orgId = ctx.organization.id;

  const [automations, systems, executions] = await Promise.all([
    listAutomations(orgId),
    store.query("systems", { organizationId: orgId }),
    store.query("executions", { organizationId: orgId }),
  ]);
  const systemNames = new Map(systems.map((s) => [s.id, s.name]));
  const runsByAutomation = new Map<string, number>();
  for (const e of executions) {
    runsByAutomation.set(e.automationId, (runsByAutomation.get(e.automationId) ?? 0) + 1);
  }

  const versionsByAutomation = new Map(
    await Promise.all(
      automations.map(async (a) => {
        const versions = await listVersions(a.id);
        return [a.id, versions[0]?.version ?? 0] as const;
      }),
    ),
  );

  const canManage = can(ctx, "automations.manage");

  return (
    <div>
      <AppPageHeader
        title="Automations"
        description="Step graphs that move work forward — with approval gates where a human decides."
      >
        {canManage ? (
          <Link
            href="/app/automations/new"
            className="btn btn-primary"
          >
            New automation
          </Link>
        ) : null}
      </AppPageHeader>

      {automations.length === 0 ? (
        <EmptyState
          title="No automations yet"
          description="Define your first automation: a trigger, the steps that follow, and approval gates where a person must decide."
          action={canManage ? { href: "/app/automations/new", label: "Define an automation" } : undefined}
        />
      ) : (
        <div className="table-wrap" tabIndex={0}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Automation</th>
                <th>Status</th>
                <th>System</th>
                <th>Version</th>
                <th>Runs</th>
                <th>Updated</th>
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
                  <td className="text-slate">
                    {automation.systemId ? (systemNames.get(automation.systemId) ?? "—") : "—"}
                  </td>
                  <td className="tnum text-slate">
                    v{versionsByAutomation.get(automation.id) ?? 0}
                  </td>
                  <td className="tnum text-slate">{runsByAutomation.get(automation.id) ?? 0}</td>
                  <td className="tnum text-slate">{formatDate(automation.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-[13px] text-slate">
        Scheduled and webhook triggers —{" "}
        <span className="text-mute">not configured in this environment. Automations run manually for now.</span>
      </p>
    </div>
  );
}
