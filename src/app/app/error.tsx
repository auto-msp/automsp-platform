"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";

/** Route-level error boundary for /app. Shows no internals — only a digest the operator can quote. */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="card mx-auto mt-8 flex max-w-lg flex-col items-center px-6 py-12 text-center">
      <span className="mb-4 flex size-11 items-center justify-center rounded-full bg-risk-soft text-risk">
        <TriangleAlert aria-hidden strokeWidth={1.5} className="size-5" />
      </span>
      <h1 className="text-lg font-semibold text-ink">This page didn’t load</h1>
      <p className="mt-1.5 text-sm leading-relaxed text-slate">
        Something went wrong while preparing this screen. Your data has not been changed.
      </p>
      {error.digest ? <p className="mt-3 font-mono text-xs text-mute">Reference: {error.digest}</p> : null}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={reset} className="btn btn-primary">
          Try again
        </button>
        <Link href="/app/dashboard" className="btn btn-secondary">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
