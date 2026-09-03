import Script from "next/script";

import { MixpanelAnalytics } from "@/components/mixpanel-analytics";

/**
 * GA4 loader — inert until NEXT_PUBLIC_GA_MEASUREMENT_ID is set in the
 * environment. No measurement ID, no third-party script: the site ships
 * with zero tracking by default and activates analytics deliberately.
 * Event taxonomy lives in docs/website-master-plan/04 (§ conversion funnel).
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!gaId) return null;

  return (
    <>
      <MixpanelAnalytics />
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
