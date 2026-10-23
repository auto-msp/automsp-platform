# UI audit — baseline at 6c2c156

Method: production build, local JSON store, demo data only (fake account
"Northwind Demo Co", example.test email). Every reachable route captured with
Playwright at 1440px and 390px (126 captures, 33 marketing/auth routes and 28
app routes). Contrast ratios are computed from the token values in
`src/app/globals.css`.

## Ranked problems

### Critical
1. **The app has no mobile layout.** All 28 captured `/app` screens overflow horizontally at 390px
   (document width 418–790px). `AppShell` is a fixed `w-60` sticky sidebar with no collapse, so
   content gets ~150px: KPI cards squeeze to ~80px with words breaking mid-label, and the top bar
   overlaps itself (org name, "Development" tag, user name, Sign out). `/app/agents` (790px) and
   `/app/knowledge` (780px) are worst because tables sit inside the squeezed column.
2. **Secondary text fails WCAG AA.** `text-mute` (#8a8f97) is 3.11:1 on paper and 2.87:1 on haze, and
   it is used 212 times for metadata, column headers, captions and helper text. Warn text on its own
   10% tint chip is 4.25:1 (below 4.5). Input borders (`fog` #e7e7e2) are 1.19:1 against the page,
   below the 3:1 non-text minimum for form controls.
3. **Focus is removed on form fields.** 30 `focus:outline-none` uses on inputs rely on a 1px border
   colour change (ink on fog). Eleven separate `inputCls` constants define inputs differently, so
   forms are inconsistent across screens.

### High
4. **Tap targets.** 19–32 interactive elements per app screen and 20–29 per marketing screen are
   under 44px (nav rows ~36px, `sm` buttons 36px, header icon button 32px, table row links, pills,
   footer links, privacy page 80+).
5. **Type is too small and too light.** 140 uses of 9–11px text, mostly uppercase tracked labels in
   `mute`. Tracked-uppercase is applied to KPI labels, column headers, eyebrows, section titles, status
   pills and buttons at once, so nothing is differentiated and long labels become hard to scan.
6. **Hierarchy in app screens.** Dashboard is six equal bordered cards, then a large dashed empty
   box; the primary action competes with nothing. Page headers are plain title + paragraph with the
   action buttons far right and no consistent place for status, filters or counts.
7. **Marketing-style patterns inside the app.** Black uppercase tracked CTA buttons, a dashed
   "empty" panel with a centred sentence and a big black button, and generous editorial whitespace
   where operators need density (agents table shows 11 rows over 750px, with an ID column that is
   truncated and unusable).
8. **Navigation.** Sidebar has 15 flat links in three groups, no icons (scan cost), active state is a
   full black block, no breadcrumbs on detail routes (`/app/automations/[id]/build`, `/edit`) where
   the only way back is a small "← Back" text link. Notification bell is a hand-written SVG.

### Medium
9. **Tables.** 23 `<table>`s with no consistent header style, no sticky header, no row hover or
   focus treatment, no numeric alignment utilities, and no responsive strategy (they overflow, not
   scroll or stack). IDs shown as truncated strings.
10. **Forms.** Hint/error text is 12px in `mute`/`risk`; errors appear below the field but are not
    summarised or announced; selects use native styling that clashes with the inputs; the builder
    step selector is an unlabeled `<select>` in a dashed box.
11. **States.** Only one `not-found.tsx` exists. There is no `loading.tsx` or `error.tsx` anywhere,
    so slow server renders show nothing, and 14 empty states are ad hoc copies of one dashed box.
12. **Repeated card grids on marketing.** 37 `grid-cols-2/3/4` uses; the homepage problem section,
    capability list, use cases and pricing all resolve to the same bordered boxes with a title and a
    sentence, so sections feel interchangeable.
13. **Hero visual is placeholder-like.** Grey skeleton squares and "01/02/03" tags are not a product
    picture; the vertical "AI SYSTEMS. MANAGED." text is decorative and hard to read.
14. **Status colour reliance.** Status pills differ only by hue plus a faint tint; ok/warn/risk tints
    sit at 4.25–4.8:1 and carry no icon, so colour is the main signal.

### Low
15. **Icons are inconsistent.** `lucide-react` is imported in 19 files but arrows and checks elsewhere
    are text glyphs (→ ← ✓) and four files hand-roll inline SVG. No emoji were found.
16. **Motion.** `prefers-reduced-motion` is handled globally (good); hover transitions are uniform
    200ms colour-only and the sidebar/header give no state feedback beyond colour.
17. **No dark theme.** Out of scope unless requested; the token structure should allow it later.

## What already works (keep)
- Calm monochrome base with one accent, clear brand voice, honest "Actual / Estimated" labelling.
- Marketing mobile layout reflows cleanly with no horizontal overflow at 390px.
- Global reduced-motion rule and a visible `:focus-visible` outline exist.

## Not captured
`/app/commercial` (operator-only), `/app/operations/[id]`, approval items and run results need
operator login or executed runs; they are captured in the Step 5 verification pass.

## Process note
`npm ci && npm run build` fails on a clean clone because `src/generated/prisma` is gitignored; the
Dockerfile runs `prisma generate` first. I ran `npx prisma generate` (no schema or migration change)
and the baseline then builds. Baseline lint: 0 errors, 2 existing warnings in
`src/app/app/agents/actions.ts`.

---

# Outcome (after the redesign)

Same crawler, same demo data, production build. Before = 126 captures at 6c2c156; after = 128 captures
(two extra routes: an execution detail and an approval, because the after run has a real waiting run).

| Measure | Before | After |
| --- | --- | --- |
| Captures with horizontal page overflow | 30 (every `/app` screen at 390px) | 0 of 128 |
| Interactive elements under 44px (mouse pointer, all captures) | 2,876 | 861 |
| Same check under touch emulation, `/app` screens at 390px | not measured | 1–6 per screen: hidden skip link, inline prose links, and notifications actions (since fixed) |
| `text-mute` contrast on page / on haze | 3.11:1 / 2.87:1 | 5.05:1 / 4.53:1 |
| Control border contrast | 1.19:1 | 3.29:1 on paper, 3.71:1 on cards |
| Text under 12px | 140 uses | 0 |
| `focus:outline-none` on inputs | 30 | 0 (one `.field` focus ring) |
| Hand-copied input style constants | 11 | 1 (`.field`) |
| `loading.tsx` / `error.tsx` / `not-found.tsx` in `/app` | 0 / 0 / 0 | 1 / 1 / 1 |
| Palette | indigo accent, black buttons | beige/grey base, orange primary, blue interactive, red risk; no indigo, purple or teal |

Remaining known gaps, deliberately left:
- The remaining 861 sub-44px elements are mostly the legal text on `/privacy` (generated HTML in
  `policy-html.ts`, about 60 inline links) and desktop-density controls (36px nav rows and small buttons)
  that become 44px on touch devices via `pointer-coarse`.
- Native `<select>` menus keep browser styling; only the closed control is themed.
- No dark theme.
