# Competitive Intelligence Report — Part 2: Competitive Matrix & Business Model
Sections 2–3 of the specification.

---

# 2. COMPETITIVE MATRIX

## 2.1 Why these competitors
Polsia competes on two axes simultaneously: (a) AI app/company *building* and (b) autonomous business *operations*. Okara competes on autonomous marketing execution. No single vendor spans both, so the set below covers each axis plus the "AI employee" layer.

| Dimension | **Polsia** | **Okara AI** | Lovable | Bolt.new / v0 | Replit Agent | Lindy.ai | Jasper |
|---|---|---|---|---|---|---|---|
| Core JTBD | Run whole company autonomously | Replace marketing team | Build web apps from prompts | Build/prototype apps & UI | Build + host full-stack in cloud IDE | Automate business workflows w/ AI employees | Marketing content at scale |
| Target customer | Solo founders, non-technical builders | Founders/teams 1–5, bootstrapped | Founders, PMs, indie hackers | Devs, designers | Developers, technical founders | SMB ops teams, GTM teams | Marketing teams (mid-mkt+) |
| Pricing | Free + ~$29–59/mo + credits + 20% rev share | Free / ~$99 Lite / ~$249 Pro / agency tiers | Free + ~$25/mo+ usage credits | Freemium + token/usage based | ~$20–25/mo + usage | ~$49.99K+/yr custom-ish; usage-based | ~$39–69/mo seat-based |
| AI capability | 9 scheduled agents, Claude SDK, nightly cycles | 10 channel agents, approval-gated, 6h audits | Single-agent app builder | Single-agent codegen | Agent w/ shell+deploy | Multi-agent workflow builder | Brand-voice content gen |
| Website/app creation | Full: code→GitHub→deploy→domain | No (edits via coding agent PRs) | Yes — core | Yes — core | Yes — core | No | No |
| Automation | Deep (email, ads, social, support, finance) | Marketing-only | None post-build | None | Limited | Deep (workflow-centric) | Light |
| Hosting | Included, tenant subdomains/custom domains | N/A | Included | Included | Included | N/A | N/A |
| Payments | Stripe provisioned for tenant businesses | N/A | Via integrations | Via integrations | Via integrations | N/A | N/A |
| Human-in-loop | Minimal (~80% autonomy claim) | Mandatory approvals | You build | You build | You build | Configurable | You edit |
| Differentiator | Post-launch operations loop; infra bundling; rev-share alignment | GEO/AI-search tracking niche; strategy-doc grounding; Reddit/HN native channels | Design quality, speed | Speed, dev UX | Full cloud dev environment | Enterprise workflow reliability | Brand voice + enterprise adoption |
| Key weakness | No approval gates; ~50% early churn; thin sub margins; Trustpilot complaints | Output quality criticism ("Claude wrapper"); platform ban risk; no ads/paid media | Stops at app delivery | Same | Technical users only | Not for company-building | No automation/agentic depth |

**Additional meaningful competitors**:
6. **Copy.ai (GTM AI)** — workflow-based GTM automation at team scale; belongs here because it targets the same "replace marketing ops labor" budget as Okara with a different architecture.
7. **HubSpot Breeze** — incumbent embedding AI agents into CRM; belongs because it can bundle what both startups charge for, at platform scale.
8. **Bubble (AI)** — no-code incumbent adding AI generation; represents the migration path for businesses that outgrow Polsia-hosted infrastructure.
9. **Artisan / 11x (AI SDRs)** — verticalized autonomous outbound; overlaps Polsia's outreach agent directly and validates that budget line.
10. **Semrush ContentShake / Surfer SEO** — SEO-content execution tools overlapping Okara's Writer/SEO agents at similar price points.

---

# 3. BUSINESS MODEL RECONSTRUCTION

## 3.1 Polsia funnel map
```
Traffic (X virality, Meta/Google/TikTok/OpenAI paid — all four pixels verified)
  → Landing page (free-explore CTA, no card)
  → Signup → Company creation (aha moment in minutes: research + landing page live)
  → Activation = first nightly cycle completes (morning recap email)
  → 3-day trial (card upfront) → $49/mo subscription
  → Monetization expansion: credit top-ups ($1/task), ad-spend management, custom domains
  → Alignment monetization: 20% of tenant-business transactions (revenue share scales with customer success)
  → Retention: autonomy itself ("it works every day as long as you pay") + switching cost of migrated infra
  → Referral: every tenant site is a public artifact; founder-in-public flywheel on X
```

