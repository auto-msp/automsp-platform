import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Create an AutoMSP organization account.",
};

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
        <Link href="/sign-in" className="font-medium text-ink underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
      <p className="mt-2 text-sm text-slate">
        Magic links and SSO — <span className="text-mute">not configured for this environment.</span>
      </p>
    </div>
  );
}
