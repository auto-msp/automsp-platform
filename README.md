# AutoMSP — AI Automation Services Platform

The control plane for a company's AI automation: marketing site, customer portal,
internal operations platform, AI workflow & agent management, integrations,
execution engine, analytics, and billing.

**Status — the platform app is live for development.** Marketing website,
authenticated workspace (`/app`) with local credential auth + org RBAC, systems,
versioned automations with a builder, execution engine v1 (idempotency keys,
approval gates, interpolation), approvals center, notifications, a sealed
credentials vault for HTTP steps, an in-process scheduler for interval
triggers, versioned agents with a playground, knowledge bases with retrieval
(semantic when an embeddings provider is configured, lexical otherwise), and
evaluation suites with recorded pass rates. Everything unbuilt is labeled,
never simulated.

### AI provider abstraction

All model calls route through `src/server/ai/provider.ts` (Anthropic, OpenAI,
or Google, picked from whichever `*_API_KEY` env var is set; pin with
`AUTOMSP_AI_PROVIDER`). Keys are server-side only. When no key is configured,
every AI surface — the agent playground, workflow AI steps, evaluation runs —
reports "provider not configured" instead of simulating output. Token counts
are provider-reported (actual); USD figures are list-price estimates and say so.

Agents are versioned (`agents` + `agent_versions`): every save adds a version.
Workflow AI steps reference an agent and can retrieve knowledge chunks for
context; each run records model, tokens, estimated cost, and which retrieval
method (semantic/lexical) served it (`ai_runs` + `usage_records`).

### Agent tool execution

Agents can be granted tool scopes (`agent_versions.permissionScopes`) from a
fixed registry (`src/server/ai/tools.ts`): `http_request` (calls an endpoint
on a connected integration — the vault credential is injected as an auth
header at call time and never appears in results, logs, or the client),
`knowledge_write` (indexes a document into a knowledge source), and
`notify_send` (in-app notification). Two gates protect every call, enforced
server-side in `src/server/ai/agent-runner.ts`:

1. **Scope** — a tool whose scope is not granted on the running version is
   never executed; the denial is fed back to the model as a tool result.
2. **Consequential actions** — tools flagged consequential pause the run and
   create an approval (`approvals.kind = "agent_tool"`) that pins the exact
   arguments the model supplied. Approving executes those recorded arguments
   verbatim; rejecting ends the run as `rejected`.

Runs are persisted (`agent_runs`) with the full transcript, invocation
outcomes, and pending calls, so a paused run resumes from durable state.
Every model call in a run records an `ai_runs` row linked by `agentRunId`.
Tool calling is wired for Anthropic and OpenAI; Gemini reports the limitation
honestly instead of silently dropping granted tools.

### Persistence: one interface, two adapters

Every data access goes through `src/server/db/store.ts`, which picks an adapter
at boot:

| `DATABASE_URL` | Adapter | Where data lives |
| -------------- | ------- | ---------------- |
| unset          | `json-store.ts` | `.data/store/*.json` (gitignored), atomic writes |
| set            | `prisma-store.ts` | PostgreSQL via the schema in `prisma/` |

`/api/health` reports which adapter is live. Prisma predicates currently filter
in application memory after `findMany()` — SQL pushdown is the performance
follow-up, not a correctness gap (tenant guards live in the service layer and
apply to both adapters).

Apply the schema to a fresh database with `pnpm prisma migrate deploy`
(initial migration is generated, in `prisma/migrations/`).

### Credentials vault

Workflow HTTP steps can reference a stored credential instead of embedding
tokens in step config. Secrets are sealed with AES-256-GCM (`src/server/vault.ts`)
under `AUTOMSP_VAULT_KEY`; without it a development key is generated into the
gitignored `.data/vault.key`. The plaintext secret is never returned to the
client, never logged, and is destroyed on revoke.

### Scheduler

`src/instrumentation.ts` starts a single-process interval poller (30s ticks).
It fires active automations whose schedule is due; cursor advancement is
idempotency-keyed (`sched:{id}:{dueAt}`). Multi-instance deployments need a
dedicated worker — this scheduler is honest about being single-process.

### Operations & reporting

`src/server/ops/` computes the operational picture for one organization from
its own records and renders it as analytics and as shareable reports. One
rule governs every number: it never blurs its basis. **Actual** means counted
from records; **Estimated** means derived from user-set assumptions (per-run
time estimates, a labor rate) or list pricing; **Projected** means a measured
rate extended forward. Every derived figure carries `calculation { source,
method }` text so a reader can reconstruct how it was produced — reproduced in
full on each report's "basis & method" detail section.

- `metrics.ts` — `computeOpsMetrics` (runs, success rate excluding
  waiting-on-approval, per-automation performance, approvals SLA, incidents,
  AI usage) and `recordMetrics` snapshots for later auditability.
