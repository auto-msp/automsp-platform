import type { Metadata } from "next";
import { AppPageHeader } from "@/components/app/page-header";
import { getSessionContext } from "@/server/auth/session";

export const metadata: Metadata = { title: "Billing" };

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const ctx = await getSessionContext();
  if (!ctx) return null;

  return (
    <div>
      <AppPageHeader
        title="Billing"
        description="Plan, usage, and invoices for this workspace."
      />

      <div className="border border-fog bg-surface p-8">
        <span className="border border-fog bg-haze px-2 py-1 text-[11px] font-medium tracking-[0.1em] text-slate uppercase">
          Not configured
        </span>
        <h2 className="mt-4 text-lg font-semibold tracking-tight text-ink">
          No billing provider is connected
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate">
          This development environment runs without a payment processor, so there is no plan, no
          usage metering, and nothing to pay for here. Managed deployments connect billing through
          Stripe with metered automation runs; until then, anything shown here would be invented —
          so we show nothing.
        </p>
      </div>
    </div>
  );
}
