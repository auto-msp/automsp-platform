"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center justify-between px-3 py-2 text-sm transition-colors ${
        active ? "bg-ink font-medium text-paper" : "text-graphite hover:bg-haze hover:text-ink"
      }`}
    >
      <span>{label}</span>
      {badge ? (
        <span
          className={`tnum px-1.5 text-[11px] font-medium ${
            active ? "bg-paper/15 text-paper" : "bg-haze text-graphite"
          }`}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
