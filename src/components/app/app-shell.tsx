import Link from "next/link";
import { signOut } from "@/server/auth/actions";
import { can, type SessionContext } from "@/server/auth/session";
import { store } from "@/server/db/store";
import { unreadCount } from "@/server/notifications";
import { formatRole } from "@/server/roles";
import { NavLink } from "./nav-link";

interface NavItem {
  href: string;
  label: string;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

async function buildNav(ctx: SessionContext): Promise<NavSection[]> {
  const sections: NavSection[] = [];

  const work: NavItem[] = [{ href: "/app/dashboard", label: "Dashboard" }];
  if (can(ctx, "systems.view")) work.push({ href: "/app/systems", label: "Systems" });
  if (can(ctx, "automations.view")) work.push({ href: "/app/automations", label: "Automations" });
  if (can(ctx, "agents.view")) work.push({ href: "/app/agents", label: "Agents" });
  if (can(ctx, "knowledge.view")) work.push({ href: "/app/knowledge", label: "Knowledge" });
  if (can(ctx, "evals.view")) work.push({ href: "/app/evals", label: "Evaluations" });
  if (can(ctx, "integrations.view")) work.push({ href: "/app/integrations", label: "Integrations" });
  sections.push({ title: "Work", items: work });

  const run: NavItem[] = [];
  if (can(ctx, "executions.view")) run.push({ href: "/app/operations", label: "Operations" });
  if (can(ctx, "approvals.view")) {
    const pending = await store.query("approvals", {
      organizationId: ctx.organization.id,
      status: "pending",
    });
    run.push({ href: "/app/approvals", label: "Approvals", badge: pending.length });
  }
  if (run.length > 0) sections.push({ title: "Run", items: run });

  const account: NavItem[] = [];
  const unread = await unreadCount(ctx.organization.id, ctx.user.id);
  account.push({ href: "/app/notifications", label: "Notifications", badge: unread });
  if (can(ctx, "analytics.view")) account.push({ href: "/app/analytics", label: "Analytics" });
  if (can(ctx, "reports.view")) account.push({ href: "/app/reports", label: "Reports" });
  if (can(ctx, "org.view")) account.push({ href: "/app/organization", label: "Organization" });
  if (can(ctx, "billing.view")) account.push({ href: "/app/billing", label: "Billing" });
  sections.push({ title: "Account", items: account });

  // AutoMSP's own pipeline — only in the operations tenant (operator/agent orgs
  // follow the same can() rule on other routes)
  if (ctx.organization.kind === "automsp" && can(ctx, "commercial.view")) {
    sections.push({ title: "AutoMSP", items: [{ href: "/app/commercial", label: "Commercial" }] });
  }

  return sections;
}

export async function AppShell({
  ctx,
  children,
}: {
  ctx: SessionContext;
  children: React.ReactNode;
}) {
  const sections = await buildNav(ctx);
  const unread =
    sections
      .flatMap((s) => s.items)
      .find((i) => i.href === "/app/notifications")?.badge ?? 0;

  return (
    <div className="flex min-h-svh bg-paper">
      <aside className="sticky top-0 flex h-svh w-60 shrink-0 flex-col border-r border-fog">
        <div className="flex h-14 items-center gap-2 border-b border-fog px-5">
          <Link href="/app/dashboard" className="text-[15px] font-semibold tracking-tight text-ink">
            AutoMSP
          </Link>
          <span className="border border-fog bg-haze px-1.5 py-px text-[10px] font-medium tracking-[0.1em] text-slate uppercase">
            Platform
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4">
          {sections.map((section) => (
            <div key={section.title} className="mb-5">
              <p className="px-3 pb-1.5 text-[11px] font-medium tracking-[0.12em] text-mute uppercase">
                {section.title}
              </p>
              <div className="space-y-px">
                {section.items.map((item) => (
                  <NavLink key={item.href} href={item.href} label={item.label} badge={item.badge} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-fog p-3">
          <p className="px-3 pb-2 text-[11px] leading-relaxed text-mute">
            Development environment — local data store. External integrations are not configured.
          </p>
          <Link
            href="/"
            className="block px-3 py-1.5 text-[13px] text-slate transition-colors hover:text-ink"
          >
            ← automsp.us
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-fog bg-paper px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="truncate text-sm font-medium text-ink">{ctx.organization.name}</span>
            <span className="border border-warn/40 bg-warn/10 px-1.5 py-px text-[10px] font-medium tracking-[0.1em] text-warn uppercase">
              Development
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/app/notifications"
              aria-label={unread > 0 ? `${unread} unread notifications` : "Notifications"}
              className="relative flex h-8 w-8 items-center justify-center border border-fog text-slate transition-colors hover:border-ink hover:text-ink"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              {unread > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center bg-accent px-1 text-[10px] font-semibold text-paper">
                  {unread > 9 ? "9+" : unread}
                </span>
              ) : null}
            </Link>
            <div className="text-right">
              <p className="text-[13px] font-medium text-ink">{ctx.user.name}</p>
              <p className="text-[11px] text-mute">{formatRole(ctx.membership.role)}</p>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="border border-fog px-3 py-1.5 text-[13px] text-slate transition-colors hover:border-ink hover:text-ink"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 px-6 py-8">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
