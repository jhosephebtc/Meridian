---
name: meridian-design-system
description: Core specification and routing skill for the MERIDIAN Design System (v1.5.0). Covers the 40 Single-Ink + Soft Chromatic surfaces, Dual-Mode (invisible B2C vs. technical Pro), Geist 3-voice typography, dual-radius geometry, contained organic palette, and 4-language i18n (PT/EN/ES/FR). Use when initializing Meridian tokens, theming across surfaces, pairing React Native + pure-CSS Web, or routing to specialized Meridian domain skills.
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
| **Page Grid, Masthead/Header, Color Studio & Entrance Motion** | [`meridian-layout-chrome`](../meridian-layout-chrome/SKILL.md) | `src/site-chrome.css`, `src/site-chrome.ts`, `src/theme-sync.ts`, `src/page-enter.ts` |
| **89 Tactile Line Components & shadcn Registry** | [`meridian-components`](../meridian-components/SKILL.md) | `src/component-catalog.ts`, `src/components-lab.ts`, `registry/meridian/*` |

---

## 2. Single-Ink Multi-Surface Engine (`40` Surfaces)

All rules, borders, subtle fills, and muted text derive dynamically from a single ink (`--ds-fg`) mixed over a paper ground (`--ds-bg`) via `color-mix(in srgb, var(--ds-fg) X%, ...)` in `src/tokens.css`, with pre-resolved RGBA fallbacks for React Native in `SURFACES` (`src/tokens.ts`).

### Official Spectrum (`SURFACE_SPECTRUM` — 40 surfaces)

Pair any surface with the **28 type inks** and **8 color/button roles** from `src/theme-sync.ts` (`primary`, `secondary`, `tertiary`, `accent`, `buttonPrimaryBg/Fg`, `buttonSecondaryFg/Bg`; transparency `10–100%` per role). Custom text colors must stay **≥ 4.5:1** against the active ground — see [`meridian-layout-chrome`](../meridian-layout-chrome/SKILL.md).

