import { Eyebrow, Shell } from "@/components/ui/shell";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  lede,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  dark?: boolean;
}) {
  return (
    <div className={cn("hairline-b", dark ? "bg-night text-paper" : "bg-paper")}>
      <Shell className="py-16 sm:py-24">
        <Eyebrow tone={dark ? "dark" : "light"}>{eyebrow}</Eyebrow>
        <h1
          className={cn(
            "font-display mt-6 max-w-3xl text-5xl leading-[1.05] tracking-tight sm:text-6xl",
            dark ? "text-paper" : "text-ink",
          )}
        >
          {title}
        </h1>
        {lede ? (
          <p
            className={cn(
              "mt-6 max-w-xl text-[17px] leading-relaxed",
              dark ? "text-white/70" : "text-slate",
            )}
          >
            {lede}
          </p>
        ) : null}
      </Shell>
    </div>
  );
}
