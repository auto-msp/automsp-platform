"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  Bell,
  ChartColumn,
  ClipboardCheck,
  CreditCard,
  FileText,
  LayoutDashboard,
  Plug,
  Server,
  ShieldCheck,
  TrendingUp,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Server code passes a string key; the icon component stays on the client. */
const ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  systems: Server,
  automations: Workflow,
  agents: Bot,
  knowledge: BookOpen,
  growth: TrendingUp,
  evals: ClipboardCheck,
  integrations: Plug,
  operations: Activity,
  approvals: ShieldCheck,
  notifications: Bell,
  analytics: ChartColumn,
  reports: FileText,
  organization: Building2,
  billing: CreditCard,
  commercial: Briefcase,
};

export function NavLink({
  href,
  label,
  icon,
  badge,
}: {
  href: string;
  label: string;
  icon?: string;
  badge?: number;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");
  const Icon = icon ? ICONS[icon] : undefined;

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex min-h-11 items-center gap-3 lg:min-h-10 lg:pointer-coarse:min-h-11 rounded-md px-3 text-sm transition-colors duration-150",
        active
          ? "bg-ink font-medium text-paper"
          : "text-graphite hover:bg-haze hover:text-ink",
      )}
    >
      {Icon ? (
        <Icon
          aria-hidden
          strokeWidth={1.75}
          className={cn("size-[18px] shrink-0", active ? "text-paper" : "text-mute group-hover:text-ink")}
        />
      ) : null}
      <span className="flex-1">{label}</span>
      {badge ? (
        <span
          className={cn(
            "tnum min-w-5 rounded-sm px-1.5 py-px text-center text-xs font-semibold",
            active ? "bg-paper/20 text-paper" : "bg-accent-soft text-accent-strong",
          )}
        >
          <span className="sr-only">(</span>
          {badge}
          <span className="sr-only">)</span>
        </span>
      ) : null}
    </Link>
  );
}
