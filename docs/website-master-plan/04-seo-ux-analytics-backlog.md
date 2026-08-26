# AutoMSP Website Master Plan — Part 4: SEO, UX, Analytics, Backlog & Questionnaire

---

## 16. SEO & AEO Plan (Phase 8)

**Shipped 2026-08-26**: robots policy welcoming 16 search/AI crawlers · llms.txt · /aeo-services with FAQ schema · /agentic-ai 308 · complete sitemap · Organization/ProfessionalService JSON-LD · homepage FAQPage schema.

**Keyword & intent map (priority order)**:
| Cluster | Intent | Pages | Status |
|---|---|---|---|
| aeo services / answer engine optimization | commercial | /aeo-services | Live — captures existing GSC demand |
| managed ai infrastructure / ai infrastructure services | commercial | new split page | Backlog B-04 |
| ai agents for business / production ai agents | commercial | new split page | B-04 |
| enterprise rag / ai workflow automation | commercial | solutions slugs | Exists, refresh copy |
| human-in-the-loop ai / ai agent security | informational→commercial | security page + article | Month-2 content |
| ai automation for logistics/professional services | industry | industries slugs | Exist; verify substance |

**Internal linking rule**: every service page links to one use case, one case study, and the audit CTA. Homepage sections get anchor IDs once section nav ships.

**Comparison-page opportunities** (original, restrained): "Managed AI services vs AI consultancies," "AI automation vs AI agents" (definition block live on homepage/FAQ), "Build vs buy for enterprise RAG."

**90-day editorial calendar** (Phase 16 condensed):
- **Month 1 — Foundation**: pricing rebuild (B-02) · security page expansion · GA4 install (B-03) · service split pages (B-04) · entity consistency sweep
- **Month 2 — Proof**: case study w/ verified figures + methodology · "How we evaluate agents" architecture article · deployment checklist asset · author bio entities [INPUT REQUIRED: real names/credentials]
- **Month 3 — Authority**: AI workflow ROI framework (template, not fabricated numbers) · model/vendor selection guide · failure-mode analysis post · first benchmark dataset if operational data permits [VERIFICATION REQUIRED]

Every article must pass: would an experienced operator save or cite this?

## 17. UX & Accessibility Findings (Phase 9)

Confirmed issues:
1. **HeroVisual animation ignores reduced-motion preference** — `src/components/marketing/hero-visual.tsx` animates continuously; WCAG 2.3.3 consideration. Fix: wrap in `motion-reduce:animate-none` equivalent / check `prefers-reduced-motion`. Priority High.
2. **Long homepage lacks jump navigation** — 11 sections, no anchors. Fix: anchor IDs + slim in-page nav. Low effort.
3. **FAQ answers not keyboard-expandable** — currently always-visible `<dl>` (good — no hidden content issue). No action; do not convert to accordion without need.
4. **Form error states** — audit form uses inline errors (verified pattern in source-form); confirm same on book-audit form during B-01 work.
5. Touch targets ≥44px verified on primary buttons (`h-11`/`h-[52px]`). Pass.
6. Heading hierarchy: single H1/page verified on rewritten pages; audit remaining pages post-split. Medium.
7. 200% zoom: grid system uses relative units; spot-check required. Recommended test.

Probable risks (test before claiming): color contrast of `.text-mute` on `bg-haze` at small sizes; focus-visible ring visibility on dark sections.

## 18. Technical Audit (Phase 10)

Confirmed issues:
1. **No OG/Twitter image** → shipped fix: dynamic `opengraph-image` (see deploy notes below).
2. **Zero analytics** → B-03 (GA4 + event plan Part 4 §19).
3. **No spam protection on public form** → B-01 (honeypot + server-side rate limit via existing rate-limit module).
4. **Pricing body/metadata mismatch** → B-02.

Validated as healthy: sitemap completeness ✅ · canonical support via metadataBase ✅ · next/font self-hosting ✅ · static marketing pages, minimal hydration ✅ · redirect hygiene (308s) ✅ · semantic landmarks in shell components ✅.

