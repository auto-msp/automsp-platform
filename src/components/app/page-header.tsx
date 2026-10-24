import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Title block for every /app screen: optional back link, h1, description, and
 * an action area that wraps below the title on narrow screens.
 */
export function AppPageHeader({
  title,
  description,
  back,
  children,
}: {
  title: string;
  description?: string;
  back?: { href: string; label: string };
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 sm:mb-8">
      {back ? (
        <Link
          href={back.href}
          className="-ml-2 mb-1 inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm text-slate transition-colors hover:bg-haze hover:text-ink"
        >
          <ArrowLeft aria-hidden strokeWidth={1.75} className="size-4" />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0 max-w-2xl">
          <h1 className="text-balance text-2xl font-semibold leading-8 tracking-tight text-ink">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 text-sm leading-relaxed text-slate">{description}</p>
          ) : null}
        </div>
        {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
      </div>
    </div>
  );
}
