# Architecture

AutoMSP is a multi-tenant SaaS: the control plane for a customer's AI automation.
One Next.js application serves three planes:

- **Marketing plane** (`/`, `/capabilities`, …) — public, statically optimized.
- **Customer plane** (`/app/*`) — authenticated portal: systems, automations,
  agents, knowledge, integrations, approvals, operations, analytics, reports.
- **Operations plane** (`/admin/*`) — AutoMSP internal: organizations, pipeline,
  audits, incidents, billing.

## Request path

```
UI → Server Action / Route Handler → Authorization → Zod validation
   → Service layer → Repository / Prisma → PostgreSQL

Async execution:
API → Queue / Event → Worker → Execution Engine → DB / external systems
```

## Tenancy

Every tenant-owned table carries `organization_id`. Authorization is enforced
server-side on every read/write; production hardening adds Postgres RLS policies
keyed to the request's organization context. Frontend checks are UX only.

## Current phase state

| Area | State |
| --- | --- |
| Marketing site + design system | Built |
| Audit request funnel | Built — file store at `.data/`; Prisma swap planned when `DATABASE_URL` is configured |
| Data model | `prisma/schema.prisma` — the full target schema, ready for first migration |
| Auth / orgs / RBAC | Next slice |
| Execution engine, agents, RAG | Phases 2–3 |
| Billing | Phase 5 |

Wherever a capability is not yet implemented, the UI says so (`Not configured` /
`Available with engagements`) instead of simulating it.
