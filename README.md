# MERIDIAN Design System (`v1.5.0`)

**Single-Ink Multi-Surface Editorial System** — **PaperGrain** via native HTML5 `<canvas>`, **HalfTone** WebGL dots via `@paper-design/shaders`, asymmetric motion governance (**Frequency Gate**), flat editable **Plotter SVG** blueprints (`data-plotter-role`), an orthographic **81k Globe**, **89 tactile line components** with copyable AI install prompts (`public/r/registry.json`), **8 modular agent skills** (including **`meridian-taste`**), and a **100% TypeScript generative watercolor, graphite, wax-crayon & sumi-e engine** (zero `p5.js`).

> ⭐ **Like Meridian?** [**Star `jhosephebtc/Meridian` on GitHub**](https://github.com/jhosephebtc/Meridian) — every page header includes a live GitHub Star CTA.

---

## Live Applications (Vercel Production)

- **Design System & Showcase:** [`https://meridian-olive-phi.vercel.app/index.html`](https://meridian-olive-phi.vercel.app/index.html)
- **Components Lab (89 Components + AI Install Prompts):** [`https://meridian-olive-phi.vercel.app/components.html`](https://meridian-olive-phi.vercel.app/components.html)
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
| [`meridian-design-system`](./skills/meridian-design-system/SKILL.md) | Single-Ink `color-mix()` (`9%` / `12%`), 13 surfaces, Geist 3-voice typography (`Geist`, `Geist Serif`, `Geist Mono`), Dual-Radius, `pt/en/es/fr` i18n | `src/tokens.css`, `src/tokens.ts`, `src/fonts.css`, `src/i18n.ts` |
| [`meridian-paper-shaders`](./skills/meridian-paper-shaders/SKILL.md) | Canvas PaperGrain (`opacity`, `dust`, `scratch`, `double`), `@paper-design/shaders` HalfTone (`u_size < 0.2`), Chromium hairline `2px` scrollbars, `.ds-burger` → `X`, `.ds-page-veil` | `src/paper-grain.ts`, `src/halftone-mount.ts`, `src/page-enter.ts` |
| [`meridian-motion`](./skills/meridian-motion/SKILL.md) | Animation Frequency Gate (`0ms` `⌘K`), 6 easing curves (zero `ease-in`, zero `transition: all`), clip-path tabs, asymmetric Hold (`1.4s / 180ms`), 1:1 drag + `projectMomentum`, RN Reanimated 4 + Haptics | `src/tokens.ts`, `src/components.css`, `src/timeline.ts` |
| [`meridian-plotter-svg`](./skills/meridian-plotter-svg/SKILL.md) | 13 semantic `data-plotter-role` blueprint layers, `fill="none"` discipline, didactic isolation, 81k orthographic globe & Gann 1:1 instruments | `src/plotter-svg.ts`, `src/historia-ambient-svg.ts`, `src/gann-app.ts` |
| [`meridian-atelier`](./skills/meridian-atelier/SKILL.md) | Zero-`p5.js` strict TypeScript watercolor wash, graphite `2H/4B`, wax crayon & sumi-e engine (`< 0.7ms/frame`) | `src/atelier-engine.ts` |
| [`meridian-editorial-archival`](./skills/meridian-editorial-archival/SKILL.md) | 3-column archival reader (`152px` TOC · `65ch` prose · `264px` aside), clickable claims, `Lifeline` / `Timeline`, `preserve-3d` shelf, dual chrome | `src/components.css`, `src/gann.css`, `gann.html`, `historia.html`, `manifesto.html` |
| [`meridian-components`](./skills/meridian-components/SKILL.md) | 89 tactile SVG-line components, `public/r/` shadcn registry manifests, interactive demos & per-component AI install prompts | `src/component-catalog.ts`, `src/components-lab.ts`, `registry/meridian/`, `scripts/build-registry.mjs` |

---

## Components Lab & Per-Component Install Prompts (89 Components)

[`components.html`](https://meridian-olive-phi.vercel.app/components.html) documents all **89 components** across 11 categories (`controls`, `inputs`, `overlays`, `charts`, `surfaces`, `navigation`, `instruments`, `tables`, `feedback`, `astronomy`, `weather`) with live Single-Ink demos across all 13 surfaces.

Every component card includes:
- **Live Interactive Demo** (including the interactive **`timeline`** component powered by `createTimeline` from `src/timeline.ts`).
- **One-Click shadcn CLI Install** (`npx shadcn@latest add https://meridian-olive-phi.vercel.app/r/<id>.json`).
- **Per-Component Prompt Section** (`Copiar prompt` + expand/collapse preview) containing a self-contained, component-specific prompt generated by `buildInstallPrompt()` in `src/component-catalog.ts` (localized in **PT / EN / ES / FR**) covering prerequisites, CLI install command, token usage, and `DESIGN.md` taste invariants (`0ms` high-frequency gate, `1px` `color-mix()` hairlines, zero `ease-in`).

---

## The 13 Single-Ink Surfaces

Every color token derives dynamically from a paper background (`--ds-bg`) and a single ink (`--ds-fg`) using `color-mix(in srgb, var(--ds-fg) ...)`:

| ID | Label | Ground (`--ds-bg`) | Ink (`--ds-fg`) | Contrast | Primary Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `ivory` | **Ivory Editorial** | `#FAF9F5` | `#141413` | `17.6:1 (AAA)` | Default B2C calm editorial surface |
| `paper` | **Paper White** | `#FFFFFF` | `#0A0A0A` | `19.8:1 (AAA)` | B2B dossiers, PDF reports & documentation |
| `blush` | Soft Blush | `#E8C4C0` | `#1A1414` | `9.8:1 (AAA)` | Warm rose chromatic paper |
| `apricot` | Soft Apricot | `#E8C8A8` | `#1A1612` | `10.0:1 (AAA)` | Warm peach editorial ground |
| `butter` | Soft Butter | `#E8D9A8` | `#1A1810` | `10.1:1 (AAA)` | Warm cream note-taking paper |
| `sage` | Soft Sage | `#B8C5A8` | `#141812` | `9.8:1 (AAA)` | Botanical & environmental briefings |
| `mist` | Soft Mist | `#C5D4CE` | `#141816` | `9.6:1 (AAA)` | Cool mineral daylight surface |
| `aqua` | **Signature Aqua** | `#A4CED0` | `#171614` | `10.4:1 (AAA)` | Cartography, climate & air quality |
| `sky` | Soft Sky | `#B0C8D6` | `#12161A` | `9.9:1 (AAA)` | Atmospheric telemetry & clear sky views |
| `slate` | Soft Slate | `#B5BFC9` | `#141618` | `9.7:1 (AAA)` | Technical ledgers & archival plates |
| `lilac` | Soft Lilac | `#C9C0D8` | `#16141A` | `9.7:1 (AAA)` | Editorial essays & manifesto views |
| `terracotta` | **Warm Terracotta** | `#EDBB99` | `#171614` | `10.4:1 (AAA)` | Biographies, Audio briefings & Solar 3D |
| `obsidian` | **Obsidian Dark** | `#0E0E0D` | `#FAF9F5` | `18.4:1 (AAA)` | Pro Observatory & Gann–Jenkins Night Mode |

---

## Attribution, External Skills & Design References

Meridian is built with explicit respect and gratitude toward the creators whose open skills, design systems, and research shaped this repository (full inventory in [`skills/CREDITS.md`](./skills/CREDITS.md)):

| Source / Author | Link | What Meridian Uses & Credits |
| :--- | :--- | :--- |
| **Evil Rabbit — Deimos (Design Zeitgeist) & Geist** | [`deimos.evilrabbit.com`](https://deimos.evilrabbit.com/) · [`vercel.com/font`](https://vercel.com/font) | Reference design architecture for the Single-Ink `color-mix()` engine, archival surfaces (*Paper White*, *Signature Aqua*, *Warm Terracotta*, *Obsidian Dark*), 3-column encyclopedic reader (`152px · 65ch · 264px`), Tier A–C claim citations, `Lifeline` chronology, `preserve-3d` dossier shelf, monochrome signals, and **Geist / Geist Serif / Geist Mono** variable fonts. |
| **Emil Kowalski (`emilkowalski/skills`)** | [`github.com/emilkowalski/skills`](https://github.com/emilkowalski/skills) · [`animations.dev`](https://animations.dev/) | Skill design & physics behind `meridian-motion` and `meridian-taste`: Animation Frequency Gate (`0ms` `⌘K`), custom easing curves (zero `ease-in`), clip-path seamless tabs, origin-aware popovers, skip-delay tooltips (`320ms → 0ms`), asymmetric hold-to-confirm (`1.4s / 180ms`), Vaul/Sonner interruptible patterns, 1:1 pointer momentum/rubberbanding, React Native + Haptics parity, `Before/After/Why` reviews, and `learn-taste` discipline. |
| **Pasquale Vitiello (`pasqualevitiello/plotter`)** | [`github.com/pasqualevitiello/plotter`](https://github.com/pasqualevitiello/plotter) | Architectural SVG grammar adopted in `src/plotter-svg.ts` & `meridian-plotter-svg`: 1 ink (`currentColor`), 1 hairline thickness, 13 `data-plotter-role` layers, `fill="none"`, open 45° arrowheads, `-45°` hatch, and didactic role isolation (`data-plotter-isolate`). |
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
npm run registry   # Rebuild public/r/ (89 items + registry.json)
npm run build      # registry + tsc --noEmit + Vite production bundle (6 HTML pages → dist/)
npm run preview    # Serve dist/ locally
```

## Keyboard Shortcuts

- `⌘K` / `Ctrl+K` / `/`: Instant `0ms` command palette (`index.html`, `preview.html`).
- `1`–`9` & `0`: Instant surface switching (`preview.html` 10 quick slots; `1`–`5` in `index.html`).
- `M`: Toggle `B2C Invisible` ↔ `Pro Technical Audit` mode.

---

*Built in Vite, strict TypeScript, and pure CSS — MIT License.*
