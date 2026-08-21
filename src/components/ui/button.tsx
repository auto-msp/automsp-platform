import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "inverse";
type Size = "md" | "lg" | "sm";

const base =
  "group/btn inline-flex items-center justify-center gap-2.5 whitespace-nowrap font-medium transition-colors duration-200 select-none";

const variants: Record<Variant, string> = {
  // Swiss primary: solid ink block, squared corners, tracked label
  primary: "bg-ink text-paper hover:bg-graphite text-[13px] uppercase tracking-[0.08em]",
  secondary:
    "border border-ink/25 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-paper text-[13px] uppercase tracking-[0.08em]",
  ghost: "text-ink hover:text-slate normal-case text-sm",
  inverse: "bg-paper text-ink hover:bg-white text-[13px] uppercase tracking-[0.08em]",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-6",
  lg: "h-[52px] px-8",
  sm: "h-9 px-4 text-xs",
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
