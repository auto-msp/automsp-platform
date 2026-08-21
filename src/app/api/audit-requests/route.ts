import { NextResponse } from "next/server";
import { auditRequestSchema } from "@/lib/validation";
import { createAuditRequest } from "@/server/audit-requests";

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
    // Persist to the audit inbox (file-backed store until DATABASE_URL is
    // configured, then this is swapped for Prisma without touching the route).
    const record = await createAuditRequest(parsed.data);
    return NextResponse.json({ ok: true, id: record.id }, { status: 201 });
  } catch (err) {
    console.error("audit-request:create", err);
    return NextResponse.json(
      { error: "We could not record your request. Please try again or email hello@automsp.us." },
      { status: 500 },
    );
  }
}
