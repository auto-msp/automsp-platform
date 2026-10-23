import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/**
 * Title block for every /app screen: optional back link, title, one-line
 * description, and an actions slot that wraps under the title on narrow screens.
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
    <div className="mb-6 md:mb-8">
      {back ? (
        <Link
          href={back.href}
          className="-ml-1 mb-1 inline-flex min-h-11 items-center gap-0.5 pr-2 text-[13px] font-medium text-slate transition-colors hover:text-ink"
        >
          <ChevronLeft aria-hidden className="size-4" strokeWidth={2} />
          {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <h1 className="text-2xl leading-8 font-semibold tracking-tight text-ink">{title}</h1>
          {description ? <p className="mt-1.5 max-w-2xl text-sm text-slate">{description}</p> : null}
        </div>
        {children ? <div className="flex flex-wrap items-center gap-2 sm:gap-3">{children}</div> : null}
      </div>
    </div>
  );
}

/** H2 row inside a screen: title on the left, optional link or control on the right. */
export function SectionHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
      <div>
        <h2 className="text-lg leading-6 font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-0.5 text-sm text-slate">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}
