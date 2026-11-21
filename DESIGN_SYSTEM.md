# MERIDIAN Design System — Complete Technical Specification (`v1.5.0`)

**Architectural Philosophy:** *Single-Ink Multi-Surface Editorial* — PaperGrain via HTML5 `<canvas>`, HalfTone WebGL dots via `@paper-design/shaders`, asymmetric motion governed by the **Frequency Gate**, flat editable **Plotter SVG** blueprints (`data-plotter-role`), an orthographic **81k Globe**, **89 tactile line components** with copyable AI install prompts, and a **100% TypeScript generative watercolor, graphite, wax-crayon & sumi-e engine** (zero `p5.js`).

> Governance files: [`DESIGN.md`](./DESIGN.md) (taste & engineering invariants) · [`AGENTS.md`](./AGENTS.md) (agent skill routing) · [`skills/`](./skills/) (8 domain skills including [`meridian-taste`](./skills/meridian-taste/SKILL.md)) · [`skills/CREDITS.md`](./skills/CREDITS.md) (full external attribution).

---

## 1. Visual Architecture & The 13 Single-Ink Surfaces

Every color derives dynamically from two base CSS variables — paper background `--ds-bg` and single ink `--ds-fg` — using native CSS `color-mix(in srgb, var(--ds-fg) ...)`:

- `--ds-rule` / `--ds-border`: `color-mix(in srgb, var(--ds-fg) 9%, transparent)`
- `--ds-rule-strong` / `--ds-border-strong`: `color-mix(in srgb, var(--ds-fg) 12%, transparent)`
- `--ds-bg-tint-subtle`: `color-mix(in srgb, var(--ds-fg) 4.5%, transparent)`
- `--ds-bg-tint-muted`: `color-mix(in srgb, var(--ds-fg) 8.5%, transparent)`
- `--ds-bg-tint-active`: `color-mix(in srgb, var(--ds-fg) 12%, transparent)`
- `--ds-chrome-bg`: `color-mix(in srgb, var(--ds-bg) 82%, transparent)`

Switching `data-surface="..."` re-themes every divider, badge, focus ring, scrollbar hairline, SVG trace, and canvas palette atomically without duplicating color CSS across 13 themes.

| Surface (`data-surface`) | Label | Ground (`--ds-bg`) | Ink (`--ds-fg`) | Contrast | Image Blend | Lineage / Role |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `ivory` *(default)* | **Ivory Editorial** | `#FAF9F5` | `#141413` | `17.6:1 (AAA)` | `multiply` | Calm B2C editorial default (Anthropic Ivory) |
| `paper` | **Paper White** | `#FFFFFF` | `#0A0A0A` | `19.8:1 (AAA)` | `multiply` | Archival B2B dossiers & documentation (Deimos Paper) |
| `blush` | Soft Blush | `#E8C4C0` | `#1A1414` | `9.8:1 (AAA)` | `multiply` | Soft Chromatic Edition — Rose paper |
| `apricot` | Soft Apricot | `#E8C8A8` | `#1A1612` | `10.0:1 (AAA)` | `multiply` | Soft Chromatic Edition — Peach cotton paper |
| `butter` | Soft Butter | `#E8D9A8` | `#1A1810` | `10.1:1 (AAA)` | `multiply` | Soft Chromatic Edition — Warm butter paper |
| `sage` | Soft Sage | `#B8C5A8` | `#141812` | `9.8:1 (AAA)` | `multiply` | Soft Chromatic Edition — Botanical sage |
| `mist` | Soft Mist | `#C5D4CE` | `#141816` | `9.6:1 (AAA)` | `multiply` | Soft Chromatic Edition — Cool mineral mist |
| `aqua` | **Signature Aqua** | `#A4CED0` | `#171614` | `10.4:1 (AAA)` | `multiply` | Climate, Air Quality & Cartography (Deimos Aqua) |
| `sky` | Soft Sky | `#B0C8D6` | `#12161A` | `9.9:1 (AAA)` | `multiply` | Soft Chromatic Edition — Clear sky ground |
| `slate` | Soft Slate | `#B5BFC9` | `#141618` | `9.7:1 (AAA)` | `multiply` | Soft Chromatic Edition — Cool mineral slate |
| `lilac` | Soft Lilac | `#C9C0D8` | `#16141A` | `9.7:1 (AAA)` | `multiply` | Soft Chromatic Edition — Archival lavender |
| `terracotta` | **Warm Terracotta** | `#EDBB99` | `#171614` | `10.4:1 (AAA)` | `multiply` | Solar 3D, Audio Briefings & Biography (Deimos Terracotta) |
| `obsidian` | **Obsidian Dark** | `#0E0E0D` | `#FAF9F5` | `18.4:1 (AAA)` | `normal` | Pro Observatory & Gann–Jenkins Night Mode (Deimos Obsidian) |

