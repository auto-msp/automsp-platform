import Link from "next/link";
import { Shell } from "@/components/ui/shell";

export default function NotFound() {
  return (
    <Shell className="flex min-h-[60svh] flex-col items-start justify-center py-24">
      <p className="text-xs font-medium tracking-[0.2em] text-mute uppercase">404</p>
      <h1 className="font-display mt-5 max-w-xl text-4xl leading-[1.08] tracking-tight text-ink sm:text-6xl">
        This page doesn&rsquo;t exist.
      </h1>
      <p className="mt-5 max-w-md text-[16px] leading-relaxed text-slate">
        The link may be outdated. Start from the homepage, or book an audit and tell us what you
        were looking for.
      </p>
      <div className="mt-9 flex flex-wrap items-center gap-6">
        <Link
          href="/"
          className="inline-flex h-11 items-center bg-ink px-6 text-[13px] font-medium tracking-[0.08em] text-paper uppercase transition-colors hover:bg-graphite"
        >
          Back to home
        </Link>
        <Link
          href="/book-audit"
          className="text-sm font-medium text-ink underline decoration-fog underline-offset-4 hover:decoration-ink"
        >
          Book a free AI opportunity audit
        </Link>
      </div>
    </Shell>
  );
}