Recommended tests (not yet run): Lighthouse mobile pass per template; broken-link crawl; CSP report review from proxy.ts logs; form submission end-to-end test incl. notification delivery (TELEGRAM_BOT_TOKEN exists — confirm it's actually wired to lead notifications).

## 19. Conversion Journey & Analytics Plan (Phases 13–14)

Funnel: Landing session → engaged (>30s/scroll) → high-intent page (/security, /pricing, case) → CTA click → form start → submit → booked call → qualified opportunity → proposal → won.

Events to implement in GA4 (names, trigger):
- `cta_click {location, label}` all ButtonLinks to /book-audit
- `section_view {section}` homepage scroll depth by section
- `form_start` first field focus
- `form_submit {company_size, role_tier}` sanitized
- `call_booked` calendar confirmation
- `pricing_view`, `security_view`, `case_view` page_view aliases for funnel steps

Form fields (pre-booking, minimal): Name · Work email · Company · Role · Company size (bands) · Primary workflow problem (free text). Post-booking qualification: current systems, desired outcome, timeline, optional budget range. Privacy reassurance line under submit: "Used only to prepare your audit. Never sold." Error messages specific per field. Confirmation page restates the three-deliverable promise + what happens next.

Copy deliverables (write during B-03/B-06 implementation): pre-call email, no-show follow-up, post-audit follow-up — templates standard; owner supplies calendar link [INPUT REQUIRED].

Experiments backlog (top 5 of 10): hero subheadline specificity A/B · trust-strip position (above vs below hero) · pricing visibility on homepage (with/without figures) · form length (4 vs 6 fields) · case-study presence above/below process. Each requires baseline traffic first — install analytics before running any [DEPENDENCY: B-03].

## 20. Visual Direction (Phase 18) — summary

Current Swiss/editorial system (ink/paper/fog palette, Instrument Serif display) already avoids generic-AI aesthetics. Keep. Additions: anonymized workflow diagram (before/after swimlanes), controlled-agent architecture diagram, human-approval sequence visual — all renderable from real platform concepts, no fake dashboards. Avoid stock portraits permanently.

## 21. Prioritized Implementation Backlog (Phase 19)

| ID | Task | Pri | Effort | Acceptance |
|---|---|---|---|---|
| B-01 | Honeypot + rate-limit book-audit form | P0 | S | Bot POST rejected; real submit unaffected |
| ~~B-R1~~ | Remove unsupported metrics-band claims | P0 | S | Shipped this cycle ✅ |
| ~~B-R2~~ | OG/social image | P0 | S | Shipped this cycle ✅ |
| B-02 | Rebuild /pricing body to 4-tier ladder | P0 | M | Body matches homepage; old plan language gone |
| B-03 | GA4 + conversion events | P1 | M | Events firing in debug view |
| B-05 | Reduced-motion + focus pass | P1 | S | prefers-reduced-motion honored site-wide |
| B-04 | Service split pages (infra/agents/ops) | P1 | M/L | 3 pages live w/ schema |
| B-06 | Case-study substantiation or removal | P1 | Owner | Records exist or figures removed |
| B-07 | Cloudflare AI-crawler unblock | P0-manual | Owner | Live robots.txt serves origin policy |
| B-08 | Brand-domain decision (.us vs .cloud) | P1-decision | Owner | One canonical; other redirects |
| B-09 | Section anchors + in-page nav | P2 | S | Keyboard-navigable |
| B-10 | Editorial month-1 articles | P2 | M | Per calendar |

First 48 hours: R1 ✅, R2 ✅, B-01, B-07 manual, spelling/grammar sweep on aging pages, link check. Two weeks: B-02, B-03, B-05. 30 days: B-04, B-06 decision. Days 31–60: editorial + comparison content. 61–90: authority assets + experiments (only with traffic baseline).

## 22. Missing-Information Questionnaire (owner must answer)

1–3. Three most profitable services / strongest completed projects / evidence for every published result?
4. Client permissions (names, logos, quotes)?
5. Real team members + credentials?
6–8. Actual tech capabilities, supported environments, implemented security controls?
9. Compliance status (any audits held)?
10–13. Standard timeline, minimum engagement, monthly scope, support hours/response times?
14–17. IP/code ownership terms, data-retention policy, provider data-use terms, offboarding process?
18–20. Target industries, company size, geographic market?
21–25. Current conversion rate, organic traffic, top sales objections, sales-cycle length, lead sources?

Do not fill these gaps with assumptions anywhere on the site.

## 23. Final Pre-Publication Checklist

- [ ] Every factual assertion traced to code, contract, or measurement record
- [ ] All [VERIFICATION REQUIRED] items resolved or removed
- [ ] Single H1 per page; unique titles/metas
- [ ] FAQ schema only where Q&A visibly rendered
-[ ] Forms: honeypot active, rate-limited, errors accessible, confirmation honest
- [ ] No unsupported superlatives ("industry-leading", "guaranteed", etc.)
- [ ] Case studies carry methodology + attribution disclosure
- [ ] Security claims match implemented controls exactly
- [ ] Analytics events firing before any experiment runs
- [ ] Adversarial re-read by each persona in Part 2 §5
