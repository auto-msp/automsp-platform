import type { Metadata } from "next";
import Link from "next/link";
import { AppPageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { getSessionContext } from "@/server/auth/session";
import { listNotifications } from "@/server/notifications";
import { formatDateTime } from "@/lib/format";
import { markAllReadAction, markReadAction } from "./actions";

export const metadata: Metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

const KIND_LABELS: Record<string, string> = {
  workflow_failure: "Run failure",
  execution: "Execution",
  approval: "Approval",
  integration: "Integration",
  membership: "Membership",
  schedule: "Schedule",
};

export default async function NotificationsPage() {
  const ctx = await getSessionContext();
  if (!ctx) return null;

  const rows = await listNotifications(ctx.organization.id, ctx.user.id);
  const hasUnread = rows.some((n) => n.readAt === null);

  return (
    <div>
      <AppPageHeader
        title="Notifications"
        description="Run outcomes, approval requests, and account events. Email delivery is not configured in this environment — this inbox is the only channel."
      >
        {hasUnread ? (
          <form action={markAllReadAction}>
            <button
              type="submit"
              className="border border-fog px-3 py-1.5 text-[13px] text-slate transition-colors hover:border-ink hover:text-ink"
            >
              Mark all as read
            </button>
          </form>
        ) : null}
      </AppPageHeader>

      {rows.length === 0 ? (
        <EmptyState
          title="Nothing yet"
          description="Notifications appear here when runs complete or fail, approvals are requested, or credentials change."
        />
      ) : (
        <div className="border border-fog">
          {rows.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-4 border-b border-fog px-5 py-4 last:border-0 ${
                n.readAt === null ? "bg-accent/[0.04]" : ""
              }`}
            >
              <span
                aria-hidden
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  n.readAt === null ? "bg-accent" : "bg-fog"
                }`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <p className={`text-sm ${n.readAt === null ? "font-semibold text-ink" : "text-graphite"}`}>
                    {n.title}
                  </p>
                  <span className="text-[11px] tracking-[0.08em] text-mute uppercase">
                    {KIND_LABELS[n.kind] ?? n.kind}
                  </span>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-slate">{n.body}</p>
                <div className="mt-1.5 flex items-center gap-4 text-[12px] text-mute">
                  <span className="tnum">{formatDateTime(n.createdAt)}</span>
                  {n.href ? (
                    <Link href={n.href} className="text-accent hover:underline underline-offset-2">
                      Open →
                    </Link>
                  ) : null}
                </div>
              </div>
              {n.readAt === null ? (
                <form action={markReadAction.bind(null, n.id)} className="shrink-0">
                  <button
                    type="submit"
                    className="text-[12px] text-slate hover:text-ink underline-offset-2 hover:underline"
                  >
                    Mark read
                  </button>
                </form>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
