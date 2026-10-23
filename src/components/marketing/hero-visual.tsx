import { Bot, Inbox, Send, UserCheck } from "lucide-react";

/**
 * HeroVisual — one governed workflow, drawn as a schematic.
 * Trigger → AI step → human approval → action. The approval node is the only
 * orange plane: it is the product's promise (a person decides consequential
 * steps). Structure only — no metrics, no invented data. Pure CSS/SVG.
 */
const steps = [
  { icon: Inbox, tag: "01 Trigger", title: "Invoice arrives", body: "Shared inbox, any format", tone: "plain", offset: "lg:ml-0" },
  { icon: Bot, tag: "02 AI step", title: "Extract and check", body: "Fields read, totals matched", tone: "blue", offset: "lg:ml-8" },
  { icon: UserCheck, tag: "03 Approval", title: "A person decides", body: "Held until approved or rejected", tone: "brand", offset: "lg:ml-16" },
  { icon: Send, tag: "04 Action", title: "Posted to accounting", body: "Only after approval", tone: "plain", offset: "lg:ml-24" },
] as const;

const tones = {
  plain: { card: "border-fog bg-surface", icon: "bg-haze text-ink", tag: "text-mute" },
  blue: { card: "border-accent/40 bg-surface", icon: "bg-accent text-surface", tag: "text-accent" },
  brand: { card: "border-ink bg-brand text-ink", icon: "bg-ink text-brand", tag: "text-ink" },
} as const;

export function HeroVisual() {
  return (
    <div
      role="img"
      aria-label="Illustration of a governed workflow: a trigger, an AI step, a human approval gate, then an action."
      className="relative hidden w-full select-none lg:block"
    >
      {/* Hairline substrate */}
      <svg aria-hidden className="absolute inset-0 h-full w-full" fill="none">
        <defs>
          <pattern id="hv-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" stroke="#d8d0bf" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hv-grid)" />
      </svg>

      <ol className="relative flex flex-col gap-4 py-8 pr-2">
        {steps.map((s, i) => {
          const t = tones[s.tone];
          const Icon = s.icon;
          return (
            <li key={s.tag} className={`relative w-[72%] ${s.offset}`}>
              {i < steps.length - 1 ? (
                <span aria-hidden className="absolute top-full left-6 h-4 w-px bg-ink/40" />
              ) : null}
              <div className={`flex items-center gap-4 border px-4 py-3.5 shadow-[6px_6px_0_0_rgb(28_26_22/0.9)] ${t.card}`}>
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-(--radius-control) ${t.icon}`}>
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold ${t.tag}`}>{s.tag}</p>
                  <p className="text-[15px] font-semibold text-ink">{s.title}</p>
                  <p className={`text-[13px] ${s.tone === "brand" ? "text-ink" : "text-slate"}`}>{s.body}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="relative pb-1 text-xs text-mute">Illustration — an example workflow, not live data.</p>
    </div>
  );
}
