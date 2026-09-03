"use client";

import { useEffect } from "react";
import type { Mixpanel } from "mixpanel-browser";

/**
 * Mixpanel loader — inert until NEXT_PUBLIC_MIXPANEL_TOKEN is set in the
 * environment, mirroring the GA4 gate in analytics.tsx. Project tokens are
 * public identifiers, not secrets, but the site still ships with zero
 * tracking by default and activates analytics deliberately.
 */
export function MixpanelAnalytics() {
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    import("mixpanel-browser").then((mod) => {
      if (cancelled) return;
      const mixpanel: Mixpanel = mod.default;
      mixpanel.init(token, {
        autocapture: true,
        record_sessions_percent: 100,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return null;
}
