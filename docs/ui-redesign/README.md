# UI redesign — results

Presentation only. No change to behaviour, routes, data, auth, tenant isolation, Prisma schema,
migrations, server code or server actions. Tokens and rules: [`docs/design-system.md`](../design-system.md).
Baseline findings: [`audit.md`](audit.md) and `before/_metrics.json`.

## Screenshots

- `before/` — unmodified `main` (6c2c156). `after/` — this branch. Names are `<route>__<width>.webp`
  (`1440` desktop, `390` phone). Every route (61) at both widths, plus `after/interaction_*` for the
  open mobile drawer and a keyboard focus ring.
- Demo data only: a fictional company ("Northwind Logistics (demo)"), `example.test` addresses and
  placeholder secrets. Full-page captures are cropped to 4000px tall and stored as WebP.
- `before/_metrics.json` and `after/_metrics.json` hold the per-page measurements below.

## Measured change (61 routes, Playwright + axe-core 4.10, WCAG 2.0/2.1/2.2 A+AA)

| | Before | After |
|---|---|---|
| axe violations, all pages @1440 | 936 | **0** |
| axe violations, all pages @390 | 689 | **0** |
| App pages overflowing horizontally @390 | 34 of 35 (up to 536px) | **0** |
| Colour-contrast failures | 1,500+ (`text-mute` 3.11:1, used 212×) | **0** (all pairs ≥ 4.5:1, see design-system.md) |
| Critical `label` / `select-name` failures | 20 per viewport | **0** |
| Interactive elements < 44px, app @390 (touch) | 839 of 972 | 41 of 446 (see notes) |

### Notes on the measurements

- **Touch vs mouse.** The "before" run used a plain 390px desktop viewport; the "after" run emulates
  a touch device at 390px so `pointer: coarse` rules apply. Compact controls are 36px with a mouse and
  44px on touch by design, so the 1440px "under 44px" counts (≈19 per app page) are the 40px sidebar rows
  and 36px compact buttons that only apply to fine pointers.
- **Remaining 390px "small" targets** are measurement artifacts, not usable targets: the visually-hidden
  skip link (becomes a full-size control on focus), the off-screen anti-spam field on the audit form,
  and in-sentence links in the legal text (WCAG 2.5.8 inline exception).
- **Axe cannot check** colour contrast of text over images or gradients, keyboard order in full, or
  screen-reader announcement quality. Those were checked by reading the code and by the interaction run
  (drawer focus moves in on open and returns to the menu button on Esc).

## What changed

- **Tokens** (`globals.css`): measured colour pairs, `line` token for 3:1 control borders, solid status
  tints, radii, elevation, on-dark colours, focus-on-dark. Component classes `.btn .field .card .data-table`.
- **App shell:** responsive navigation (drawer under 1024px with focus trap), icons, skip link, loading
  skeleton and error boundary for `/app`.
- **Shared components:** `Field` (label, hint, error linked to the control), `StatusPill`/`RiskPill`
  (icon + label, never colour-only), `Metric` + `BasisBadge` (Actual / Estimated / Projected as UI),
  `EmptyState`, `TextLink`, page header with back link.
- **Every app screen** moved onto the shared classes; tables scroll inside their own region.
- **Marketing:** accessible header (closed menus leave the tab order), original hero illustration of
  a workflow pausing at a human approval gate, varied section layouts, sentence-case buttons.
- **Auth:** bordered panel, brand mark, 44px targets.

## Not changed / out of scope

Copy, pricing and case-study figures, routes, metadata and structured data, and a dark theme.
