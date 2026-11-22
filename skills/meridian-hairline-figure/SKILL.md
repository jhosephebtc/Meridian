---
name: meridian-hairline-figure
description: Interactive 2:1 isometric rounded-solid SVG figure craft aligned with Meridian's Plotter Single-Ink grammar. Encodes all 10 Hairline rules (hit testing on rest pose, distance stagger, clamped reach, single-stroke highlight, composed rest frame, opaque back-to-front painter occlusion, offscreen/idle sleep, dual-clock tween vs spring, rounded-ring hulls without vertical box edges, and quiet wordless figures with external telemetry) plus SVG adoption (hairline-adopt). Inspired by Lucas Marques's hairline. Use alongside meridian-plotter-svg for tactile isometric SVG figures.
---

# Meridian Hairline Isometric Figures (`meridian-hairline-figure`)

Pairs **Lucas Marques's** [`lucasmarkes/hairline`](https://github.com/lucasmarkes/hairline) ([`hairline.lucasmarkes.com/skills`](https://hairline.lucasmarkes.com/skills)) interactive 2:1 isometric solid grammar with Meridian's [`meridian-plotter-svg`](../meridian-plotter-svg/SKILL.md) Single-Ink engine (`currentColor`, `data-plotter-role`, 13 surfaces).

Whereas **Plotter** draws orthographic 2D plans, cross-sections, dimensions, and the 81k spherical projection, **Hairline Figures** build pointer-responsive **2:1 isometric objects** from rounded solids in a single stroke.

---

## 1. The 10 Hairline Rules (Adapted for Meridian Single-Ink)

1. **01 · `hit` — Hit Areas Never Move:**
   - Test pointer coordinates against the **rest pose** or ground plane (`unproj` / static hit bands / rest screen centres), never the moving rendered shape.
   - Never call `getBoundingClientRect()` inside animation loops or oscillate hover state under a stationary pointer.

2. **02 · `order` — Stagger by Distance:**
   - Spread wave animations outward from the touched index `a`:
     `delay = Math.abs(i - a) * step` (`step` `30–60ms`) so neighbors ripple organically from the cursor instead of marching sequentially down an index list.

3. **03 · `reach` — Clamp the Reach:**
   - Clamp every lift, gap, tilt, and spring target so extremes remain framed at `intensity = 1` inside `viewBox="0 0 400 320"` (or `.ds-svg-frame`). Apply sublinear distance falloff (`1 → 0.31 → 0.09`).

4. **04 · `accent` — Stroke Is the Only Highlight (Razor-Thin Hairline Scale):**
   - Use **one** foreground stroke (`var(--ds-fg)` / `currentColor`) across all 13 Meridian surfaces with **`vector-effect="non-scaling-stroke"`** so lines stay razor-thin at every card width: active contour `0.85px` (`opacity: 1`), resting contour `0.6px` (`opacity: 0.38`), inner crease `0.5px` (`opacity: 0.34`), base guide `0.5px` (`opacity: 0.22`), zero fills, glows, gradients, blurs, or secondary accent stripes.
   - Highlight **one** subject at a time: at rest, one lead mark (`r=1.5`) guides the eye; on pointer hover/lock, the rest mark yields brightness to the hovered piece.

5. **05 · `rest` — Rest Is Designed, Never Flat:**
   - Frame 0 is the cover thumbnail. Give rest state subtle asymmetric elevation/lean (a wave crest, fanned angles, or slight lift) so resting composition holds up without interaction.

6. **06 · `honesty` — Painter's Order Stays Honest:**
   - Paint plates and extruded solids **back-to-front**.
   - Fill visible top/hull faces with opaque surface ground (`fill="var(--ds-bg)"`) so rear contours never bleed x-ray-style through near solids. Paint dashed guides (`data-plotter-role="guide"`) strictly *behind* the plate they serve.

7. **07 · `cost` — Loops Sleep Offscreen & When Idle:**
   - Run `requestAnimationFrame` only while springs/tweens are non-settled; stop immediately when velocities drop below epsilon, pause offscreen via `IntersectionObserver`, and snap synchronously to settled targets under `@media (prefers-reduced-motion: reduce)`.

8. **08 · `clock` — Two Clocks (Choice vs. Continuous):**
   - **Discrete item / state transitions:** ease-out **`700ms cubic-bezier(0.32, 0.72, 0, 1)`** (Meridian `--ds-ease-drawer`).
   - **Continuous pointer position tracking:** underdamped/critical spring (`k = 100, c = 18, m = 1`) so moving targets never stall or lag behind the pointer. Never use `linear` for motion curves.

9. **09 · `radius` — Round Every Corner, Draw Less:**
   - Model extruded solids as the 2D silhouette hull connecting top & bottom rounded rings (`rrect`) with **zero vertical corner lines** drawn down the walls, plus **one** dimmer inner top crease (`opacity: 0.28–0.35`, `data-plotter-role="secondary"`).
   - Silhouette strong outside, crease quiet inside.

10. **10 · `quiet` — No Words Inside the Figure:**
    - Keep the SVG canvas wordless (`stroke="none"` labels stay outside the drawing or omitted). Identity travels through geometry (punches, dot codes, notches).
    - Display a compact external `Geist Mono` (`tabular-nums`) readout beside/below the frame (`rest`, `tile 2·3`, `04`), never a explanatory paragraph inside the figure.

---

## 2. Joint Usage with `meridian-plotter-svg`

Combine both skills whenever a Meridian surface needs architectural rigor *plus* physical 2.5D depth:

| Layer / Feature | Plotter (`meridian-plotter-svg`) | Hairline (`meridian-hairline-figure`) |
| :--- | :--- | :--- |
| **Projection** | Orthographic 2D plan / dial / spherical 81k globe | 2:1 isometric `Cam(45°, 0.5)` rounded solids |
| **Container** | `560 × 440` or `400 × 400` 1:1 locked dial | `400 × 320` centered frame, legible down to `240px` width |
| **Occlusion** | Transparent (`fill="none"`), dashed `hidden` layer | Opaque `fill="var(--ds-bg)"` painter sort back-to-front |
| **Semantic Tagging** | Apply `data-plotter-role` (`primary`, `secondary`, `guide`, `centerline`, `dimension`, `transfer`) to every primitive inside Hairline SVGs so Plotter isolation (`data-plotter-isolate`) works across both. | Keep silhouette on `primary`, inner crease on `secondary`, projection ticks on `guide` |
| **Adopting Existing SVGs** | Clean up raw paths into Single-Ink `currentColor` tokens | **`hairline-adopt` rule:** Inspect the source SVG first, extract its **conceptual object and semantic parts** (never trace/animate raw curves blindly), rebuild those parts as rounded 2:1 isometric solids with a natural pointer gesture, and flag third-party brand marks at hand-over. |

---

## 3. Attribution & License

- **Lucas Marques** — [`lucasmarkes/hairline`](https://github.com/lucasmarkes/hairline) · [`hairline.lucasmarkes.com/skills`](https://hairline.lucasmarkes.com/skills) (`hairline-create`, `hairline-adopt`, MIT License).
- Works alongside **Pasquale Vitiello's** [`pasqualevitiello/plotter`](https://github.com/pasqualevitiello/plotter) documented in [`meridian-plotter-svg`](../meridian-plotter-svg/SKILL.md).
- Full project credits: [`../CREDITS.md`](../CREDITS.md).
