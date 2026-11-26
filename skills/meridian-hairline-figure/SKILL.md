---
name: meridian-hairline-figure
description: Interactive 2:1 isometric rounded-solid SVG figure craft aligned with Meridian's Plotter Single-Ink grammar. Encodes all 10 Hairline rules (hit testing on rest pose, distance stagger, clamped reach, single-stroke highlight, composed rest frame, opaque back-to-front painter occlusion, offscreen/idle sleep, dual-clock tween vs spring, rounded-ring hulls without vertical box edges, and quiet wordless figures with external telemetry) plus SVG adoption (hairline-adopt). Solid faces stay fully opaque and take depth from --ds-bg / --ds-surface-1 / --ds-surface-2 / --ds-surface-3; only strokes use reduced opacity. Inspired by Lucas Marques's hairline. Use alongside meridian-plotter-svg for tactile isometric SVG figures.
---

# Meridian Hairline Isometric Figures (`meridian-hairline-figure`)

Pairs **Lucas Marques's** [`lucasmarkes/hairline`](https://github.com/lucasmarkes/hairline) ([`hairline.lucasmarkes.com/skills`](https://hairline.lucasmarkes.com/skills)) interactive 2:1 isometric solid grammar with Meridian's [`meridian-plotter-svg`](../meridian-plotter-svg/SKILL.md) Single-Ink engine (`currentColor`, `data-plotter-role`, 40 surfaces).

Whereas **Plotter** draws orthographic 2D plans, cross-sections, dimensions, and the 81k spherical projection, **Hairline Figures** build pointer-responsive **2:1 isometric objects** from rounded solids: opaque surface fills, one ink on every stroke.

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
   - Use **one** foreground stroke (`var(--ds-fg)` / `currentColor`) across all 40 Meridian surfaces with **`vector-effect="non-scaling-stroke"`** so lines stay razor-thin at every card width: active contour `0.65px` (`stroke-opacity: 0.92`), resting contour `0.45px` (`stroke-opacity: 0.32`), inner crease `0.4px` (`stroke-opacity: 0.24`), base guide `0.4px` (`stroke-opacity: 0.18`). Those numbers are strokes only. No glow, gradient, blur, or second accent stripe. A fill is never the highlight — solid faces are rule 06.
   - Highlight **one** subject at a time: at rest, one lead mark (`r=1.15`, opaque `fill="currentColor"`) guides the eye; on pointer hover/lock, the rest mark yields brightness to the hovered piece. Rest vs hover changes z, stroke width, and stroke-opacity. It does not change fill-opacity.

5. **05 · `rest` — Rest Is Designed, Never Flat:**
   - Frame 0 is the cover thumbnail. Give rest state subtle asymmetric elevation/lean (a wave crest, fanned angles, or slight lift) so resting composition holds up without interaction.

6. **06 · `honesty` — Painter's Order Stays Honest (opaque surfaces):**
   - Paint **back-to-front** and keep every solid face opaque. Depth is which surface token you pick, not alpha that lets the drawing behind show through.
   - **Opacity split:** strokes may use reduced opacity. Every solid face is opaque (`fill-opacity="1"`, or omit it). Never put alpha on a fill — no `rgba()`, no `fill-opacity` below 1, no `color-mix(..., transparent)` as a face.
   - **Stack** in `render()` (`src/hairline-figure.ts`): dashed `guide` first, then the stepped tray (`buildSteppedPlinth`: outer step, inner step, then well/slot/collar strokes), then each prism in `drawOrder` (`order`, then `r`, then `c`). The live solid is one hull (`prismMarkup` = top ring ∪ base ring). A split into top, side, or rim faces is allowed; each face is still an opaque surface step. Do not shade a wall by fading it.
   - **Surface assignment** — names from `src/tokens.css` and `SURFACES` / `toCssVariables()` in `src/tokens.ts`. Single-Ink only. Read the hex for the active `[data-surface]`; do not paste a swatch screenshot over the token (mist `--ds-surface-1` is `#B9C9C2` in code).
     - Far / outer tray: `fill="var(--ds-bg)"`, fully opaque. Guide ticks stay `fill="none"` behind it.
     - Mid / inner tray or well floor: `fill="var(--ds-surface-1)"`, fully opaque. Optional mid mix, still opaque: `--ds-bg-tint-subtle` (4.5% `--ds-fg` into `--ds-bg`), `--ds-bg-tint-muted` (8.5%), `--ds-bg-tint-active` (12%), from `color-mix` in `src/tokens.css`.
     - Near solid that must win occlusion (button, blade, column, bezel plate, hull): `fill="var(--ds-surface-2)"`, fully opaque. A cap in front of that body uses `--ds-surface-3`. On `obsidian` the same order still steps `--ds-surface-1` → `2` → `3` (those tokens lighten off the ground).
     - Stroke and the single lead pip: `currentColor` (`--ds-fg`) or `--ds-fg-muted` at rule 04 `stroke-opacity`. The pip is opaque ink.
   - **Do not:** set `fill-opacity` below 1; put `opacity` on a `<g>` or path that contains a fill (the tray groups in `buildSteppedPlinth`, the per-solid group in `render()`, a bezel wall); use `--ds-chrome-bg`, `--ds-glass-control`, veil, or glass; let a front `switches` key or `riffle` blade reveal tray slot lines through its body; paint a face with the TS `bgTint*` / `rule` / `border` rgba strings (those are translucent — the CSS `color-mix` into `--ds-bg` is the opaque mix).
   - **Role opacity trap:** `[data-plotter]` in `src/tokens.css` sets element `opacity` from `--plotter-opacity-*` (secondary `0.32`, guide `0.14`). That multiplies fill and stroke. `[data-hairline]` only retunes stroke width. Keep solid faces at `opacity: 1` (`primary`, or an override) and fade with `stroke-opacity`. `data-plotter-isolate` may dim strokes; it must not ghost a filled face.

