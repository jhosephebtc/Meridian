# MERIDIAN Design System (`v1.5.0`)

**Single-Ink Multi-Surface Editorial System** — **PaperGrain** via native HTML5 `<canvas>`, **HalfTone** WebGL dots via `@paper-design/shaders`, asymmetric motion governance (**Frequency Gate**), flat editable **Plotter SVG** blueprints (`data-plotter-role`) paired with interactive **Hairline 2:1 isometric solids**, container **Gridlines** ink-edge alignment auditing (`probe.js`), an orthographic **81k Globe**, **90 tactile line components** with copyable AI install prompts (`public/r/registry.json`), **11 modular agent skills** (including **`meridian-taste`**), and a **100% TypeScript generative watercolor, graphite, wax-crayon & sumi-e engine** (zero `p5.js`).

> ⭐ **Like Meridian?** [**Star `jhosephebtc/Meridian` on GitHub**](https://github.com/jhosephebtc/Meridian) — every page header includes a live GitHub Star CTA.

---

## Live Applications (Vercel Production)

- **Design System & Showcase:** [`https://meridian-olive-phi.vercel.app/index.html`](https://meridian-olive-phi.vercel.app/index.html)
- **Components Lab (90 Components + AI Install Prompts):** [`https://meridian-olive-phi.vercel.app/components.html`](https://meridian-olive-phi.vercel.app/components.html)
- **Meridian Studio (Interactive 3-View Workspace Preview):** [`https://meridian-olive-phi.vercel.app/preview.html`](https://meridian-olive-phi.vercel.app/preview.html)
- **Editorial Manifesto:** [`https://meridian-olive-phi.vercel.app/manifesto.html`](https://meridian-olive-phi.vercel.app/manifesto.html)
- **O Farol e o Meridiano (Archival Essay & PaperGrain):** [`https://meridian-olive-phi.vercel.app/historia.html`](https://meridian-olive-phi.vercel.app/historia.html)
- **Dossiê W.D. Gann (HalfTone + Plotter D2):** [`https://meridian-olive-phi.vercel.app/gann.html`](https://meridian-olive-phi.vercel.app/gann.html)
- **Complete Technical Specification:** [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)
- **Agent Taste & Engineering Rules:** [`DESIGN.md`](./DESIGN.md) · [`AGENTS.md`](./AGENTS.md) · [`skills/CREDITS.md`](./skills/CREDITS.md)

---

## Agent Skills & Taste System (`skills/` + `DESIGN.md` + `AGENTS.md`)

Meridian ships a structured, verifiable skill kit grounded in everything actually implemented in the codebase, plus a dedicated taste & critique skill (**`meridian-taste`**).

```bash
npx skills add jhosephebtc/Meridian
# or target a single skill, e.g.:
npx skills add jhosephebtc/Meridian --skill meridian-taste
```

| Skill | Focus | Primary Source Files |
| :--- | :--- | :--- |
| [**`meridian-taste`**](./skills/meridian-taste/SKILL.md) | **Dedicated taste & critique skill:** Lighthouse Criterion, 10 pillars of taste, `Before / After / Why` review protocol, anti-slop checklist, and continuous `learn-taste` capture | `DESIGN.md`, `DESIGN_SYSTEM.md` |
| [`meridian-design-system`](./skills/meridian-design-system/SKILL.md) | Single-Ink `color-mix()` (`9%` / `12%`), 40 surfaces, Geist 3-voice typography (`Geist`, `Geist Serif`, `Geist Mono`), Dual-Radius, `pt/en/es/fr` i18n | `src/tokens.css`, `src/tokens.ts`, `src/fonts.css`, `src/i18n.ts` |
| [`meridian-paper-shaders`](./skills/meridian-paper-shaders/SKILL.md) | Canvas PaperGrain (`opacity`, `dust`, `scratch`, `double`), `@paper-design/shaders` HalfTone (`u_size < 0.2`), Chromium hairline `2px` scrollbars, `.ds-burger` → `X`, `.ds-page-veil` | `src/paper-grain.ts`, `src/halftone-mount.ts`, `src/page-enter.ts` |
| [`meridian-motion`](./skills/meridian-motion/SKILL.md) | Animation Frequency Gate (`0ms` `⌘K`), 6 easing curves (zero `ease-in`, zero `transition: all`), clip-path tabs, asymmetric Hold (`1.4s / 180ms`), 1:1 drag + `projectMomentum`, RN Reanimated 4 + Haptics | `src/tokens.ts`, `src/components.css`, `src/timeline.ts` |
| [`meridian-plotter-svg`](./skills/meridian-plotter-svg/SKILL.md) | 13 semantic `data-plotter-role` blueprint layers, `fill="none"` discipline, didactic isolation, 81k orthographic globe & Gann 1:1 instruments | `src/plotter-svg.ts`, `src/historia-ambient-svg.ts`, `src/gann-app.ts` |
| [`meridian-hairline-figure`](./skills/meridian-hairline-figure/SKILL.md) | **Plotter companion:** interactive 2:1 isometric rounded solids, 10 Hairline rules (rest-pose hit testing, back-to-front opaque occlusion, quiet wordless frames, SVG adoption) | `skills/meridian-hairline-figure/SKILL.md`, `index.html` (`#svg-viz`) |
| [`meridian-gridlines`](./skills/meridian-gridlines/SKILL.md) | Container ink-edge & center-line alignment pass via [`probe.js`](./skills/meridian-gridlines/probe.js) at `1440px` and `390px` | `skills/meridian-gridlines/SKILL.md`, `skills/meridian-gridlines/probe.js` |
| [`meridian-layout-chrome`](./skills/meridian-layout-chrome/SKILL.md) | **Grid, header & color studio:** unified `1440px` shell, `1fr auto 1fr` masthead, Preferences popover, top-right hamburger `< 1120px`, 40 surfaces × 28 inks × 8 roles with transparency sliders, **≥ 4.5:1 legibility rule** for custom ink colors, calm page/tab entrance motion | `src/site-chrome.css`, `src/site-chrome.ts`, `src/theme-sync.ts`, `src/page-enter.ts` |
| [`meridian-atelier`](./skills/meridian-atelier/SKILL.md) | Zero-`p5.js` strict TypeScript watercolor wash, graphite `2H/4B`, wax crayon & sumi-e engine (`< 0.7ms/frame`) | `src/atelier-engine.ts` |
| [`meridian-editorial-archival`](./skills/meridian-editorial-archival/SKILL.md) | 3-column archival reader (`152px` TOC · `65ch` prose · `264px` aside), clickable claims, `Lifeline` / `Timeline`, `preserve-3d` shelf, dual chrome | `src/components.css`, `src/gann.css`, `gann.html`, `historia.html`, `manifesto.html` |
| [`meridian-components`](./skills/meridian-components/SKILL.md) | 90 tactile SVG-line components, `public/r/` shadcn registry manifests, interactive demos & per-component AI install prompts | `src/component-catalog.ts`, `src/components-lab.ts`, `registry/meridian/`, `scripts/build-registry.mjs` |

---

## Components Lab & Per-Component Install Prompts (90 Components)

[`components.html`](https://meridian-olive-phi.vercel.app/components.html) documents all **90 components** across 11 categories (`controls`, `inputs`, `overlays`, `charts`, `surfaces`, `navigation`, `instruments`, `tables`, `feedback`, `astronomy`, `weather`) with live Single-Ink demos across all 40 surfaces.

Every component card includes:
- **Live Interactive Demo** (including the interactive **`timeline`** component powered by `createTimeline` from `src/timeline.ts`).
- **One-Click shadcn CLI Install** (`npx shadcn@latest add https://meridian-olive-phi.vercel.app/r/<id>.json`).
- **Per-Component Prompt Section** (`Copiar prompt` + expand/collapse preview) containing a self-contained, component-specific prompt generated by `buildInstallPrompt()` in `src/component-catalog.ts` (localized in **PT / EN / ES / FR**) covering prerequisites, CLI install command, token usage, and `DESIGN.md` taste invariants (`0ms` high-frequency gate, `1px` `color-mix()` hairlines, zero `ease-in`).

---

## The 40 Single-Ink Surfaces

Every color token derives dynamically from a paper background (`--ds-bg`) and a single ink (`--ds-fg`) using `color-mix(in srgb, var(--ds-fg) ...)`:

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

---

## Attribution, External Skills & Design References

Meridian is built with explicit respect and gratitude toward the creators whose open skills, design systems, and research shaped this repository (full inventory in [`skills/CREDITS.md`](./skills/CREDITS.md)):

| Source / Author | Link | What Meridian Uses & Credits |
| :--- | :--- | :--- |
| **Evil Rabbit — Deimos (Design Zeitgeist) & Geist** | [`deimos.evilrabbit.com`](https://deimos.evilrabbit.com/) · [`vercel.com/font`](https://vercel.com/font) | Reference design architecture for the Single-Ink `color-mix()` engine, archival surfaces (*Paper White*, *Signature Aqua*, *Warm Terracotta*, *Obsidian Dark*), 3-column encyclopedic reader (`152px · 65ch · 264px`), Tier A–C claim citations, `Lifeline` chronology, `preserve-3d` dossier shelf, monochrome signals, and **Geist / Geist Serif / Geist Mono** variable fonts. |
| **Emil Kowalski (`emilkowalski/skills`)** | [`github.com/emilkowalski/skills`](https://github.com/emilkowalski/skills) · [`animations.dev`](https://animations.dev/) | Skill design & physics behind `meridian-motion` and `meridian-taste`: Animation Frequency Gate (`0ms` `⌘K`), custom easing curves (zero `ease-in`), clip-path seamless tabs, origin-aware popovers, skip-delay tooltips (`320ms → 0ms`), asymmetric hold-to-confirm (`1.4s / 180ms`), Vaul/Sonner interruptible patterns, 1:1 pointer momentum/rubberbanding, React Native + Haptics parity, `Before/After/Why` reviews, and `learn-taste` discipline. |
| **Pasquale Vitiello (`pasqualevitiello/plotter`)** | [`github.com/pasqualevitiello/plotter`](https://github.com/pasqualevitiello/plotter) | Architectural SVG grammar adopted in `src/plotter-svg.ts` & `meridian-plotter-svg`: 1 ink (`currentColor`), 1 hairline thickness, 13 `data-plotter-role` layers, `fill="none"`, open 45° arrowheads, `-45°` hatch, and didactic role isolation (`data-plotter-isolate`). |
| **Lucas Marques (`lucasmarkes/hairline`)** | [`hairline.lucasmarkes.com/skills`](https://hairline.lucasmarkes.com/skills) · [`github.com/lucasmarkes/hairline`](https://github.com/lucasmarkes/hairline) | Companion 2:1 isometric SVG rules (`hairline-create` & `hairline-adopt`, MIT) powering `meridian-hairline-figure` alongside Plotter: rest-pose hit testing, opaque back-to-front painter occlusion, distance stagger, and quiet wordless figures. |
| **Pritam (`pritamux/gridlines`)** | [`github.com/pritamux/gridlines`](https://github.com/pritamux/gridlines) | Alignment pass & ink-edge probe (`probe.js`, MIT) backing `meridian-gridlines` — synthesizing **Karri Saarinen's** Linear sidebar rules and **Apple HIG (Layout)** at `1440px` and `390px`. |
| **Paper Design (`@paper-design/shaders`)** | [`shaders.paper.design`](https://shaders.paper.design/) | WebGL `halftoneDotsFragmentShader` powering archival print plates in `src/halftone-mount.ts` and `gann.html`. |
| **Jhosephe UI (`jhosephebtc`)** | [`jhosephe.vercel.app`](https://jhosephe.vercel.app/) | Tactile pointer-capture physics (`--ml-press-x/y`, 270° dials, 1:1 scrubs), `jhosephe-svg-motion` precision, and the original 64-component foundation expanded to 89 components. |
| **Anthropic Research / Econ Scenarios / 81k** | [`anthropic.com/research`](https://www.anthropic.com/research) | Warm `#FAF9F5` editorial ground, dual-radius tokens (`pill` + `squircle`), asymmetric 12-col masonry gallery, `<details>` accordion footer, contained earthy pigments, dotted orthographic globe aesthetic, and painterly watercolor blocks. |
| **Tyler Hobbs & `p5.brush`** | [`github.com/acamposuribe/p5.brush`](https://github.com/acamposuribe/p5.brush) | Recursive Gaussian polygon subdivision and wet-edge / tooth algorithms adapted into zero-dependency TypeScript in `src/atelier-engine.ts`. |
| **shadcn/ui Registry** | [`ui.shadcn.com`](https://ui.shadcn.com/) | JSON distribution format (`public/r/*.json`, `public/r/registry.json`) for `npx shadcn@latest add`. |

---

## Development & Verification Commands

```bash
npm install
npm run dev        # Vite dev server
npm run typecheck  # Strict TypeScript check (tsc --noEmit)
npm run registry   # Rebuild public/r/ (90 items + registry.json)
npm run build      # registry + tsc --noEmit + Vite production bundle (6 HTML pages → dist/)
npm run preview    # Serve dist/ locally
```

## Keyboard Shortcuts

- `⌘K` / `Ctrl+K` / `/`: Instant `0ms` command palette (`index.html`, `preview.html`).
- `1`–`9` & `0`: Instant surface switching (`preview.html` 10 quick slots; `1`–`5` in `index.html`).
- `M`: Toggle `B2C Invisible` ↔ `Pro Technical Audit` mode.

---

*Built in Vite, strict TypeScript, and pure CSS — MIT License.*
