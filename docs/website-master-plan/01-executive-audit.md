# AutoMSP Website Master Plan — Part 1: Executive Assessment & Fact Base
Target: automsp.cloud | Basis: direct source-code inspection + live-site probing, 2026-08-26

---

## 1. Executive Summary

The automsp.cloud homepage rewrite (deployed 2026-08-26) resolved the largest positioning failures: hero now leads with "Build an AI operating layer without building an AI department," services are structured as five capability stages, pricing shows a coherent four-tier ladder, FAQ schema is live, and AEO infrastructure (llms.txt, robots policy, /aeo-services) shipped the same day.

What remains open falls into three buckets:

1. **Unverifiable proof claims still published** — the metrics band asserts "100+ AI systems designed & deployed," "30–50% cycle-time reduction," "4–12× ROI," "99.9% reliability." These are labeled "typical ranges" but have no cited basis. Under this plan's rules they are [VERIFICATION REQUIRED] items on an enterprise-facing page.
2. **No measurement foundation** — zero analytics scripts exist anywhere in the app. Every downstream question (conversion rate, CTA performance, funnel drop-off) is currently unanswerable. This blocks Phases 13–14 from functioning.
3. **Trust-surface gaps** — no Open Graph/social share image, no spam protection on the primary conversion form, security page depth unverified against actual controls, and the /pricing page body still describes the old single-plan SaaS model while its metadata describes the new ladder (entity inconsistency that answer engines penalize).

## 2. Critical Risks (P0)

| # | Risk | Evidence | Status |
|---|---|---|---|
| R1 | Unsupported performance claims visible to enterprise buyers | `src/components/marketing/metrics-band.tsx:9-12` | Fix below |
| R2 | Social shares render without image (`summary_large_image` card, no image defined) | `src/app/layout.tsx:33-38`; `public/` contains only `brand/`, no OG raster | Fix below |
| R3 | Primary conversion form accepts unauthenticated public POSTs with no bot protection | `/book-audit` HTML contains no honeypot/captcha/token | Backlog B-01 |
| R4 | Pricing page body contradicts homepage pricing section | `src/app/(marketing)/pricing/page.tsx` body = single SaaS plan + revenue share | Backlog B-02 |
| R5 | Cloudflare-managed robots.txt blocks GPTBot/ClaudeBot/etc. at edge | Live robots.txt fetch, 2026-08-26 | **Manual action required** (owner, CF dashboard) |
| R6 | Case-study figures (80%/30%/60hrs) lack documented measurement records | Owner-supplied copy | [VERIFICATION REQUIRED] — owner |

---

## 3. Verified Facts Table (Phase 1)

Sources: repository source of truth (file paths noted); live HTTP checks. Anything not listed here must not be claimed publicly.

| Claim (as published/implied) | Source | Verification status | Safe to publish? | Required evidence | Recommended wording |
|---|---|---|---|---|---|
| AutoMSP designs, deploys, operates AI infra, automation, agents | Product itself (`src/server/*`, running platform) | Verified by codebase | Yes | — | As-is |
| Nine specialist agents / starter fleet | `src/server/ai/fleet.ts` (10 templates incl. SEO Auditor, GEO Tracker) | Verified in code | Yes, update count | — | "A specialist agent fleet seeded day one" |
| Human approval gates on consequential actions | `DEFAULT_APPROVAL_POLICY = require_approval`, sandbox mode org flag | Verified in code | Yes | — | As-is |
| Sandbox mode — nothing external dispatches until owner opts out | `Organization.sandboxMode` default true; nightly-cycle docstring | Verified in code | Yes | — | As-is |
| Usage-based AI cost tracking at list price | `provider.ts estimateCostUsd`, AiRun records | Verified in code | Yes | — | As-is |
| Model-provider neutrality (Anthropic/OpenAI/Google) | `provider.ts` | Verified in code | Yes | — | As-is |
| Credential vault, server-side keys only | `src/server/vault.ts`; provider reads env server-side | Verified in code | Yes | — | As-is |
| Evaluation suites with recorded pass rates | `EvalSuite/EvalRun/EvalResult` models | Verified in code | Yes | — | As-is |
| "100+ AI systems designed & deployed" | metrics-band.tsx | **Unsupported** | No | Deployment register | Remove or replace with operational statement |
| "30–50% cycle-time reduction" | metrics-band.tsx | **Unsupported** | No | Measurement records per engagement | Remove |
| "4–12× ROI within 12 months" | metrics-band.tsx | **Unsupported** | No | Client outcome records | Remove |
| "99.9% reliability target" | metrics-band.tsx | Target ≠ result; ambiguous | Borderline | Monitoring history | Only with SLA documentation [LEGAL REVIEW REQUIRED] |
| Case study: logistics, 80%/30%/60hrs, 90 days | Homepage case-study component | Owner-supplied, unaudited | Conditionally | Measurement records + confidentiality basis | Keep only if records exist; else remove figures |
| Free audit / $7,500 pilot / $12K-mo managed / custom dept | Homepage pricing section (this rewrite) | Proposed pricing | With label | Commercial sign-off | Keep "starting at" framing [COMMERCIAL VALIDATION REQUIRED] |
| Team size, employee credentials, offices | Not published anywhere | Unknown | Do not publish | Owner input | [INPUT REQUIRED] |
| Compliance status (SOC 2, ISO, GDPR posture) | Not claimed anywhere | Correctly absent | Keep absent until true | Audit reports | Do not imply |
| Cloudflare AI-crawler permissions | Live robots.txt | Blocked at edge | N/A | CF dashboard change | Owner action |

