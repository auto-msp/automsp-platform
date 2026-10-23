import Link from "next/link";
import { Bell, LogOut, ArrowLeft } from "lucide-react";
import { signOut } from "@/server/auth/actions";
import { can, type SessionContext } from "@/server/auth/session";
import { store } from "@/server/db/store";
import { unreadCount } from "@/server/notifications";
import { formatRole } from "@/server/roles";
import { NavLink } from "./nav-link";
import { MobileNav } from "./mobile-nav";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

async function buildNav(ctx: SessionContext): Promise<NavSection[]> {
  const sections: NavSection[] = [];

  const work: NavItem[] = [{ href: "/app/dashboard", label: "Dashboard", icon: "dashboard" }];
  if (can(ctx, "systems.view")) work.push({ href: "/app/systems", label: "Systems", icon: "systems" });
  if (can(ctx, "automations.view")) work.push({ href: "/app/automations", label: "Automations", icon: "automations" });
  if (can(ctx, "agents.view")) work.push({ href: "/app/agents", label: "Agents", icon: "agents" });
  if (can(ctx, "knowledge.view")) work.push({ href: "/app/knowledge", label: "Knowledge", icon: "knowledge" });
  if (can(ctx, "knowledge.view")) work.push({ href: "/app/growth", label: "Growth", icon: "growth" });
  if (can(ctx, "evals.view")) work.push({ href: "/app/evals", label: "Evaluations", icon: "evals" });
  if (can(ctx, "integrations.view")) work.push({ href: "/app/integrations", label: "Integrations", icon: "integrations" });
  sections.push({ title: "Work", items: work });

  const run: NavItem[] = [];
  if (can(ctx, "executions.view")) run.push({ href: "/app/operations", label: "Operations", icon: "operations" });
  if (can(ctx, "approvals.view")) {
    const pending = await store.query("approvals", {
      organizationId: ctx.organization.id,
      status: "pending",
    });
    run.push({ href: "/app/approvals", label: "Approvals", icon: "approvals", badge: pending.length });
  }
  if (run.length > 0) sections.push({ title: "Run", items: run });

  const account: NavItem[] = [];
  const unread = await unreadCount(ctx.organization.id, ctx.user.id);
  account.push({ href: "/app/notifications", label: "Notifications", icon: "notifications", badge: unread });
  if (can(ctx, "analytics.view")) account.push({ href: "/app/analytics", label: "Analytics", icon: "analytics" });
  if (can(ctx, "reports.view")) account.push({ href: "/app/reports", label: "Reports", icon: "reports" });
  if (can(ctx, "org.view")) account.push({ href: "/app/organization", label: "Organization", icon: "organization" });
  if (can(ctx, "billing.view")) account.push({ href: "/app/billing", label: "Billing", icon: "billing" });
  sections.push({ title: "Account", items: account });

  // AutoMSP's own pipeline — only in the operations tenant (operator/agent orgs
  // follow the same can() rule on other routes)
  if (ctx.organization.kind === "automsp" && can(ctx, "commercial.view")) {
    sections.push({ title: "AutoMSP", items: [{ href: "/app/commercial", label: "Commercial", icon: "commercial" }] });
  }

  return sections;
}

function NavContent({ sections }: { sections: NavSection[] }) {
  return (
    <div className="flex h-full flex-col">
      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-4">
        {sections.map((section) => (
          <div key={section.title} className="mb-5">
            <p className="section-label px-3 pb-1.5">{section.title}</p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  badge={item.badge}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-fog p-3">
        <p className="px-3 pb-2 text-xs leading-relaxed text-mute">
          Development environment — local data store. External integrations are not configured.
        </p>
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2 rounded-md px-3 text-sm text-slate lg:min-h-10 lg:pointer-coarse:min-h-11 transition-colors hover:bg-haze hover:text-ink"
        >
          <ArrowLeft aria-hidden strokeWidth={1.75} className="size-4" />
          automsp.us
        </Link>
      </div>
    </div>
  );
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
        className="sr-only z-50 rounded-md bg-ink px-4 py-3 text-sm font-medium text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col border-r border-fog bg-paper lg:flex">
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-fog px-5">
          <Link href="/app/dashboard" className="-mx-1 inline-flex min-h-11 items-center px-1 text-[15px] font-semibold tracking-tight text-ink">
            AutoMSP
          </Link>
          <span className="rounded-sm bg-haze px-1.5 py-px text-xs font-medium text-slate">
            Platform
          </span>
        </div>
        <div className="min-h-0 flex-1">
          <NavContent sections={sections} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-2 border-b border-fog bg-paper px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <MobileNav>
              <NavContent sections={sections} />
            </MobileNav>
            <span className="truncate text-sm font-medium text-ink">{ctx.organization.name}</span>
            <span className="hidden shrink-0 rounded-sm bg-warn-soft px-1.5 py-px text-xs font-semibold text-warn sm:inline">
              Development
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <Link
              href="/app/notifications"
              aria-label={unread > 0 ? `${unread} unread notifications` : "Notifications"}
              className="btn btn-ghost btn-icon relative"
            >
              <Bell aria-hidden strokeWidth={1.75} className="size-5" />
              {unread > 0 ? (
                <span
                  aria-hidden
                  className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold leading-none text-white"
                >
                  {unread > 9 ? "9+" : unread}
                </span>
              ) : null}
            </Link>
            <div className="hidden text-right md:block">
              <p className="text-sm font-medium leading-tight text-ink">{ctx.user.name}</p>
              <p className="text-xs leading-tight text-mute">{formatRole(ctx.membership.role)}</p>
            </div>
            <form action={signOut}>
              <button type="submit" className="btn btn-secondary btn-sm min-w-11">
                <LogOut aria-hidden strokeWidth={1.75} className="size-4" />
                <span className="hidden sm:inline">Sign out</span>
                <span className="sr-only sm:hidden">Sign out</span>
              </button>
            </form>
          </div>
        </header>

        <main id="main" tabIndex={-1} className="flex-1 px-4 py-6 outline-none sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
