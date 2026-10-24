import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppPageHeader } from "@/components/app/page-header";
import { getSessionContext } from "@/server/auth/session";
import { getReport, type ReportPayload } from "@/server/ops/reports";
import { REPORT_TYPE_LABELS } from "@/server/ops/metrics";
import { BasisBadge } from "@/components/app/metric";

export const metadata: Metadata = { title: "Report" };

export const dynamic = "force-dynamic";

const BasisPill = BasisBadge;

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const ctx = await getSessionContext();
  if (!ctx) return null;
  const { id } = await params;

  const report = await getReport(ctx.organization.id, id);
  if (!report) notFound();

  const payload = report.payload as ReportPayload;

  return (
    <div>
      <AppPageHeader
        title={payload.title ?? REPORT_TYPE_LABELS[report.type]}
        description={payload.basisNote}
        back={{ href: "/app/reports", label: "All reports" }}
      />

      <div className="mb-6 flex items-center gap-3 text-xs text-mute">
        <span>
          Period {report.periodStart.slice(0, 10)} → {report.periodEnd.slice(0, 10)}
        </span>
        <span aria-hidden>·</span>
        <span>Generated {report.createdAt.slice(0, 16).replace("T", " ")}</span>
      </div>

      {payload.sections.map((section, i) => (
        <section key={i} className="card card-pad mb-6">
          <h2 className="text-sm font-semibold text-ink">{section.title}</h2>
          {section.narrative ? (
            <p className="mt-2 text-[13px] leading-relaxed text-slate">{section.narrative}</p>
          ) : null}

          {section.kpis && section.kpis.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {section.kpis.map((kpi, j) => (
                <div key={j} className="border border-fog bg-paper p-3 rounded-lg">
                  <p className="text-xs font-medium text-mute">
                    {kpi.label}
                  </p>
                  <p className="tnum mt-1 text-xl font-semibold text-ink">{kpi.value}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <BasisPill basis={kpi.basis} />
                    {kpi.note ? <span className="text-xs text-mute">{kpi.note}</span> : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {section.table ? (
            <div className="mt-4 table-wrap" tabIndex={0}>
              <table className="data-table">
                <thead>
                  <tr>
                    {section.table.headers.map((h, k) => (
                      <th key={k} className="px-4 py-2.5">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.table.rows.length === 0 ? (
                    <tr>
                      <td colSpan={section.table.headers.length} className="px-4 py-6 text-center text-sm text-mute">
                        No rows in this period.
                      </td>
                    </tr>
                  ) : (
                    section.table.rows.map((row, r) => (
                      <tr key={r} className="border-b border-fog last:border-0">
                        {row.map((cell, c) => (
                          <td key={c} className={`px-4 py-3 ${c === 0 ? "font-medium text-ink" : "tnum text-slate"}`}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : null}

          {section.metrics && section.metrics.length > 0 ? (
            <div className="mt-4 space-y-2">
              {section.metrics.map((m, mIdx) => (
                <div key={mIdx} className="border border-fog bg-paper p-3 rounded-lg">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[13px] font-medium text-ink">
                      {m.label} — <span className="tnum">{m.value} {m.unit}</span>
                    </p>
                    <BasisPill basis={m.basis} />
                  </div>
                  <p className="hint">
                    <span className="text-slate">Source:</span> {m.calculation.source}
                    <span aria-hidden> · </span>
                    <span className="text-slate">Method:</span> {m.calculation.method}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ))}
    </div>
  );
}
