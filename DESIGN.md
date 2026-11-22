# MERIDIAN Design System — Taste & Engineering Rules (`v1.5.0`)

Before building, styling, or reviewing UI in Meridian, read this file and load the matching domain skill under [`skills/`](./skills/).

> **The Lighthouse Criterion:** *"Does this help navigators find their way?"*
> Every surface, hairline, typographic voice, motion curve, and SVG mark must earn its place by improving orientation — never chasing attention.

---

## 1. Surfaces & Single-Ink Engine

- **Always derive hierarchy from a single ink (`--ds-fg`) over a paper ground (`--ds-bg`) via `color-mix()`.**
  - Rules & borders: `--ds-rule` / `--ds-border` (`9%`), `--ds-rule-strong` / `--ds-border-strong` (`12%`).
  - Tints: `--ds-bg-tint-subtle` (`4.5%`), `--ds-bg-tint-muted` (`8.5%`), `--ds-bg-tint-active` (`12%`).
  - Translucent chrome: `--ds-chrome-bg` (`82%` `--ds-bg`).
  - Why: derived values stay harmonically locked across all 13 light/tinted/dark papers without duplicating component color themes.
- **Official surfaces (`SURFACES` / `SURFACE_SPECTRUM` in `src/tokens.ts`, `[data-surface]` in `src/tokens.css`):**
  - Core & Archival: `ivory` (`#FAF9F5` / `#141413`, 17.6:1), `paper` (`#FFFFFF` / `#0A0A0A`, 19.8:1), `aqua` (`#A4CED0` / `#171614`, 10.4:1), `terracotta` (`#EDBB99` / `#171614`, 10.4:1), `obsidian` (`#0E0E0D` / `#FAF9F5`, 18.4:1).
  - Soft Chromatic: `blush` (`#E8C4C0`), `apricot` (`#E8C8A8`), `butter` (`#E8D9A8`), `sage` (`#B8C5A8`), `mist` (`#C5D4CE`), `sky` (`#B0C8D6`), `slate` (`#B5BFC9`), `lilac` (`#C9C0D8`).
  - Extended papers: `ash` Pale Ash (`#E2DFD8`), `stone` Stone Gray (`#8E8B84`), `clay` Field Ochre (`#B39A6E`).
  - Extended inks: `navy` Navy Ink (`#1C3142`), `mocha` Mocha Ink (`#3A2A22`), `pine` Pine Ink (`#1E3328`), `umber` Deep Ochre (`#4E3E24`), `charcoal` Charcoal (`#3E3C38`).
- **Never use neon accents, purple-on-dark gradients, or decorative drop shadows.**
  - `--ds-shadow-raised: none` and `--ds-shadow-popover: none`. In `rnElevation`, `flat` and `raised` return `{ elevation: 0, shadowOpacity: 0 }`; only `modal` carries structural elevation.

## 2. Color & Signals

- **Confine saturated/earthy pigments strictly to tags, chart series, status markers, and atelier brushwork — never full-page backgrounds.**
  - Organic palette (`--ds-organic-*`): `olive` (`#5E6E47`), `sky` (`#477085`), `coral` (`#B55A42`), `ochre` (`#9A7134`), `slate` (`#56606E`) with dark/tinted surface calibrations in `src/tokens.ts` and `src/tokens.css`.
- **Always pair verification semantics with geometric form (`[data-signals="monochrome"]` compatibility).**
  - Signals (`support`, `caution`, `refute`, `info`) must remain readable even when `--ds-signal-*` collapses to `--ds-fg` in monochrome archival mode.

## 3. Typography (Geist 3-Voice Discipline)

- **Three voices only (`src/fonts.css`, `TYPOGRAPHY` in `src/tokens.ts`):**
  1. **Display Serif** (`Geist Serif`): `mega`, `h1`, `h2`, `h3`, `h4`, `lead`, `metric` — **always weight `400`** with `font-synthesis-weight: none`. Never bold serif display titles.
  2. **Functional Sans** (`Geist`): prose and UI controls (`body-lg`, `body-md`, `body-sm`, `ui-md` at `500`).
  3. **Technical Mono** (`Geist Mono`): eyebrows (`letter-spacing: 0.06em`), coordinates, table numbers, telemetry, code — **always `font-variant-numeric: tabular-nums` (`tnum`)**.
- **Optical discipline:** `font-kerning: normal` + `font-feature-settings: "kern" 1, "liga" 1, "calt" 1` on body/headings; constrain long-form prose to `max-width: 65ch` (`--ds-max-prose`).
- **Build hierarchy via scale contrast and voice switch, never heavy weights or boxed noise.**
- **Type roles** (`--ds-type-primary`, `--ds-type-secondary`, `--ds-type-tertiary`) default to `--ds-fg`, `--ds-fg-secondary` and `--ds-fg-muted` at opacity `1`. The system-page menu may retint each role with palette inks (Obsidian Dark and the dark tones, or muted ink) and the steps `100` / `78` / `56`.

