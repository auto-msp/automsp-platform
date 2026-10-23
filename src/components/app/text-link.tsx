import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Standalone navigational link with a direction icon and a 44px hit area. */
export function TextLink({
  href,
  children,
  direction = "forward",
  className,
}: {
  href: string;
  children: React.ReactNode;
  direction?: "forward" | "back";
  className?: string;
}) {
  const Icon = direction === "back" ? ArrowLeft : ArrowRight;
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-accent underline-offset-4 transition-colors hover:text-accent-strong hover:underline",
        className,
      )}
    >
      {direction === "back" ? <Icon aria-hidden strokeWidth={1.75} className="size-4" /> : null}
      {children}
      {direction === "forward" ? <Icon aria-hidden strokeWidth={1.75} className="size-4" /> : null}
    </Link>
  );
}
