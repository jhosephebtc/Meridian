# MERIDIAN Design System — Complete Technical Specification (`v1.5.0`)

**Architectural Philosophy:** *Single-Ink Multi-Surface Editorial* — PaperGrain via HTML5 `<canvas>`, HalfTone WebGL dots via `@paper-design/shaders`, asymmetric motion governed by the **Frequency Gate**, flat editable **Plotter SVG** blueprints (`data-plotter-role`) paired with interactive **Hairline 2:1 isometric solids**, an orthographic **81k Globe**, **90 tactile line components** with copyable AI install prompts, and a **100% TypeScript generative watercolor, graphite, wax-crayon & sumi-e engine** (zero `p5.js`).

> Governance files: [`DESIGN.md`](./DESIGN.md) (taste & engineering invariants) · [`AGENTS.md`](./AGENTS.md) (agent skill routing) · [`skills/`](./skills/) (11 domain skills including [`meridian-taste`](./skills/meridian-taste/SKILL.md), [`meridian-hairline-figure`](./skills/meridian-hairline-figure/SKILL.md), and [`meridian-gridlines`](./skills/meridian-gridlines/SKILL.md), and [`meridian-layout-chrome`](./skills/meridian-layout-chrome/SKILL.md)) · [`skills/CREDITS.md`](./skills/CREDITS.md) (full external attribution).

---

## 1. Visual Architecture & The 40 Single-Ink Surfaces

Every color derives dynamically from two base CSS variables — paper background `--ds-bg` and single ink `--ds-fg` — using native CSS `color-mix(in srgb, var(--ds-fg) ...)`:

- `--ds-rule` / `--ds-border`: `color-mix(in srgb, var(--ds-fg) 9%, transparent)`
- `--ds-rule-strong` / `--ds-border-strong`: `color-mix(in srgb, var(--ds-fg) 12%, transparent)`
- `--ds-bg-tint-subtle`: `color-mix(in srgb, var(--ds-fg) 4.5%, transparent)`
- `--ds-bg-tint-muted`: `color-mix(in srgb, var(--ds-fg) 8.5%, transparent)`
- `--ds-bg-tint-active`: `color-mix(in srgb, var(--ds-fg) 12%, transparent)`
- `--ds-chrome-bg`: `color-mix(in srgb, var(--ds-bg) 82%, transparent)`

Switching `data-surface="..."` re-themes every divider, badge, focus ring, scrollbar hairline, SVG trace, and canvas palette atomically without duplicating color CSS across 40 themes.

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
- **Hairline 2:1 Isometric Companion (`skills/meridian-hairline-figure/SKILL.md`)**: Adapted from **Lucas Marques's** [`lucasmarkes/hairline`](https://github.com/lucasmarkes/hairline) (`hairline.lucasmarkes.com/skills`) to work alongside Plotter: 400×320 2:1 isometric rounded solids, opaque `var(--ds-bg)` back-to-front painter occlusion, zero vertical box corners, 1 dim inner crease, hit testing strictly on rest pose (`01 · hit`), and dual clock (`700ms cubic-bezier(0.32, 0.72, 0, 1)` discrete / spring `k 100 · c 18` pointer).
- **Gridlines Alignment Audit (`skills/meridian-gridlines/SKILL.md`, `probe.js`)**: Adapted from **Pritam's** [`pritamux/gridlines`](https://github.com/pritamux/gridlines) (citing **Karri Saarinen** & **Apple HIG Layout**) to verify ink edges and vertical row centers across topbars, menus, sidebars, toolbars, cards, and tables at `1440px` and `390px`.
- **Generative Atelier (`src/atelier-engine.ts`)**: Zero-dependency strict TypeScript painterly engine (`< 0.7ms/frame`) implementing multi-layer wet-on-wet watercolor washes (`watercolorWash` + wet edge pooling), graphite pencils (`2H`/`4B` hatching), wax crayons (`waxCrayon`), and sumi-e ink (`inkBrush`), with viewport culling and instant static finish under `prefers-reduced-motion: reduce`.

---

## 7. Archival 3-Col Reader, Components Lab (90) & Prompts

- **Dual Mode (`data-mode`)**: `invisible` (calm B2C cards & plain prose) vs. `technical` (dense tabular ledger, Tier A/B/C badges, degree offsets).
- **3-Column Reader**: `152px` sticky TOC | `65ch` prose with clickable dotted `.ds-claim` citations | `264px` aside plate + *At a glance* card + interactive `Timeline` (`src/timeline.ts`) + `preserve-3d` dossier shelf.
- **Components Lab (`components.html`, `src/component-catalog.ts`, `src/components-lab.ts`)**: **90 components** across 11 categories, live interactive demos (including `timeline` & `hairline-isometric`), shadcn JSON manifests in [`public/r/`](./public/r/registry.json) built by `scripts/build-registry.mjs`, and **per-component AI Install Prompts** (`buildInstallPrompt` / `buildSystemInstallPrompt`, localized in PT/EN/ES/FR) copyable right from every component card.

---

## 8. Agent Governance & External Credits

- **Layout, Header & Color Studio (`skills/meridian-layout-chrome/SKILL.md`)**: one `1440px` shell (`57.6 → 1382.4px`; `20 → 370px` at `390px`) across all 6 pages, `1fr auto 1fr` masthead, Preferences popover, top-right hamburger below `1120px`, 40 surfaces × 28 inks × 8 roles with `10–100%` transparency and a `≥ 4.5:1` legibility rule for custom text colors, and `≤ 420ms` `translateY` page/tab entrances.

- **Repository Governance:** [`DESIGN.md`](./DESIGN.md) · [`AGENTS.md`](./AGENTS.md) · [`skills/meridian-taste/SKILL.md`](./skills/meridian-taste/SKILL.md) (dedicated taste skill) · 10 domain skills under [`skills/`](./skills/) (including [`meridian-hairline-figure`](./skills/meridian-hairline-figure/SKILL.md) & [`meridian-gridlines`](./skills/meridian-gridlines/SKILL.md)).
- **External Craft Attributed:** **Evil Rabbit** ([Deimos / Design Zeitgeist](https://deimos.evilrabbit.com/) & [Geist](https://vercel.com/font)), **Emil Kowalski** ([`emilkowalski/skills`](https://github.com/emilkowalski/skills)), **Pasquale Vitiello** ([`pasqualevitiello/plotter`](https://github.com/pasqualevitiello/plotter)), **Lucas Marques** ([`lucasmarkes/hairline`](https://github.com/lucasmarkes/hairline) · [skills](https://hairline.lucasmarkes.com/skills)), **Pritam** ([`pritamux/gridlines`](https://github.com/pritamux/gridlines) + Karri Saarinen & Apple HIG), **Paper Design** ([`@paper-design/shaders`](https://shaders.paper.design/)), **Jhosephe UI** ([`jhosephe.vercel.app`](https://jhosephe.vercel.app/)), **Anthropic Research**, **Tyler Hobbs / `p5.brush`**, and **shadcn/ui** — documented in detail in [`skills/CREDITS.md`](./skills/CREDITS.md).
