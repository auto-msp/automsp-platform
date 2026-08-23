"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { marketingNav, type NavItem } from "@/lib/site";
import { cn } from "@/lib/utils";

function isActive(pathname: string, item: NavItem): boolean {
  if (item.children) return item.children.some((c) => pathname === c.href || pathname.startsWith(c.href + "/"));
  return pathname === item.href || pathname.startsWith(item.href + "/");
}

export function SiteHeader() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  /** Close everything on navigation — attached to nav link clicks. */
  function closeAll() {
    setOpenMenu(null);
    setMobileOpen(false);
    setMobileGroup(null);
    document.body.style.overflow = "";
  }

  // Close desktop dropdowns on outside pointer-down and on Escape.
  useEffect(() => {
    if (!openMenu) return;

    function onPointerDown(e: PointerEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenMenu(null);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenu]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-fog bg-paper/90 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-60 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>

      <div
        ref={navRef}
        className="mx-auto flex h-[68px] w-full max-w-[76rem] items-center justify-between px-5 sm:px-8"
      >
        {/* Logo mark — replaces the text wordmark */}
        <Link href="/" aria-label="AutoMSP — home" className="flex shrink-0 items-center">
          <Image
            src="/brand/logo-gravatar.png"
            alt=""
            width={40}
            height={40}
            priority
            className="size-10 rounded-full transition-transform duration-300 hover:scale-105"
          />
        </Link>

        {/* Desktop navigation */}
        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {marketingNav.map((item) => {
            const active = isActive(pathname, item);
            if (!item.children) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={closeAll}
                  className={cn(
                    "px-4 py-2 text-[13px] font-medium uppercase tracking-[0.06em] transition-colors",
                    active ? "text-ink" : "text-slate hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              );
            }
            const open = openMenu === item.label;
            return (
              <div key={item.label} className="relative">
                <button
                  type="button"
                  aria-expanded={open}
                  aria-haspopup="true"
                  onClick={() => setOpenMenu(open ? null : item.label)}
                  onMouseEnter={() => setOpenMenu(item.label)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium uppercase tracking-[0.06em] transition-colors",
                    active || open ? "text-ink" : "text-slate hover:text-ink",
                  )}
                >
                  {item.label}
                  <ChevronDown
                    className={cn(
                      "size-3.5 transition-transform duration-200",
                      open && "rotate-180",
                    )}
                    strokeWidth={2}
                    aria-hidden
                  />
                </button>

                <div
                  className={cn(
                    "absolute top-full left-0 pt-2 transition-opacity duration-150",
                    open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
                  )}
                >
                  <div className="min-w-80 border border-fog bg-paper p-2 shadow-lg shadow-ink/5">
                    {item.children.map((child) => (
                      <Link
                        key={child.href + child.label}
                        href={child.href}
                        onClick={closeAll}
                        className={cn(
                          "group block px-4 py-3 transition-colors hover:bg-haze",
                          pathname === child.href && "bg-haze",
                        )}
                      >
                        <span className="flex items-center justify-between text-sm font-medium text-ink">
                          {child.label}
                          <ArrowRight
                            className="size-3.5 -translate-x-1 text-mute opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                            strokeWidth={2}
                            aria-hidden
                          />
                        </span>
                        <span className="mt-0.5 block text-[12.5px] leading-snug text-slate">
                          {child.description}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/book-audit"
            onClick={closeAll}
            className="group inline-flex h-10 items-center gap-2 bg-ink px-5 text-[13px] font-medium uppercase tracking-[0.08em] text-paper transition-colors hover:bg-graphite"
          >
            Book Audit
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={1.75} aria-hidden />
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex size-10 items-center justify-center text-ink lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
        </button>
      </div>

      {/* Mobile navigation */}
      <div
        id="mobile-nav"
        className={cn(
          "fixed inset-0 top-[68px] z-40 flex-col overflow-y-auto bg-paper lg:hidden",
          mobileOpen ? "flex" : "hidden",
        )}
      >
        <nav aria-label="Mobile" className="flex flex-col px-6 py-8">
          {marketingNav.map((item, i) =>
            !item.children ? (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeAll}
                className="flex items-baseline justify-between border-b border-fog py-4 text-2xl font-medium tracking-tight text-ink"
              >
                {item.label}
                <span className="tnum text-xs text-mute">0{i + 1}</span>
              </Link>
            ) : (
              <div key={item.label} className="border-b border-fog">
                <button
                  type="button"
                  aria-expanded={mobileGroup === item.label}
                  onClick={() => setMobileGroup(mobileGroup === item.label ? null : item.label)}
                  className="flex w-full items-baseline justify-between py-4 text-2xl font-medium tracking-tight text-ink"
                >
                  {item.label}
                  <ChevronDown
                    className={cn(
                      "size-5 self-center transition-transform duration-200",
                      mobileGroup === item.label && "rotate-180",
                    )}
                    strokeWidth={2}
                    aria-hidden
                  />
                </button>
                <div className={cn("overflow-hidden", mobileGroup === item.label ? "block pb-3" : "hidden")}>
                  {item.children.map((child) => (
                    <Link
                      key={child.href + child.label}
                      href={child.href}
                      onClick={closeAll}
                      className="block py-2 pl-4 text-base text-slate first:pt-0 hover:text-ink"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            ),
          )}
          <Link
            href="/book-audit"
            onClick={closeAll}
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
