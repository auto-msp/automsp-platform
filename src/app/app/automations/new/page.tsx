import type { Metadata } from "next";
import { AppPageHeader } from "@/components/app/page-header";
import { getSessionContext } from "@/server/auth/session";
import { store } from "@/server/db/store";
import { createAutomationAction } from "../actions";
import { AutomationSettingsForm } from "../settings-form";

export const metadata: Metadata = { title: "New automation" };

export const dynamic = "force-dynamic";

export default async function NewAutomationPage({
  searchParams,
}: {
  searchParams: Promise<{ system?: string }>;
}) {
  const ctx = await getSessionContext();
  if (!ctx) return null;

  const { system } = await searchParams;
  const systems = await store.query("systems", { organizationId: ctx.organization.id });

  return (
    <div>
      <AppPageHeader
        title="New automation"
        description="Name it, attach it to a system if relevant, then design the steps in the builder."
      />
      <div className="max-w-xl">
        <AutomationSettingsForm
          action={createAutomationAction}
          submitLabel="Create and open builder"
          systems={systems.map((s) => ({ id: s.id, name: s.name }))}
          defaultSystemId={system ?? ""}
        />
      </div>
    </div>
  );
}
