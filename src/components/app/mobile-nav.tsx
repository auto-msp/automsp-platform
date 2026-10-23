"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

/**
 * Below 1024px the sidebar becomes a drawer. The nav markup is rendered on the
 * server and passed in as children, so the drawer adds no data fetching.
 * Behaviour: focus moves into the drawer on open and returns to the menu
 * button on close; Esc and the scrim close it; Tab is trapped inside; the page
 * behind does not scroll; it closes itself on navigation.
 */
export function MobileNav({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  // A route change closes the drawer without stealing focus from the new page.
  // Adjusting state during render is React's recommended pattern for this.
  const [openedAt, setOpenedAt] = useState(pathname);
  if (pathname !== openedAt) {
    setOpenedAt(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
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
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="app-drawer"
        className="btn btn-ghost btn-icon -ml-2 lg:hidden"
      >
        <Menu aria-hidden strokeWidth={1.75} className="size-5" />
        <span className="sr-only">Open navigation menu</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            aria-hidden
            onClick={close}
            className="absolute inset-0 bg-ink/50 motion-safe:animate-[fade-in_150ms_ease-out]"
          />
          <div
            id="app-drawer"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            className="absolute inset-y-0 left-0 z-50 flex w-[min(20rem,calc(100vw-3rem))] flex-col bg-paper shadow-pop motion-safe:animate-[slide-in_250ms_var(--ease-out-soft)]"
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-fog pl-5 pr-2">
              <span className="text-[15px] font-semibold tracking-tight text-ink">AutoMSP</span>
              <button ref={closeRef} type="button" onClick={close} className="btn btn-ghost btn-icon">
                <X aria-hidden strokeWidth={1.75} className="size-5" />
                <span className="sr-only">Close navigation menu</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </div>
        </div>
      ) : null}
    </>
  );
}
