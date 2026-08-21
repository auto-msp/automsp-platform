"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { marketingNav, site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  // Menu state is tied to the path it was opened on — a navigation event
  // closes it automatically without a state-syncing effect.
  const [menu, setMenu] = useState<string | null>(null);
  const open = menu === pathname;
  const setOpen = (v: boolean) => setMenu(v ? pathname : null);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-fog bg-paper/90 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-60 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-[68px] w-full max-w-[76rem] items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="text-[19px] font-semibold tracking-tight text-ink"
          aria-label={`${site.name} — home`}
        >
          Auto<span className="text-ink">MSP</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {marketingNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-[13px] font-medium uppercase tracking-[0.06em] transition-colors",
                pathname === item.href ? "text-ink" : "text-slate hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/book-audit"
            className="group inline-flex h-10 items-center gap-2 bg-ink px-5 text-[13px] font-medium uppercase tracking-[0.08em] text-paper transition-colors hover:bg-graphite"
          >
            Book Audit
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={1.75} aria-hidden />
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center text-ink lg:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </div>

      {/* Mobile navigation */}
      <div
        id="mobile-nav"
        className={cn(
          "fixed inset-0 top-[68px] z-40 flex-col bg-paper lg:hidden",
          open ? "flex" : "hidden",
        )}
      >
        <nav aria-label="Mobile" className="flex flex-col px-6 py-8">
          {marketingNav.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-baseline justify-between border-b border-fog py-4 text-2xl font-medium tracking-tight text-ink"
            >
              {item.label}
              <span className="tnum text-xs text-mute">0{i + 1}</span>
            </Link>
          ))}
          <Link
            href="/book-audit"
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 bg-ink text-[13px] font-medium uppercase tracking-[0.08em] text-paper"
          >
            Book a Free AI Opportunity Audit
            <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
          </Link>
        </nav>
      </div>
    </header>
  );
}
