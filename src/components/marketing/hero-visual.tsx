/**
 * HeroVisual — abstract AI infrastructure stack.
 * Layered architectural planes representing: data foundation → retrieval →
 * orchestration → agents → human control. Monochrome Swiss aesthetic with a
 * single indigo accent plane. Pure CSS/SVG, no imagery dependencies.
 */
export function HeroVisual() {
  return (
    <div
      aria-hidden
      className="relative hidden aspect-[5/6] w-full select-none lg:block"
    >
      {/* Vertical caption, editorial margin note */}
      <div className="absolute top-1/2 -right-2 hidden -translate-y-1/2 rotate-90 items-center gap-3 xl:flex">
        <span className="size-1.5 rounded-full bg-accent" />
        <span className="text-[11px] font-medium tracking-[0.28em] text-slate uppercase">
          AI Systems. Managed.
        </span>
      </div>

      {/* Substrate grid */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 500 600"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="pane" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#ededE8" />
          </linearGradient>
          <linearGradient id="paneAccent" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
          <linearGradient id="glassDark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e2126" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#1e2126" stopOpacity="0.14" />
          </linearGradient>
        </defs>

        {/* Hairline grid */}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} x1={50 + i * 50} y1="0" x2={50 + i * 50} y2="600" stroke="#e7e7e2" strokeWidth="1" />
        ))}
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={60 + i * 48} x2="500" y2={60 + i * 48} stroke="#e7e7e2" strokeWidth="1" />
        ))}

        {/* Flow connectors between layers */}
        <path d="M120 430 C 190 400, 210 360, 250 330" stroke="#c9c9c2" strokeWidth="1.25" strokeDasharray="3 4" />
        <path d="M250 330 C 290 300, 300 260, 330 230" stroke="#c9c9c2" strokeWidth="1.25" strokeDasharray="3 4" />
        <circle cx="250" cy="330" r="3.5" fill="#4338ca" />
        <circle cx="120" cy="430" r="3" fill="#8a8f97" />
        <circle cx="330" cy="230" r="3" fill="#8a8f97" />
        <circle cx="392" cy="150" r="3" fill="#8a8f97" />
        <path d="M330 230 C 355 205, 370 180, 392 150" stroke="#c9c9c2" strokeWidth="1.25" strokeDasharray="3 4" />
      </svg>

      {/* Layer 1 — Data foundation */}
      <figure className="absolute bottom-[6%] left-[2%] w-[46%] border border-fog bg-surface shadow-[0_18px_50px_-20px_rgba(11,12,14,0.25)]">
        <div className="border-b border-fog px-4 py-2.5">
          <span className="tnum text-[10px] font-medium tracking-[0.2em] text-mute uppercase">01 — Data</span>
        </div>
        <div className="space-y-2 px-4 py-4">
          <div className="h-2 w-11/12 bg-haze" />
          <div className="h-2 w-8/12 bg-haze" />
          <div className="h-2 w-9/12 bg-haze" />
        </div>
      </figure>

      {/* Layer 2 — Orchestration plane */}
      <figure className="absolute top-[26%] left-[26%] w-[48%] border border-ink/10 bg-[url(#pane)] bg-surface shadow-[0_28px_70px_-24px_rgba(11,12,14,0.35)]">
        <div className="flex items-center justify-between border-b border-fog px-4 py-2.5">
          <span className="tnum text-[10px] font-medium tracking-[0.2em] text-mute uppercase">02 — Orchestration</span>
          <span className="flex gap-1.5">
            <i className="size-1.5 rounded-full bg-fog" />
            <i className="size-1.5 rounded-full bg-fog" />
            <i className="size-1.5 rounded-full bg-ink/70" />
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 px-4 py-4">
          <div className="aspect-square border border-fog bg-haze/60" />
          <div className="aspect-square border border-fog bg-haze/60" />
          <div className="aspect-square border border-accent/50 bg-accent-soft" />
          <div className="aspect-square border border-fog bg-haze/60" />
          <div className="aspect-square border border-fog bg-haze/60" />
          <div className="aspect-square border border-fog bg-haze/60" />
        </div>
      </figure>

      {/* Layer 3 — Agents / accent plane */}
      <figure className="absolute top-[9%] right-[4%] w-[38%] shadow-[0_28px_70px_-24px_rgba(67,56,202,0.45)]">
        <div className="border border-accent/30 bg-linear-to-br from-[#4f46e5] to-[#4338ca] px-4 py-3">
          <span className="tnum text-[10px] font-medium tracking-[0.2em] text-white/80 uppercase">03 — Agents</span>
        </div>
        <div className="border border-t-0 border-fog bg-surface px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-ok" />
            <span className="text-xs text-graphite">Approver in the loop</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-haze">
            <div className="h-full w-2/3 bg-ink/80" />
          </div>
        </div>
      </figure>

      {/* Human control node */}
      <figure className="absolute bottom-[16%] right-[10%] flex items-center gap-3 border border-fog bg-surface px-4 py-3 shadow-[0_18px_50px_-20px_rgba(11,12,14,0.25)]">
        <span className="flex size-8 items-center justify-center rounded-full border border-ink/15">
          <svg viewBox="0 0 24 24" className="size-4 text-ink" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M20 13.5A8.5 8.5 0 1 1 10.5 4" strokeLinecap="round" />
            <path d="M20 4v5h-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div>
          <p className="text-[11px] font-medium tracking-[0.14em] text-ink uppercase">Human-in-the-loop</p>
          <p className="text-xs text-slate">Approvals &amp; escalation</p>
        </div>
      </figure>
    </div>
  );
}
