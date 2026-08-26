import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { Eyebrow, Section, Shell } from "@/components/ui/shell";

const assurances = [
  "Least-privilege tool and system access",
  "Human approval for sensitive actions",
  "Logging and workflow traceability",
  "Configurable data-retention controls",
  "Evaluation before production release",
  "Cloud, private-network, and hybrid options",
  "Documented escalation and recovery paths",
];

export function SecuritySection() {
  return (
    <Section className="bg-night text-paper">
      <Shell>
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr_1fr] lg:gap-16">
          <div>
            <Eyebrow tone="dark">Security</Eyebrow>
            <h2 className="font-display mt-6 text-4xl leading-[1.08] tracking-tight sm:text-5xl">
              Control is part of the architecture.
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/70">
              AI systems should operate within defined boundaries. AutoMSP designs deployments
              around your security, privacy, and operational requirements.
            </p>
          </div>

          <ul className="space-y-4">
            {assurances.map((a) => (
              <li key={a} className="flex items-center gap-3 text-sm text-white/85">
                <Check className="size-4 shrink-0 text-trail" strokeWidth={2} aria-hidden />
                {a}
              </li>
            ))}
          </ul>
          <div className="lg:col-span-2">
            <Link
              href="/security"
              className="inline-flex items-center gap-2 border-b border-white/30 pb-1 text-[13px] font-medium tracking-[0.08em] text-paper uppercase transition-colors hover:border-paper"
            >
              Review our security approach
              <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
            </Link>
          </div>

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
