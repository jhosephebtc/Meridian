---
name: meridian-plotter-svg
description: Editable single-ink SVG blueprint grammar (Plotter), 81k dotted orthographic globe, Gann/Jenkins locked 1:1 instruments, and stroke-draw animations in Meridian. Covers src/plotter-svg.ts, src/historia-ambient-svg.ts, src/gann-app.ts, src/manifesto-app.ts, and assets/meridian-globe-81k.svg. Use when generating or auditing technical diagrams, globes, charts, or radial geometry.
---

# Meridian Plotter SVG & 81k Globe (`meridian-plotter-svg`)

Follows **Pasquale Vitiello's** [`pasqualevitiello/plotter`](https://github.com/pasqualevitiello/plotter) blueprint grammar combined with the dotted orthographic globe aesthetic of **Anthropic's** [81k Interviews](https://www.anthropic.com/features/81k-interviews).

---

## 1. Core Plotter Drawing Rules (`PLOTTER_STANDARDS` in `src/plotter-svg.ts`)

- **One ink (`currentColor` / `--plotter-ink: var(--ds-fg)`):** Every diagram reads natively across all 13 Meridian surfaces (`ivory` through `obsidian`).
- **Calibrated stroke & point scale (`vector-effect="non-scaling-stroke"`):**
  - Plotter blueprints (`src/plotter-svg.ts` & `[data-plotter]` in `src/tokens.css`): unit stroke `1` where hierarchy comes exclusively from **opacity** and **dash patterns** (`data-plotter-role`).
  - Components Lab / UI charts (`src/components-lab.css` `.ml-svg`): `--ml-primary: 1.5px`, `--ml-secondary: 1.15px`, `--ml-guide: 0.7px`, dot marks `r: 2px`, labels `10–11px` without stroke (`stroke="none"`).
- **Transparent shapes (`fill="none"`):** Only a single named selection/intersection may carry `fill-opacity: 0.055` (`highlightFillOpacity`).
- **Discreet, non-stroked labels (`plotterLabelSvg`):** weight `400`, `stroke="none"`, `0.72` opacity for names (`11px`), `0.50` for values (`10.5px`). Dimension lines leave a clean label gap (`labelClearance: 3u`, end slashes `8u`).
- **Open 45° arrowheads (`plotterArrowheadPath`):** `leg = 6`, `angleDeg = 45`.
- **Canonical canvases & locked 1:1:**
  - Technical blueprints & globes: `560 × 440` (`PLOTTER_STANDARDS.canonicalCanvas`).
  - Angular instruments (Gann Fan, Square of Nine, Jenkins `63.75°`, Compass): `.ds-svg-frame` with `viewBox="0 0 400 400"` and `aspect-ratio: 1 / 1` — **never** `preserveAspectRatio="none"`.

---

## 2. The 13 Semantic Roles (`PLOTTER_ROLES` / `data-plotter-role`)

| Role | Opacity | Dash Array | Purpose |
| :--- | :---: | :--- | :--- |
| **`primary`** / **`section`** | `1.00` | Continuous | Main outer contour, active arc, section cut |
| **`secondary`** / **`dimension`** / **`leader`** | `0.32` | Continuous | 81k landmass dots, real dimensions, callouts |
| **`hatch`** | `0.18` | Continuous (`-45°`, pitch `12`) | Hatching clipped inside a bounded region |
| **`guide`** | `0.14` | Continuous | Parallels, meridians, alignment guides (`8u` clearance) |
| **`centerline`** | `0.14` | `8 3 1 3` | Equator, orthogonal axes, symmetry center |
| **`hidden`** / **`absent`** / **`proposed`** | `0.32` | `3 5` | Hidden hemisphere, absent channel, proposed orbit |
| **`transfer`** | `0.32` | `4 6` | Geodesic / orbital arc paired with `6u`/`45°` arrow |
| **`grid`** | `0.06` | Continuous | Modular coordinate grid |

Set `data-plotter-isolate="<role>"` on `[data-plotter]` to dim non-matching layers to `opacity: 0.04` for interactive didactic inspection.

---

## 3. Orthographic 81k Globe & Historia / Gann Plotter Plates

- **`renderPlottedGlobeSvg(opts?: PlottedGlobeOptions)` (`src/plotter-svg.ts`):** Pure TypeScript 3D→2D orthographic projection (`projectOrthographic` + `isLandApprox`) with zero Three.js/GeoJSON bloat, compatible with Web and `react-native-svg`.
- **Standalone asset:** [`assets/meridian-globe-81k.svg`](../../assets/meridian-globe-81k.svg).
- **Stroke-draw animations (`src/historia-app.ts` & `src/gann-app.ts`):** Compute exact lengths via `el.getTotalLength()` (`--ht-len`) and trigger once on intersection (`IntersectionObserver`), respecting `prefers-reduced-motion`.
- **Ambient nautical motifs (`src/historia-ambient-svg.ts`):** Fine curves placed behind essays without overpowering prose contrast.

---

## 4. Pairing with `meridian-hairline-figure` & `meridian-gridlines`

- **2:1 Isometric Companion ([`meridian-hairline-figure`](../meridian-hairline-figure/SKILL.md)):** Use Plotter (`560 × 440` or `400 × 400`) for orthographic blueprints, globes, and technical dials; use Hairline (`400 × 320`, 2:1 isometric rounded solids with opaque `var(--ds-bg)` back-to-front occlusion and rest-pose hit testing) when building interactive isometric objects. Tag Hairline silhouettes with `data-plotter-role="primary"` and creases with `data-plotter-role="secondary"` so `data-plotter-isolate` highlights both grammars uniformly.
- **Alignment Audit ([`meridian-gridlines`](../meridian-gridlines/SKILL.md)):** After assembling headers, telemetry toolbars, and instrument cards around Plotter plates, verify horizontal edges and vertical row centers with `window.__gridlines()`.

---

## 5. Attribution

- **Pasquale Vitiello** ([`pasqualevitiello/plotter`](https://github.com/pasqualevitiello/plotter)): 13 semantic roles, 1-ink stroke discipline, open 45° arrows, gap-cleared dimensions, and role isolation.
- **Lucas Marques** ([`lucasmarkes/hairline`](https://github.com/lucasmarkes/hairline) · [skills](https://hairline.lucasmarkes.com/skills)): Interactive 2:1 isometric rounded-solid figure companion rules paired with Plotter.
- **Anthropic** ([81k Interviews](https://www.anthropic.com/features/81k-interviews)): Dotted orthographic editorial globe style.
- Full credits: [`../CREDITS.md`](../CREDITS.md).
