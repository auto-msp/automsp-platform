import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "inverse";
type Size = "md" | "lg" | "sm";

/**
 * No `whitespace-nowrap` here. Combined with the long primary labels
 * ("Book a free AI opportunity audit" is ~366px at this size), a fixed-height
 * no-wrap button is wider than a 375px phone's content column — it pushed the
 * hero grid column to 386px and widened the layout viewport on every viewport
 * below ~400px. Labels still sit on one line wherever they fit; they simply
 * wrap instead of overflowing when they don't.
 *
 * `max-w-full` bounds the button by its container, and the sizes below use
 * `min-h-*` rather than `h-*` so a wrapped label grows the button instead of
 * being clipped by a fixed height.
 */
const base =
  "group/btn inline-flex max-w-full items-center justify-center gap-2.5 text-center text-[15px] font-medium leading-snug transition-colors duration-200 select-none";

const variants: Record<Variant, string> = {
  // Swiss primary: solid ink block, squared corners, tracked label
  primary: "bg-ink text-paper hover:bg-graphite",
  secondary: "border border-line bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-paper",
  ghost: "text-ink underline-offset-4 hover:underline",
  inverse: "bg-paper text-ink hover:bg-white",
};

const sizes: Record<Size, string> = {
  md: "min-h-12 px-6",
  // Tighter gutters on phones so the long CTA labels wrap less often.
  lg: "min-h-14 px-6 sm:px-8",
  sm: "min-h-11 px-4 text-sm",
};

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  withArrow = false,
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  withArrow?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)}>
      {children}
      {withArrow ? (
        <ArrowRight
          aria-hidden
          className="size-4 transition-transform duration-300 ease-(--ease-out-soft) group-hover/btn:translate-x-1"
          strokeWidth={1.75}
        />
      ) : null}
    </Link>
  );
}