## 4. Website Scorecard (Phase 2)

Scores reflect post-rewrite state, 2026-08-26.

| Category | Score | Evidence | Impact | Correction | Priority | Effort |
|---|---|---|---|---|---|---|
| Positioning clarity | 8 | New hero/eyebrow align to managed-AI category | High | None urgent | Low | Small |
| Ideal-customer clarity | 7 | Eyebrow names mid-market; ICP detail lives in solutions pages | Medium | Add ICP line to About/solutions intro | Medium | Small |
| Offer differentiation | 7 | Managed-vs-self-service wedge present; approval-gate story strong | High | Sharpen on service pages | High | Medium |
| Enterprise credibility | 5 | Metrics band unsupported; case study single-source | High | R1/R6 fixes | Critical | Small |
| Technical credibility | 6 | Approval gates/sandbox real & explainable; architecture page thin | High | Security page expansion (Part 3 §4) | High | Medium |
| Proof & substantiation | 4 | One anonymized case; no logos, quotes, or named results | High | Case-study system (Part 3 §3) | Critical | Large |
| Conversion flow | 6 | Clear CTAs; form unqualified, unprotected | High | Conversion journey (Part 4 §3) | High | Medium |
| CTA clarity | 8 | Single primary CTA repeated coherently | Medium | — | Low | Small |
| Information architecture | 7 | Logical nav; /results vs /case-studies naming split | Medium | Standardize slug strategy | Medium | Small |
| Copy quality | 8 | Rewritten; consistent terminology | Medium | Service pages still old voice | Medium | Medium |
| UX clarity | 7 | Clean Swiss layout; long homepage (~11 sections) | Medium | Anchor nav for homepage sections | Low | Small |
| Mobile usability | 7 | Responsive grid system throughout | Medium | Spot-check 200% zoom | Medium | Small |
| Accessibility | 6 | Semantic landmarks mostly present; focus states untested; motion not reduced-motion-aware in HeroVisual | Medium | Part 4 §2 items | High | Medium |
| Page speed risk | 7 | Static marketing, minimal JS; fonts via next/font | Low | Add OG image w/o weight regression | Low | Small |
| Technical SEO | 8 | Sitemap complete, canonicals, redirects, llms.txt, robots | Medium | Cloudflare edge override (R5) | Critical | Manual |
| On-page SEO | 7 | Unique titles/metas; H1 discipline good | Medium | Service-page metas refresh | Medium | Small |
| AEO readiness | 7 | llms.txt, FAQPage JSON-LD, answer passages | High | Depends on R5 + entity consistency | Critical | Manual+Small |
| Security communication | 5 | Section lists controls; page depth unknown vs reality | High | Part 3 §4 outline + verification pass | High | Medium |
| Pricing clarity | 5 | Homepage coherent; /pricing page contradicts | High | B-02 rebuild | Critical | Medium |
| Legal/reputational risk | 6 | No fake logos/testimonials (good); metrics claims remain | High | R1/R6 | Critical | Small |

---

*Parts 2–4 continue in sibling files. All [INPUT REQUIRED] items are consolidated in the questionnaire (Part 4 §9).*
