import type { Metadata } from "next";
import Link from "next/link";
import { AppPageHeader } from "@/components/app/page-header";
import { can, getSessionContext } from "@/server/auth/session";
import { listReports } from "@/server/ops/reports";
import { REPORT_TYPE_LABELS } from "@/server/ops/metrics";
import { GenerateReportForm } from "./generate-form";

export const metadata: Metadata = { title: "Reports" };

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const ctx = await getSessionContext();
  if (!ctx) return null;

  const reports = await listReports(ctx.organization.id);
  const canGenerate = can(ctx, "reports.generate");

  return (
    <div>
      <AppPageHeader
        title="Reports"
        description="Point-in-time operational and impact documents. Each report snapshots the numbers plus the assumptions and methods behind them, so it still explains itself months later."
      />

      <GenerateReportForm canGenerate={canGenerate} />

      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-ink">Generated reports</h2>
        {reports.length === 0 ? (
          <div className="border border-dashed border-fog p-10 text-center">
            <p className="text-sm text-mute">
              No reports yet. Generate one above — it will snapshot your automations, approvals, AI
              usage, and ROI with method text attached.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden border border-fog">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-fog bg-haze text-left text-[11px] font-medium tracking-[0.1em] text-mute uppercase">
                  <th className="px-4 py-2.5">Report</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">Period</th>
                  <th className="px-4 py-2.5">Generated</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-b border-fog last:border-0">
                    <td className="px-4 py-3">
                      <Link href={`/app/reports/${r.id}`} className="font-medium text-ink hover:underline">
                        {(r.payload as { title?: string }).title ?? REPORT_TYPE_LABELS[r.type]}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate">{REPORT_TYPE_LABELS[r.type]}</td>
                    <td className="tnum px-4 py-3 text-slate">
                      {r.periodStart.slice(0, 10)} → {r.periodEnd.slice(0, 10)}
                    </td>
                    <td className="tnum px-4 py-3 text-slate">
                      {r.createdAt.slice(0, 16).replace("T", " ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
