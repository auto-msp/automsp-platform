import { CircleCheck, CircleDot, Clock, Hand, ShieldAlert } from "lucide-react";

/**
 * HeroVisual — the product's central idea, drawn with the product's own parts:
 * an automated workflow that pauses at a human approval gate before anything
 * consequential happens. It is an illustration (labelled as such), built from
 * real UI primitives so it stays crisp at any size and never implies customer
 * data. No gradients, no stock imagery.
 */
const steps = [
  { icon: CircleCheck, state: "done", title: "Trigger", detail: "Overdue invoice detected" },
  { icon: CircleCheck, state: "done", title: "Draft", detail: "Reminder prepared from the CRM record" },
  { icon: Hand, state: "current", title: "Human approval", detail: "Waiting for a reviewer" },
  { icon: Clock, state: "next", title: "Send", detail: "Runs only after a recorded decision" },
] as const;

export function HeroVisual() {
  return (
    <figure className="relative w-full max-w-lg select-none justify-self-center lg:justify-self-end">
      {/* offset hairline plate — gives the card depth without a shadow or gradient */}
      <div aria-hidden className="absolute inset-0 translate-x-3 translate-y-3 border border-line" />

      <div className="relative border border-ink bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-fog px-5 py-3">
          <p className="font-mono text-xs text-mute">workflow run · invoice-follow-up</p>
          <span className="inline-flex items-center gap-1 bg-warn-soft px-2 py-0.5 text-xs font-semibold text-warn">
            <CircleDot aria-hidden className="size-3" strokeWidth={2} />
            Waiting
          </span>
        </div>

        <ol className="px-5 py-5">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const current = s.state === "current";
            return (
              <li key={s.title} className="relative flex gap-4 pb-6 last:pb-0">
                {i < steps.length - 1 ? (
                  <span aria-hidden className="absolute top-8 bottom-0 left-4 w-px bg-line" />
                ) : null}
                <span
                  className={
                    "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full " +
                    (current
                      ? "bg-accent text-white ring-4 ring-accent-soft"
                      : s.state === "done"
                        ? "bg-ok-soft text-ok"
                        : "border border-line bg-surface text-mute")
                  }
                >
                  <Icon aria-hidden className="size-4" strokeWidth={2} />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-semibold text-ink">{s.title}</p>
                  <p className="text-[13px] leading-snug text-slate">{s.detail}</p>
                  {current ? (
                    <div aria-hidden className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 bg-warn-soft px-2 py-0.5 text-xs font-semibold text-warn">
                        <ShieldAlert className="size-3" strokeWidth={2} />
                        Medium risk
                      </span>
                      <span className="bg-ink px-3 py-1.5 text-xs font-medium text-paper">Approve</span>
                      <span className="border border-line px-3 py-1.5 text-xs font-medium text-ink">Reject</span>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>

        <div className="border-t border-fog bg-haze px-5 py-3 text-xs text-slate">
          Every step is logged. Every figure says whether it is actual, estimated, or projected.
        </div>
      </div>

      <figcaption className="relative mt-8 text-xs text-mute">
        Illustration: a workflow pauses for a person before anything is sent.
      </figcaption>
    </figure>
  );
}
