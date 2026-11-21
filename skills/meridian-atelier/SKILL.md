---
name: meridian-atelier
description: Zero-dependency 100% strict TypeScript generative analog media engine (src/atelier-engine.ts). Renders watercolor washes, wet-on-wet scenario blocks, eroded graph paper, graphite pencils (2H/HB/4B), wax crayons, dry-brush chalk, and sumi-e ink brushes at <0.7ms/frame with IntersectionObserver pausing, reduced-motion static synthesis, and @shopify/react-native-skia backend portability. Use instead of p5.js for editorial illustrations.
---

# Meridian Atelier Engine (`meridian-atelier`)

A portable, zero-dependency analog media engine (`src/atelier-engine.ts`) that replaces 800KB+ `p5.js` bundles with `< 0.7ms/frame` incremental rendering across Web Canvas 2D and `@shopify/react-native-skia`.

---

## 1. Architecture & Portability (`AtelierDrawingBackend`)

- **Web backend:** `createCanvasBackend(canvas, dpr)` (HTML5 Canvas 2D).
- **React Native / Expo backend:** Implement the 6 methods of `AtelierDrawingBackend` (`clear`, `setCompositeMode`, `fillPolygon`, `strokePolyline`, `fillDot`, `fillEllipse`) over `@shopify/react-native-skia`.
- **Persistent incremental painting:** Sketches never clear and redraw all geometry every frame — `draw(atelier, frameCount, elapsedSec)` layers strokes onto persistent paper, keeping frame times under `0.7ms`.
- **Motion & battery discipline (`runMeridianSketch`):**
  - Pauses automatically when off-screen via `IntersectionObserver`.
  - Under `prefers-reduced-motion: reduce`, synchronously steps up to `staticSteps` (48 frames) to render the complete static illustration immediately with zero `requestAnimationFrame` loop.

---

## 2. The 5 Analog Physical Media (`MeridianAtelier`)

1. **Watercolor (`watercolorWash`, `watercolorBand`, `brushFillRect`):** Recursive Gaussian polygon subdivision (`deformPolygon`), translucent layering in `multiply` (or `screen` on `obsidian`), and wet-edge capillary pigment pooling (`wetEdgeRing`).
2. **Graphite Pencil (`graphitePencil`, `handDrawnRect`, `hatchArea`):** 4–8 parallel micro-fibers (`2H | HB | 4B`) modulated by `fbm2D` hand tremor + Cohen–Sutherland clipped hatching (`hatchArea`).
3. **Wax Crayon / Pastel (`waxCrayon`):** Anisotropic ellipse stippling masked against simulated cotton-paper tooth (`noise2D`).
4. **Sumi-e Ink & Dry-Brush Chalk (`inkBrush`, `dryBrushChalk`):** Split bristles with sinusoidal pressure modulation and progressive dry-brush *kasure* gaps.
5. **Eroded Graph Paper & Fan Trajectories (`erodedGraphPaper`, `paintFanTrajectories`):** Multi-octave Perlin erosion fading out toward margins, paired with curved trajectory ribbons.

---

## 3. Built-In Presets & Usage

1. `createEconWatercolorSketch()` — `4×3` wet-on-wet scenario tiles + fan trajectories + `4B` pencil overlays.
2. `createBotanicalWatercolorSketch()` — Soft botanical watercolor blooms (`sky` / `olive` / `ochre`) + topographic `2H`/`HB` contour strokes.
3. `createCelestialPencilSketch()` — Technical notebook with `2H` hatch, `4B` circle/radials, and `coral` sumi-e Square-of-Nine spiral.
4. `createCrayonCollageSketch()` — Warm wax crayon collage with hand-drawn `4B` frame.

```ts
import { runMeridianSketch, createBotanicalWatercolorSketch } from '@meridian/design-system';

const ctrl = runMeridianSketch(canvas, createBotanicalWatercolorSketch(), {
  surface: 'ivory',
  seed: 20261120,
  maxFrames: 28,
  respectReducedMotion: true,
});
```

---

## 4. Attribution

- **Anthropic Economic Scenarios** ([anthropic.com/institute/econ-scenarios](https://www.anthropic.com/institute/econ-scenarios)): Filled watercolor block matrices and fan trajectories.
- **Tyler Hobbs & `p5.brush`**: Recursive Gaussian watercolor edge deformation and physical dry-brush/tooth algorithms re-implemented in strict TypeScript.
- Full credits: [`../CREDITS.md`](../CREDITS.md).
