import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "accent" | "danger" | "ghost" | "inverse" | "dark";
export type ButtonSize = "sm" | "md" | "lg";

const variantClass: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  quiet: "btn-quiet",
  accent: "btn-accent",
  danger: "btn-danger",
  ghost: "btn-ghost",
  // On charcoal bands: light fill, ink label
  inverse: "bg-paper text-ink hover:bg-surface",
  // On orange bands: ink fill, paper label
  dark: "bg-ink text-paper hover:bg-graphite",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
};

/** Class string for anything that must look like a button (links, submit inputs). */
export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn("btn", variantClass[variant], sizeClass[size], className);
}

/**
 * Link styled as a button. Labels wrap instead of overflowing, so the long
 * marketing CTAs ("Book a free AI opportunity audit") stay inside a 360px column.
 */
export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  withArrow = false,
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  withArrow?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn("group/btn", buttonClass(variant, size, className))}>
      {children}
      {withArrow ? (
        <ArrowRight
          aria-hidden
          className="size-4 shrink-0 transition-transform duration-200 ease-(--ease-out-soft) group-hover/btn:translate-x-0.5"
          strokeWidth={2}
        />
      ) : null}
    </Link>
  );
}
