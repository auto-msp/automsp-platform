# AutoMSP Website Master Plan — Part 2: Wargame, Positioning, Messaging & IA

---

## 5. Adversarial Wargame (Phase 3)

| Persona | Will question | Abandonment trigger | Weak claim they'll hit | Missing info | Objection to resolve | Trust-builder needed | Required change |
|---|---|---|---|---|---|---|---|
| A. Skeptical COO | "What do you actually operate best?" | Breadth over focus; no named problem | "100+ systems deployed" (no basis) | Which workflow families you've shipped most | Who's accountable after go-live | Named workflow types + escalation story | Replace metrics with operational statements (done in R1 fix) |
| B. Enterprise CTO | Deployment models, data flow, model routing | Security hand-waving before discovery call | "Encryption where supported" vagueness | Architecture diagram, credential handling, logging detail | How agents are sandboxed/permissioned | Downloadable security overview + architecture page | Expand /security per Part 3 §4 |
| C. CFO / procurement | Why these prices? What am I buying monthly? | $7,500 vs $12K/mo without scope definition | "Starting at" without exclusions | Pilot scope boundaries, exit terms, ownership | What happens if we stop paying | Defined pilot scope doc + ownership FAQ | Pricing rebuild (Part 3 §5) |
| D. Security reviewer | Subprocessor list, data retention, training use | Absolute privacy promises | "Your data stays yours" (removed — good) | Model-provider data-use specifics | Where data resides, who can access | Due-diligence answers ready (Part 3 §4.2) | Publish factual controls only |
| E. AI engineer | "Is this n8n wrappers or real engineering?" | Buzzword density without mechanism | Any "autonomous" framing w/o eval story | Eval methodology, failure recovery, tool permissions | How quality is measured pre/post launch | Evaluation-suite description (it exists in product!) | Add "How we evaluate" block |
| F. Competitor consultant | Differentiation vs generic agencies | Undifferentiated claims | Category jargon overlap | Proof of ongoing operation (not just builds) | Why not hire/freelance | Managed-ops emphasis + monitoring screenshots [VERIFICATION REQUIRED] | Comparison table (Part 4 §6) |
| G. Reputation investigator | Are clients/cases verifiable? | Anonymized case without disclosure | Case metrics without method | Measurement methodology | Is the case study real at all | Disclosure lines (present) + method note | Keep only substantiated figures |
| H. Search engine | Duplicate/thin content, intent match | — | Old pricing-page copy vs homepage | Consistent entity facts | — | Entity consistency (done for metas; body pending) | B-02 |
| I. AI answer engine | Can I retrieve clean facts about this company? | Contradictory descriptions across pages | Stale third-party descriptions | llms.txt (shipped), direct definitions | — | Consistent one-paragraph company definition everywhere | Done on key pages; audit remaining |
| J. Accessibility reviewer | Keyboard traps, motion, contrast, hidden dupes | Unusable nav/forms | Decorative animation in HeroVisual | Reduced-motion support | — | prefers-reduced-motion handling | Part 4 §2 |

### Ten most dangerous failure scenarios

1. **Buyer asks ChatGPT about AutoMSP and gets the stale "$50/mo + 20% rev share" description** → mitigation: Cloudflare crawler unblock + consistent entity copy (done) + re-crawl trigger via GSC.
2. **CFO discovers pricing page contradicts homepage** → B-02 rebuild within 2 weeks.
3. **Prospect shares homepage link internally; link preview shows no image** → OG image fix (shipped below).
4. **Security reviewer asks for SOC 2 and finds silence** → publish honest "current posture + roadmap" instead of silence or implication.
5. **Case study challenged as fabricated** → keep only if measurement records exist; add methodology note; else remove.
6. **Form gets spammed/botted; real leads buried** → honeypot + rate limit (B-01).
7. **Metrics band cited by an answer engine as fact ("AutoMSP has deployed 100+ systems")** → remove unsupported numbers (shipped).
8. **Accessibility complaint from enterprise buyer's procurement screen** → reduced-motion + focus pass (B-05).
9. **Two sites (.us static vs .cloud app) present different companies** → decide canonical brand domain; align or redirect [INPUT REQUIRED: owner decision].
10. **Analytics absence means every conversion hypothesis stays untestable** → GA4 + events install (B-03).