- `roi.ts` — labor value (time avoided × your labor-rate assumption) against
  list-price AI cost; null-safe when model pricing is unknown (shown honestly
  as "not computable", never invented). The labor rate is stored as an
  auditable metric row, defaulting to $45/h.
- `reports.ts` — `generateReport` bakes a point-in-time payload (KPIs,
  narratives, tables, metric snapshots), notifies the org, and remains
  org-scoped (one tenant's report is invisible to another).

Six report types: weekly operations, monthly impact, system health,
automation performance, AI cost, and incident review.

### Commercial

Two distinct workspaces, one rule each:

- **Customer billing** (`/app/billing`) — metered usage is real: it sums
  `UsageRecord` rows the engine and AI layer write (workflow runs, tokens,
  agent runs) for the current period, and shows the unit-price basis when one
  is configured. The subscription/invoice layer is honest about its state:
  with no `STRIPE_SECRET_KEY` it reports "not configured" and shows the plan
  catalog — it never fabricates a subscription or an invoice.
- **AutoMSP's own pipeline** (`/app/commercial`, operator tenant only) — the
  inbound "Book an audit" inbox, the opportunity pipeline, clients, and
  delivery projects. The public funnel writes a typed `Audit` into the
  operator organization and opens a matching opportunity; nothing on the board
  is simulated. Pipeline totals are operator-entered estimates and are labeled
  **Estimated**; cross-tenant reads/writes are blocked at the service layer.

`scripts/seed-operator.mjs` provisions the operator org + internal users in
the local dev store (idempotent).

## Visual direction

Enterprise Swiss Editorial — crisp, structured, light-first. Monochrome foundation
(paper/ink/graphite), one restrained indigo accent, editorial serif display type
(Instrument Serif) over an Inter UI. Dark tech internationalism is used
selectively: security, infrastructure, operations, and high-impact CTAs.

Principles: minimalist precision, generous whitespace, hairline grids, restrained
motion. Nothing that reads as a generic AI wrapper.

## Stack

| Layer    | Choice                                             |
| -------- | -------------------------------------------------- |
| App      | Next.js 16 (App Router), React 19, TypeScript      |
| Styling  | Tailwind CSS 4, design tokens in `app/globals.css` |
| Icons    | lucide-react                                        |
| Motion   | motion (Framer Motion) — restrained reveals only    |
| Database | PostgreSQL via Prisma (JSON file adapter when unset) |
| Validation | Zod — every external input, client + server      |
| Auth     | Built-in credential auth (scrypt + hashed session tokens); SSO later |
| Payments | Planned: Stripe (Phase 5)                           |
| Email    | Planned: Resend (Phase 5)                           |

## Run it

```bash
cp .env.example .env.local
pnpm install
pnpm dev          # http://localhost:3000
```

No environment variables are required for the marketing site. The audit form
persists to `.data/audit-requests.json` (git-ignored) until `DATABASE_URL` is
configured and `src/server/audit-requests.ts` is swapped to Prisma — the function
signature stays identical.

Quality gates:

```bash
pnpm exec tsc --noEmit   # types
pnpm lint                # eslint
pnpm build               # production build
```

## Structure

```
src/
  app/                 routes (marketing + /api/audit-requests)
  components/
    ui/                primitives: Shell, Section, Eyebrow, ButtonLink, Kpi
    marketing/         header, footer, hero, section blocks
  lib/                 site config, content model, validation, utils
  server/              server-only services (audit requests today)
prisma/schema.prisma   full multi-tenant data model
docs/                  architecture, security, database notes
```

## Roadmap (vertical slices)

1. **Foundation** — repo, design system, marketing site, audit funnel, auth, orgs, RBAC ✅
2. **Core platform** — systems, automations, execution engine v1, builder, vault credentials, scheduler, notifications ✅
3. **AI** — provider abstraction, agents, knowledge/RAG, evaluations, cost tracking ✅
4. **Agent tool execution** — permission scopes, consequential-action approvals, real integration calls ✅
5. **Operations** — monitoring, incidents, audit logs ✅, analytics, ROI, reports ✅
6. **Commercial** — billing, subscriptions, opportunity & audit management ✅
7. **Hardening** — CSP ✅ (route-aware nonce policy via `src/proxy.ts`),
   security headers ✅, public-endpoint rate limiting ✅, automated tests ✅
   (`pnpm test`), RLS policies designed (`docs/rls-policies.sql`, DRAFT — not
   yet applied/verified against a live database), deployment runbook ✅
   (`docs/DEPLOYMENT.md`); remaining: SQL pushdown for store predicates,
   multi-instance scheduler switch, shared rate-limit store

Rules that don't change: nothing fake presented as real · tenant isolation at the
database layer · human approval for consequential AI actions · every reported
metric carries its calculation method.
