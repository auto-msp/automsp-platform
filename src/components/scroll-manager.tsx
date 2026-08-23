"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Route-change scroll restoration.
 *
 * Global CSS sets `html { scroll-behavior: smooth }`, which makes the
 * router's default jump-to-top animate — a navigating user watches the new
 * page slide up from their previous position. This manager scrolls
 * instantly (behavior "instant" overrides the CSS value per spec) after
 * every route change, while leaving same-page #anchor navigation to the
 * browser's native smooth scrolling.
 */
export function ScrollManager() {
  const pathname = usePathname();

  useEffect(() => {
    // Hash present → the browser will scroll to the anchor target itself.
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return null;
}