**Elevation discipline:** `--ds-shadow-raised: none`, `--ds-shadow-popover: none`. Cards and popovers sit flat on the paper via `1px` `color-mix()` hairlines.

---

## 2. Organic Accent & Semantic Signals

- **Contained Organic Palette (`--ds-organic-*`)**: `olive` (`#5E6E47`), `sky` (`#477085`), `coral` (`#B55A42`), `ochre` (`#9A7134`), `slate` (`#56606E`) with dark/tinted surface calibrations in `src/tokens.ts` and `src/tokens.css`. Restricted strictly to badges, chart series, data markers, and generative atelier brushwork.
- **Signals + Monochrome Parity (`[data-signals="monochrome"]`)**: `support`, `caution`, `refute`, and `info` always pair hue with geometric marks so `[data-signals="monochrome"]` collapses all chromatic signals to `--ds-fg` with zero loss of meaning.

---

## 3. Typography (Geist 3-Voice System)

Defined in `src/fonts.css` (local `.woff2` bundles in `assets/fonts/`) and `TYPOGRAPHY` in `src/tokens.ts`:

1. **Display Serif (`Geist Serif`)** — `mega`, `h1`, `h2`, `h3`, `h4`, `lead`, `metric`: **strictly `font-weight: 400`** (`font-synthesis-weight: none`), optical negative tracking (`-0.028em` to `-0.015em`).
2. **Functional Sans (`Geist`)** — UI body (`body-lg`, `body-md`, `body-sm`) and interactive controls (`ui-md` at `500`), line length clamped to `max-width: 65ch` (`--ds-max-prose`).
3. **Technical Mono (`Geist Mono`)** — Eyebrows (`0.06em`), SVG dial readouts, coordinates, ledger cells, code, and prompt viewers: always `font-variant-numeric: tabular-nums` (`tnum`).

---

## 4. PaperGrain, HalfTone Shaders & Chrome Invariants

- **Canvas PaperGrain (`src/paper-grain.ts`)**: `mountPaperGrain()` + `bootPaperGrainExtras()` render procedural organic cotton grain (`PAPER_SHADER`), 4 grain sizes (`GRAIN_SIZES`: `fine` `140`, `medium` `180`, `coarse` `260`, `chunky` `360`), adjustable `opacity` (`20%–100%`), and optional tactile layers (`dust`, `scratch`, `double`). Setting `html[data-paper-shader="canvas"]` disables legacy CSS `data:image/svg+xml` grain overlays for Chromium compatibility.
- **HalfTone Dots (`src/halftone-mount.ts`)**: Mounts `@paper-design/shaders` (`halftoneDotsFragmentShader`, WebGL) in a hex lattice (`grid: 'hex'`, `type: 'classic'`) kept in the crisp `u_size` `0.12–0.18` band (`HALFTONE` / `HALFTONE_MEDIUM`).
- **Chromium `2px` Hairline Scrollbars (`src/tokens.css`)**: Styled via `::-webkit-scrollbar` on Blink/WebKit; Firefox `scrollbar-width: thin` is isolated inside `@supports (-moz-appearance: none)` so Chromium never falls back to default wide scrollbars.
- **No-Blur Overlays & `.ds-burger` → `X`**: Drawers, modals, and nav-rails dim the backdrop (`rgba(20, 16, 12, 0.34)`) with `blur: false`. Menu triggers morph 3 equal `1.5px` bars into a centered `X` on `aria-expanded="true"`.

---

## 5. Motion Grammar & Tactile Gestures (`src/tokens.ts`, `src/components.css`)

Governed by the **Animation Frequency Gate** (adapted from `emilkowalski/skills`):

| Frequency | Examples | Target Timing |
| :--- | :--- | :--- |
| **100+/day** | `⌘K` / `/` command palette, surface hotkeys `1–9`/`0`, root switches | **`0ms`** (`DURATION_NONE`) — zero transition delay |
| **10+/day** | `:active` `scale(0.97)`, button hover, row selection | **`120–160ms`** |
| **Occasional** | Clip-path tabs (`240ms`), popovers (`220ms`), drawers/sheets (`380ms`), toasts (`400ms`) | **`< 400ms`**, interruptible CSS transitions |
| **Rare / First-time** | Scroll-reveal plates (`560ms`), 3D volume shelf opening (`800ms`) | Asymmetric editorial settle |

