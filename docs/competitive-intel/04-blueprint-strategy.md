# Competitive Intelligence Report — Part 4: Build Boundary, Implementation Blueprint & Strategy
Sections 9–11.

---

# 9. CLONE/BUILD BOUNDARY

**Will NOT copy**: Polsia/Okara source code, private APIs, credentials, non-public metrics,
branding, mascot/favicon designs, exact marketing copy, or their proprietary prompt libraries.

| Element category | Examples | Treatment |
|---|---|---|
| Industry-standard patterns | Stripe billing, OAuth, multi-tenant RLS, credit systems, nightly digest emails | Use freely |
| Publicly observable product concepts | Agent dashboards, approval queues, strategy-doc grounding, tenant subdomain hosting, GEO tracking | Reimplement originally (functional concepts aren't protectable; expression is) |
| Original design decisions | Mandatory HITL gate as default; model-agnostic routing; public agent audit logs; ROI attribution per agent | Ours — differentiators |
| Hypotheses requiring validation | Approval-first reduces churn vs autonomy-first; rev-share optional tier beats mandatory take; agency wedge before prosumer | Test via MVP |

---

# 10. IMPLEMENTATION BLUEPRINT

## 10.1 Repo structure (extends existing automsp-platform conventions)
```
src/
  app/                    # Next.js routes (landing, dashboard, api)
    (marketing)/          # landing, pricing, explore, blog
    dashboard/
    api/trpc/
  agents/                 # agent definitions: system prompts, tools, schedules
    runtime/              # Temporal workflows + activities
    connectors/           # meta-ads/, google-ads/, x/, reddit/, email/, stripe/, github/
  platform/
    auth/ billing/ tenancy/ approvals/ observability/
  instrumentation/        # analytics SDK, pixel host-gating, CAPI
prisma/schema.prisma
workers/                  # standalone worker service deployable separately
tests/                    # vitest unit + playwright e2e + agent eval harness
```

## 10.2 Core schema (abridged)
`tenants(id, plan, credits_balance, spend_cap_cents, autonomy_config jsonb)`
`users(id, tenant_id, role, mfa_secret_enc)`
`agents(id, tenant_id, type, schedule, status, writing_instructions jsonb)`
`tasks(id, tenant_id, agent_id, status, input, output, cost_cents, started_at, finished_at)`
`approvals(id, task_id, risk_level, channel, payload_diff, decision, decided_by, latency_ms)`
`artifacts(id, tenant_id, kind[site|article|post|email], content, version, published_at)`
`integrations(id, tenant_id, provider, token_enc, scopes, status)`
`usage_events(id, tenant_id, metric, quantity, occurred_at)` → Stripe metering
`audit_log(id, tenant_id, actor_type[user|agent], action, diff, ip, created_at)`
`revenue_syncs(id, tenant_id, source, amount_cents, occurred_at)`

## 10.3 Core API endpoints (tRPC routers)
`auth.*`, `tenant.create/configure`, `onboarding.runResearch`,
`agents.{list,configure,pause,resume}`, `tasks.{create,list,retry}`,
`approvals.{inbox,decide,bulkDecide}`, `site.{edit,deploy,rollback,domain.connect}`,
`integrations.{oauthCallback,list,disconnect}`, `billing.{plans,checkout,topup,invoices}`,
`analytics.{kpis,attribution}`, `team.{invite,roles}`, `export.request`, `account.delete`.

## 10.4 AI-agent architecture
Per agent: typed tool set → policy layer (permissions, budget, approval requirement) → model router (task-complexity-based Claude/GPT/local routing) → execution trace to Langfuse → structured result card. Orchestrator = planner workflow producing daily task DAG; QA critic agent reviews outputs pre-approval; memory = tenant-scoped vector store + strategy docs (the Okara-grounding pattern, reimplemented).

## 10.5 Permission model
Owner > Admin > Editor > Viewer; agent service identities scoped per-tool; external side effects require either explicit approval or per-category auto-arm (default off). Spend caps enforced at connector layer.

## 10.6 CI/CD, testing, monitoring
- GitHub Actions: lint/typecheck → vitest → Playwright e2e → preview deploy → prod on tag
- **Agent evals**: golden-set regression suite for every agent (output quality gates block deploys)
- Invariant test: no publish/send/spend path reachable without approval-or-auto-arm check
- Monitoring: OTel traces, LLM cost dashboards per tenant/agent, budget-burn alerts, error budgets

## 10.7 Prioritized backlog (Epic → Stories)

**EPIC A — Foundations (P0)**: A1 Auth+tenancy+RLS · A2 Stripe subscriptions+credits · A3 PostHog+GA4+CAPI with pixel gating · A4 audit log. *AC: signup→tenant→billing live; all events firing; RLS tested.*

**EPIC B — Research & Strategy engine (P0)**: B1 URL ingest → strategy docs (5 doc types) · B2 competitor scan · B3 brand voice guide. *AC: docs in <5 min p50; quality eval ≥ baseline.*

**EPIC C — Marketing agents v1 (P0)**: C1 SEO auditor (6h cadence) · C2 Writer→CMS publish w/ approval · C3 Reddit/HN finder+drafts (draft-only) · C4 X/LinkedIn drafts · C5 daily digest email. *AC: feed populated daily; nothing publishes unapproved.*

**EPIC D — Approvals & safety (P0)**: D1 approval queue UI · D2 policy engine (side-effect classification) · D3 spend/budget guards. *AC: invariant test green; median decision <12h.*

**EPIC V2 scope**: E1 Code agent (GitHub PR fixes) · E2 site builder+deploy+domains · E3 UGC video gen · E4 GEO tracking (15 prompts) · E5 team/agency workspaces.
**EPIC V3 scope**: F1 paid-ads management w/ caps · F2 support inbox agent · F3 finance sync + rev-share payouts (Stripe Connect) · F4 explore directory/marketplace · F5 custom agent builder.

Dependencies: B←A; C←B,D; E2←D; F1←D,F5.

## MVP definition (8–10 weeks [EST])
Landing + auth + onboarding research + 4 marketing agents (SEO, Writer, Social drafts, Reddit) + approval queue + Free/$99/$249 pricing + digest emails. This is "Okara-class" capability with the approval-gate differentiation and better observability.

---

# 11. FINAL STRATEGIC ASSESSMENT

1. **What Polsia does exceptionally well**: time-to-artifact (minutes to live landing page); bundling entire infra stack; founder-led virality as distribution; rev-share alignment narrative; solo-founder operational leverage proven publicly.
2. **Likely moat**: accumulated tenant-business data + agent reliability iteration; infra bundling economics; brand ("runs your company" category ownership). Moat is currently thin — mostly speed and story. Confidence: MEDIUM.
3. **Apparent weaknesses**: ~50% early churn; no approval gates → trust erosion; low Trustpilot; thin subscription margins hostage to compute prices; paywalled docs hurting SEO/support; single point of failure (one human).
4. **Hardest to replicate**: agent reliability at code-execution level; the founder's distribution machine; rev-share underwriting appetite.
5. **Easiest to replicate**: strategy-doc generation, scheduled agent cycles, draft feeds, pricing structure, tenant subdomain hosting.
6. **Business risks**: compute cost inflation; churn from failed tenant businesses; regulatory exposure of autonomous ad-spend/outbound (spam, TCPA/CAN-SPAM, platform bans); valuation vs unaudited-metrics gap.
7. **Technical risks**: sandbox escapes from code-executing agents; runaway agent actions; multi-tenant data leakage; model-vendor dependency (Claude).
8. **Regulatory/security risks**: GDPR/CCPA on integration tokens; AI-content disclosure rules; Meta/Google ads policy enforcement on autonomous creatives; PCI scope via Stripe (mitigated); EU AI Act transparency duties.
9. **Differentiation openings**: (a) approval-gated autonomy as default trust posture; (b) per-agent ROI attribution (prove which agent earns its keep); (c) model-agnostic cost routing → structurally better margins than a Claude-only stack; (d) public docs/community (both competitors are weak here); (e) agency/multi-brand wedge Okara only just opened; (f) compliance pack (audit logs, SOC 2 roadmap) for non-hobbyist SMBs.
10. **Recommended strategy**: Don't fight Polsia's full-autonomy brand or Okara's price floor. Enter as **"autonomous ops you can actually supervise"**: start with the high-margin marketing-agent suite (Okara-proven demand, 85%+ margins), make the human-approval layer and audit trail the headline, add build/deploy (Polsia's wedge) in V2 once the approval infrastructure makes it safe, and monetize expansion via credits + agency seats rather than a mandatory revenue take. Win the customers both competitors are currently burning: serious SMB operators who want leverage without losing control.

---
*Report complete. Parts 1–4 constitute the full deliverable: research (01), competition & business models (02), architecture & product spec (03), blueprint & strategy (04).*
