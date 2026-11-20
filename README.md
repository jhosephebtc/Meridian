# MERIDIAN Design System (`v1.4.1`)

**Components Lab:** open [`components.html`](./components.html) for all 64 tactile line components (jhosephe gestures × Meridian SVG grammar). Install via shadcn:

```sh
npm run registry
npx shadcn@latest add http://localhost:5173/r/button.json
# or after deploy: https://<your-host>/r/registry.json
```


**Sistema Visual, Editorial, Navegacional, de Motion, Blueprints SVG (Plotter), HalfTone e Arte Generativa 100% TypeScript** para o ecossistema **Lunar + Earth AI + Gemini Studio** (React Native + Web · CSS Puro · SVG 1:1).

![Meridian Plotted 81k Globe](./assets/meridian-globe-81k.svg)

---

## Linhagem & Pilares

- **Anthropic Research & Economic Scenarios:** Ivory `#FAF9F5`, dual-radius, masonry assimétrico, paleta orgânica, aquarelas.
- **Deimos Archival + Soft Chromatic:** Single-Ink + pastéis (`blush` / `butter` / `mist` / `lilac`), leitor 3 colunas, Lifeline, estante 3D.
- **PaperGrain canvas (v1.4):** overlay `#ds-paper-grain` — **nunca** data-URL em CSS var (browsers descartavam o PNG). Speckles com alpha, visível em ivory.
- **HalfTone Paper Shaders:** malha fina (`HALFTONE.size ≈ 0.12`) — size ≥ 0.4 derrete a imagem.
- **Emil Kowalski:** Frequency Gate (`⌘K` 0ms), clip-path tabs, Vaul drawer **só dim** (sem blur), burger **3 linhas → X**, page enter veil.
- **Scrollbar hairline:** 2px, track transparente, canvas visível.
- **Plotter + Globo 81k + Atelier TS:** gramática SVG 1 tinta + aquarela/lápis/giz/sumi-e.

---

## Atmosferas (`data-surface`)

| Superfície | Ground | Ink | Uso |
| :--- | :---: | :---: | :--- |
| **`ivory`** *(padrão)* | `#FAF9F5` | `#141413` | Home B2C / pesquisa |
| **`paper`** | `#FFFFFF` | `#0A0A0A` | Dossiês / PDF |
| **`blush` · `butter` · `mist` · `lilac`** | pastéis | tinta quente | Soft Chromatic / capas |
| **`aqua`** | `#A4CED0` | `#171614` | Clima / Earth AI |
| **`terracotta`** | `#EDBB99` | `#171614` | Cultura / Gann / Solar |
| **`obsidian`** | `#0E0E0D` | `#FAF9F5` | Terminal Pro |

Espectro UI: `SURFACE_SPECTRUM` em `src/tokens.ts`.

---

## Prévia ao Vivo

- **Showcase DS:** https://jhosephebtc.github.io/Meridian/
- **Meridian Studio:** https://jhosephebtc.github.io/Meridian/preview.html
- **Dossiê W.D. Gann:** https://jhosephebtc.github.io/Meridian/gann.html

---

## Estrutura

```text
Meridian/
├── DESIGN_SYSTEM.md          # Spec completa v1.4.1
├── index.html                # Showcase interativo
├── preview.html              # Prévia de produto
├── gann.html                 # Dossiê archival + HalfTone
├── src/
│   ├── index.ts              # Barrel (tokens, paper-grain, page-enter, plotter, atelier)
│   ├── tokens.css / tokens.ts
│   ├── components.css        # Burger→X, claim, drawer dim, veil…
│   ├── paper-grain.ts        # Canvas overlay (sem data-URL)
│   ├── page-enter.ts         # markPageReady()
│   ├── plotter-svg.ts
│   ├── atelier-engine.ts
│   ├── gann.css / gann-app.ts
│   └── preview.css / preview-app.ts
└── assets/
```

---

## Local (`npm run dev`)

```bash
npm install
npm run dev
```

- Showcase: `http://localhost:5173/`
- Studio: `http://localhost:5173/preview.html`
- Gann: `http://localhost:5173/gann.html`

Atalhos: **`1`–`5`** atmosferas · **`M`** modo · **`⌘K` / `/`** paleta.

---

## Uso rápido

```html
<link rel="stylesheet" href="./src/tokens.css" />
<link rel="stylesheet" href="./src/components.css" />
<html data-surface="ivory" data-mode="invisible" data-grain="editorial">
```

```ts
import {
  mountPaperGrain,
  markPageReady,
  HALFTONE,
  PAPER_SHADER,
  SURFACE_SPECTRUM,
} from '@meridian/design-system';

mountPaperGrain();
markPageReady();
```

Hamburger:

```html
<button class="ds-burger" aria-expanded="false" aria-label="Abrir menu">
  <span class="ds-burger-lines" aria-hidden="true"><span></span><span></span><span></span></span>
</button>
```

Documentação completa: [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md).