Six official curves (`MOTION.bezier`, **zero `ease-in`**, **zero `transition: all`**, **minimum enter scale `0.96`**):
- `--ds-ease-out`: `cubic-bezier(0.23, 1, 0.32, 1)`
- `--ds-ease-in-out`: `cubic-bezier(0.77, 0, 0.175, 1)`
- `--ds-ease-drawer`: `cubic-bezier(0.32, 0.72, 0, 1)`
- `--ds-ease-snappy`: `cubic-bezier(0.85, 0, 0, 1)`
- `--ds-ease-editorial`: `cubic-bezier(0.22, 1, 0.36, 1)`
- `--ds-ease-volume`: `cubic-bezier(0.22, 0.8, 0.25, 1)`

Key interaction mechanics:
- **Hold-to-Confirm**: Asymmetric `1.4s linear` fill while held; `180ms ease-out` cancel snap-back.
- **1:1 Drag & Momentum**: `setPointerCapture` during active drag, then `projectMomentum(v, 0.998)` + `rubberband(overshoot, dim, 0.55)`.
- **Touch & Mobile-Native**: Hover styles strictly inside `@media (hover: hover) and (pointer: fine)`; `44×44px` minimum hit targets; `16px` input font under `pointer: coarse`; full `@media (prefers-reduced-motion: reduce)` parity.

---

## 6. Plotter SVG Grammar & Generative Atelier TS

- **Plotter SVG (`src/plotter-svg.ts`, `src/historia-ambient-svg.ts`)**: Inspired by [`pasqualevitiello/plotter`](https://github.com/pasqualevitiello/plotter), enforces single-ink `currentColor` strokes across **13 semantic `data-plotter-role` layers** (`primary`, `section`, `secondary`, `dimension`, `leader`, `hatch`, `guide`, `grid`, `centerline`, `hidden`, `absent`, `proposed`, `transfer`), transparent shapes (`fill="none"`), open 45° dimension arrows, didactic isolation (`data-plotter-isolate`), `aspect-ratio: 1 / 1` circular gauges/Gann wheels, and the interactive orthographic **81k Globe** (`renderPlottedGlobeSvg`).
- **Generative Atelier (`src/atelier-engine.ts`)**: Zero-dependency strict TypeScript painterly engine (`< 0.7ms/frame`) implementing multi-layer wet-on-wet watercolor washes (`watercolorWash` + wet edge pooling), graphite pencils (`2H`/`4B` hatching), wax crayons (`waxCrayon`), and sumi-e ink (`inkBrush`), with viewport culling and instant static finish under `prefers-reduced-motion: reduce`.

---

## 7. Archival 3-Col Reader, Components Lab (89) & Prompts

- **Dual Mode (`data-mode`)**: `invisible` (calm B2C cards & plain prose) vs. `technical` (dense tabular ledger, Tier A/B/C badges, degree offsets).
- **3-Column Reader**: `152px` sticky TOC | `65ch` prose with clickable dotted `.ds-claim` citations | `264px` aside plate + *At a glance* card + interactive `Timeline` (`src/timeline.ts`) + `preserve-3d` dossier shelf.
- **Components Lab (`components.html`, `src/component-catalog.ts`, `src/components-lab.ts`)**: **89 components** across 11 categories, live interactive demos (including `timeline`), shadcn JSON manifests in [`public/r/`](./public/r/registry.json) built by `scripts/build-registry.mjs`, and **per-component AI Install Prompts** (`buildInstallPrompt` / `buildSystemInstallPrompt`, localized in PT/EN/ES/FR) copyable right from every component card.

---

## 8. Agent Governance & External Credits

- **Repository Governance:** [`DESIGN.md`](./DESIGN.md) · [`AGENTS.md`](./AGENTS.md) · [`skills/meridian-taste/SKILL.md`](./skills/meridian-taste/SKILL.md) (dedicated taste skill) · 7 domain skills under [`skills/`](./skills/).
- **External Craft Attributed:** **Evil Rabbit** ([Deimos / Design Zeitgeist](https://deimos.evilrabbit.com/) & [Geist](https://vercel.com/font)), **Emil Kowalski** ([`emilkowalski/skills`](https://github.com/emilkowalski/skills)), **Pasquale Vitiello** ([`pasqualevitiello/plotter`](https://github.com/pasqualevitiello/plotter)), **Paper Design** ([`@paper-design/shaders`](https://shaders.paper.design/)), **Jhosephe UI** ([`jhosephe.vercel.app`](https://jhosephe.vercel.app/)), **Anthropic Research**, **Tyler Hobbs / `p5.brush`**, and **shadcn/ui** — documented in detail in [`skills/CREDITS.md`](./skills/CREDITS.md).
