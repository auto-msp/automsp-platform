"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  ChartColumn,
  ClipboardCheck,
  CreditCard,
  FileText,
  LayoutDashboard,
  Network,
  Plug,
  ShieldCheck,
  TrendingUp,
  Workflow,
  Bell,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Keyed by route so the server-built nav stays plain serializable data.
const ICONS: Record<string, LucideIcon> = {
  "/app/dashboard": LayoutDashboard,
  "/app/systems": Network,
  "/app/automations": Workflow,
  "/app/agents": Bot,
  "/app/knowledge": BookOpen,
  "/app/growth": TrendingUp,
  "/app/evals": ClipboardCheck,
  "/app/integrations": Plug,
  "/app/operations": Activity,
  "/app/approvals": ShieldCheck,
  "/app/notifications": Bell,
  "/app/analytics": ChartColumn,
  "/app/reports": FileText,
  "/app/organization": Building2,
  "/app/billing": CreditCard,
  "/app/commercial": Briefcase,
};

export function NavLink({
  href,
  label,
  badge,
}: {
  href: string;
  label: string;
  badge?: number;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  const Icon = ICONS[href];

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-11 items-center gap-3 border-l-[3px] px-3 text-sm transition-colors lg:min-h-10 pointer-coarse:lg:min-h-11",
        active
          ? "border-brand bg-surface font-semibold text-ink"
          : "border-transparent text-graphite hover:bg-haze hover:text-ink",
      )}
    >
      {Icon ? (
        <Icon aria-hidden className={cn("size-[18px] shrink-0", active ? "text-ink" : "text-slate")} strokeWidth={1.75} />
      ) : null}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {badge ? (
        <span
          aria-label={`${badge} ${label === "Approvals" ? "pending" : "unread"}`}
          className="tnum rounded-(--radius-chip) bg-ink px-1.5 py-px text-xs font-semibold text-paper"
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
