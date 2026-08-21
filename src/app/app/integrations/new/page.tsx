import type { Metadata } from "next";
import Link from "next/link";
import { AppPageHeader } from "@/components/app/page-header";
import { can, getSessionContext } from "@/server/auth/session";
import { notFound } from "next/navigation";
import { PROVIDERS } from "@/server/integrations";
import { IntegrationForm } from "./integration-form";

export const metadata: Metadata = { title: "Add credential" };
export const dynamic = "force-dynamic";

export default async function NewIntegrationPage() {
  const ctx = await getSessionContext();
  if (!ctx) return null;
  if (!can(ctx, "integrations.manage")) notFound();

  return (
    <div>
      <AppPageHeader
        title="Add credential"
        description="The secret is sealed with AES-256-GCM the moment it is submitted. It is never stored in plaintext, never shown again, and never written to logs."
      >
        <Link href="/app/integrations" className="text-[13px] text-slate hover:text-ink">
          ← Back
        </Link>
      </AppPageHeader>

      <IntegrationForm
        providers={PROVIDERS.map((p) => ({ key: p.key, name: p.name, category: p.category }))}
      />
    </div>
  );
}
