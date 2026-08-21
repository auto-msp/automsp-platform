const TONES: Record<string, { label: string; cls: string }> = {
  // execution statuses
  queued: { label: "Queued", cls: "border-fog bg-haze text-slate" },
  running: { label: "Running", cls: "border-accent/40 bg-accent/10 text-accent" },
  waiting: { label: "Waiting", cls: "border-warn/40 bg-warn/10 text-warn" },
  completed: { label: "Completed", cls: "border-ok/40 bg-ok/10 text-ok" },
  failed: { label: "Failed", cls: "border-risk/40 bg-risk/10 text-risk" },
  cancelled: { label: "Cancelled", cls: "border-fog bg-haze text-mute" },
  // system statuses
  healthy: { label: "Healthy", cls: "border-ok/40 bg-ok/10 text-ok" },
  paused: { label: "Paused", cls: "border-fog bg-haze text-slate" },
  incident: { label: "Incident", cls: "border-risk/40 bg-risk/10 text-risk" },
  // automation statuses
  draft: { label: "Draft", cls: "border-fog bg-haze text-slate" },
  active: { label: "Active", cls: "border-ok/40 bg-ok/10 text-ok" },
  archived: { label: "Archived", cls: "border-fog bg-haze text-mute" },
  // approval statuses
  pending: { label: "Pending", cls: "border-warn/40 bg-warn/10 text-warn" },
  approved: { label: "Approved", cls: "border-ok/40 bg-ok/10 text-ok" },
  rejected: { label: "Rejected", cls: "border-risk/40 bg-risk/10 text-risk" },
  // system status extra
  warning: { label: "Warning", cls: "border-warn/40 bg-warn/10 text-warn" },
  // integration statuses
  revoked: { label: "Revoked", cls: "border-risk/40 bg-risk/10 text-risk" },
  // agent statuses (draft/paused/archived/approved reuse the tones above)
  testing: { label: "Testing", cls: "border-accent/40 bg-accent/10 text-accent" },
  production: { label: "Production", cls: "border-ok/40 bg-ok/10 text-ok" },
  // document statuses
  indexed: { label: "Indexed", cls: "border-ok/40 bg-ok/10 text-ok" },
  // eval run statuses
  blocked: { label: "Blocked", cls: "border-warn/40 bg-warn/10 text-warn" },
};

export function StatusPill({ status }: { status: string }) {
  const tone = TONES[status] ?? { label: status, cls: "border-fog bg-haze text-slate" };
  return (
    <span
      className={`inline-block border px-1.5 py-px text-[11px] font-medium tracking-[0.08em] uppercase ${tone.cls}`}
    >
      {tone.label}
    </span>
  );
}
