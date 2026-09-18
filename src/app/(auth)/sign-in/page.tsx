import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SignInForm } from "./sign-in-form";

// Utility page: it ranks for nothing useful and competes with the marketing
// pages for brand queries. Kept crawlable (not disallowed in robots.txt) so the
// directive is actually seen, with follow left on so the links out of it still
// pass through.
export const metadata: Metadata = pageMetadata({
  title: "Sign in",
  description: "Sign in to the AutoMSP client platform.",
  path: "/sign-in",
  index: false,
});

export default function SignInPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Sign in to AutoMSP</h1>
      <p className="mt-2 text-sm text-slate">Access your organization&rsquo;s automation control plane.</p>
      <div className="mt-8">
        <SignInForm />
      </div>
      <p className="mt-6 text-sm text-slate">
        No account yet?{" "}
        <Link href="/sign-up" className="font-medium text-ink underline-offset-4 hover:underline">
          Create one
        </Link>
      </p>
      <p className="mt-2 text-sm text-slate">
        SSO (Google / Microsoft) —{" "}
        <span className="text-mute">not configured for this environment.</span>
      </p>
    </div>
  );
}
