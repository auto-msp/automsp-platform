# AutoMSP design system

Presentation only. Tokens live in `src/app/globals.css` (`@theme` + `@layer components`);
this file records the decisions and the measurements behind them.

**Direction.** One token set, two densities.
- **Marketing** — *Swiss editorial*: hairline grid, serif display (Instrument Serif), generous space,
  square corners, one dark "infrastructure" band.
- **App** — *quiet instrument*: dense, sentence-case, 6px/10px radii, one accent used only for focus,
  selection and the primary data signal. Basis labels (**Actual / Estimated / Projected**) are
  first-class UI, never fine print.

Rules that apply everywhere: WCAG 2.2 AA, visible focus, keyboard-first, 44px touch targets,
360–1440px responsive, motion only behind `prefers-reduced-motion`, no stock photos, no emoji,
one icon family (`lucide-react`, 1.75 stroke, `aria-hidden` unless it is the only label).

## Colour (measured)

Contrast is WCAG relative luminance. Text needs 4.5:1, control borders and focus rings 3:1.

| Token | Hex | Use | on paper | on white | on haze |
|---|---|---|---|---|---|
| `paper` | #f8f8f5 | page | — | — | — |
| `surface` | #ffffff | cards, inputs | — | — | — |
| `haze` | #f0f0eb | table headers, hover | — | — | — |
| `fog` | #e4e4de | decorative hairlines only | 1.2 | — | — |
| `line` | #80858d | **control borders** | **3.49** | **3.71** | — |
| `ink` | #0b0c0e | headings, primary fill | 18.4 | 19.6 | 17.1 |
| `graphite` | #1e2126 | body, labels | 15.2 | 16.1 | 14.1 |
| `slate` | #464b53 | secondary text | 8.3 | 8.8 | 7.7 |
| `mute` | #5c616a | captions, metadata (was #8a8f97 = **3.11 ✗**) | 5.9 | 6.2 | 5.5 |
| `accent` | #4338ca | focus, links, selection | 7.4 | 7.9 | 6.9 |
| `accent-strong` | #352ba8 | accent hover | 9.6 | 10.2 | 8.9 |

Status pairs (text on its own solid tint — never alpha tints, which blend unpredictably):

| Status | Text | Tint | Ratio |
|---|---|---|---|
| ok | #14633a | #e4f2ea | 6.32 |
| warn | #8a4100 | #fbeedd | 6.48 |
| risk | #a01c15 | #fbe8e6 | 6.66 |
| info/running | #3730a3 | #eaecff | 8.49 |
| neutral | #464b53 | #ecece6 | 7.40 |

Fills: paper on ink 18.4, white on accent 7.9, white on risk 7.9. Dark band (`night` #0b0d12):
body 9.8 (white/70), muted 7.5, `trail-light` text/focus 7.7, `trail` strokes 5.5.

Status is never colour-only: every pill carries an icon and a label.

## Typography

- **Pairing:** Inter (UI + body) with Instrument Serif for marketing display only. System mono for IDs.
- **Minimum size 12px.** The previous 9–11px labels are gone.
- **App scale:** page title 24/32 semibold −0.01em · section 16/24 semibold · body 14/20 · label 13/20
  medium · caption 12/18 · KPI value 30/36 semibold tabular.
- **Marketing scale:** display `clamp(2.5rem, 6vw, 4.5rem)` serif · h2 `clamp(1.875rem, 3.5vw, 2.75rem)` ·
  body 17/28 · eyebrow 12 uppercase tracked 0.12em (eyebrows only — not buttons, headers or pills).
- Tabular numerals (`.tnum`) for every figure in a table or KPI.

## Spacing, radii, elevation

- 4px base grid; app density steps 4/8/12/16/24/32; marketing sections 64/96.
- Radii: `sm` 4 (chips) · `md` 6 (controls) · `lg` 10 (panels, tables) · `xl` 14 (drawer). Marketing is square.
- Elevation: flat. `--shadow-card` is a 1px hairline lift; `--shadow-pop` only for floating layers
  (mobile drawer, menus). No glow, no decorative gradients. The only gradients are functional: the
  loading skeleton shimmer and the table scroll-edge shadows (both static under reduced motion / only
  visible when content overflows).
- Z-scale: content 0 · sticky header 20 · drawer scrim 40 · drawer 50.

## Components (classes in `@layer components`)

| Class | Purpose |
|---|---|
| `.btn` + `-primary/-secondary/-danger/-ghost/-accent` | 44px buttons; `-sm` is 36px with a mouse, 44px on touch |
| `.field`, `.label`, `.hint`, `.field-error` | form controls: 3:1 border, 44px, visible label, error linked via `aria-describedby` |
| `.form-alert`, `.form-notice` | form-level result messages |
| `.card`, `.card-pad` | panels |
| `.table-wrap` + `.data-table` | tables scroll inside their own region; `.num`, `.id` cell modifiers |
| `.section-label` | small group label |

React: `AppPageHeader`, `EmptyState`, `StatusPill` (icon + label), `NavLink` (icon, `aria-current`),
mobile drawer in the app shell, `loading.tsx` skeleton and `error.tsx` for `/app`.

## Interaction

- Focus ring: 2px accent, 2px offset, `trail-light` on dark and ink fills. Never `outline: none`
  without a replacement.
- Hover is never the only affordance; state changes 150ms, drawer 250ms; all of it collapses under
  `prefers-reduced-motion`.
- Tables: horizontal scroll inside `.table-wrap` (region is focusable), never the page.
- Navigation: sidebar ≥1024px; below that a top bar with a labelled menu button opening a drawer
  (focus moves in, Esc and scrim close it, focus returns to the button).
