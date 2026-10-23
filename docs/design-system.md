# AutoMSP design system — "Paper & Signal"

Presentation only. Tokens live in `src/app/globals.css` (`@theme` block, Tailwind 4)
and are consumed through Tailwind utilities (`bg-paper`, `text-slate`, `bg-brand`, …).
Do not hard-code hex values in components; add a token instead.

## Principles

1. **Warm neutrals do the carrying.** Beige paper, warm greys, near-black ink. Colour is a signal, not decoration.
2. **Three signals, three jobs.** Orange is the one primary action. Blue is interactive state and data. Red is risk.
   Green and amber exist only for status, never as brand colours.
3. **No purple, indigo or teal.** No gradients on UI chrome, no glass blur, no emoji icons, no stock photos.
4. **Apps are dense, marketing is expressive.** Same tokens, different rhythm: the app uses 14px type and 44px rows;
   marketing uses the serif display face and large spacing.
5. **Never colour alone.** Every status carries an icon and a word.

## Colour

Contrast is measured with the WCAG 2.2 relative-luminance formula. Text needs 4.5:1; control borders and chart marks need 3:1.

### Neutrals

| Token | Hex | Role |
| --- | --- | --- |
| `paper` | `#F4EFE6` | Page canvas (beige) |
| `surface` | `#FFFDF9` | Cards, panels, inputs |
| `haze` | `#EAE3D5` | Table headers, hover rows, code chips |
| `fog` | `#D8D0BF` | Decorative hairlines and dividers only |
| `line` | `#8A8372` | Control borders (must be visible) |
| `ink` | `#1C1A16` | Primary text |
| `graphite` | `#3A372F` | Strong secondary text |
| `slate` | `#58534A` | Body secondary |
| `mute` | `#6B655A` | Captions and metadata |

### Signals and status

| Token | Hex | Role |
| --- | --- | --- |
| `brand` / `brand-hover` | `#FF6A13` / `#F05A00` | Primary button fill (ink label), brand moments |
| `brand-text` / `brand-soft` | `#B33F06` / `#FFE6D3` | Orange as text, orange tint |
| `accent` / `accent-hover` | `#1358D6` / `#0E47B0` | Links, focus ring, selection, secondary buttons, data |
| `accent-soft` | `#DFE9FB` | Selected row, info tint |
| `risk` / `risk-fill` / `risk-soft` | `#B42318` / `#D92D20` / `#FBE0DC` | Errors, destructive actions, incidents |
| `ok` / `ok-soft` | `#1A7239` / `#DCEFDD` | Success status |
| `warn` / `warn-fill` / `warn-soft` | `#8F5200` / `#F2B01E` / `#FBEBC4` | Pending, attention |

### Charcoal band (security, infrastructure, high-impact CTAs)

`night #1D1B17`, `night-2 #27241F`, `nline #3E3A31`, `night-text #F4EFE6`, `night-mute #B7B0A0`,
`trail #FF8A3D` (orange on dark), `trail-blue #6FA0FF`, `trail-warm #F2B01E`. Add the `on-dark` class to the
section so the focus ring switches to `trail-blue`.

### Data series

`data-1 #D9540A` orange, `data-2 #1358D6` blue, `data-3 #6B655A` grey, `data-4 #B42318` red, `data-5 #A86A00` amber.
Charts also use direct labels, patterns or markers; colour is never the only encoding.

### Measured contrast

| Pair | Foreground on background | Ratio |
| --- | --- | --- |
| Body text on page | `#1C1A16` on `#F4EFE6` | 15.17:1 |
| Body text on cards | `#1C1A16` on `#FFFDF9` | 17.10:1 |
| Strong secondary | `#3A372F` on `#F4EFE6` | 10.37:1 |
| Secondary text | `#58534A` on `#F4EFE6` | 6.66:1 |
| Secondary on table header / hover | `#58534A` on `#EAE3D5` | 5.98:1 |
| Captions, metadata | `#6B655A` on `#F4EFE6` | 5.05:1 |
| Captions on cards | `#6B655A` on `#FFFDF9` | 5.69:1 |
| Captions on haze (lowest case) | `#6B655A` on `#EAE3D5` | 4.53:1 |
| Control border on page (3:1) | `#8A8372` on `#F4EFE6` | 3.29:1 |
| Control border on card (3:1) | `#8A8372` on `#FFFDF9` | 3.71:1 |
| Primary button label | `#1C1A16` on `#FF6A13` | 6.06:1 |
| Primary button hover | `#1C1A16` on `#F05A00` | 5.10:1 |
| Orange text on page | `#B33F06` on `#F4EFE6` | 5.05:1 |
| Orange text on soft chip | `#B33F06` on `#FFE6D3` | 4.82:1 |
| Label on blue button | `#FFFDF9` on `#1358D6` | 6.09:1 |
| Label on blue hover | `#FFFDF9` on `#0E47B0` | 8.12:1 |
| Link / focus ring on page | `#1358D6` on `#F4EFE6` | 5.40:1 |
| Blue on soft chip | `#1358D6` on `#DFE9FB` | 5.06:1 |
| Risk text on page | `#B42318` on `#F4EFE6` | 5.74:1 |
| Risk text on soft chip | `#B42318` on `#FBE0DC` | 5.26:1 |
| Label on destructive button | `#FFFDF9` on `#B42318` | 6.47:1 |
| Ok text on page | `#1A7239` on `#F4EFE6` | 5.22:1 |
| Ok text on soft chip | `#1A7239` on `#DCEFDD` | 4.97:1 |
| Warn text on page | `#8F5200` on `#F4EFE6` | 5.43:1 |
| Warn text on soft chip | `#8F5200` on `#FBEBC4` | 5.27:1 |
| Text on charcoal | `#F4EFE6` on `#1D1B17` | 15.01:1 |
| Muted on charcoal | `#B7B0A0` on `#1D1B17` | 7.97:1 |
| Orange on charcoal | `#FF8A3D` on `#1D1B17` | 7.33:1 |
| Blue on charcoal | `#6FA0FF` on `#1D1B17` | 6.67:1 |
| Chart orange (3:1) | `#D9540A` on `#FFFDF9` | 3.96:1 |
| Chart amber (3:1) | `#A86A00` on `#FFFDF9` | 4.37:1 |

