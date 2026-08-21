import type { Metadata } from "next";
import { AppPageHeader } from "@/components/app/page-header";
import { formatDate } from "@/lib/format";
import { can, getSessionContext } from "@/server/auth/session";
import { store } from "@/server/db/store";
import { InviteForm } from "./invite-form";
import { MemberRow } from "./member-row";

export const metadata: Metadata = { title: "Organization" };

export const dynamic = "force-dynamic";

export default async function OrganizationPage() {
  const ctx = await getSessionContext();
  if (!ctx) return null;
  const orgId = ctx.organization.id;

  const [memberships, users] = await Promise.all([
    store.find("memberships", (m) => m.organizationId === orgId),
    store.all("users"),
  ]);
  const userById = new Map(users.map((u) => [u.id, u]));
  const members = memberships
    .map((m) => ({ membership: m, user: userById.get(m.userId) }))
    .filter((m) => m.user !== undefined);

  const canManageMembers = can(ctx, "members.invite");

  return (
    <div>
      <AppPageHeader
        title="Organization"
        description="Your workspace, its members, and their access."
      />

      <dl className="grid grid-cols-2 gap-4 border border-fog bg-surface p-5 sm:grid-cols-4">
        <div>
          <dt className="text-[11px] font-medium tracking-[0.12em] text-mute uppercase">Name</dt>
          <dd className="mt-1.5 text-sm text-ink">{ctx.organization.name}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium tracking-[0.12em] text-mute uppercase">Slug</dt>
          <dd className="tnum mt-1.5 text-sm text-ink">{ctx.organization.slug}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium tracking-[0.12em] text-mute uppercase">Type</dt>
          <dd className="mt-1.5 text-sm text-ink capitalize">{ctx.organization.kind}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium tracking-[0.12em] text-mute uppercase">Created</dt>
          <dd className="tnum mt-1.5 text-sm text-ink">{formatDate(ctx.organization.createdAt)}</dd>
        </div>
      </dl>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-ink">Members ({members.length})</h2>
        <div className="overflow-hidden border border-fog">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-fog bg-haze text-left text-[11px] font-medium tracking-[0.1em] text-mute uppercase">
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">Email</th>
                <th className="px-4 py-2.5">Role</th>
                <th className="px-4 py-2.5">Joined</th>
                {canManageMembers ? <th className="px-4 py-2.5" /> : null}
              </tr>
            </thead>
            <tbody>
              {members.map(({ membership, user }) => (
                <MemberRow
                  key={membership.id}
                  membershipId={membership.id}
                  name={user!.name}
                  email={user!.email}
                  role={membership.role}
                  createdAt={membership.createdAt}
                  isSelf={membership.userId === ctx.user.id}
                  canManage={canManageMembers}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {canManageMembers ? (
        <div className="mt-8 max-w-xl">
          <h2 className="mb-1.5 text-sm font-semibold text-ink">Add a member</h2>
          <p className="mb-4 text-[13px] text-slate">
            Email invitations are not configured in this environment — members join by signing up
            first, then being added here by email.
          </p>
          <InviteForm />
        </div>
      ) : null}

      <div className="mt-8 border border-fog bg-haze p-5">
        <p className="text-sm font-medium text-ink">Single-sign-on and SCIM</p>
        <p className="mt-1 text-[13px] text-slate">
          Not configured in this environment. Managed deployments wire these to your identity
          provider.
        </p>
      </div>
    </div>
  );
}
