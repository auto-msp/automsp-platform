# AutoMSP — AI Automation Services Platform

The control plane for a company's AI automation: marketing site, customer portal,
internal operations platform, AI workflow & agent management, integrations,
execution engine, analytics, and billing.

**Status — Phase 1 complete:** marketing website (all routes), design system,
audit-request funnel with working form → API → validated persistence (file store
until the database is configured). Next: authentication, organizations, DB wiring
(Phase 2+ per roadmap below).

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
| Database | PostgreSQL via Prisma (schema in `prisma/`)         |
| Validation | Zod — every external input, client + server      |
| Auth     | Planned: Clerk or Supabase Auth (Phase 1 remainder)|
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

1. **Foundation** — repo, design system, marketing site, audit funnel ✅ · auth, orgs, RBAC next
2. **Core platform** — systems, automations, execution model, workflow builder, integrations architecture
3. **AI** — provider abstraction, agents, knowledge/RAG, evaluations, cost tracking
4. **Operations** — monitoring, incidents, approvals, audit logs, analytics, ROI, reports
5. **Commercial** — billing, subscriptions, opportunity & audit management
6. **Hardening** — security review, performance, a11y, tests, deployment

Rules that don't change: nothing fake presented as real · tenant isolation at the
database layer · human approval for consequential AI actions · every reported
metric carries its calculation method.
