---
name: meridian-motion
description: Interaction, timing, and physics specification for Meridian — The Animation Frequency Gate (0ms shortcuts), 6 official bezier curves (zero ease-in), Clip-Path Seamless Tabs, Origin-Aware Popovers, Skip-Delay Tooltips, Asymmetric Hold-to-Confirm, Interruptible Toasts, 1:1 Drag + Momentum/Rubberband (Timeline & Lifeline), and React Native / Expo Reanimated 4 + Haptics parity. Use when authoring or auditing any animation, gesture, or mobile-native rule.
---

# Meridian Motion & Interaction Physics (`meridian-motion`)

Built on **Emil Kowalski's** [`emilkowalski/skills`](https://github.com/emilkowalski/skills) design-engineering principles and **Apple Fluid Interfaces**, tokenized in `src/tokens.ts` (`MOTION`, `projectMomentum`, `rubberband`), `src/tokens.css`, `src/components.css`, and `src/timeline.ts`.

---

## 1. The Animation Frequency Gate

Decide **whether** an element may animate based on daily repetition before choosing timing:

| Frequency (`MOTION.frequencyGate`) | Examples | Decision | Token / Duration |
| :--- | :--- | :--- | :--- |
| **`highFrequency100PerDay`** | `⌘K` / `/` Command Palette, keyboard shortcuts, root tab switches | **ZERO animation** (`none`) | `0ms` (`transition: none`) |
| **`mediumFrequency10PerDay`** | Button press (`:active`), link hover, row focus | Minimal micro-feedback | `100–160ms` (`press: 120`, `fast: 160`) |
| **`occasional`** | Popovers, selects, clip-path tabs, drawers, sheets, toasts | Functional interruptible motion | `220ms` base · `380ms` drawer · `400ms` toast |
| **`rareFirstTime`** | 3D dossier opening, editorial plate reveal, onboarding milestones | Delight budget | `560ms` reveal · `800ms` volume |

---

## 2. Official Curves & Rules (`MOTION.bezier`)

**Zero `ease-in` on UI interactions. Zero `transition: all`. Zero `scale(0)` entrances.**

| CSS Variable | TS Key (`MOTION.bezier`) | Cubic Bezier | Role |
| :--- | :--- | :--- | :--- |
| `--ds-ease-out` | `easeOut` | `cubic-bezier(0.23, 1, 0.32, 1)` | Entrances, exits, press, popovers, tooltips |
| `--ds-ease-in-out` | `easeInOut` | `cubic-bezier(0.77, 0, 0.175, 1)` | On-screen morphs & `.ds-cliptabs-overlay` slide |
| `--ds-ease-drawer` | `drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | Drawers, navigation rails, bottom sheets |
| `--ds-ease-snappy` | `snappy` | `cubic-bezier(0.85, 0, 0, 1)` | Fast selection indicators |
| `--ds-ease-editorial` | `editorial` | `cubic-bezier(0.22, 1, 0.36, 1)` | Plate reveals & soft image zoom (`1.018`) |
| `--ds-ease-volume` | `volume` | `cubic-bezier(0.22, 0.8, 0.25, 1)` | 3D dossier shelf cover rotation |

---

## 3. Core Interaction Patterns Implemented

1. **Press & Fine-Pointer Hover:**
   - `:active` applies `transform: scale(var(--ds-press-scale, 0.97))` in `120ms var(--ds-ease-out)`.
   - Every `:hover` rule is strictly wrapped in `@media (hover: hover) and (pointer: fine)`.
2. **Clip-Path Seamless Segmented Tabs (`.ds-cliptabs`):**
   - Base track + inverted `.ds-cliptabs-overlay` clipped via `clip-path: inset(0 R% 0 L% round 9999px)` transitioning with `--ds-ease-in-out`. Labels invert color subpixel-for-subpixel.
   - Measure button widths dynamically (`syncClipTabs` in `src/preview-app.ts` / `updateClipTabs` in `index.html`), and re-sync on `resize` and `meridian:lang` i18n switches!
3. **Origin-Aware Popovers:**
   - Grow from `scale(var(--ds-enter-scale, 0.96))` + `opacity: 0` anchored to their trigger's `transform-origin`. Never `scale(0)`.
4. **Skip-Delay Tooltips:**
   - First tooltip waits `~290–320ms`; moving to sibling triggers flips `[data-instant="true"]` for `0ms` instant switching (`380ms` group cooldown).
5. **Blur Crossfade (`--ds-blur-bridge: 2px`):**
   - Smooths text/state swaps on mode badges and readouts without layout shift.
6. **Asymmetric Hold-to-Confirm:**
   - `clip-path` fill advances **`linear 1.4s`** while held (honest time perception) and retracts in **`180ms ease-out`** on early pointer release.
7. **Interruptible Toasts (`.ds-toast` / `.lab-toast`):**
   - Always use CSS `transition` (never `@keyframes`), entering and exiting along the same axis, pausing auto-dismiss on `pointerenter`.
8. **1:1 Pointer Drag + Momentum + Rubberband (`src/timeline.ts`, `src/tokens.ts`):**
   - Track phase: `setPointerCapture` + direct `scrollLeft` / `transform` write (no CSS transitions/easing while `data-dragging="true"`).
   - Release phase: exponential friction (`v *= 0.92` per 60Hz frame in `createTimeline`) or `projectMomentum(velocityPxPerSec, 0.998)` + `rubberband(overshoot, dimension, 0.55)`.

---

## 4. React Native / Expo & Mobile-Native Web Parity (`MOTION.springs`, `MOTION.haptics`)

- **UI Thread always:** Use `react-native-reanimated` (Reanimated 4) + `react-native-gesture-handler`. Never `PanResponder` and never `setState` inside scroll/drag callbacks.
- **Springs (`MOTION.springs`):**
  - `settle`: `{ duration: 400, dampingRatio: 1.0, overshootClamping: true }`
  - `momentum`: `{ duration: 400, dampingRatio: 0.8, overshootClamping: false }`
  - `sheet`: `{ duration: 300, dampingRatio: 0.8, overshootClamping: false }`
- **Haptics (`MOTION.haptics`):** `selection` (sliders/ticks), `impactLight` (snap), `impactMedium` (hold commit), `notificationSuccess`, `notificationError` — fired on the same frame as visual feedback.
- **Mobile-Native Web Baseline (`src/tokens.css`):** `100dvh` shells, `100svh` heroes, `minHitTarget: 44`, `-webkit-tap-highlight-color: transparent`, `touch-action: manipulation` on buttons, `font-size: 16px` under `@media (pointer: coarse)` on `input, textarea, select`, and `env(safe-area-inset-*)`.
- **Reduced Motion:** Under `@media (prefers-reduced-motion: reduce)`, `--ds-press-scale: 1`, `--ds-enter-scale: 1`, `--ds-blur-bridge: 0px`, and `createTimeline` reveals immediately.

---

## 5. Attribution

- **Emil Kowalski** ([`emilkowalski/skills`](https://github.com/emilkowalski/skills) · [animations.dev](https://animations.dev)): `animate`, `animate-expo`, `animation-performance`, `choreograph`, `gestures`, `mobile-native`, `ask-sonner`, and `apple-design` principles.
- Full credits: [`../CREDITS.md`](../CREDITS.md).
