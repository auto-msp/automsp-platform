import type { Metadata } from "next";
import Link from "next/link";
import { AppPageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { StatusPill } from "@/components/app/status-pill";
import { can, getSessionContext } from "@/server/auth/session";
import { listIntegrations, providerByKey } from "@/server/integrations";
import { usingDevVaultKey } from "@/server/vault";
import { formatDateTime, truncateId } from "@/lib/format";
import { RevokeButton } from "./revoke-form";

export const metadata: Metadata = { title: "Integrations" };
export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const ctx = await getSessionContext();
  if (!ctx) return null;
  if (!can(ctx, "integrations.view")) {
    return (
      <EmptyState
        title="No access"
        description="Your role does not include integration management. Ask an organization owner or admin."
      />
    );
  }

  const rows = await listIntegrations(ctx.organization.id);
  const canManage = can(ctx, "integrations.manage");
  const devKey = usingDevVaultKey();

  return (
    <div>
      <AppPageHeader
        title="Integrations"
        description="External credentials are sealed with AES-256-GCM before storage. They are shown nowhere — not here, not in logs, not in run output. Only workflow HTTP steps consume them."
      >
        {canManage ? (
          <Link
            href="/app/integrations/new"
            className="inline-flex h-10 items-center bg-ink px-4 text-[12px] font-medium tracking-[0.08em] text-paper uppercase transition-colors hover:bg-graphite"
          >
            Add credential
          </Link>
        ) : null}
      </AppPageHeader>

      <div className="mb-6 border border-fog bg-haze px-4 py-3">
        <p className="text-[13px] text-slate">
          {devKey ? (
            <>
              <span className="font-medium text-warn">Development vault key.</span> Secrets are sealed
              with a key stored in the gitignored <code className="text-ink">.data/</code> directory. In
              production the key comes from <code className="text-ink">AUTOMSP_VAULT_KEY</code> — set it
              before storing real credentials.
            </>
          ) : (
            <>
              <span className="font-medium text-ok">Vault key configured.</span> Secrets are sealed with
              the key from <code className="text-ink">AUTOMSP_VAULT_KEY</code>.
            </>
          )}
        </p>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No credentials yet"
          description="Add an API token for the systems your automations talk to. The secret is sealed before it is written anywhere and never becomes visible again."
          action={canManage ? { href: "/app/integrations/new", label: "Add the first credential" } : undefined}
        />
      ) : (
        <div className="border border-fog">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-fog text-[11px] tracking-[0.1em] text-mute uppercase">
                <th className="px-4 py-2.5 font-medium">Name</th>
                <th className="px-4 py-2.5 font-medium">Provider</th>
                <th className="px-4 py-2.5 font-medium">Secret</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Last used</th>
                <th className="px-4 py-2.5 font-medium">Id</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-fog last:border-0">
                  <td className="px-4 py-3 font-medium text-ink">{row.name}</td>
                  <td className="px-4 py-3 text-slate">
                    {providerByKey(row.providerKey)?.name ?? row.providerKey}
                  </td>
                  <td className="px-4 py-3">
                    <span className="tnum text-slate">
                      {row.secretPreview ? `••••${row.secretPreview}` : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill status={row.status} />
                  </td>
                  <td className="tnum px-4 py-3 text-slate">
                    {row.lastUsedAt ? formatDateTime(row.lastUsedAt) : "Never"}
                  </td>
                  <td className="tnum px-4 py-3 text-mute">{truncateId(row.id)}</td>
                  <td className="px-4 py-3 text-right">
                    {canManage && row.status === "active" ? (
                      <RevokeButton integrationId={row.id} name={row.name} />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-[12px] leading-relaxed text-mute">
        Revoking a credential destroys the sealed material. Managed connectors (OAuth sign-in flows,
        automatic sync) are not configured in this environment — credentials work with HTTP workflow
        steps only.
      </p>
    </div>
  );
}