## 6. Positioning Options (Phase 4)

| Dimension | Option 1 (RECOMMENDED) | Option 2 | Option 3 |
|---|---|---|---|
| Category | Managed AI systems partner | Production AI enablement firm | AI operations department (AaaS) |
| Ideal customer | Mid-market ops/tech leaders, 100–2,000 emp | Same, more technical buyer | Ops leaders allergic to hiring |
| Core problem | Prototypes stall before production | Pilots don't survive contact with real data/systems | No internal capacity to run AI |
| Unique mechanism | Build + operate with approval-gated autonomy | Eval-first deployment | Outcome-linked managed service |
| Primary promise | Operating layer without the department | From pilot to production, controlled | Your AI team, minus the hiring |
| Reasons to believe | Real platform: approvals, sandbox, vault, evals (verifiable in product) | Same + evaluation framework depth | Same + commercial alignment |
| Likely objection | "Managed = lock-in" | "Sounds like consulting" | "Revenue-share-like models sound risky" |
| Positioning statement | AutoMSP designs, deploys, and operates secure AI systems so mid-market companies get an AI operating layer without building an AI department. | AutoMSP takes AI workflows from demo to monitored production with evaluation built in. | AutoMSP runs your AI function end-to-end under your controls. |
| Homepage headline | Build an AI operating layer without building an AI department. ✅ (live) | Ship AI that survives production. | Hire the department, not the headcount. |
| CTA | Book a Free AI Opportunity Audit ✅ (live) | Start with a scoped pilot | Get your operating plan |

**Recommendation**: Option 1 — matches live implementation, is defensible (the platform genuinely does build+operate with controls), and avoids revenue-sharing framing entirely.

## 7. Ideal Customer Profile (Phase 2 supplement)

Published ICP (homepage eyebrow + solutions pages): mid-market companies ~100–2,000 employees, multiple disconnected systems, high repetitive-knowledge volume, existing CRM/ERP/ticketing/data stack, no mature internal AI engineering function, executive sponsor in ops/tech/revenue/CX, five-figure-plus capacity.

[INPUT REQUIRED] Confirm against actual customer base; note Okara's crawl recorded an older ICP ("20–200 employees, $2M–$50M") from previous site copy — pick one and make it consistent everywhere.

## 8. Messaging Hierarchy

1. **Category**: Managed AI systems partner
2. **Promise**: Build an AI operating layer without building an AI department
3. **Wedge**: Managed vs self-service — we run it, you don't babysit it
4. **Proof architecture**: approval gates · sandbox mode · provider-neutral stack · cost transparency · evaluations (all code-verifiable)
5. **Mechanism**: Discover → Design → Deploy → Operate (deliverables per stage)
6. **Offer ladder**: Free audit → $7,500 pilot → $12K/mo managed → custom department
7. **Voice rules**: see Phase 17 summary (Part 4 §7)

## 9. Recommended Sitemap & IA (Phase 5)

Live routes today (verified): `/`, `/capabilities`, `/aeo-services`, `/solutions[/slug]`, `/industries[/slug]`, `/approach`, `/results`, `/resources`, `/about`, `/contact`, `/book-audit`, `/security`, `/pricing`, `/how-it-works`, `/agents`, `/privacy`, `/terms`.

Gaps and intent assignments:

| Page | Audience | Intent | Buyer question | Conversion goal | Required proof | Schema |
|---|---|---|---|---|---|---|
| /ai-infrastructure (new, split from capabilities) | CTO | commercial investigation | "How would you run my models/data securely?" | Audit | Deployment-model description, vault/logging facts | Service |
| /ai-agents (new split) | COO/VP Ops | commercial | "What can an agent safely do?" | Audit | Approval/escalation mechanics | Service |
| /managed-ai-operations (new split) | COO | commercial | "Who fixes it when it breaks?" | Audit | Monitoring/incident process | Service |
| /case-studies (rename /results) | All evaluators | proof | "Who has you done this for?" | Audit/pilot | Verified cases only | Article/CreativeWork |
| /security expansion | CTO/security reviewer | due diligence | "Pass procurement?" | Contact | Factual controls only | — |

Non-duplication rule: each service page owns its mechanism section; homepage keeps summaries + links only.
