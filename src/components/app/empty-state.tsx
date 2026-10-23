import Link from "next/link";
import { Inbox, type LucideIcon } from "lucide-react";
import { buttonClass } from "@/components/ui/button";

/** Empty list or workspace: what is missing, why, and the one next action. */
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
    <div className="border border-dashed border-line/60 bg-surface/60 px-6 py-12 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand-text">
        <Icon aria-hidden className="size-6" strokeWidth={1.75} />
      </span>
      <p className="mt-4 text-base font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-slate">{description}</p>
      {action ? (
        <Link href={action.href} className={buttonClass("primary", "md", "mt-5")}>
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
