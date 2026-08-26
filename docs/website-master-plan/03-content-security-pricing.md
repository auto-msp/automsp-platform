# AutoMSP Website Master Plan — Part 3: Content, Case Studies, Security & Pricing

---

## 10. Homepage (Phase 6) — Status: IMPLEMENTED

The full homepage rewrite per the preferred narrative is live (11 sections, single H1, verified title/meta). No further copy work required this cycle; see backlog for section-anchor navigation.

## 11. Service-Page Rewrites (Phase 6, templates)

Existing pages to refresh with the new voice. Template per page:

- **SEO title**: `{Service} for Mid-Market Companies | AutoMSP`
- **Meta**: one sentence: what it is + who + audit CTA
- **H1**: outcome-phrased ("Enterprise RAG your teams can actually trust" style — no buzzwords)
- **Hero eyebrow** → **headline** → **subheadline** (what/who/how)
- **Primary CTA**: Book a Free AI Opportunity Audit · Secondary: Discuss this workflow
- **Trust strip**: 4 operational statements (reuse TrustStrip component)
- **Problem**: the failure mode without this capability
- **Mechanism**: how AutoMSP implements it (specific verbs: connect, extract, route, reconcile, approve, escalate)
- **Use cases**: 3–4 bullets tied to systems
- **Controls block**: permissions, approval points, logging specific to this service
- **Proof slot**: case reference or [VERIFICATION REQUIRED] placeholder
- **FAQ**: 3 questions with visible answers + FAQPage schema
- **Final CTA**

Pages in scope: capabilities page sections split into `/ai-infrastructure`, `/ai-agents`, `/managed-ai-operations` (+ existing `/aeo-services` shipped). Effort: medium each. Priority: P1.

## 12. Use-Case Page Templates

Six use cases already on homepage map to future detail pages (`/use-cases/[slug]`). Each needs: baseline workflow description, systems involved, automation design, human-approval model, measurement approach, CTA. Publish only after at least one real engagement exists per use case — otherwise keep as homepage cards.

## 13. Case-Study System (Phase 7)

Template fields (all mandatory before publication): client descriptor · original workflow · baseline volume/performance · problem · systems involved · implementation list · human approval model · deployment timeline · measurement period · results with calculation method · authorized quote · security considerations · architecture summary · lessons learned.

Rules adopted:
- Anonymized clients labeled explicitly ("Client identity withheld under a confidentiality agreement") ✅ already live
- Figures published only when measurement records exist → current logistics figures: [VERIFICATION REQUIRED] owner action
- Calculation method line added under each metric (e.g., "reduction vs prior 90-day manual-correction volume")
- Reject any case lacking ≥6 of the fields above

## 14. Security & Enterprise Trust Content (Phase 11)

### 14.1 Homepage security section — Status: LIVE
Current seven assurances are all code-verifiable platform behaviors (least privilege, approvals, logging, retention controls, pre-release evaluation, deployment options, escalation paths). Safe as published.

### 14.2 Detailed /security page outline
1. Deployment architecture (cloud/private/hybrid; where components run) — factual only
2. Cloud-account ownership model [INPUT REQUIRED: actual contract terms]
3. Data flow diagram: source systems → integration layer → model providers → outputs
4. Credential storage: server-side vault, env-only keys (code-verifiable)
5. Access control: roles (owner/admin/editor/viewer exist in permissions.ts)
6. Human approval controls: require_approval default, sandbox mode default true
7. Audit logging: AuditLog model, agent-run transcripts retained
8. Model-provider selection + provider data-retention settings [INPUT REQUIRED: which providers/tiers]
9. Customer-data usage policy [INPUT REQUIRED + LEGAL REVIEW REQUIRED]
10. Monitoring & incident handling process [INPUT REQUIRED: actual on-call/response commitments]
11. Backup/recovery [VERIFICATION REQUIRED]
12. Vendor dependencies list
13. Data residency options [INPUT REQUIRED]
14. Offboarding & portability: what client receives, export paths [INPUT REQUIRED]
15. Compliance status: honest "current posture and roadmap" — never imply SOC 2/ISO/HIPAA/GDPR certification until held [LEGAL REVIEW REQUIRED]

### 14.3 Security Due-Diligence Questions checklist (prepare answers internally)
Where does data physically process and rest? Which subprocessors? Retention per system? Training-use opt-outs per provider? Who holds cloud account root? How are credentials rotated? What's logged and for how long? How are agents rate-limited? What happens on model-provider outage? Incident notification SLA? Exit/offboarding artifacts? Penetration test history? [VERIFICATION REQUIRED items marked internally]

## 15. Pricing & Offer Architecture (Phase 12)

Homepage ladder (live): Audit Free → Pilot from $7,500 → Managed Infrastructure from $12,000/mo → AI Department custom. All figures [COMMERCIAL VALIDATION REQUIRED].

Definitions to publish (removes procurement ambiguity):
- **Workflow**: one repeatable business process with defined trigger, steps, systems, exception path
- **Agent**: task-scoped software using models + tools within granted permissions and approval rules
- **Integration**: one authenticated connection between the platform and an external system
- **Production deployment**: running against live data with monitoring, logging, and rollback path

Pricing transparency recommendation: **starting-from public, ranges for pilots, custom above managed tier.** Public exact prices attract wrong buyers at enterprise tier; hiding all numbers kills self-qualification. Homepage currently follows this correctly.

**B-02 (critical)**: rebuild `/pricing` body to match this ladder; current page still sells the retired single SaaS plan with revenue-share language — the single largest entity-consistency defect remaining.
