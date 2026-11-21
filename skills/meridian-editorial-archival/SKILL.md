---
name: meridian-editorial-archival
description: Editorial and archival layout patterns implemented in Meridian — 3-column encyclopedic reader (152px TOC, 65ch prose with clickable dotted .ds-claim citations and Tier A/B/C sources, 264px aside plate + At a glance), dual layout chrome (masthead vs. lateral rail), draggable 1:1 Lifeline chronology, preserve-3d dossier shelf, 12-column asymmetric gallery, and 3-column single-open accordion footer. Use when building long-form dossiers, essays, or research interfaces.
---

# Meridian Editorial & Archival Layouts (`meridian-editorial-archival`)

Directly adapts **Evil Rabbit's** [Deimos / Design Zeitgeist](https://deimos.evilrabbit.com/) archival reader grammar alongside **Anthropic Research's** editorial gallery cadence (`src/components.css`, `src/gann.css`, `gann.html`, `historia.html`, `manifesto.html`, `preview.html`, `index.html`).

---

## 1. 3-Column Encyclopedic Reader (`.ds-reader-grid`)

| Column | Token / Measure | Contents |
| :--- | :--- | :--- |
| **Left TOC** | `--ds-toc-width: 152px` | Section anchor links (`aria-current="true"` active highlight via `--ds-bg-tint-muted`) |
| **Main Prose** | `--ds-max-prose: 65ch` | Narrative with inline clickable `.ds-claim` spans (dotted underline, no blur/glow) + `.ds-cite-sup` (`¹²³`) linked to Tier A / B / C verified sources |
| **Right Aside** | `--ds-aside-width: 264px` | Square archival plate (`.ds-aside-plate`, `mix-blend-mode: multiply` on light surfaces) + *At a glance* clickable fact rows that highlight and scroll to the corresponding claim/source |

Stacks cleanly on narrow viewports (`prose → aside plate`) with `--ds-reader-gap: 32px`.

---

## 2. Dual Layout Chrome (`data-layout="masthead | rail"`)

Implemented in `gann.html`, `historia.html`, `manifesto.html` (`src/gann.css` + `src/site-chrome.ts`):
- **`masthead`**: Sticky hairline header (`.gann-chrome`) with inline section links + 8-surface soft-chromatic selector + language switcher (`PT/EN/ES/FR`) + GitHub Star pill + `"Ir"` destination menu.
- **`rail`**: Burger (`3 lines → X`) opening a dim-backed lateral summary rail (`.gann-rail` / `.gann-rail-backdrop`), no `backdrop-filter: blur`.

---

## 3. Structural Patterns

1. **Horizontal `Lifeline` (`src/timeline.ts` · `createTimeline` / `mountTimeline`):**
   - `1:1` pointer drag with exponential momentum release, dashed hairline rail (`--ds-rule-strong`), progress track, keyboard `ArrowLeft`/`ArrowRight` navigation, and `IntersectionObserver` staggered reveal.
2. **Tactile 3D Dossier Shelf (`.ds-shelf`, `.ds-volume`):**
   - Vertical spines in `preserve-3d` with fluted page-edge ribs (`--ds-pattern-page-ribs`), pivoting open smoothly in `800ms var(--ds-ease-volume)` to reveal dossier metadata.
3. **12-Column Asymmetric Masonry Gallery:**
   - Alternates asymmetric spans (`3+8`, `6+3`, `8+3`) without repeating a cadence row-over-row. Under `@media (hover: hover) and (pointer: fine)`, hovering one card dims sibling cards to `opacity: 0.54`.
4. **3-Column Accordion Footer (`.ds-footer`):**
   - Brand lockup | `<details class="ds-footer-acc">` single-open-at-a-time accordions with hairlines and chevrons | Mission + `↗` links.

---

## 4. Attribution

- **Evil Rabbit — Deimos / Design Zeitgeist** ([deimos.evilrabbit.com](https://deimos.evilrabbit.com/)): Single-Ink archival reader, clickable claims & provenance, Lifeline, and 3D dossier shelf.
- **Anthropic Research** ([anthropic.com/research](https://www.anthropic.com/research)): 12-column asymmetric gallery and 3-column accordion footer.
- Full credits: [`../CREDITS.md`](../CREDITS.md).