Known constraint: white text on the orange fill is 2.82:1 and is not allowed. Orange buttons always use `ink` labels.

## Typography

Pairing is unchanged: **Instrument Serif** (display) + **Inter** (UI), with **JetBrains Mono** added for ids, keys and code.

| Style | Size / line | Weight | Use |
| --- | --- | --- | --- |
| Display (marketing) | clamp 40–72px / 1.05 | serif 400 | Hero and section headlines (`font-display`) |
| App H1 | 24px / 32px | Inter 600 | Page title |
| H2 | 18px / 24px | 600 | Section title |
| H3 | 15px / 20px | 600 | Card and group title |
| Body (app) | 14px / 20px | 400 | Tables, forms, lists |
| Body (marketing) | 16–18px / 1.6 | 400 | Paragraphs |
| Small | 13px / 20px | 400–500 | Helper text, labels |
| Caption | 12px / 16px | 500 | Metadata, column headers. **Minimum size: 12px** |
| Mono | 13px | 400 | `.code` ids, keys, snippets |

Rules: sentence case for headings, labels and column headers. Uppercase tracking is reserved for marketing eyebrows
(one per section). KPI numerals use the serif at large size with `tnum` (tabular figures).

## Spacing, layout, radii, elevation

- **Base unit 4px.** Scale: 4, 8, 12, 16, 24, 32, 48, 64.
- **App gutters:** 16px under `md`, 24px at `md`, 32px at `xl`. Content max width 80rem. Vertical rhythm: 24px between sections, 12–16px inside panels.
- **Marketing:** `Shell` max 76rem, section padding 64px (mobile) / 96px (desktop).
- **Breakpoints:** 360 (min supported), `sm` 640, `md` 768, `lg` 1024 (sidebar appears), `xl` 1280.
- **Touch:** every interactive element is at least 44×44px with at least 8px between neighbours. Table rows are 44px tall.
- **Radii:** panels, tables, cards 0 (Swiss grid); controls 6px (`--radius-control`); chips and pills 3px (`--radius-chip`).
- **Elevation:** flat with hairlines. One float level (`--shadow-float`) for menus and the mobile drawer. Marketing illustration uses a hard offset shadow (no blur).

## Icons

One family: **lucide-react**, stroke 1.75, sizes 16 (inline), 20 (nav, buttons), 24 (empty states).
Decorative icons carry `aria-hidden`; icon-only buttons carry an `aria-label`. No unicode arrows or checkmarks as icons, no emoji.

## Components

| Component | Notes |
| --- | --- |
| `ButtonLink` / `Button` | `primary` = orange fill, ink label. `secondary` = ink outline. `accent` = blue fill. `danger` = red fill. `ghost`. Min height 44px. |
| `.field`, `.field-label`, `.field-hint`, `.field-error` | One input style. 44px, 3:1 border, `aria-invalid` turns the border red. Errors have an icon and are tied with `aria-describedby`. |
| `.panel` | Hairline-bordered surface, square. |
| `.table-wrap` + `.app-table` | Sentence-case sticky header, 44px rows, hover tint, horizontal scroll on small screens, `num` class for right-aligned tabular numbers, `row-link` for full-height link targets. |
| `StatusPill` | Icon + word + tint. Never colour alone. |
| `PageHeader` | Title, description, status slot, actions slot; actions wrap under the title on mobile. |
| `EmptyState` | Icon, one sentence on why it is empty, one primary action. |
| `AppShell` | Sidebar at `lg+`; top bar with menu button and slide-in drawer below `lg`. |
| `loading.tsx`, `error.tsx`, `not-found.tsx` | Skeletons and recoverable error states for the `/app` segment. |

## Motion

Minimal. 150–200ms colour and opacity transitions, 250ms for the drawer, `ease-out`. Animate transform and opacity only.
`prefers-reduced-motion: reduce` removes all transitions and animations globally.

## Accessibility checklist (every PR)

- Text 4.5:1, non-text 3:1 (table above).
- Focus ring (2px blue, 2px offset) visible on every interactive element; never `outline: none` without a replacement.
- Keyboard: skip link, logical tab order, drawer traps focus and closes on Escape, tables scroll by keyboard.
- Touch targets 44px; no horizontal page scroll from 360px to 1440px.
- Status and errors use icon + text, announced with `role="status"` or `role="alert"` where they appear dynamically.
- Dark charcoal bands add `on-dark`.

## How this was chosen

The UI/UX Pro Max skill's design-system search for "AI operations control plane, dense editorial" returned a blue primary with an orange
call-to-action on a light neutral base, which matches the brief. Adopted: the blue/orange split, density 8 for the app,
motion 2, the 4.5:1 label rule for CTAs. Rejected: the suggested Glassmorphism style (blur and translucency lower contrast and
add cost in a dense operations UI) and the Calistoga pairing (the existing Instrument Serif + Inter pairing was kept by decision).