## 4. Dual-Radius & Materiality

- **Dual-radius grammar (`RADII`):**
  - `pill` (`9999px`): navigation, segmented controls, surface pills, carousel dots/arrows, CTA badges.
  - `squircle` (`8px`): utility buttons, search/inputs, toolbar controls, toasts, component copy chips.
  - `plate` (`4px`): editorial plates, image frames, filmstrip tiles.
  - `card` (`12px`): structural panels, popovers, dialogs, component cards.
- **PaperGrain via `<canvas id="ds-paper-grain">` (`src/paper-grain.ts`) — NEVER `data:` URI in CSS variables.**
  - Chrome/Edge silently drop oversized CSS data-URI textures. Always call `mountPaperGrain()` + `bootPaperGrainExtras()` so `html[data-paper-shader="canvas"]` disables legacy `body::after`.
- **HalfTone Dots (`@paper-design/shaders` via `src/halftone-mount.ts`):**
  - Keep `u_size` in the fine-mesh band (`0.12` default `HALFTONE.size` to `0.18` `HALFTONE_MEDIUM.size`, `grid: 'hex'`, `type: 'classic'`). **Never set `u_size >= 0.4`**, which collapses cell count and melts the photograph.
- **Hairline `2px` Scrollbars (`src/tokens.css`):**
  - **Chromium pitfall:** never combine `scrollbar-width` / `scrollbar-color` directly with `::-webkit-scrollbar` on the same global rule — Chromium disables the pseudo-elements and reverts to native white tracks. Gate `scrollbar-width: thin` strictly inside `@supports (-moz-appearance: none)`.
- **Overlays, Burger & Page Veil:**
  - Rail/drawer/modal backdrops **only dim** (`OVERLAY_DIM.backdrop = rgba(20, 16, 12, 0.34)`, `blur: false`). Do not blur backdrop overlays behind drawers/dialogs.
  - Use `.ds-burger` (3 equal `1.5px` lines morphing smoothly to `X` on `aria-expanded="true"`).
  - Always include `.ds-page-veil` + `markPageReady()` (`src/page-enter.ts`) on pages.

## 5. Motion & Tactile Interaction

- **Frequency Gate (decide *whether* to animate before *how*):**
  - **100+/day** (`⌘K`, `/` palette, root tab switches): **`0ms` (`duration: none`)** — instant.
  - **10+/day** (`:active` press, link hover, row focus): **`100–160ms`**, `:active` applies `scale(0.97)` in `120ms`.
  - **Occasional** (popovers `220ms`, drawers/sheets `380ms`, toasts `400ms`): interruptible transitions.
  - **Rare / first-time** (`560ms` reveal, `800ms` 3D volume opening): editorial delight budget.
- **6 Official Curves (`MOTION.bezier`) — NEVER `ease-in` on UI:**
  - `--ds-ease-out`: `cubic-bezier(0.23, 1, 0.32, 1)`
  - `--ds-ease-in-out`: `cubic-bezier(0.77, 0, 0.175, 1)`
  - `--ds-ease-drawer`: `cubic-bezier(0.32, 0.72, 0, 1)`
  - `--ds-ease-snappy`: `cubic-bezier(0.85, 0, 0, 1)`
  - `--ds-ease-editorial`: `cubic-bezier(0.22, 1, 0.36, 1)`
  - `--ds-ease-volume`: `cubic-bezier(0.22, 0.8, 0.25, 1)`
- **Absolute Interaction Invariants:**
  - Never write `transition: all` — list exact properties (`transform`, `opacity`, `background-color`, `border-color`, `color`, `clip-path`).
  - Never animate entrances from `scale(0)` — minimum `--ds-enter-scale: 0.96`.
  - Wrap hover rules inside `@media (hover: hover) and (pointer: fine)` so touch devices never suffer sticky hovers.
  - Popovers scale from trigger (`transform-origin`); centered dialogs/palettes animate from center (`0.98` or `0ms` for `⌘K`).
  - Tooltips support skip-delay (`320ms` initial wait → `0ms` `[data-instant="true"]` between siblings).
  - Hold-to-Confirm is asymmetric: **`1.4s linear`** fill while held, **`180ms ease-out`** snap-back on cancel.
  - Toasts use **CSS transitions** (never `@keyframes`) so pointer hover/swipe stays interruptible.
  - 1:1 Drag (`setPointerCapture`, direct `scrollLeft`/`transform` write without easing during track, then `projectMomentum(v, 0.998)` + `rubberband(overshoot, dim, 0.55)` on release).
  - Mobile-Native Web baseline: `100dvh` shells, `100svh` heroes, `44px` minimum hit targets, `font-size: 16px` on inputs under `@media (pointer: coarse)`, `env(safe-area-inset-*)`, `touch-action: manipulation` on buttons.
  - Respect `@media (prefers-reduced-motion: reduce)` and `@media (prefers-reduced-transparency: reduce)`.

