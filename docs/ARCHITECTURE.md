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
server-side on every read/write; frontend checks are UX only. Postgres RLS
policies (defense in depth, keyed to a per-transaction `automsp.org_id`
setting) are designed in `docs/rls-policies.sql` — status there is DRAFT:
written but not yet applied or verified against a live database.

## Current phase state

| Area | State |
| --- | --- |
| Marketing site + design system | Built (slice 1) |
| Audit request funnel | Built — writes into the operator org's audit inbox (slice 6) |
| Data model | `prisma/schema.prisma` — full schema, migrations through slice 4 |
| Auth / orgs / RBAC | Built (slice 2) — scrypt credential auth, 8 roles, server-side enforcement |
| Execution engine, approvals, vault, scheduler | Built (slices 2–3) |
| AI: providers, agents, knowledge/RAG, evals, cost tracking | Built (slice 3) |
| Agent tool execution with approval gates | Built (slice 4) |
| Operations: metrics, ROI, reports | Built (slice 5) |
| Commercial: billing, pipeline, audit management | Built (slice 6) |
| Hardening: CSP, rate limiting, tests, RLS, deployment | In progress (slice 7) |

Wherever a capability is not yet implemented, the UI says so (`Not configured` /
`Available with engagements`) instead of simulating it.
