import { NextResponse } from "next/server";
import { auditRequestSchema } from "@/lib/validation";
import { createAuditRequest } from "@/server/audit-requests";
import { createAuditFromFunnel } from "@/server/commercial";
import { checkRateLimitAuto, clientIp, rateLimitHeaders } from "@/server/rate-limit";

// Public, unauthenticated endpoint — bounded per client address. The limiter
// is DB-backed when Postgres is live (shared across instances), in-memory
// otherwise.
const FUNNEL_LIMIT = 10;
const FUNNEL_WINDOW_MS = 10 * 60 * 1000;

export async function POST(req: Request) {
  const limit = await checkRateLimitAuto(
    `audit-requests:${clientIp(req)}`,
    FUNNEL_LIMIT,
    FUNNEL_WINDOW_MS,
  );
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests from this address. Please try again shortly." },
      { status: 429, headers: rateLimitHeaders(limit, FUNNEL_LIMIT) },
    );
  }

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
