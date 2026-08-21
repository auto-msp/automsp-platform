export function AppPageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm text-slate">{description}</p> : null}
      </div>
      {children ? <div className="flex items-center gap-3">{children}</div> : null}
    </div>
  );
}