7. **07 · `cost` — Loops Sleep Offscreen & When Idle:**
   - Run `requestAnimationFrame` only while springs/tweens are non-settled; stop immediately when velocities drop below epsilon, pause offscreen via `IntersectionObserver`, and snap synchronously to settled targets under `@media (prefers-reduced-motion: reduce)`.

8. **08 · `clock` — Two Clocks (Choice vs. Continuous):**
   - **Discrete item / state transitions:** ease-out **`700ms cubic-bezier(0.32, 0.72, 0, 1)`** (Meridian `--ds-ease-drawer`).
   - **Continuous pointer position tracking:** underdamped/critical spring (`k = 100, c = 18, m = 1`) so moving targets never stall or lag behind the pointer. Never use `linear` for motion curves.

9. **09 · `radius` — Round Every Corner, Draw Less:**
   - Model extruded solids as the 2D silhouette hull connecting top & bottom rounded rings (`rrect`) with **zero vertical corner lines** drawn down the walls, plus **one** dimmer inner top crease (rule 04 `stroke-opacity`, `fill="none"`, `data-plotter-role="secondary"`).
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
| **Occlusion** | Transparent (`fill="none"`), dashed `hidden` layer | Opaque faces (`fill-opacity: 1`) stepped `--ds-bg` → `--ds-surface-1` → `--ds-surface-2` / `--ds-surface-3`, painter sort back-to-front. Strokes may fade. Not group opacity. |
| **Semantic Tagging** | Apply `data-plotter-role` (`primary`, `secondary`, `guide`, `centerline`, `dimension`, `transfer`) to every primitive inside Hairline SVGs so Plotter isolation (`data-plotter-isolate`) works across both. | Keep silhouette on `primary`, inner crease on `secondary`, projection ticks on `guide`. Isolation may dim strokes only — a filled face stays `opacity: 1`. |
| **Adopting Existing SVGs** | Clean up raw paths into Single-Ink `currentColor` tokens | **`hairline-adopt` rule:** Inspect the source SVG first, extract its **conceptual object and semantic parts** (never trace/animate raw curves blindly), rebuild those parts as rounded 2:1 isometric solids with a natural pointer gesture, and flag third-party brand marks at hand-over. Adopted solids obey rule 06: opaque surface fills; strokes may fade. |

**Mount:** `mountHairlineFigure(svg, readout?, preset)` in `src/hairline-figure.ts` (re-exported from `src/index.ts`). Presets: `wave`, `strata`, `beacon`, `octaves`, `switches`, `riffle`, `phosphor`. Home specimens are `index.html` `#svg-viz`: `#hairline-iso-svg` (`wave`), `#hairline-iso-strata`, `#hairline-iso-switches`, `#hairline-iso-beacon`, `#hairline-iso-riffle`, `#hairline-iso-phosphor` (`octaves` is a preset only). Lab: `demoHairlineIso` in `src/components-lab.ts` (`hairline-isometric`). Fills are `var(--ds-*)` already provided by `src/tokens.css` — do not hardcode a surface hex and do not import a second palette. The same split applies to other `[data-hairline]` solid plates in that lab file (bezel wall, hub).

---

## 3. Attribution & License

- **Lucas Marques** — [`lucasmarkes/hairline`](https://github.com/lucasmarkes/hairline) · [`hairline.lucasmarkes.com/skills`](https://hairline.lucasmarkes.com/skills) (`hairline-create`, `hairline-adopt`, MIT License).
- Works alongside **Pasquale Vitiello's** [`pasqualevitiello/plotter`](https://github.com/pasqualevitiello/plotter) documented in [`meridian-plotter-svg`](../meridian-plotter-svg/SKILL.md).
- Full project credits: [`../CREDITS.md`](../CREDITS.md).