| ID | Label | Scheme | Ground `--ds-bg` | Ink `--ds-fg` | Contrast | Recommended for |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| `ivory` | Ivory Editorial | light | `#FAF9F5` | `#141413` | `17.5:1 (AAA)` | Padrão universal B2C, pesquisa, leitura calma e vitrines editoriais |
| `alabaster` | Alabaster Silk | light | `#F6F5F0` | `#131312` | `17.0:1 (AAA)` | Galeria editorial quente estilo Milor, catálogos de arte e leitura longa |
| `paper` | Paper White | light | `#FFFFFF` | `#0A0A0A` | `19.8:1 (AAA)` | Dossiês auditáveis, Raio-X de Endereço, PDFs, relatórios B2B e documentação |
| `pearl` | Cool Pearl | light | `#EEF0F2` | `#111417` | `16.2:1 (AAA)` | Papel suíço frio de altíssima precisão técnica, tabelas e engenharia |
| `linen` | Raw Linen | light | `#EFECE4` | `#161513` | `15.5:1 (AAA)` | Linho cru belga não-alvejado para ensaios, arquitetura e monografias |
| `parchment` | Vellum Parchment | light | `#ECE5D5` | `#191612` | `14.4:1 (AAA)` | Pergaminho velino arquival para manuscritos, história e cartografia clássica |
| `oat` | Warm Oat | light | `#E4DDD0` | `#181613` | `13.4:1 (AAA)` | Papel aveia orgânico com calor tátil e contraste descansado |
| `sand` | Dune Sand | light | `#DDD2BE` | `#1A1611` | `12.0:1 (AAA)` | Calcário e travertino mediterrâneo para dossiês solares e arquitetura |
| `ash` | Pale Ash | light | `#E2DFD8` | `#141413` | `13.9:1 (AAA)` | Papel cinza claro, neutro, ao lado do marfim |
| `blush` | Soft Blush | light | `#E8C4C0` | `#1A1414` | `11.3:1 (AAA)` | Espectro suave, dossiês culturais e capas HalfTone |
| `rosewater` | Rosewater Clay | light | `#E5CFCB` | `#1B1414` | `12.2:1 (AAA)` | Argila rosada mineral contida para editoriais de cultura e design |
| `apricot` | Soft Apricot | light | `#E8C8A8` | `#1A1612` | `11.4:1 (AAA)` | Espectro suave, solar e capas quentes |
| `terracotta` | Warm Terracotta | light | `#EDBB99` | `#171614` | `10.5:1 (AAA)` | Cultura Pop, Social/Voz, Jornal 3 Min, Solar 3D, Biografias & Histórias |
| `butter` | Soft Butter | light | `#E8D9A8` | `#1A1810` | `12.6:1 (AAA)` | Espectro suave, solar e notas editoriais quentes |
| `chamomile` | Chamomile Cream | light | `#EAE0BE` | `#191710` | `13.6:1 (AAA)` | Creme botânico suave para leitura diurna acolhedora e notas |
| `clay` | Field Ochre | light | `#B39A6E` | `#1A1610` | `6.7:1 (AA)` | Ocre médio terroso, sem o amarelo do Soft Butter |
| `sage` | Soft Sage | light | `#B8C5A8` | `#141812` | `9.9:1 (AAA)` | Espectro suave, agro e leitura ambiental |
| `celadon` | Celadon Glaze | light | `#C7D8CC` | `#131915` | `12.0:1 (AAA)` | Cerâmica celadon pálida para botânica, ecologia e cartografia serena |
| `mist` | Soft Mist | light | `#C5D4CE` | `#141816` | `11.7:1 (AAA)` | Espectro suave, clima e leitura ambiental |
| `aqua` | Signature Aqua | light | `#A4CED0` | `#171614` | `10.6:1 (AAA)` | Ambiente, Clima, Qualidade do Ar, AgroCiclos, Logística e Cartografia |
| `sky` | Soft Sky | light | `#B0C8D6` | `#12161A` | `10.5:1 (AAA)` | Espectro suave, clima e cartografia leve |
| `fjord` | Fjord Mist | light | `#BECAD4` | `#12171B` | `10.8:1 (AAA)` | Azul-ardósia nórdico para navegação oceânica, clima e observatórios |
| `slate` | Soft Slate | light | `#B5BFC9` | `#141618` | `9.7:1 (AAA)` | Espectro suave, finanças e dossiês B2B |
| `lilac` | Soft Lilac | light | `#C9C0D8` | `#16141A` | `10.5:1 (AAA)` | Espectro suave, cultura e capas editoriais |
| `stone` | Stone Gray | light | `#8E8B84` | `#141413` | `5.4:1 (AA)` | Cinza médio neutro, distinto do Soft Slate |
| `charcoal` | Charcoal | dark | `#3E3C38` | `#F4F2EC` | `9.8:1 (AAA)` | Carvão mais claro que o Obsidian Dark |
| `umber` | Deep Ochre | dark | `#4E3E24` | `#F7F3EA` | `9.3:1 (AAA)` | Ocre profundo, terra, sem folha de ouro |
| `mocha` | Mocha Ink | dark | `#3A2A22` | `#F6F1EC` | `12.2:1 (AAA)` | Marrom café profundo, quente, sem laranja |
| `bordeaux` | Bordeaux Noir | dark | `#241518` | `#F6F0F1` | `15.6:1 (AAA)` | Vinho oxblood noturno de alta costura editorial e ensaios literários |
| `pine` | Pine Ink | dark | `#1E3328` | `#F2F6F3` | `12.3:1 (AAA)` | Verde profundo, tinta, além do Soft Sage |
| `petrol` | Deep Petrol | dark | `#132429` | `#EFF5F6` | `14.5:1 (AAA)` | Tinta petróleo oceânica profunda para telemetria marítima e dados densos |
| `navy` | Navy Ink | dark | `#1C3142` | `#F3F6F6` | `12.3:1 (AAA)` | Tinta azul-marinho dessaturada, alternativa ao Obsidian |
| `indigo` | Midnight Indigo | dark | `#151A26` | `#F1F4F8` | `15.8:1 (AAA)` | Atlas astronômico da meia-noite e terminais de ciclos planetários |
| `prune` | Muted Eggplant | dark | `#1B171D` | `#F4F2F5` | `15.9:1 (AAA)` | Ameixa mineral fechada e dessaturada para dossiês noturnos |
| `espresso` | Smoked Umber | dark | `#1D1815` | `#F6F2EE` | `15.8:1 (AAA)` | Sepia defumado dessaturado quase preto com calor de arquivo |
| `graphite` | Graphite Mute | dark | `#1E1D1B` | `#F5F3EE` | `15.2:1 (AAA)` | Grafite mineral dessaturado próximo ao preto com calor neutro |
| `moss` | Moss Shadow | dark | `#171C19` | `#F2F5F3` | `15.7:1 (AAA)` | Sombra florestal dessaturada próxima ao preto para leitura calma |
| `basalt` | Basalt Noir | dark | `#191B1D` | `#F3F4F4` | `15.7:1 (AAA)` | Fundo quase preto frio e dessaturado (ardósia noturna) |
| `obsidian` | Obsidian Dark | dark | `#0E0E0D` | `#FAF9F5` | `18.3:1 (AAA)` | Terminal Gann-Jenkins, Efemérides, Gráficos SVG Noturnos e Pro Desk |
| `velvet` | Carbon Pitch | dark | `#080808` | `#F7F6F2` | `18.5:1 (AAA)` | Preto galeria OLED de máximo contraste para fotografia e placas luminosas |

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
