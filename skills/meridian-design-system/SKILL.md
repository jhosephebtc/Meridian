---
name: meridian-design-system
description: Core specification and routing skill for the MERIDIAN Design System (v1.5.0). Covers the 13 Single-Ink + Soft Chromatic surfaces, Dual-Mode (invisible B2C vs. technical Pro), Geist 3-voice typography, dual-radius geometry, contained organic palette, and 4-language i18n (PT/EN/ES/FR). Use when initializing Meridian tokens, theming across surfaces, pairing React Native + pure-CSS Web, or routing to specialized Meridian domain skills.
---

# MERIDIAN Design System (`v1.5.0`)

**Visual, Editorial, Navigational, Motion, Plotter SVG, HalfTone, and 100% TypeScript Generative System** for Web (pure CSS + Vite/React) and React Native / Expo.

> **Guiding Question:** *"Does this help navigators find their way?"* — Before building or reviewing any UI, also load [`../../DESIGN.md`](../../DESIGN.md) and [`../meridian-taste/SKILL.md`](../meridian-taste/SKILL.md).

---

## 1. Domain Skill Routing

| Domain | Skill | Primary Files |
| :--- | :--- | :--- |
| **Taste & UI Critique ("Habilidade de Gostos")** | [`meridian-taste`](../meridian-taste/SKILL.md) | `DESIGN.md` |
| **PaperGrain, HalfTone Shaders & Chrome** | [`meridian-paper-shaders`](../meridian-paper-shaders/SKILL.md) | `src/paper-grain.ts`, `src/halftone-mount.ts`, `src/page-enter.ts` |
| **Motion, Frequency Gate & Mobile-Native** | [`meridian-motion`](../meridian-motion/SKILL.md) | `src/tokens.ts`, `src/components.css`, `src/timeline.ts` |
| **Plotter SVG Blueprints & 81k Globe** | [`meridian-plotter-svg`](../meridian-plotter-svg/SKILL.md) | `src/plotter-svg.ts`, `src/historia-ambient-svg.ts`, `src/gann-app.ts` |
| **Generative Watercolor / Pencil / Crayon / Sumi-e** | [`meridian-atelier`](../meridian-atelier/SKILL.md) | `src/atelier-engine.ts` |
| **3-Column Archival Reader, Lifeline & Shelf** | [`meridian-editorial-archival`](../meridian-editorial-archival/SKILL.md) | `src/components.css`, `src/gann.css`, `gann.html`, `historia.html`, `manifesto.html` |
| **89 Tactile Line Components & shadcn Registry** | [`meridian-components`](../meridian-components/SKILL.md) | `src/component-catalog.ts`, `src/components-lab.ts`, `registry/meridian/*` |

---

## 2. Single-Ink Multi-Surface Engine (`13` Surfaces)

All rules, borders, subtle fills, and muted text derive dynamically from a single ink (`--ds-fg`) mixed over a paper ground (`--ds-bg`) via `color-mix(in srgb, var(--ds-fg) X%, ...)` in `src/tokens.css`, with pre-resolved RGBA fallbacks for React Native in `SURFACES` (`src/tokens.ts`).

### Official Spectrum (`SURFACE_SPECTRUM`)

| `data-surface` | Lineage | Ground `--ds-bg` | Ink `--ds-fg` | Contrast | Primary Role |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **`ivory`** *(default)* | Anthropic Research | `#FAF9F5` | `#141413` | `17.6:1 (AAA)` | B2C calm home, research, showcase |
| **`paper`** | Deimos Paper White | `#FFFFFF` | `#0A0A0A` | `19.8:1 (AAA)` | Printable dossiers, B2B reports |
| **`blush`** | Soft Chromatic | `#E8C4C0` | `#1A1414` | `9.8:1 (AAA)` | Cultural editions, HalfTone covers |
| **`apricot`** | Soft Chromatic | `#E8C8A8` | `#1A1612` | `10.0:1 (AAA)` | Solar & warm narrative covers |
| **`butter`** | Soft Chromatic | `#E8D9A8` | `#1A1810` | `10.1:1 (AAA)` | Warm editorial notes |
| **`sage`** | Soft Chromatic | `#B8C5A8` | `#141812` | `9.8:1 (AAA)` | Agro & environmental reading |
| **`mist`** | Soft Chromatic | `#C5D4CE` | `#141816` | `9.6:1 (AAA)` | Soft climate & atmosphere |
| **`aqua`** | Deimos Signature Aqua | `#A4CED0` | `#171614` | `10.4:1 (AAA)` | Climate, AQI, cartography |
| **`sky`** | Soft Chromatic | `#B0C8D6` | `#12161A` | `9.9:1 (AAA)` | Light cartography & weather |
| **`slate`** | Soft Chromatic | `#B5BFC9` | `#141618` | `9.7:1 (AAA)` | Finance & B2B dossiers |
| **`lilac`** | Soft Chromatic | `#C9C0D8` | `#16141A` | `9.7:1 (AAA)` | Narrative, voice & editorial covers |
| **`terracotta`** | Deimos Warm Terracotta | `#EDBB99` | `#171614` | `10.4:1 (AAA)` | Culture, Solar 3D, W.D. Gann archive |
| **`obsidian`** | Inverted + Obsidian Archive | `#0E0E0D` | `#FAF9F5` | `18.4:1 (AAA)` | Technical Pro terminal, dark reading |