**Revenue streams**: subscriptions · task credits · revenue share · ad-spend margin (~20% fee on managed ad spend) · likely future compute resale/domain upsells [EST].

**Unit economics** [FACT inputs from founder interviews]:
- COGS/customer/mo ≈ $30 agent compute + $5–10 hosting/db/email ≈ **$35–40**
- ARPU ≈ $49 → subscription gross margin ≈ **15–30%** before rev-share upside
- Break-even requires either rev share attach or credit overage — hence the aggressive 20% take
- Compute deflation is their stated margin thesis (cheaper models → margin expands)

**Margin structure scenarios (bottom-up, explicit assumptions)**:

| Scenario | Paying subs | Avg ARPU/mo | Sub revenue | Rev-share net | Est. COGS | Contribution |
|---|---|---|---|---|---|---|
| Conservative | 4,000 | $52 | $208K/mo | $40K | $150K ($37.50 ea) | $98K/mo |
| Base | 10,000 | $55 | $550K/mo | $250K (2.3K active biz × ~$550 mo GMV × 20%) | $370K | $430K/mo |
| Aggressive | 25,000 | $60 | $1.5M/mo | $900K | $875K | $1.53M/mo |

Base case reconciles with the ~$10M run-rate claim ($9.8M annualized). Sensitivity: ±$10 COGS/customer swings base-case contribution ±28% — compute cost is the single dominant risk variable.

**Retention**: ~50% early churn reported [STRONG] — expectation mismatch ("passive income" buyers). Retention lever = customers whose businesses actually earn (rev share makes churn costly to both sides). Network effects: weak-to-moderate (tenant directory `/explore`, shared learnings across agents); switching costs: moderate (code in GitHub = portable; bundled infra = friction).

## 3.2 Okara funnel map
```
Traffic (X virality — 10M+ views launch; founder audience; SEO/GEO dogfooding)
  → Landing (Free, no card) → URL entry = instant product value (analysis in 3–5 min)
  → Free plan delivers real artifacts (strategy docs, homepage audit)
  → Credit-gated upgrade → Lite $99–129 → Pro $249 (or $2,490/yr)
  → Usage monetization: credit top-ups (never expire), agency per-site pricing
  → Retention: daily feed habit + connected publishing stack + accumulated strategy docs
  → Expansion: multi-project workspaces, agency tier, higher-tier plans unlocking more agents (stated roadmap via Stripe case study)
```

**Revenue streams**: subscriptions · credit top-ups · agency plans · planned higher tiers/influencer marketplace take rate [EST].

**Unit economics** [EST — inference]: agent runs are mostly text-gen + scraping (cheap vs Polsia's code-execution); UGC video gen is the expensive line item. Assume $8–20 COGS/Pro customer/mo → **85–92% gross margin**. This is structurally better than Polsia's model.

| Scenario | Paying subs | Blended ARPU | MRR | COGS (12%) | Contribution |
|---|---|---|---|---|---|
| Conservative | 3,000 | $120 | $360K | $43K | $317K/mo |
| Base ("thousands paying", 70% US) | 7,000 | $135 | $945K | $113K | $832K/mo |
| Aggressive | 15,000 | $140 | $2.1M | $252K | $1.85M/mo |

Confidence: LOW-MEDIUM (40%) — "thousands of paying customers" is the only anchor; plan mix unknown.

**Retention assumptions**: approval-workflow products retain better than autonomy products (user stays editor); integration lock-in (CMS, GSC, GA4, socials) raises switching costs; credit pools create sunk-cost lock-in. Churn est. 5–8%/mo for prosumer SaaS [EST]. Network effects: minimal; community/distribution effects: strong (founder-led virality).

## 3.3 Comparative economics verdict
- **Polsia** = aligned-but-thin: low margins, high compute risk, unlimited upside via rev share if tenant businesses succeed. Venture-scale bet on operations autonomy.
- **Okara** = classic high-margin vertical SaaS with usage expansion; risk concentrated in output quality and channel-platform dependency (Reddit/X/HN ToS).