## 6. Plotter SVG & Generative Atelier

- **Plotter SVG (`src/plotter-svg.ts`):**
  - One ink (`currentColor`), hairline stroke, hierarchy exclusively by opacity & dash across the **13 `data-plotter-role` layers** (`primary`, `section`, `secondary`, `dimension`, `leader`, `hatch`, `guide`, `grid`, `centerline`, `hidden`, `absent`, `proposed`, `transfer`).
  - Shapes stay transparent (`fill="none"`, except `0.055` named intersection highlight).
  - Radial / Gann / environmental dials lock `aspect-ratio: 1 / 1` (`viewBox="0 0 400 400"`) — never `preserveAspectRatio="none"`.
  - Canonical technical illustrations compose in `560 × 440`; support didactic isolation (`data-plotter-isolate`).
- **Hairline Isometric Figures (`skills/meridian-hairline-figure/SKILL.md`):**
  - Pair with Plotter for pointer-responsive **2:1 isometric rounded solids** (`400 × 320`; strokes may use reduced opacity; every solid face stays opaque, no fill alpha; depth is the surface token — far/outer tray `--ds-bg`, mid/inner `--ds-surface-1`, near solid that must occlude `--ds-surface-2`, cap in front `--ds-surface-3`; a front solid must not reveal strokes behind it; zero vertical box corners, 1 dim inner crease, hit testing strictly on rest pose, `700ms cubic-bezier(0.32, 0.72, 0, 1)` discrete / spring `k 100 · c 18` continuous, external Mono telemetry only).
- **Gridlines Alignment Policy (`skills/meridian-gridlines/SKILL.md` & `probe.js`):**
  - Audit headers, nav rails, menus, sidebars, toolbars, cards, and tables with `window.__gridlines()` at `1440px` and `390px`.
  - Fix alignment outliers (`> 1px` off dominant ink line or vertical center) at container padding / shared CSS tokens — never with per-item `margin-left` hacks or by distorting approved hit areas (`>= 44px`).
- **Generative Atelier (`src/atelier-engine.ts`):**
  - 100% strict TypeScript (`MeridianAtelier`, `AtelierDrawingBackend`), zero `p5.js`.
  - Paint incrementally (`< 0.7ms/frame`), pause offscreen via `IntersectionObserver`, and render static final frame immediately when `prefers-reduced-motion: reduce`.

## 7. Editorial Reader & Dual-Mode (`data-mode`)

- `data-mode="invisible"` (B2C calm): `density: 1`, `--ds-card-pad: 24px`, `body-lg` prose, plain natural copy.
- `data-mode="technical"` (Pro audit): `density: 0.82` (CSS) / `0.88` (TS `MODE_PROFILES`), `--ds-card-pad: 14px`, 4-layer deterministic ledger, Tier A/B/C badges, tabular degrees.
- **3-Column Archival Reader:** `152px` TOC | `65ch` prose with clickable dotted `.ds-claim` + superscripts | `264px` aside plate (`mix-blend-mode: multiply` on light papers) + *At a glance*.

## 8. Never-Ship Checklist

| Never Ship | Required Standard |
| --- | --- |
| `transition: all` | Explicit property list (`transform`, `opacity`, `background-color`, `border-color`, `clip-path`) |
| `ease-in` on UI enter/exit | `--ds-ease-out` (`cubic-bezier(0.23, 1, 0.32, 1)`) |
| `transform: scale(0)` entrance | `--ds-enter-scale: 0.96` + `opacity: 0` |
| Animation on `⌘K` / `/` | `0ms` (`transition: none`) |
| `:hover` outside fine-pointer MQ | `@media (hover: hover) and (pointer: fine)` |
| `data:` image URI in `--ds-paper-texture` | `mountPaperGrain()` `<canvas id="ds-paper-grain">` |
| HalfTone `u_size >= 0.4` | `0.12–0.18` (`HALFTONE` / `HALFTONE_MEDIUM`) |
| Unscoped `scrollbar-width` with `::-webkit-scrollbar` | Scope `scrollbar-width` inside `@supports (-moz-appearance: none)` |
| `backdrop-filter: blur` on modal/drawer backdrop | Dim only (`rgba(20, 16, 12, 0.34)`) |
| `p5.js` bundle | `src/atelier-engine.ts` (`< 0.7ms/frame`, 0 deps) |
| `preserveAspectRatio="none"` on radial SVGs | `1:1` locked `viewBox="0 0 400 400"` |

---

Full specification: [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) · Modular agent skills: [`skills/`](./skills/) · Attributions: [`skills/CREDITS.md`](./skills/CREDITS.md).
