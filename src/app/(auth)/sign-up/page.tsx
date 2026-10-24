import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SignUpForm } from "./sign-up-form";

// Utility page — see the note on the sign-in route.
export const metadata: Metadata = pageMetadata({
  title: "Create your account",
  description: "Create an AutoMSP organization account.",
  path: "/sign-up",
  index: false,
});

export default function SignUpPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Create your account</h1>
      <p className="mt-2 text-sm text-slate">
        Your organization gets its own isolated workspace with role-based access.
      </p>
      <div className="mt-8">
        <SignUpForm />
      </div>
      <p className="mt-6 text-sm text-slate">
        Already have an account?{" "}
        <Link href="/sign-in" className="inline-flex min-h-11 items-center font-medium text-ink underline underline-offset-4 hover:text-accent">
          Sign in
        </Link>
      </p>
      <p className="mt-2 text-sm text-slate">
        Magic links and SSO — <span className="text-mute">not configured for this environment.</span>
      </p>
    </div>
  );
}
