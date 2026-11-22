# Meridian Agent Instructions (`AGENTS.md`)

**Before building, styling, reviewing, or modifying UI in Meridian, read [`DESIGN.md`](./DESIGN.md) and load the matching skill under [`skills/`](./skills/).**

## Skill Routing

| Task | Load Skill | Key Files |
| --- | --- | --- |
| Design system overview, 13 surfaces, tokens, Geist typography, i18n | [`skills/meridian-design-system/SKILL.md`](./skills/meridian-design-system/SKILL.md) | `src/tokens.css`, `src/tokens.ts`, `src/fonts.css`, `src/i18n.ts` |
| Taste rules, UI critique (`Before/After/Why`), anti-slop review, `learn-taste` | [`skills/meridian-taste/SKILL.md`](./skills/meridian-taste/SKILL.md) | `DESIGN.md`, `DESIGN_SYSTEM.md` |
| PaperGrain canvas, HalfTone shaders, hairline scrollbars, burger→X, veil | [`skills/meridian-paper-shaders/SKILL.md`](./skills/meridian-paper-shaders/SKILL.md) | `src/paper-grain.ts`, `src/halftone-mount.ts`, `src/page-enter.ts` |
| Frequency Gate, curves, clip-path tabs, hold-to-confirm, drag/momentum, RN/Expo | [`skills/meridian-motion/SKILL.md`](./skills/meridian-motion/SKILL.md) | `src/tokens.ts`, `src/components.css`, `src/timeline.ts` |
| Plotter 13-role SVG grammar, 81k orthographic globe, Gann 1:1 instruments | [`skills/meridian-plotter-svg/SKILL.md`](./skills/meridian-plotter-svg/SKILL.md) | `src/plotter-svg.ts`, `src/historia-ambient-svg.ts`, `src/gann-app.ts` |
| Interactive 2:1 isometric rounded-solid SVG figures (10 Hairline rules, paired with Plotter) | [`skills/meridian-hairline-figure/SKILL.md`](./skills/meridian-hairline-figure/SKILL.md) | `index.html` (`#svg-viz`), `src/plotter-svg.ts` |
| Ink-edge alignment audit (`probe.js`, `1440px` / `390px`, container edges & centers) | [`skills/meridian-gridlines/SKILL.md`](./skills/meridian-gridlines/SKILL.md) | `skills/meridian-gridlines/probe.js`, `src/tokens.css`, `src/site-chrome.css` |
| 100% TypeScript generative watercolor, pencil, wax crayon & sumi-e engine | [`skills/meridian-atelier/SKILL.md`](./skills/meridian-atelier/SKILL.md) | `src/atelier-engine.ts` |
| 3-column archival reader, claims, Lifeline, 3D dossier shelf, dual chrome | [`skills/meridian-editorial-archival/SKILL.md`](./skills/meridian-editorial-archival/SKILL.md) | `src/components.css`, `src/gann.css`, `gann.html`, `historia.html`, `manifesto.html` |
| 89 tactile line components, shadcn registry, per-component install prompts | [`skills/meridian-components/SKILL.md`](./skills/meridian-components/SKILL.md) | `src/component-catalog.ts`, `src/components-lab.ts`, `registry/meridian/`, `scripts/build-registry.mjs` |

## Verification Commands

```sh
npm run typecheck   # tsc --noEmit (strict mode, must pass with 0 errors)
npm run registry    # rebuilds public/r/*.json and public/r/registry.json (89 items)
npm run build       # registry + tsc --noEmit + vite build (6 HTML entrypoints → dist/)
```

## Attribution

Meridian is built with respect to external authors, open-source skills, and design references documented in [`skills/CREDITS.md`](./skills/CREDITS.md), including **Evil Rabbit ([Deimos / Design Zeitgeist](https://deimos.evilrabbit.com/) & Geist)**, **Emil Kowalski ([`emilkowalski/skills`](https://github.com/emilkowalski/skills))**, **Pasquale Vitiello ([`pasqualevitiello/plotter`](https://github.com/pasqualevitiello/plotter))**, **Lucas Marques ([`lucasmarkes/hairline`](https://github.com/lucasmarkes/hairline))**, **Pritam ([`pritamux/gridlines`](https://github.com/pritamux/gridlines))**, **Paper Design (`@paper-design/shaders`)**, **Jhosephe UI**, **Anthropic Research**, and **shadcn/ui**.
