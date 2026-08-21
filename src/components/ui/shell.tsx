import { cn } from "@/lib/utils";

/** Editorial page shell — 1216px max, generous gutters. */
export function Shell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[76rem] px-5 sm:px-8", className)}>
      {children}
    </div>
  );
}

/** Vertical rhythm for page sections. */
export function Section({
  className,
  children,
  id,
}: {
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-16 sm:py-24", className)}>
      {children}
    </section>
  );
}

/** Eyebrow label — small, tracked-out, uppercase, with a precision tick. */
export function Eyebrow({
  className,
  children,
  tone = "light",
}: {
  className?: string;
  children: React.ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-2.5 text-[11px] font-medium uppercase tracking-[0.18em]",
        tone === "light" ? "text-slate" : "text-white/60",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "inline-block size-[5px]",
          tone === "light" ? "bg-ink" : "bg-trail",
        )}
      />
      {children}
    </p>
  );
}
