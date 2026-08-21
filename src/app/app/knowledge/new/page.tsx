import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppPageHeader } from "@/components/app/page-header";
import { can, getSessionContext } from "@/server/auth/session";
import { SourceForm } from "../source-form";

export const metadata: Metadata = { title: "New knowledge source" };
export const dynamic = "force-dynamic";

export default async function NewSourcePage() {
  const ctx = await getSessionContext();
  if (!ctx) return null;
  if (!can(ctx, "knowledge.manage")) redirect("/app/knowledge");

  return (
    <div>
      <AppPageHeader
        title="New knowledge source"
        description="A source groups related documents. Ingestion is pasted text/markdown in this slice — web crawling and integration sync are not built."
      />
      <div className="max-w-xl">
        <SourceForm />
      </div>
    </div>
  );
}
