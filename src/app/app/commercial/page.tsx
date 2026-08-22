import type { Metadata } from "next";
import { AppPageHeader } from "@/components/app/page-header";
import { formatDate } from "@/lib/format";
import { can, getSessionContext } from "@/server/auth/session";
import {
  AUDIT_STATUSES,
  listAudits,
  listClients,
  listOpportunities,
  listProjects,
  OPPORTUNITY_STAGES,
  PROJECT_STAGES,
  summarizePipeline,
} from "@/server/commercial";
import { NewClientForm, NewOpportunityForm, NewProjectForm } from "./forms";
import { AuditStatusPicker, ExpandableText, InboxAutoRefresh, StagePicker } from "./pickers";

export const metadata: Metadata = { title: "Commercial" };

export const dynamic = "force-dynamic";

function fmtUsd(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

/**
 * AutoMSP's own commercial workspace — the inbound "Book an audit" inbox and
 * the delivery pipeline. Visible only in the AutoMSP operations tenant;
 * customer roles carry no commercial.* permission. Nothing here is simulated:
 * every audit request came through the public form, every opportunity card was
 * recorded by a person, and pipeline totals are user-entered estimates —
 * labeled as such.
 */
export default async function CommercialPage() {
  const ctx = await getSessionContext();
  if (!ctx) return null;

  if (ctx.organization.kind !== "automsp" || !can(ctx, "commercial.view")) {
    return (
      <div>
        <AppPageHeader title="Commercial" />
        <p className="border border-dashed border-fog px-6 py-8 text-center text-sm text-mute">
          The commercial workspace belongs to AutoMSP&apos;s operations team and isn&apos;t part of
          your customer workspace.
        </p>
      </div>
    );
  }

  const orgId = ctx.organization.id;
  const canManage = can(ctx, "commercial.manage");

  const [audits, opportunities, clients, projects] = await Promise.all([
    listAudits(orgId),
    listOpportunities(orgId),
    listClients(orgId),
    listProjects(orgId),
  ]);
  const pipeline = summarizePipeline(opportunities);
  const clientNames = new Map(clients.map((c) => [c.id, c.name]));
  const receivedCount = audits.filter((a) => a.status === "received").length;

  return (
    <div>
      <AppPageHeader
        title="Commercial"
        description="AutoMSP's own pipeline: inbound audit requests from the website, opportunities, clients, and delivery projects. Pipeline values are operator-entered estimates — labeled Estimated."
      />

      {/* ── Audits inbox ─────────────────────────────────────────────── */}
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
          Audit requests
          {receivedCount > 0 ? (
            <span className="border border-warn/40 bg-warn/10 px-1.5 py-px text-[10px] font-medium tracking-[0.08em] text-warn uppercase">
              {receivedCount} received
            </span>
          ) : null}
          <InboxAutoRefresh />
        </h2>
        <p className="text-[11px] text-mute">
          <span className="font-medium text-ok">Actual</span> — submitted through the public form
        </p>
      </div>
      {audits.length === 0 ? (
        <p className="border border-dashed border-fog px-6 py-8 text-center text-sm text-mute">
          No audit requests yet. Requests from the &quot;Book an audit&quot; form land here — one
          card per real submission.
        </p>
      ) : (
        <div className="space-y-3">
          {audits.map((a) => (
            <div key={a.id} className="border border-fog bg-surface p-5">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-semibold text-ink">{a.company}</p>
                <span className="text-[13px] text-slate">
                  {a.contactName} · {a.contactEmail}
                  {a.phone ? ` · ${a.phone}` : ""}
                </span>
                <span className="tnum ml-auto text-[11px] text-mute">{formatDate(a.createdAt)}</span>
                {canManage ? (
                  <AuditStatusPicker auditId={a.id} status={a.status} options={AUDIT_STATUSES} />
                ) : (
                  <span className="border border-fog bg-haze px-2 py-1 text-[11px] font-medium tracking-[0.08em] text-slate uppercase">
                    {AUDIT_STATUSES.find((s) => s.key === a.status)?.label ?? a.status}
                  </span>
                )}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-mute">
                {a.role ? <span>{a.role}</span> : null}
                {a.industry ? <span>{a.industry}</span> : null}
                {a.companySize ? <span>{a.companySize}</span> : null}
                {a.aiUsage ? <span>AI: {a.aiUsage}</span> : null}
                {a.processVolume ? <span>Volume: {a.processVolume}</span> : null}
              </div>
              {a.bottlenecks ? (
                <p className="mt-3 text-[13px] leading-relaxed text-slate">
                  <span className="font-medium text-ink">Bottlenecks: </span>
                  <ExpandableText text={a.bottlenecks} />
                </p>
              ) : null}
              {a.currentSystems ? (
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate">
                  <span className="font-medium text-ink">Current systems: </span>
                  <ExpandableText text={a.currentSystems} />
                </p>
              ) : null}
              {a.desiredOutcomes ? (
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate">
                  <span className="font-medium text-ink">Desired outcomes: </span>
                  <ExpandableText text={a.desiredOutcomes} />
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* ── Pipeline ─────────────────────────────────────────────────── */}
      <div className="mt-10 mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-ink">Pipeline</h2>
        <p className="text-[11px] text-mute">
          <span className="font-medium text-warn">Estimated</span> — values and probabilities are
          operator-entered
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="border border-fog bg-surface p-4">
          <p className="text-[11px] font-medium tracking-[0.1em] text-mute uppercase">
            Open opportunities
          </p>
          <p className="tnum mt-1.5 text-2xl font-semibold text-ink">{pipeline.openCount}</p>
        </div>
        <div className="border border-fog bg-surface p-4">
          <p className="text-[11px] font-medium tracking-[0.1em] text-mute uppercase">
            Pipeline value
          </p>
          <p className="tnum mt-1.5 text-2xl font-semibold text-ink">
            {pipeline.estimatedPipelineUsd !== null ? fmtUsd(pipeline.estimatedPipelineUsd) : "—"}
          </p>
          {pipeline.estimatedPipelineUsd === null ? (
            <p className="mt-1 text-[11px] text-mute">no values recorded</p>
          ) : null}
        </div>
        <div className="border border-fog bg-surface p-4">
          <p className="text-[11px] font-medium tracking-[0.1em] text-mute uppercase">
            Probability-weighted
          </p>
          <p className="tnum mt-1.5 text-2xl font-semibold text-ink">
            {pipeline.weightedPipelineUsd !== null ? fmtUsd(pipeline.weightedPipelineUsd) : "—"}
          </p>
          <p className="mt-1 text-[11px] text-mute">Σ value × probability</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {pipeline.byStage.map((s) => (
          <span
            key={s.stage}
            className="border border-fog bg-haze px-2 py-1 text-[11px] font-medium tracking-[0.06em] text-slate"
          >
            {s.label} <span className="tnum">{s.count}</span>
          </span>
        ))}
      </div>

      {opportunities.length === 0 ? (
        <p className="mt-4 border border-dashed border-fog px-6 py-8 text-center text-sm text-mute">
          No opportunities yet. Inbound audit requests open a card automatically; add others by
          hand below.
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto border border-fog">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-fog bg-haze text-left text-[11px] font-medium tracking-[0.1em] text-mute uppercase">
                <th className="px-4 py-2.5">Company</th>
                <th className="px-4 py-2.5">Stage</th>
                <th className="px-4 py-2.5">Est. value</th>
                <th className="px-4 py-2.5">Prob.</th>
                <th className="px-4 py-2.5">Source</th>
                <th className="px-4 py-2.5">Next action</th>
                <th className="px-4 py-2.5">Updated</th>
              </tr>
            </thead>
            <tbody>
              {opportunities.map((o) => (
                <tr key={o.id} className="border-b border-fog last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{o.company}</p>
                    {o.contactName || o.contactEmail ? (
                      <p className="mt-0.5 text-[12px] text-mute">
                        {[o.contactName, o.contactEmail].filter(Boolean).join(" · ")}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    {canManage ? (
                      <StagePicker
                        opportunityId={o.id}
                        stage={o.stage}
                        options={OPPORTUNITY_STAGES}
                      />
                    ) : (
                      <span className="text-slate">
                        {OPPORTUNITY_STAGES.find((s) => s.key === o.stage)?.label ?? o.stage}
                      </span>
                    )}
                  </td>
                  <td className="tnum px-4 py-3 text-slate">
                    {o.estimatedValue !== null ? fmtUsd(o.estimatedValue) : "—"}
                  </td>
                  <td className="tnum px-4 py-3 text-slate">
                    {o.probability !== null ? `${o.probability}%` : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate">{o.source ?? "—"}</td>
                  <td className="max-w-56 px-4 py-3">
                    {o.nextAction ? (
                      <ExpandableText text={o.nextAction} limit={80} />
                    ) : (
                      <span className="text-slate">—</span>
                    )}
                  </td>
                  <td className="tnum px-4 py-3 text-slate">{formatDate(o.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canManage ? (
        <div className="mt-4">
          <NewOpportunityForm />
        </div>
      ) : null}

      {/* ── Clients & projects ───────────────────────────────────────── */}
      <h2 className="mt-10 mb-3 text-sm font-semibold text-ink">Clients &amp; projects</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="border border-fog bg-surface p-5">
          <h3 className="text-sm font-semibold text-ink">Clients ({clients.length})</h3>
          {clients.length === 0 ? (
            <p className="mt-3 text-[13px] text-mute">
              None yet. A client record represents a signed engagement — created here, not
              simulated.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-fog">
              {clients.map((c) => (
                <li key={c.id} className="flex items-baseline justify-between gap-3 py-2.5">
                  <p className="text-sm font-medium text-ink">{c.name}</p>
                  <p className="text-[12px] text-mute">
                    {[c.industry, c.size].filter(Boolean).join(" · ") || "—"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border border-fog bg-surface p-5">
          <h3 className="text-sm font-semibold text-ink">Projects ({projects.length})</h3>
          {projects.length === 0 ? (
            <p className="mt-3 text-[13px] text-mute">
              None yet. Projects track delivery from discovery to managed operations.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-fog">
              {projects.map((p) => (
                <li key={p.id} className="flex items-baseline justify-between gap-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-ink">{p.name}</p>
                    <p className="text-[12px] text-mute">
                      {p.clientId ? (clientNames.get(p.clientId) ?? "—") : "no client linked"}
                    </p>
                  </div>
                  <span className="border border-fog bg-haze px-1.5 py-px text-[10px] font-medium tracking-[0.08em] text-slate uppercase">
                    {PROJECT_STAGES.find((s) => s.key === p.stage)?.label ?? p.stage}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {canManage ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <NewClientForm />
          <NewProjectForm clients={clients.map((c) => ({ id: c.id, name: c.name }))} />
        </div>
      ) : null}
    </div>
  );
}
