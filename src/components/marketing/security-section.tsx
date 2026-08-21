import { Check } from "lucide-react";
import { Eyebrow, Section, Shell } from "@/components/ui/shell";

const assurances = [
  "Human-in-the-loop controls",
  "Role-based access & governance",
  "Audit logs & full traceability",
  "Security-first architecture",
  "Data residency options",
  "Your data stays yours",
];

export function SecuritySection() {
  return (
    <Section className="bg-night text-paper">
      <Shell>
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr_1fr] lg:gap-16">
          <div>
            <Eyebrow tone="dark">Secure. Compliant. Controlled.</Eyebrow>
            <h2 className="font-display mt-6 text-4xl leading-[1.08] tracking-tight sm:text-5xl">
              Enterprise AI with human-in-the-loop and full visibility.
            </h2>
          </div>

          <ul className="space-y-4">
            {assurances.map((a) => (
              <li key={a} className="flex items-center gap-3 text-sm text-white/85">
                <Check className="size-4 shrink-0 text-trail" strokeWidth={2} aria-hidden />
                {a}
              </li>
            ))}
          </ul>

          {/* Governance diagram — dotted technical frame with lock */}
          <div aria-hidden className="relative hidden aspect-square lg:block">
            <svg viewBox="0 0 240 240" fill="none" className="h-full w-full">
              {Array.from({ length: 8 }).map((_, i) => (
                <line key={`v${i}`} x1={20 + i * 28} y1="10" x2={20 + i * 28} y2="230" stroke="#232833" strokeWidth="1" strokeDasharray="2 5" />
              ))}
              {Array.from({ length: 8 }).map((_, i) => (
                <line key={`h${i}`} x1="10" y1={20 + i * 28} x2="230" y2={20 + i * 28} stroke="#232833" strokeWidth="1" strokeDasharray="2 5" />
              ))}
              <rect x="86" y="92" width="68" height="56" rx="4" stroke="#8a93a8" strokeWidth="1.5" />
              <path d="M100 92V76a20 20 0 0 1 40 0v16" stroke="#8a93a8" strokeWidth="1.5" />
              <circle cx="120" cy="116" r="5" stroke="#8a93a8" strokeWidth="1.5" />
              <path d="M120 121v10" stroke="#8a93a8" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="48" cy="48" r="2.5" fill="#6d7cff" />
              <circle cx="196" cy="62" r="2.5" fill="#6d7cff" />
              <circle cx="60" cy="196" r="2.5" fill="#6d7cff" />
              <circle cx="188" cy="180" r="2.5" fill="#6d7cff" />
              <path d="M48 48 C 80 60, 90 76, 100 84" stroke="#6d7cff" strokeWidth="1" strokeOpacity="0.55" strokeDasharray="3 4" />
              <path d="M196 62 C 168 72, 152 80, 142 90" stroke="#6d7cff" strokeWidth="1" strokeOpacity="0.55" strokeDasharray="3 4" />
              <path d="M60 196 C 82 172, 92 156, 100 148" stroke="#6d7cff" strokeWidth="1" strokeOpacity="0.55" strokeDasharray="3 4" />
              <path d="M188 180 C 166 162, 154 152, 146 146" stroke="#6d7cff" strokeWidth="1" strokeOpacity="0.55" strokeDasharray="3 4" />
            </svg>
          </div>
        </div>
      </Shell>
    </Section>
  );
}
