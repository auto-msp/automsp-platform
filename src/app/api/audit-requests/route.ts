import { NextResponse } from "next/server";
import { auditRequestSchema } from "@/lib/validation";
import { createAuditRequest } from "@/server/audit-requests";
import { createAuditFromFunnel } from "@/server/commercial";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = auditRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Please review the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  try {
    // System of record: the Audit + Opportunity in the AutoMSP operator org.
    const audit = await createAuditFromFunnel(parsed.data);
    if (!audit) {
      // No operator org provisioned in this environment — keep the legacy
      // file receipt so the request is never silently dropped.
      await createAuditRequest(parsed.data);
      return NextResponse.json(
        { ok: true, id: null, note: "inbox-unavailable" },
        { status: 202 },
      );
    }
    // Redundant receipt, kept for continuity with pre-slice-6 behaviour.
    await createAuditRequest(parsed.data);
    return NextResponse.json({ ok: true, id: audit.id }, { status: 201 });
  } catch (err) {
    console.error("audit-request:create", err);
    return NextResponse.json(
      { error: "We could not record your request. Please try again or email hello@automsp.us." },
      { status: 500 },
    );
  }
}
