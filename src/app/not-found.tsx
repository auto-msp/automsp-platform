import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Shell } from "@/components/ui/shell";

export default function NotFound() {
  return (
    <Shell className="flex min-h-[60svh] flex-col items-start justify-center py-24">
      <p className="text-xs font-semibold tracking-[0.2em] text-brand-text uppercase">404</p>
      <h1 className="font-display mt-5 max-w-xl text-4xl leading-[1.08] tracking-tight text-ink sm:text-6xl">
        This page doesn&rsquo;t exist.
      </h1>
      <p className="mt-5 max-w-md text-[16px] leading-relaxed text-slate">
        The link may be outdated. Start from the homepage, or book an audit and tell us what you
        were looking for.
      </p>
      <div className="mt-9 flex flex-wrap items-center gap-6">
        <ButtonLink href="/" size="lg">
          Back to home
        </ButtonLink>
        <Link
          href="/book-audit"
          className="text-sm font-medium text-ink underline decoration-line underline-offset-4 hover:text-accent hover:decoration-accent"
        >
          Book a free AI opportunity audit
        </Link>
      </div>
    </Shell>
  );
}
