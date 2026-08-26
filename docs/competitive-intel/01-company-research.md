# Competitive Intelligence Report — Part 1: Company Research
## Polsia (polsia.com) & Okara AI (okara.ai)

**Prepared**: 2026-08-26 | **Method**: Public web research only. No private data, credentials,
non-public analytics, or unauthorized scanning. Every claim tagged:
**[FACT]** = directly verified · **[STRONG]** = multiple independent sources · **[EST]** = estimate ·
**[UNKNOWN]** = not publicly determinable.

---

# 1. POLSIA

## 1.1 Identity & Positioning
| Item | Finding | Confidence |
|---|---|---|
| Tagline | "AI That Runs Your Company While You Sleep" | FACT (site HTML) |
| Category | Autonomous multi-agent business operating system | FACT |
| Founder | Ben Cera / Ben Broca (handles @benbroca; ex-Cloud Kitchens employee #2 under Travis Kalanick) | FACT (JSON-LD author block; GTMnow podcast) |
| Founded / Launched | Founded 2025 (CB Insights); public launch Feb 2026 | STRONG |
| HQ | San Francisco (CB Insights); built out of Paris initially | STRONG |
| Team size | 1 human, zero employees (as of May–Jul 2026) | FACT (founder-stated, widely quoted) |
| Funding | $30M at $250M valuation, May 2026. Led by Sound Ventures; True Ventures, Offline Ventures, Adjacent, Tekton, Drysdale, Vaynerfund + angels | FACT (pulse2.com, fundraiseinsider.com, seedtable.com) |
| Prior capital | ~$1M pre-seed barely spent | STRONG (GTMnow interview) |

## 1.2 Value Proposition & Product
**Core promise**: give an idea → Polsia provisions infrastructure (hosting, DB, email, Stripe, GitHub, ad accounts), builds the product with code agents, then *continues operating* the business autonomously on daily cycles — marketing, outreach, support, ads, finance.

**Agent roster** [FACT — site JSON-LD FAQ + public GitHub org PolsiaAI/Polsia README]:
Orchestrator (morning plan/evening summary), Business Planning, Competitor Research, Social Media (posts every 2h), Email Outreach (every 3h), Customer Support (inbox triage), Ads Management (Google/Meta, every 6h), Code Generation (ships features, opens PRs), Finance (Stripe sync).

**Underlying engine**: Claude Agent SDK / Claude Code CLI headless mode [FACT — own JSON-LD + GitHub repo].

**Onboarding flow** [FACT — third-party hands-on reviews]:
1. Sign up (no card for explore mode) → choose CREATE NEW COMPANY vs GROW MY COMPANY
2. SURPRISE ME (researches you online, proposes business) or BUILD MY IDEA
3. Agents produce mission doc, market research, draft tweet, welcome email, landing page on `*.polsia.app` within minutes
4. Dashboard = 8 simultaneous panels (tasks, X, email, documents, business, team, website, ads)
5. Nightly autonomous cycle → 8 AM email recap
6. Onboarding completion fires Meta `CompleteRegistration` conversion (visible in their pixel contract comments)

**Autonomy level**: founder states ~80% autonomous today, targeting 100% [STRONG — mikareyes.com quoting founder].

## 1.3 Pricing (verified from JSON-LD + 4 independent reviews)
| Component | Detail | Confidence |
|---|---|---|
| Free tier | Explore free, no card; ~5 task credits | FACT |
| Subscription | JSON-LD AggregateOffer lowPrice $29, highPrice $59, 2 offers. Reviews consistently cite **$49/mo Pro** (one cites $29 entry tier) | FACT/STRONG |
| Trial | 3 days, card required upfront | FACT (AgentAya) |
| Task credits | ~$1/agentic task beyond included nightly cycle + 5 credits/mo (+10 bonus month 1) | STRONG |
| Revenue share | **20% of all economic activity** through platform-built businesses (revenue + managed ad spend; some sources say ad spend counted, one says excluded — pricing may have shifted) | STRONG |
| Platform fee note | AgentAya describes ~20% fee applying to ad spend AND income withdrawals | STRONG |

## 1.4 Conversion Funnel (observable)
Free explore (no card) → 3-day trial (card) → subscription → credit top-ups → revenue share on successful businesses. PLG loop: every customer business gets a `*.polsia.app` subdomain or custom domain — tenant sites are distribution surfaces. Their own head-script comments confirm tenant subdomains exist at scale (`shiftwithin.polsia.app`) and that custom domains of customers serve the shell.

## 1.5 Technology Stack (publicly observable)
| Layer | Evidence |
|---|---|
| Frontend | React SPA, Vite build (`/assets/index-rPksqQxN.js`), single shared shell for marketing + app + tenant hosts | FACT (HTML source) |
| AI orchestration | Anthropic Claude Agent SDK; Claude Code CLI subprocess pattern | FACT (own structured data) |
| Infra | Multi-tenant edge serving: same SPA shell on polsia.com, help.polsia.com, *.polsia.app fallbacks, customer custom domains (`x-landing-source: Fallback` header) | FACT (HTML comments) |
| Product analytics | PostHog (referenced in own engineering comments as browser analytics system) | FACT |
| Backend observability | Datadog ("zero RUM applications", monitors-as-code) | FACT (HTML comments) |

## 1.6 Analytics / Ad-tech Stack — OBSERVED (Section 5 requirement)
Verified directly in served HTML (2026-08-26):
- **GA4**: `G-GWFDYHBFQ6` — gated to owned hosts only
- **Google Ads**: `AW-18004328752`
- **Meta Pixel ×2**: `1314800673710252`, `1256400136484241` (second pixel hit Meta "additional data sharing restrictions" notice per their own comments)
- **OpenAI Ads Pixel**: pixelId `WRzo9yRvArZtukLLESuPFy` (early adopter of OpenAI's ad network)
- **TikTok Pixel**: `D6MVVDBC77U9JTU05IS0`
- **PostHog** (product analytics), Datadog (backend)
- Server-side conversions pipeline: `backend/src/channels/ad-conversions/` referenced in comments — they fire conversions server-side too
Not observed: Segment, Mixpanel, Amplitude, Hotjar, FullStory, Clarity, LinkedIn Insight Tag.

Notable engineering practice: host allowlist guard (`POLSIA_GROWTH_HOSTS`) prevents ad/analytics pixels firing on tenant domains — pollution control learned from an actual Meta enforcement notice. Pinned by jsdom tests.

## 1.7 SEO / Content Architecture
- Rich JSON-LD: SoftwareApplication + Organization + WebSite SearchAction (`/explore?q=`) + FAQPage
- OG/Twitter cards, canonical, robots index/follow
- Docs/help center at help.polsia.com — **locked behind subscription wall** (per AgentAya review) — unusual anti-SEO choice
- `/explore` route suggests a directory of user-created companies = programmatic SEO surface + marketplace discovery [STRONG]

## 1.8 Community / Distribution
- Viral X/LinkedIn launch; fundraise ran publicly on X with live dashboard [FACT — GTMnow]
- Founder gives personal phone number to customers (text-first support) [FACT]
- Trustpilot presence exists with reportedly low score; complaints re: burned credits, support [STRONG — YourAIFinder, AI Weekly]

## 1.9 Security & Compliance Posture (publicly observable only)
- HTTPS/TLS: yes (standard) — OBSERVED
- Auth: email/password + standard flows assumed — details UNKNOWN (docs paywalled)
- ToS/Privacy policy exist and describe: OAuth-connected accounts, platform-managed services (shared ad infra), scheduled autonomous operations without per-action approval, collection of integration tokens/logs/billing/ad data [FACT — quoted by backlinkmanagement.io analysis]
- No public SOC 2 / ISO claims found — UNKNOWN/absent
- Payment security: Stripe-based; users own merchant-of-record risk for their businesses [STRONG]
- Known risks surfaced publicly: no approval gate between agent and customers; autonomous spend; tenant data isolation architecture undocumented publicly

---

# 2. OKARA AI

## 2.1 Identity & Positioning
| Item | Finding | Confidence |
|---|---|---|
| Tagline | "The Only AI CMO That Puts Marketing on Autopilot" | FACT (site) |
| Category | Autonomous marketing team (AI CMO) | FACT |
| Founder | Fatima Rizwan — ex-founder TechJuice (acquired), Metaschool; Forbes 30 Under 30 Asia 2016 | FACT (LinkedIn, AI Market Watch) |
| HQ | Singapore; 70% of customers US-based; now SF Bay Area presence | FACT (Stripe case study, LinkedIn) |
| Team | 4 people at launch (Mar 2026), small distributed team | FACT (Stripe case study) |
| Backers | Peak XV Partners portfolio listing exists | FACT (peakxv.com) — round size undisclosed [UNKNOWN] |
| Origin story | Started as privacy-focused encrypted AI chat workspace (20–30 open-source models), alpha Oct 2025, 50K+ users; pivoted to agentic AI CMO Mar 2026 | FACT (Dealroom, Peak XV) |

## 2.2 Product
**Model**: enter your website URL → system researches product, generates 5 strategy documents (Product Info, Marketing Strategy, Competitor Analysis, Brand Voice, Content Strategy) → 10 specialized agents execute daily against those documents. **Human-in-the-loop approval on everything** (deliberate contrast to Polsia).

**Agents** [FACT — site + /agent page + docs]:
Reddit (draft-only, ban-safe), SEO (audits every 6h, homepage-only on free), GEO (tracks brand citations in ChatGPT/Perplexity/Gemini/Claude, up to 15 prompts tracked), Writer (SEO articles → CMS publish), X/Twitter (≥30 drafts/mo), LinkedIn (≥30/mo), Hacker News (Show HN drafts), UGC Videos (briefs + multi-aspect AI clips), Coding agent (technical SEO fixes as GitHub PRs), Influencer (X creator discovery, outreach, campaign tracking), Link Broker (backlinks).

**Integrations** [FACT]: WordPress, Webflow, Framer, Wix, Sanity, Google Search Console, Google Analytics (GA4), GitHub, LinkedIn, X, TikTok, Instagram, WhatsApp, Telegram, Slack.

**Cadence**: audits refresh every 6 hours; daily opportunity feed; daily digest email; traffic data syncs once/day [FACT — docs/faq].

## 2.3 Pricing (verified from pricing page + sources)
| Plan | Price | Contents |
|---|---|---|
| Free | $0 | Website analysis, product info doc, positioning/ICP, 30-day strategy, SEO audit (homepage), GEO recs, 5 one-time credits |
| AI CMO Lite | ~$99–129/mo | + Design guide, competitor analysis, monthly content strategy, X agent, Influencer readiness, Coding agent (GitHub PRs), GEO tracking (15 prompts), 2,000 credits/mo |
| AI CMO Pro | ~$249/mo ($2,490/yr cited April 2026) | + Reddit, LinkedIn, Articles writer (≥30/mo), HN, UGC videos, publishing integrations |
| Credits | 2,000/mo included; top-up packs never expire; balance-zero pauses agents | FACT (docs) |
| Agency plans | Volume pricing per client website | FACT |

Price history signals: launched $99 (Dealroom), blog said $249 Pro (Apr 2026), current page shows "from $99"/"$129", v2 LinkedIn post says "starts at $1,290" (= $129/mo annual framing) → price architecture has been actively iterated. **[STRONG]**

Positioning math: replaces "$14,000+/mo" marketing team (hire $5K, agency $4K, writer $1.5K, social $1.5K, community $1K).

## 2.4 Traction (all founder/company-reported)
- Exceeded $1M ARR within 2 hours of launch [CLAIM — Stripe case study, company-attributed]
- Thousands of paying customers within weeks; 68% of payment volume via Stripe Link [FACT-as-report — Stripe case study]
- 100,000+ businesses claimed as of April 2026 [COMPANY CLAIM — AI Market Watch]
- 10M+ views viral launch; infra crashed from demand [COMPANY CLAIM]
- Customers incl. YC/a16z/Sequoia-backed startups; logos JetBrains, Kong, Razer [COMPANY CLAIM]
- Customer outcome claim: 30% avg engagement/traffic lift within 45 days (v2 post) [COMPANY CLAIM]

## 2.5 Analytics stack (Okara) — observable
Their *product* consumes customer GA4/GSC data (that's a feature, not their own analytics). Their own marketing analytics: **UNKNOWN** — no third-party pixels identified in fetched pages; likely minimal/direct. Not publicly determinable beyond this.

## 2.6 Security & Compliance (observable)
- Privacy-first brand lineage (E2E-encrypted workspace heritage) [PUBLIC CLAIM]
- Google sign-in supported; email change verification flows documented; team invites (7-day expiry); read-only share links [FACT — docs]
- Stripe Radar fraud protection; Stripe Billing subscriptions [FACT — Stripe case study]
- No public SOC 2/ISO claims found — UNKNOWN
- Approval-gated publishing is itself a safety control (Reddit/HN ban-risk mitigation) [FACT]

## 2.7 Criticism (public record)
Efficienist review: "buggy Claude wrapper," basic prompts, low-quality content generations, even suggested content about Okara itself; unsupervised-posting ban risk on Reddit/HN flagged by Dealroom [FACT — published criticism]. Human-in-the-loop design (v2) directly addresses part of this.

---

# 3. REVENUE & SCALE ESTIMATES (Section 4)

## Polsia
Signals triangulated: WSJ (Jul 2026) reports 10,000 paying customers, on-track $10M 2026 revenue (founder-reported, unaudited); early deck (week 8): $228,820 ARR, 477 active businesses; Fortune (Mar): $4.5M run rate; May: ~$10M run rate.

Bottom-up check [EST]:
- 10,000 subs × $49/mo = $5.88M ARR subscription base
- + 20% take on tenant business activity. If avg active business transacts ~$500/mo through platform × say 2,000 monetizing businesses = $2.4M
- → ~$8.3M ARR plausible ⇒ consistent with "~$10M approaching" narrative. Confidence: MEDIUM (60%) — all inputs founder-reported; churn ~50% early means subscriber count is gross, not net.

ARR range estimate: **$6M–$12M** (confidence 55%). Valuation $250M ⇒ ~25–40× forward revenue — rich but typical for category.

Traffic [EST]: viral launches + paid social across 4 ad networks suggest mid-six-figures monthly visits range; SimilarWeb-class data not accessible here — NOT PUBLICLY DETERMINABLE precisely. Methodology offered: GA4 ID is visible but data is private; use third-party estimators (SimilarWeb/Semrush) when licensed.

Team scale: 1 human [FACT]. Compute economics: founder stated ~$1.00–1.50 AI cost/task, ~$30/mo compute + $5–10 infra per customer → COGS ≈ $40/mo/customer vs $49 ARPU → subscription margin thin (~15–20%); profit pool sits in revenue share + credit overages. Early deck planned 70% of raise on compute [FACT — RuntimeWire].

## Okara
- Thousands paying × blended ~$130/mo ≈ **$1.5M–$4M ARR** [EST, confidence 45%; the "$1M ARR in 2 hours" claim implies launch-day spike of ~7,700 Pro subs which is implausible as steady-state; treat as marketing framing]
- Team ~4 → revenue/employee extreme if claims hold
- Traffic [UNKNOWN]; viral X-driven acquisition is the evident channel

---

*Sources*: polsia.com HTML (2026-08-26 fetch), okara.ai + /agent + /pricing + /docs (2026-08-26), github.com/PolsiaAI/Polsia, gtmnow.com/gtm-192 (Jun 2026), pulse2.com (May 25 2026), fundraiseinsider.com (May 31 2026), runtimewire.com (Jul 30 2026, citing WSJ Jul 29), cbinsights.com/company/polsia, seedtable.com, agentaya.com review (Jul 14 2026), mikareyes.com guide (Jun 26 2026), maiamichelle.com review (May 15 2026), youraifinder.com/tool/polsia, backlinkmanagement.io (May 23 2026), stripe.com/customers/okara, dealroom.co news note, peakxv.com/companies/okara, ai-market-watch.com/company/okara, linkedin.com Fatima Rizwan v2 launch post (Aug 17 2026).
