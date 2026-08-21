import { Eyebrow, Shell } from "@/components/ui/shell";

/**
 * Placeholder brand marks. These are neutral, fictional stand-ins — replace
 * with real customer logos only when permission is granted. Never present
 * placeholder marks as real customer relationships.
 */
const placeholders = [
  { name: "Aurora", sub: "Manufacturing" },
  { name: "Northfield", sub: "Logistics" },
  { name: "Veritas", sub: "Financial Ops" },
  { name: "Pivot", sub: "Healthcare" },
  { name: "Altura", sub: "Energy" },
];

export function TrustStrip() {
  return (
    <div className="bg-haze/60">
      <Shell className="py-10 sm:py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-14">
          <Eyebrow className="shrink-0">
            Trusted by operations &amp; technology leaders
          </Eyebrow>
          <ul className="grid flex-1 grid-cols-2 items-center gap-x-8 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
            {placeholders.map((p) => (
              <li key={p.name} className="text-center lg:text-left">
                <span className="font-display text-xl text-graphite/70">{p.name}</span>
                <span className="block text-[10px] font-medium tracking-[0.22em] text-mute uppercase">
                  {p.sub}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Shell>
    </div>
  );
}
