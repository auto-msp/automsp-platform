"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Notice } from "@/components/ui/notice";
import { buttonClass } from "@/components/ui/button";

// Error boundary for the /app segment. Shows a reference (digest) only — never
// the error message, which can carry server details.
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl leading-8 font-semibold tracking-tight text-ink">This screen could not load</h1>
      <p className="mt-1.5 text-sm text-slate">
        Nothing was changed. Try again, or return to the dashboard if it keeps happening.
      </p>
      <Notice tone="risk" alert className="mt-6">
        Something went wrong while loading this page.
        {error.digest ? (
          <>
            {" "}
            Reference: <code>{error.digest}</code>
          </>
        ) : null}
      </Notice>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className={buttonClass("primary")}>
          <RotateCcw aria-hidden className="size-4" strokeWidth={2} />
          Try again
        </button>
        <Link href="/app/dashboard" className={buttonClass("quiet")}>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
