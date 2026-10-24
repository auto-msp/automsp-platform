import Link from "next/link";
import { Inbox, type LucideIcon } from "lucide-react";

/** Quiet, solid panel: icon, what's missing, what to do next. */
export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
  icon?: LucideIcon;
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center sm:py-14">
      <span className="mb-4 flex size-11 items-center justify-center rounded-full bg-haze text-slate">
        <Icon aria-hidden strokeWidth={1.5} className="size-5" />
      </span>
      <p className="text-base font-semibold text-ink">{title}</p>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate">{description}</p>
      {action ? (
        <Link href={action.href} className="btn btn-primary mt-6">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
