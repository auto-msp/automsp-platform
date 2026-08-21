import Link from "next/link";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="border border-dashed border-fog px-8 py-14 text-center">
      <p className="text-base font-medium text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate">{description}</p>
      {action ? (
        <Link
          href={action.href}
          className="mt-6 inline-flex h-10 items-center bg-ink px-5 text-[13px] font-medium tracking-[0.08em] text-paper uppercase transition-colors hover:bg-graphite"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
