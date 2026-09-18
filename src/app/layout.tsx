import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { ScrollManager } from "@/components/scroll-manager";
import { Analytics } from "@/components/analytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

/**
 * Site defaults. Page-level metadata is built by `pageMetadata` in
 * src/lib/seo.ts — that helper always sets the title, description, canonical
 * and social card, so these values are only the fallback for routes that need
 * nothing beyond the brand frame (utility and control-plane pages).
 *
 * Deliberately no `alternates.canonical` here: a default canonical would make
 * every page that forgets its own point at the homepage. Canonicals are set
 * per page, and only per page.
 */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.descriptor}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      // Full-length snippets and large image previews in search results.
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.descriptor}`,
    description: site.description,
    url: site.url,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.descriptor}`,
    description: site.description,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${instrument.variable}`}>
      <body className="flex min-h-svh flex-col">
        <ScrollManager />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