### Derived `color-mix()` Tokens (`src/tokens.css`)
- `--ds-bg-tint-subtle`: `4.5%` `--ds-fg` on `--ds-bg`
- `--ds-bg-tint-muted`: `8.5%` `--ds-fg` on `--ds-bg`
- `--ds-bg-tint-active`: `12%` `--ds-fg` on `--ds-bg`
- `--ds-rule` / `--ds-border`: `9%` `--ds-fg` transparent (`1px` hairline)
- `--ds-rule-strong` / `--ds-border-strong`: `12%` `--ds-fg` transparent
- `--ds-chrome-bg`: `color-mix(in srgb, var(--ds-bg) 82%, transparent)`

### Contained Organic Palette & Signals
- Earthy accents (`--ds-organic-*`): `olive` (`#5E6E47`), `sky` (`#477085`), `coral` (`#B55A42`), `ochre` (`#9A7134`), `slate` (`#56606E`) — calibrated on `aqua`, `terracotta`, and `obsidian` for AAA/AA contrast. Use strictly for category tags, SVG chart series, status dots, and atelier pigments — never saturated page backgrounds.
- Verification signals (`--ds-signal-support`, `caution`, `refute`, `info`) support `[data-signals="monochrome"]`, collapsing all four to `--ds-fg` while keeping distinct SVG geometric shapes (`circle`, `triangle`, `diamond`, `square`).

---

## 3. Dual-Mode Architecture (`data-mode`)

| Dimension | `data-mode="invisible"` (B2C) | `data-mode="technical"` (Pro / Audit) |
| :--- | :--- | :--- |
| **Density & Padding** | `--ds-density: 1`, `--ds-card-pad: 24px`, `body-lg` prose | `--ds-density: 0.82` (CSS) / `0.88` (TS `MODE_PROFILES`), `--ds-card-pad: 14px`, `body-md` prose |
| **Information Hierarchy** | Physical metrics (AQI, temp, pollen) foregrounded; natural copy | 4 deterministic layers (Astronomy, Houses/Dignities, Gann/Jenkins, Ledger) + Tier A/B/C |
| **Conditional DOM** | `[data-tech-only]` hidden | `[data-b2c-only]` hidden; `.eyebrow` tightens to uppercase mono |

---

## 4. Geist 3-Voice Typography & Dual-Radius

- Local `.woff2` fonts in `assets/fonts/` loaded by `src/fonts.css`:
  - **Display Serif** (`"Geist Serif"`): `mega`, `h1`, `h2`, `h3`, `h4`, `lead`, `metric` — **always weight `400`** with `font-synthesis-weight: none`.
  - **Functional Sans** (`"Geist"`): `body-lg` (`1.03125rem`), `body-md` (`0.9375rem`), `body-sm` (`0.84375rem`), `ui-md` (`0.8125rem` at `500`). Max prose measure: `65ch` (`--ds-max-prose`).
  - **Technical Mono** (`"Geist Mono"`): eyebrows (`0.6875rem`, `+0.06em`), tables, degrees, coordinates — **always `font-variant-numeric: tabular-nums`**.
- **Optical kerning:** `font-kerning: normal; font-feature-settings: "kern" 1, "liga" 1, "calt" 1;`.
- **Dual-Radius (`RADII`):** `pill: 9999`, `squircle: 8`, `plate: 4`, `card: 12`, `none: 0`.

---

## 5. Quick Boot Pattern & 4-Language i18n

```html
<html lang="pt-BR" data-surface="ivory" data-mode="invisible" data-grain="editorial" data-grain-size="medium" data-signals="chromatic">
<link rel="stylesheet" href="./src/tokens.css" />
<link rel="stylesheet" href="./src/components.css" />
```

```ts
import {
  mountPaperGrain,
  bootPaperGrainExtras,
  markPageReady,
  initI18n,
  SURFACES,
  toCssVariables,
} from '@meridian/design-system';

initI18n(); // PT · EN · ES · FR switcher in [data-lang-slot]
mountPaperGrain();
bootPaperGrainExtras();
markPageReady();
```

---

## 6. Lineage & Attributions

- **Evil Rabbit — Deimos / Design Zeitgeist** ([deimos.evilrabbit.com](https://deimos.evilrabbit.com/)) & **Geist Font Family**: Single-Ink `color-mix()` archival engine, multi-surface paper aesthetic, monochrome signals, and Geist typography.
- **Emil Kowalski** ([`emilkowalski/skills`](https://github.com/emilkowalski/skills)): Frequency Gate, motion curves, gesture physics, and taste engineering.
- **Pasquale Vitiello** ([`pasqualevitiello/plotter`](https://github.com/pasqualevitiello/plotter)): 13-role blueprint SVG grammar.
- **Anthropic Research**, **Paper Design**, and **Jhosephe UI**: Warm ivory editorial cadence, WebGL Halftone Dots, and 89 tactile line components.
- Full breakdown: [`../CREDITS.md`](../CREDITS.md).
