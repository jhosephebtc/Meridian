---
name: meridian-gridlines
description: Ink-edge alignment audit skill for Meridian interfaces. Draws vertical alignment guide lines down pages, headers, nav rails, menus, sidebars, toolbars, cards, and tables via probe.js (window.__gridlines()), pinpoints every item missing its edge or vertical center line by >= 2px, and fixes container padding/inset tokens rather than per-item hacks. Adapted from pritamux/gridlines (Karri Saarinen's Linear sidebar rules + Apple HIG Layout).
---

# Meridian Gridlines (`meridian-gridlines`)

Encodes **Pritam's** [`pritamux/gridlines`](https://github.com/pritamux/gridlines) ink-edge alignment pass — built on **Karri Saarinen's** Linear sidebar alignment notes and **Apple Human Interface Guidelines (Layout)** — calibrated for Meridian's `1px` hairline layout system.

> **Core Rule:** *"Draw the lines first, then move the items."* Fixing margins by eye drifts 2–4px per panel. Guides lock every container to 2–3 named vertical edges and a shared toolbar center line.

---

## 1. Included Probe Tool (`skills/meridian-gridlines/probe.js`)

Run [`probe.js`](./probe.js) directly in any browser console or via Playwright (`page.addScriptTag` + `page.evaluate(() => window.__gridlines())`) at both **`1440px`** desktop and **`390px`** mobile (including open menus, popovers, rails, and `⌘K` dialogs).

`window.__gridlines()` measures **actual rendered ink bounds** (text glyph boxes via `Range.getClientRects()`, SVG bounds, and boxed control edges), groups them into rows, and flags outliers `> 1px` off:
- **Lead line** (solid red): leftmost text ink across rows.
- **Label line** (solid red): leftmost label ink immediately following a leading icon column.
- **Box line** (faint red): leftmost edge of filled/bordered/shadowed controls.
- **Icon-column center** (fainter red): horizontal center axis of leading icons.
- **Trailing line** (blue) & **Trailing center** (amber): right-aligned controls, counts, chevrons, and toolbar buttons.
- **Vertical center spread (`vertical-centre`)**: flags rows where siblings' vertical centers drift apart (`centreSpread > 1px`).

---

## 2. Container Alignment Rules for Meridian

1. **Name Every Container's Lines First:**
   - Topbars (`.topbar-inner`, `.ds-topbar`, `.site-bar`): lock outer inline padding (`clamp(16px, 3vw, 44px)` / `12px` mobile) so page hero copy, status bars, and section headers share one leading edge (`x`) and one trailing edge (`right`).
   - Sidebars & Nav Rails (`.lab-sidebar`, `#nav-rail`, `#lab-rail`, `.ds-reader-toc`): lock one **icon column** (if icons exist), one **text line**, one **trailing count line** (e.g. `.lab-cat-count`), and indent nested children cleanly by one column width — never arbitrary `12px` vs `15px` drift.
   - Menus & Popovers (`.header-menu`, `.surface-menu`, `.ds-popover`, `.ds-cmdk-list`): every menu item and section header shares one text line and one horizontal trailing center (`⌘K` chips, `↗` arrows, checkmarks).

2. **One Vertical Center Line Per Bar:**
   - Measure **centers**, not tops: a `28px` pill button (`.site-gh-star`), a `30px` icon button, a language switcher, and a text `.topbar-link` inside the same header row must share one vertical axis (`align-items: center`).

3. **Optical Corrections (Ink Over Bounding Box):**
   - **Invisible borders count:** a transparent `1px` border shifts text ink inward by `1px`; compensate via container inset (`margin-inline-start: -1px` on flush labels, or matched borders across sibling controls).
   - **Icon `viewBox` inset counts:** a `20×20` SVG whose strokes only span `16×16` sits `2px` inside its box; align by visual glyph bounds, not blind container math.
   - **Tabs align by label ink, not hit box:** strip outer container padding or compensate when tab pills align flush above a section heading.
   - **Shape uniformity:** controls inside one toolbar/group are either all pills (`9999px`) or all squircles (`8px`), mixing only for one intentional primary exception (`DESIGN.md` Dual-Radius rule).

4. **Fix Containers, Never One-Off Items:**
   - Move the minority outlier onto the dominant line via shared CSS custom properties or container padding — **never** slap `margin-left: 3px` onto a single row, and never quietly alter approved hit areas (`>= 44px` on touch) or font sizes without flagging it.

5. **Shell Edges Are Named Lines Too:**
   - On every page the header (`.site-bar` / `.topbar-inner`), hero, section heads and footer share two shell lines: `57.6px` and `1382.4px` at `1440px`; `20px` and `370px` at `390px`. Verify in one pass across all 6 pages (`index`, `preview`, `components`, `gann`, `historia`, `manifesto`).
   - Masthead (`1fr auto 1fr`): the brand's center must equal `innerWidth / 2` (`720px` at `1440px`); the left group's right edge must stay `≤` brand left, and the brand's right edge `≤` right-controls left. Re-measure at `1440`, `1024` and `960px`, then confirm the top-right hamburger below `1120px`.
   - Open popovers (`Preferences`, `Type`, `Surface`) must not create horizontal overflow (`document.documentElement.scrollWidth === innerWidth`).
   - Full layout/header rules: [`../meridian-layout-chrome/SKILL.md`](../meridian-layout-chrome/SKILL.md).

---

## 3. Audit Report Format

Report findings cleanly by container before/after fixing:
- Named lines measured (`lead`, `box`, `iconCentre`, `label`, `trailing`, `trailCentre`).
- Remaining `MISS` list (`y`, `edge`, `px vs line`, element label) and explicit verification at both `1440px` and `390px` after fixes.

---

## 4. Attribution & Credits

- **Pritam** ([`pritamux/gridlines`](https://github.com/pritamux/gridlines), MIT License) — Alignment methodology & `probe.js` ink-edge measurement engine.
- Underlying visual rules credited by `pritamux/gridlines` to **Karri Saarinen's** Linear sidebar redraw notes and **Apple Human Interface Guidelines (Layout)**.
- Full project credits: [`../CREDITS.md`](../CREDITS.md).
