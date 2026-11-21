---
name: meridian-taste
description: Meridian's design-engineering taste skill ("habilidade de gostos"). Encodes the Lighthouse Criterion, non-negotiable Single-Ink/typography/materiality/motion standards, anti-slop code checks, Before/After/Why review format, and the workflow to capture new user taste rules into DESIGN.md. Use whenever designing, reviewing, or refining Meridian UI.
---

# Meridian Taste (`meridian-taste`)

> **The Lighthouse Criterion:** *"Does this help navigators find their way?"*
> Good taste in Meridian is not decoration — it is restraint calibrated to orientation. Every element must justify its stroke, surface contrast, and millisecond of motion.

This skill translates Meridian's implemented craft together with **Emil Kowalski's** [`emil-design-eng` & `learn-taste`](https://github.com/emilkowalski/skills) methodology and **Evil Rabbit's** [Deimos / Design Zeitgeist](https://deimos.evilrabbit.com/) archival discipline into concrete rules and review rituals.

---

## 1. The 10 Core Taste Pillars

1. **One Ink Per Paper (`--ds-fg` over `--ds-bg`):**
   - Never hardcode secondary border grays (`#e5e5e5`, `#333`) or random box-shadows.
   - Derive rules (`--ds-rule` 9%), strong borders (`--ds-border-strong` 12%), and tints (`--ds-bg-tint-subtle` 4.5% / `muted` 8.5%) via `color-mix()`.
   - Zero decorative elevation shadows (`--ds-shadow-raised: none`, `--ds-shadow-popover: none`).

2. **Contrast via Scale & Voice, Never Heavy Weight:**
   - Display headings (`Geist Serif`) always stay at `font-weight: 400` with `font-synthesis-weight: none`.
   - Separate hierarchy by switching voice (`Geist Serif` display → `Geist` prose → `Geist Mono` tabular metadata) and negative display tracking (`-0.03em` to `-0.011em`).
   - Constrain body prose to `max-width: 65ch`.

3. **Quiet Paper Before Saturated Color:**
   - Default ground is warm `ivory` (`#FAF9F5`) or tinted archival papers (`aqua`, `terracotta`, `blush`, `butter`, `mist`, `sage`, `sky`, `slate`, `lilac`, `apricot`) or deep `obsidian` (`#0E0E0D`).
   - Earthy pigments (`olive`, `sky`, `coral`, `ochre`, `slate`) appear only inside tags, chart paths, status marks, and atelier brush canvases.
   - Zero neon glows, zero purple-on-dark gradients, zero saturated marketing cards.

4. **Physical Paper Materiality, Never Flat Plastic:**
   - Render `PaperGrain` through `<canvas id="ds-paper-grain">` (`mountPaperGrain()`), never CSS `data:` URIs (which Chromium silently drops).
   - Keep `@paper-design/shaders` HalfTone mesh fine (`u_size` `0.12–0.18`; never `>= 0.4`).
   - Composite archival photography on light/tinted paper with `mix-blend-mode: multiply`.

5. **Hairline Restraint in Chrome:**
   - `2px` transparent-track scrollbars (`border-width` gutter trick in `src/tokens.css`; never mix unscoped `scrollbar-width` with `::-webkit-scrollbar`).
   - `.ds-burger` uses 3 equal `1.5px` lines morphing to `X`.
   - Drawers/modals dim the background (`rgba(20, 16, 12, 0.34)`), **never** `backdrop-filter: blur`.
   - Use `.ds-page-veil` + `markPageReady()` so initial load settles cleanly.

6. **Speed Is Respect (The Frequency Gate):**
   - Keyboard shortcuts (`⌘K`, `/`) and high-frequency switches animate at **`0ms`**.
   - High-frequency pointer feedback (`:active`) uses `scale(0.97)` in `120ms var(--ds-ease-out)`.
   - Never use `ease-in` on UI enter/exit; never start entrances from `scale(0)` (minimum `0.96`); never write `transition: all`.

7. **Touch Discipline & Mobile-Native Parity:**
   - Every `:hover` rule lives inside `@media (hover: hover) and (pointer: fine)` so mobile taps never leave stuck hover states.
   - Minimum `44px` hit targets, `touch-action: manipulation`, `16px` minimum input font size under `(pointer: coarse)` to stop iOS zoom, `100dvh` shells, `100svh` heroes, `env(safe-area-inset-*)`.

8. **Honest Physics Over Canned Keyframes:**
   - Drags (`Lifeline`, `Slider`, `Dial`, `Globe`) track the pointer `1:1` during `pointermove` without easing, then project inertia via `projectMomentum(v, 0.998)` and `rubberband(overshoot, dim, 0.55)`.
   - Destructive/commit holds (`Hold-to-Confirm`) fill `linear 1.4s` and retract `180ms ease-out`.
   - Toasts transition in/out along the same axis using CSS transitions so interactions stay interruptible.

9. **1-Ink Geometry & Zero-Dependency Craft:**
   - Technical illustrations follow Plotter (`currentColor`, `data-plotter-role` opacity/dash hierarchy, `fill="none"`). Radial/Gann instruments lock `aspect-ratio: 1 / 1` (`viewBox="0 0 400 400"`).
   - Generative media uses `src/atelier-engine.ts` (`< 0.7ms/frame` incremental TS) instead of shipping an 800KB+ `p5.js` runtime.

10. **Calm Copy & Auditable Provenance:**
    - `data-mode="invisible"` translates telemetry into calm everyday language without jargon.
    - `data-mode="technical"` exposes 4 deterministic layers and `Tier A / B / C` clickable provenance (`.ds-claim`).
    - All numeric readouts use `font-variant-numeric: tabular-nums`.

---

## 2. Required Review Output Format

When reviewing or critiquing UI code for taste violations, **always output a single Markdown table** with `| Before | After | Why |` columns (pattern from Emil Kowalski's `emil-design-eng` skill), one row per concrete fix:

| Before | After | Why |
| :--- | :--- | :--- |
| `transition: all 200ms ease-in;` | `transition: transform 160ms var(--ds-ease-out), opacity 160ms var(--ds-ease-out);` | Avoid `all` (unintended layout transitions) and `ease-in` (sluggish UI starts) |
| `border: 1px solid #d4d4d4;` | `border: 1px solid var(--ds-border);` | Single-Ink `color-mix()` keeps hairlines coherent across all 13 surfaces |
| `.card:hover { transform: translateY(-2px); }` | `@media (hover: hover) and (pointer: fine) { .card:hover { ... } }` | Prevent sticky hover states on touch screens |
| `transform: scale(0);` | `transform: scale(var(--ds-enter-scale, 0.96)); opacity: 0;` | Elements scale smoothly from near-resting size, never from nothing |
| `font-weight: 700;` on `Geist Serif` `h1` | `font-weight: 400; font-synthesis-weight: none;` | Display serif builds authority through scale and optical tracking, not bold weight |

---

## 3. Anti-Slop Code Checks (Run Before Shipping)

Scan changed CSS/TS/HTML files for these Meridian taste violations:
- [ ] Zero `transition: all` anywhere in CSS.
- [ ] Zero `ease-in` in UI transitions (check both CSS and inline styles).
- [ ] Zero `scale(0)` enter states on menus, popovers, dialogs, tooltips, or badges.
- [ ] Zero raw hardcoded borders/backgrounds where `--ds-bg`, `--ds-fg`, `--ds-rule`, `--ds-border`, `--ds-bg-tint-*` belong.
- [ ] Zero `backdrop-filter: blur` on modal/drawer backdrops (`OVERLAY_DIM.blur === false`).
- [ ] Zero `data:image/` inside `--ds-paper-texture` (must use `mountPaperGrain()`).
- [ ] Zero bare `scrollbar-width` combined globally with `::-webkit-scrollbar`.
- [ ] Zero `HALFTONE.size >= 0.4`.
- [ ] Zero `preserveAspectRatio="none"` on radial/Gann instruments.
- [ ] Zero `⌘K` / keyboard shortcut open animations (`transition: none`).

---

## 4. Capturing New Taste Rules (`learn-taste` Protocol)

When the user makes a visual/interaction correction during a session:
1. **Quote the exact correction or code diff** (only user-confirmed taste — never invent rules).
2. **State the rule concretely** with Meridian token names, exact values, and CSS/TS scope.
3. **Record the *Why*** (mark *inferred* and ask for confirmation if the user did not state a reason).
4. **Propose before writing**, then append to [`../../DESIGN.md`](../../DESIGN.md) under the matching section (`Surfaces`, `Color`, `Typography`, `Motion`, `Materiality`, `Plotter`, `Copy`).
5. **Convert matchable rules into checks** (lint/grep assertions) whenever possible.

---

## 5. Attribution

- **Emil Kowalski** ([`emilkowalski/skills`](https://github.com/emilkowalski/skills) — `emil-design-eng`, `learn-taste`): Review table format, Frequency Gate, and taste-capture methodology.
- **Evil Rabbit** ([Deimos / Design Zeitgeist](https://deimos.evilrabbit.com/)): Single-Ink archival restraint, monochrome signals, and Geist typography discipline.
- Full credits: [`../CREDITS.md`](../CREDITS.md).
