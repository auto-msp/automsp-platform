import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/app/empty-state";
import { AppPageHeader } from "@/components/app/page-header";
import { StatusPill } from "@/components/app/status-pill";
import { formatDate } from "@/lib/format";
import { can, getSessionContext } from "@/server/auth/session";
import { store } from "@/server/db/store";
import { listSystems } from "@/server/systems";

export const metadata: Metadata = { title: "Systems" };

export const dynamic = "force-dynamic";

export default async function SystemsPage() {
  const ctx = await getSessionContext();
  if (!ctx) return null;
  const orgId = ctx.organization.id;

  const [systems, automations] = await Promise.all([
    listSystems(orgId),
    store.query("automations", { organizationId: orgId }),
  ]);
  const countBySystem = new Map<string, number>();
  for (const a of automations) {
    if (a.systemId) countBySystem.set(a.systemId, (countBySystem.get(a.systemId) ?? 0) + 1);
  }

  const canManage = can(ctx, "systems.manage");

  return (
    <div>
      <AppPageHeader
        title="Systems"
        description="Each system groups automations around one business outcome."
      >
        {canManage ? (
          <Link
            href="/app/systems/new"
            className="btn btn-primary"
          >
            New system
          </Link>
        ) : null}
      </AppPageHeader>

      {systems.length === 0 ? (
        <EmptyState
          title="No systems yet"
          description="Create a system to start organizing automations around a business outcome."
          action={canManage ? { href: "/app/systems/new", label: "Create a system" } : undefined}
        />
      ) : (
        <div className="table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th>System</th>
                <th>Status</th>
                <th>Business outcome</th>
                <th>Automations</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {systems.map((system) => (
                <tr key={system.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/app/systems/${system.id}`}
                      className="row-link"
                    >
                      {system.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={system.status} />
                  </td>
                  <td className="max-w-56 truncate px-4 py-3 text-slate">
                    {system.businessOutcome || "—"}
                  </td>
                  <td className="tnum px-4 py-3 text-slate">{countBySystem.get(system.id) ?? 0}</td>
                  <td className="tnum px-4 py-3 text-slate">{formatDate(system.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-[13px] text-slate">
        Integration status and live connection health —{" "}
        <span className="text-mute">not configured in this environment.</span>
      </p>
    </div>
  );
}
