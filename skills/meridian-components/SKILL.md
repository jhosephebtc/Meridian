---
name: meridian-components
description: Catalog, React/CSS contracts, shadcn CLI registry, and per-component AI install prompts for all 90 tactile SVG-line components in Meridian Components Lab (components.html, src/component-catalog.ts, src/components-lab.ts, registry/meridian/*, scripts/build-registry.mjs, public/r/*.json). Use when installing, scaffolding, or extending Meridian UI components.
---

# Meridian Components & shadcn Registry (`meridian-components`)

**90 tactile SVG-line components** combining **Jhosephe UI's** pointer-physics ergonomics with **Meridian's** Single-Ink hairline visual grammar, installable individually via `shadcn` or via per-component AI installation prompts in `components.html`.

---

## 1. Catalog Breakdown (`90` Components across `11` Populated Categories)

Source of truth: [`src/component-catalog.ts`](../../src/component-catalog.ts) (`COMPONENT_CATALOG`, `buildInstallPrompt`, `installCommand`).

| Category | Count | Representative Components |
| :--- | :---: | :--- |
| **`controls`** | 16 | `button`, `slider`, `switch`, `dial`, `bar-slider`, `radio-group`, `tactile-key`, `tactile-keypad`, `tactile-console`, `camera-wheel`, `camera-dial`, `spectrum-control`, `oklch-palette`, `color-picker`, `detent-dial`, `tactile-lever` |
| **`inputs`** | 11 | `calendar`, `date-picker`, `input`, `search-input`, `data-form`, `date-time-picker`, `file-transfer`, `combobox`, `select`, `time-picker`, `range-picker` |
| **`overlays`** | 11 | `dialog`, `sheet-modal`, `drawer-modal`, `confirm-modal`, `menu`, `context-menu`, `popover-menu`, `market-picker`, `currency-picker`, `ephemeris-picker`, `financial-order-modal` |
| **`charts`** | 11 | `chart-line`, `chart-area`, `chart-bar`, `chart-hbar`, `chart-candles`, `chart-donut`, `chart-sparkline`, `chart-scatter`, `chart-radar`, `chart-histogram`, `financial-chart` |
| **`surfaces`** | 9 | `smooth-shape`, `shader-surface`, `scroll-area`, `simple-scroll`, `accordion-scroll`, `vertical-gallery`, `filmstrip-gallery`, `image-frame`, `image-tile` |
| **`navigation`** | 8 | `timeline`, `gallery`, `segmented-control`, `step-navigation`, `accordion`, `finance-navigation`, `tabs`, `command-palette` |
| **`instruments`** | 9 | `instrument`, `image-inspector`, `compass`, `audio-meter`, `weather-instrument`, `attitude-indicator`, `navigation-instrument`, `race-telemetry`, `hairline-isometric` |
| **`tables`** | 5 | `data-table`, `info-table`, `ledger-table`, `comparison-table`, `source-table` |
| **`feedback`** | 4 | `toast`, `progress-bar`, `metric-card`, `kpi-strip` |
| **`astronomy`** | 3 | `astronomy-instrument`, `astrology-wheel`, `lunar-ephemeris` |
| **`weather`** | 3 | `weather-conditions`, `wind-instrument`, `tide-instrument` |

*(Note: `ComponentCategory` also defines `'finance'`, whose components are organized across `overlays`, `navigation`, `tables`, and `charts`.)*

---

## 2. Installing Components & Using AI Install Prompts

### CLI Installation (`shadcn`)
```sh
# Single component (hosted registry)
npx shadcn@latest add https://meridian-olive-phi.vercel.app/r/button.json

# Local dev build
npm run registry
npx shadcn@latest add http://localhost:5173/r/dial.json
```

### Per-Component Prompt Section in `components.html`
Every card in [`components.html`](../../components.html) includes an interactive **Install Prompt** section powered by `buildInstallPrompt(item, REGISTRY_BASE, lang)` (`src/component-catalog.ts`) with:
1. Live preview of the exact agent prompt tailored to that component (`name`, `id`, `blurb`, `shadcn` command, `--ds-*` / `.ml-*` taste constraints, and verification check).
2. One-click **Copy prompt** button and expand/collapse toggle (`Ver completo` / `Full`).

---

## 3. Component Craft Contract (`registry/meridian/*` + `src/components-lab.css`)

- **Tokens:** Every `.ml-*` rule consumes `--ds-*` Single-Ink variables (`--ds-bg`, `--ds-fg`, `--ds-border`, `--ds-rule`, `--ds-surface-1`, `--ds-font-*`, `--ds-radius-*`, `--ds-ease-*`).
- **Tactile gestures:**
  - `Button`: pointer-down `--ml-press-x` / `--ml-press-y` local press ripple + `scale(0.97)` + `loading` (`aria-busy`).
  - `Dial` / `DetentDial`: absolute pointer-angle mapping (`-135° → 135°`), `setPointerCapture`, optional 10-step detent snap, and keyboard `<input type="range">`.
  - `Slider` & `BarSlider`: `touch-action: none`, `setPointerCapture`, arrow-key support.
  - `Switch`: `role="switch"` with `aria-checked`, `220ms cubic-bezier(0.22, 1, 0.36, 1)` thumb travel.
- **Registry maintenance:** Whenever editing `src/component-catalog.ts` or `registry/meridian/*`, run `npm run registry` (`scripts/build-registry.mjs`) so `public/r/*.json` and `public/r/registry.json` stay synced (90 items).

---

## 4. Attribution

- **Jhosephe UI** ([jhosephe.vercel.app](https://jhosephe.vercel.app/)): Tactile gesture physics and the original 64-component interactive catalog foundation.
- **shadcn/ui** ([ui.shadcn.com](https://ui.shadcn.com/)): Component distribution schema (`public/r/registry.json`).
- Full credits: [`../CREDITS.md`](../CREDITS.md).
