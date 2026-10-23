import type { Metadata } from "next";
import { PageHeader } from "@/components/marketing/page-header";
import { Section, Shell } from "@/components/ui/shell";
import { pageMetadata } from "@/lib/seo";
import { PRIVACY_POLICY_HTML } from "./policy-html";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How AutoMSP collects, uses, shares, and protects personal information.",
  path: "/privacy",
});

/**
 * Two corrections to the Termly-generated body, applied here rather than to the
 * generated file so they survive a policy regeneration:
 *
 *  1. The policy opens with its own "<h1>PRIVACY POLICY</h1>" title block. The
 *     PageHeader above already provides the page's single H1, so the generated
 *     one is stripped along with its wrapper — leaving two headings for the
 *     same page would split the document outline and repeat the title visually
 *     directly beneath itself.
 *  2. One outbound link is emitted over plain http (the ICO complaints page,
 *     which the same document links over https elsewhere). Only `href` values
 *     are rewritten, so XML namespace URIs are left untouched.
 */
const POLICY_HTML = PRIVACY_POLICY_HTML.replace(
  /<div><strong><span style="font-size: 26px;"><span data-custom-class="title"><h1>.*?<\/h1><\/span><\/span><\/strong><\/div>/,
  "",
).replace(/href="http:\/\//g, 'href="https://');

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        lede="How and why we collect, use, share, and protect your personal information when you use AutoMSP services."
      />
      <Section>
        <Shell>
          <div
            className="mx-auto max-w-2xl [&_a]:underline [&_a]:underline-offset-2"
            dangerouslySetInnerHTML={{ __html: POLICY_HTML }}
          />
        </Shell>
      </Section>
    </>
  );
}
