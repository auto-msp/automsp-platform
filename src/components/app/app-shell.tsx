import Link from "next/link";
import { signOut } from "@/server/auth/actions";
import { can, type SessionContext } from "@/server/auth/session";
import { store } from "@/server/db/store";
import { unreadCount } from "@/server/notifications";
import { formatRole } from "@/server/roles";
import { ArrowUpRight, Bell, LogOut } from "lucide-react";
import { MobileNav } from "./mobile-nav";
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
  if (can(ctx, "knowledge.view")) work.push({ href: "/app/growth", label: "Growth" });
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
      <a
        href="#main"
        className="sr-only z-[60] rounded-(--radius-control) bg-ink px-4 py-3 text-sm font-medium text-paper focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>

      <aside className="sticky top-0 hidden h-svh w-nav shrink-0 flex-col border-r border-fog lg:flex">
        <div className="flex h-(--spacing-bar) items-center gap-2 border-b border-fog px-5">
          <Link href="/app/dashboard" className="text-[15px] font-semibold tracking-tight text-ink">
            AutoMSP
          </Link>
          <span className="rounded-(--radius-chip) border border-fog bg-haze px-1.5 py-px text-xs font-medium text-slate">
            Platform
          </span>
        </div>

        <nav aria-label="Main" className="flex-1 overflow-y-auto py-3">
          {sections.map((section) => (
            <div key={section.title} className="mb-4">
              <p className="px-4 pb-1 text-xs font-semibold text-mute">{section.title}</p>
              {section.items.map((item) => (
                <NavLink key={item.href} href={item.href} label={item.label} badge={item.badge} />
              ))}
            </div>
          ))}
        </nav>

        <div className="border-t border-fog p-3">
          <p className="px-1 pb-2 text-xs leading-relaxed text-mute">
            Development environment — local data store. External integrations are not configured.
          </p>
          <Link
            href="/"
            className="flex min-h-10 items-center gap-1.5 px-1 text-[13px] text-slate transition-colors hover:text-ink pointer-coarse:min-h-11"
          >
            automsp.us
            <ArrowUpRight aria-hidden className="size-3.5" strokeWidth={1.75} />
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-(--spacing-bar) items-center justify-between gap-2 border-b border-fog bg-paper px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-2 md:gap-3">
            <MobileNav sections={sections} />
            <span className="truncate text-sm font-semibold text-ink">{ctx.organization.name}</span>
            <span className="shrink-0 rounded-(--radius-chip) border border-warn/40 bg-warn-soft px-1.5 py-px text-xs font-medium text-warn">
              Development
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1 md:gap-3">
            <Link
              href="/app/notifications"
              aria-label={unread > 0 ? `${unread} unread notifications` : "Notifications"}
              className="relative flex size-11 items-center justify-center rounded-(--radius-control) text-slate transition-colors hover:bg-haze hover:text-ink"
            >
              <Bell aria-hidden className="size-5" strokeWidth={1.75} />
              {unread > 0 ? (
                <span
                  aria-hidden
                  className="tnum absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-surface"
                >
                  {unread > 9 ? "9+" : unread}
                </span>
              ) : null}
            </Link>
            <div className="hidden text-right md:block">
              <p className="text-[13px] leading-tight font-medium text-ink">{ctx.user.name}</p>
              <p className="text-xs text-mute">{formatRole(ctx.membership.role)}</p>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                aria-label="Sign out"
                className="flex min-h-11 items-center gap-2 rounded-(--radius-control) border border-line px-3 text-[13px] font-medium text-graphite transition-colors hover:border-ink hover:text-ink"
              >
                <LogOut aria-hidden className="size-4" strokeWidth={1.75} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </header>

        <main id="main" tabIndex={-1} className="flex-1 px-4 py-6 outline-none md:px-6 md:py-8 xl:px-8">
          <div className="mx-auto w-full max-w-[80rem]">{children}</div>
        </main>
      </div>
    </div>
  );
}
