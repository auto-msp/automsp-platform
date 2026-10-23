"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { NavLink } from "./nav-link";

export interface MobileNavSection {
  title: string;
  items: { href: string; label: string; badge?: number }[];
}

/**
 * Navigation drawer for viewports below `lg`, where the fixed sidebar is hidden.
 * Modal dialog: focus moves in, Tab is trapped, Escape/backdrop/route change close it,
 * and focus returns to the menu button.
 */
export function MobileNav({ sections }: { sections: MobileNavSection[] }) {
  // Open is tied to the pathname it was opened on, so navigating closes the drawer.
  const pathname = usePathname();
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpenAt(null);
    trigger.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("button, a")?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !panel.current) return;
      const focusable = panel.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpenAt(pathname)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        aria-haspopup="dialog"
        className="-ml-2 flex size-11 shrink-0 items-center justify-center rounded-(--radius-control) text-ink transition-colors hover:bg-haze lg:hidden"
      >
        <Menu aria-hidden className="size-5" strokeWidth={1.75} />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div aria-hidden onClick={close} className="absolute inset-0 bg-ink/50" />
          <div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col border-r border-fog bg-paper shadow-(--shadow-float)"
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-fog pr-2 pl-4">
              <span className="text-[15px] font-semibold tracking-tight text-ink">AutoMSP</span>
              <button
                type="button"
                onClick={close}
                aria-label="Close navigation menu"
                className="flex size-11 items-center justify-center rounded-(--radius-control) text-ink transition-colors hover:bg-haze"
              >
                <X aria-hidden className="size-5" strokeWidth={1.75} />
              </button>
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
            <div className="shrink-0 border-t border-fog p-2">
              <Link
                href="/"
                className="flex min-h-11 items-center gap-2 px-3 text-sm text-slate transition-colors hover:text-ink"
              >
                automsp.us
                <ArrowUpRight aria-hidden className="size-4" strokeWidth={1.75} />
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
