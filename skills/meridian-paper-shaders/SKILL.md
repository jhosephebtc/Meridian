---
name: meridian-paper-shaders
description: Tactile materiality and chrome engineering for Meridian — procedural PaperGrain canvas overlay (#ds-paper-grain), @paper-design/shaders HalfTone Dots fine-mesh config, 2px hairline scrollbars across Chromium/Firefox, dim-only overlays, 3-line-to-X burger morph, and .ds-page-veil reveal. Use when working on src/paper-grain.ts, src/halftone-mount.ts, src/page-enter.ts, scrollbars, or photographic plates.
---

# Meridian Paper, Shaders & Chrome (`meridian-paper-shaders`)

Tactile cotton-paper surfaces, WebGL halftone photography, hairline chrome, and flicker-free reveals without breaking Chromium GPUs or Windows scrollbars.

---

## 1. Procedural `PaperGrain` Canvas (`src/paper-grain.ts`)

**Why canvas instead of CSS `data:` URI:** Chrome and Edge silently discard oversized full-viewport PNG data-URLs stored inside CSS custom properties (`--ds-paper-texture`), causing grain to disappear inconsistently across devices.

### Architecture
- `mountPaperGrain(options?: PaperGrainOptions)` creates `<canvas id="ds-paper-grain" class="ds-paper-grain-layer" aria-hidden="true">` fixed at `inset: 0`, sets `html[data-paper-shader="canvas"]` (disabling legacy `body::after`), and paints triangular-distribution speckles + curved cellulose fibers directly with alpha (`source-over`).
- On `data-surface="obsidian"`, `.ds-paper-grain-layer` applies `filter: invert(1)` and `0.92` opacity factor.

### Full Runtime API (`src/paper-grain.ts` + `src/tokens.ts`)

| Control | HTML Attribute / CSS Var | Exported Functions / Constants | Values |
| :--- | :--- | :--- | :--- |
| **Intensity** | `data-grain` → `--ds-grain-multiplier` | `GrainPreset` | `off` (`0`), `subtle` (`0.42`), `editorial` (`0.78`), `tactile` (`1.12`) |
| **Opacity** | `--ds-grain-opacity` + `data-grain-opacity` | `setPaperGrainOpacity(0.15–1)`, `getPaperGrainOpacity()` | `0.15` to `1.00` (persisted via `PAPER_SHADER.opacityStorageKey`) |
| **Grain Size** | `data-grain-size` (triggers repaint) | `setPaperGrainSize(size)`, `GRAIN_SIZES`, `GRAIN_SIZE_ORDER` | `fine` (`scale 0.96`), `medium` (`0.84`), `coarse` (`0.70`), `chunky` (`0.60`) |
| **Extra Layers** | `data-grain-dust`, `data-grain-scratch`, `data-grain-double` | `setPaperGrainDust`, `setPaperGrainScratch`, `setPaperGrainDouble`, `bootPaperGrainExtras` | `'on'` / `'off'` (persisted to `localStorage`) |
| **Handle** | — | `mountPaperGrain()`, `repaintPaperGrain()`, `getPaperGrainHandle()` | `dispose()`, `repaint()`, `setSize()`, `setOptions()` |

```ts
import { mountPaperGrain, bootPaperGrainExtras } from '@meridian/design-system';

mountPaperGrain({ seed: 20261120, speckleStrength: 0.72, fiberDensity: 1 });
bootPaperGrainExtras();
```

---

## 2. HalfTone Dots (`@paper-design/shaders` · `src/halftone-mount.ts`)

`mountHalftone(el, imageSrc, opts)` instantiates `ShaderMount` with `halftoneDotsFragmentShader`, sampling `--ds-bg` (`u_colorBack`) and `--ds-fg` (`u_colorFront`) with `u_originalColors: false` so every photograph translates into Single-Ink halftone dots.

- **Critical Invariant:** **`u_size >= 0.4` destroys the image** (leaving too few grid cells). Keep `u_size` in the fine-to-medium range:
  - `HALFTONE` (`src/tokens.ts`): `size: 0.12`, `radius: 0.92`, `contrast: 0.68`, `grainMixer: 0.06`, `grainOverlay: 0.05`, `grainSize: 0.28`, `grid: 'hex'`, `type: 'classic'`, `fit: 'cover'`.
  - `HALFTONE_MEDIUM` (`src/halftone-mount.ts`): `size: 0.18`, `radius: 0.92`, `contrast: 0.72`.
- **Same-origin load safety:** `loadImage` avoids forcing `crossOrigin` unnecessarily on local assets and falls back gracefully to a tinted grayscale `<img>` if WebGL fails.

---

## 3. Hairline `2px` Scrollbars (`src/tokens.css` & `SCROLLBAR`)

**Chromium Bug Warning:** Never declare `scrollbar-width` or `scrollbar-color` alongside `::-webkit-scrollbar` on global selectors — per the CSS specification, Chromium disables `::-webkit-scrollbar` when `scrollbar-width` is present, snapping back to the thick native Windows scrollbar with a white track.

```css
/* Firefox ONLY */
@supports (-moz-appearance: none) {
  html, * {
    scrollbar-width: thin;
    scrollbar-color: color-mix(in srgb, var(--ds-fg) 22%, transparent) transparent;
  }
}

/* Blink / WebKit: 8px gutter with transparent borders yields a 2px hairline thumb */
html::-webkit-scrollbar, *::-webkit-scrollbar {
  width: 8px !important;
  height: 8px !important;
  background: transparent !important;
}
html::-webkit-scrollbar-thumb, *::-webkit-scrollbar-thumb {
  background-color: color-mix(in srgb, var(--ds-fg) 28%, transparent) !important;
  border: solid transparent !important;
  border-width: 0 4px 0 2px !important;
  background-clip: padding-box !important;
}
```

Always set `background-color: var(--ds-bg)` on `html` so the gutter blends into the active surface paper.

---

## 4. Chrome Primitives (`components.css` & `page-enter.ts`)

1. **Dim-Only Backdrops (`OVERLAY_DIM`):** `rgba(20, 16, 12, 0.34)` with `blur: false`. Only the sticky `.ds-topbar` / `.topbar` uses subtle `backdrop-filter: blur(18px) saturate(135%)` on desktop (`>= 720px`) over `--ds-chrome-bg`.
2. **Burger → X (`.ds-burger` · `BURGER`):** `40×40px` squircle button with `.ds-burger-lines` (`18×12px`, 3 equal `1.5px` spans) morphing smoothly to `X` via `[aria-expanded="true"]`.
3. **Page Enter Veil (`src/page-enter.ts`):** Place `<div class="ds-page-veil" aria-hidden="false"></div>` at the top of `<body>` and call `markPageReady()` (sets `data-page-ready="true"`, `aria-hidden="true"`, then reveals `.ds-page-enter` from `--ds-enter-scale: 0.96`).

---

## 5. Attribution

- **Evil Rabbit** ([Deimos / Design Zeitgeist](https://deimos.evilrabbit.com/)): Cotton-paper archival grain and multiply plate compositing.
- **Paper Design** ([shaders.paper.design](https://shaders.paper.design)): `@paper-design/shaders` `halftoneDotsFragmentShader`.
- Full credits: [`../CREDITS.md`](../CREDITS.md).
