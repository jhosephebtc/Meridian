---
name: meridian-layout-chrome
description: Meridian's page grid, shell, header (masthead) and theming-chrome skill. Covers the unified 1440px shell and 1fr-auto-1fr masthead, header consolidation (Preferences popover, Type studio, top-right hamburger below 1120px), page/tab information architecture (Overview+Foundations, History, Examples strip), the 40-surface + 28-ink + 8-role color engine with transparency sliders and cross-page sync, legibility (contrast) rules for custom ink colors, and page/section entrance motion. Use when building or restyling headers, page layouts, grids, theme pickers, or when letting users customize colors in a Meridian project.
---

# Meridian Layout & Chrome (`meridian-layout-chrome`)

> **Rule of thumb:** one shell, one masthead, one color engine — on every page. If two pages draw the header differently, the system is broken, not the page.

Load with [`../meridian-taste/SKILL.md`](../meridian-taste/SKILL.md) and [`../meridian-gridlines/SKILL.md`](../meridian-gridlines/SKILL.md). Source of truth: `src/site-chrome.css`, `src/site-chrome.ts`, `src/theme-sync.ts`, `src/page-enter.ts`, `src/tokens.ts`.

---

## 1. Shell & Grid

| Viewport | Shell edges (measured with `probe.js`) | Notes |
| :--- | :--- | :--- |
| `1440px` desktop | `57.6px` → `1382.4px` (content width `1324.8px`) | Header, hero, sections and footer share the **same** two edges |
| `390px` mobile | `20px` → `370px` | Same edges for header, content and footer |

- **One shell on all 6 pages** (`index`, `preview`, `components`, `gann`, `historia`, `manifesto`). Never give a page its own max-width or inline padding for header/footer.
- Lay content out on a **12-column** grid. Prefer fixed ratio spreads over ragged masonry: `7:5` hero spread → `6+6` diptych → full-width panorama (`21:9` frame with 2-column head and specs) → `6+6` closing diptych. Equalize card heights (`align-items: stretch`) and pin trailing accordions/footers with `margin-top: auto` so no jagged holes appear between cards.
- Prose measure stays `65ch` (`--ds-max-prose`). Control bars (sliders, filters) use equal-width grids (`repeat(5, minmax(0, 1fr))` desktop → `3` columns `< 1120px` → `2` columns `< 640px`).
- Do not repeat information. If a section (e.g. all 40 surfaces) already appears below, remove the preview strip above it.

## 2. Masthead (Header)

- Desktop (`≥ 1120px`): `display: grid; grid-template-columns: 1fr auto 1fr` — **left** = places (`System · Studio · Lab · Archive ▾`), **center** = brand (`Meridian`, optically centered at `720px` on a `1440px` page), **right** = controls (`Surface ▾`, `Type ▾`, language, GitHub star, `Preferences ▾`). Left and right never overlap the brand; verify `leftNav.right ≤ brand.left` and `brand.right ≤ controls.left`.
- **Consolidate before you shrink:** low-frequency items (palette, tokens, grain/dust, scratches, language) live inside one **Preferences** popover (`640px`, two columns, zero horizontal overflow). The popover uses legible chrome inks (never the faded body tones).
- Keep the **GitHub star** button in the header, not inside Preferences.
- **Sub-navigation per page** (`index.html`): `Overview` (Overview + Foundations unified, incl. the surface/ink palette) · `History` · `Motion` · `Editorial` · `Plotter & 81k` · `Atelier & GPU` · `NASA Archive` · `Skills` · `View All`, followed by an **Examples** strip (`W.D. Gann · The Lighthouse · Manifesto`, i18n keys `nav.gann`, `nav.farol`, `nav.manifesto`).
- **Below `1120px`:** everything (places, sub-nav, examples, preferences, language) collapses into one drawer opened by the **top-right hamburger** (`.ds-burger`, 3 equal `1.5px` lines → `X`). Drawer backdrop only dims; never blurs.
- Every visible string has a `data-i18n` / `data-home` key in `src/i18n.ts` / `src/i18n-home.ts` for `pt`, `en`, `es`, `fr`. A raw key rendered on screen (e.g. `nav.gann`) is a bug.

## 3. Color Engine (40 surfaces · 28 inks · 8 roles)

- **40 surfaces** (`data-surface`, `SURFACE_SPECTRUM`) — full table in [`../../DESIGN_SYSTEM.md`](../../DESIGN_SYSTEM.md). Pick via `setGlobalSurface(id)` from `src/theme-sync.ts`; never set `data-surface` by hand on one page only.
- **28 type inks** (`TYPE_INKS`): `dark` 12, `editorial` 7, `light` 9. **8 roles** (`ROLE_ORDER`): `primary`, `secondary`, `tertiary`, `accent`, `buttonPrimaryBg`, `buttonPrimaryFg`, `buttonSecondaryFg`, `buttonSecondaryBg`. Each role has a **transparency slider** (`10–100%`, `[data-studio-opacity-range]`), applying to whichever ink is selected (including a custom hex from `[data-studio-custom-ink]`).
- **Persistence & sync:** `localStorage` keys `meridian-surface`, `meridian-custom-bg`, `meridian-type-config`, `meridian-mode`, language `meridian-lang`; cross-tab/page sync over `BroadcastChannel('meridian-theme-v2')`. `bootMeridianThemeSync()` runs before first paint so a page opens in the user's last theme with no flash.
- **Chrome stays legible on every ground:** header, menus and popovers derive their ink from the active ground, not from the user's decorative body inks.

### Legibility rule for custom ink colors (non-negotiable)

1. After applying transparency, any **text role must reach `≥ 4.5:1`** against the active `--ds-bg` (aim for `≥ 7:1` on `primary`; large display text may drop to `3:1` only if it is ≥ `24px`).
2. **Filter first, then pick:** compute contrast of every candidate ink against the *current* ground and only offer/apply those that pass.
3. **Re-evaluate on every surface change** — an ink that was fine on `ivory` can vanish on `obsidian`. Re-apply roles after `setGlobalSurface()`.
4. Button pairs (`buttonPrimaryBg` ↔ `buttonPrimaryFg`, `buttonSecondaryBg` ↔ `buttonSecondaryFg`) must pass `4.5:1` **between themselves**, not just against the page.
5. Rules and decorative hairlines may stay below `4.5:1` (they use `ruleOpacity`); text may not.

```ts
const lum = ([r, g, b]: number[]) => {
  const f = (v: number) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
export const contrast = (a: number[], b: number[]) => {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};
// blend ink alpha over ground first: c = ink*alpha + ground*(1-alpha)
```

`contrastRatioString(bg, fg)` in `src/theme-sync.ts` exposes the same math for the Studio readout.

## 4. Entrance Motion (page load & section/tab switch)

- **Never** zoom the whole page (`scale(0.96)` on the shell) — it breaks `position: sticky` (transform containing block) and feels slow.
- **Page load:** `@keyframes dsPageSettle` / `meridianPageEnter`: `opacity 0 → 1`, `translateY(10px) → none`, **`420ms`** `var(--ds-ease-editorial)`; `.ds-page-veil` fades in **`320ms`**; `markPageReady()` default delay `16ms`, veil cleanup `460ms`.
- **Scroll reveal** (`[data-reveal]`, `IntersectionObserver`): opacity + `translateY` only (`440ms`), applied to cards (`.nasa-card`, `.surfaces-study-card`, `.token-grid > *`, `.historia-layout > *`).
- **Tab/section switch** (`selectDsTab()`): the newly shown section gets `.is-tab-entering` (`meridianSectionEnter`, **`380ms`**) and its reveal children stagger by **`40ms`**. Root tab switches that happen 100+/day should still feel instant; keep total entrance `≤ 420ms`.
- `prefers-reduced-motion: reduce` disables the keyframes and transitions immediately.

## 5. Verification (run before shipping any page/header change)

```sh
npm run typecheck && npm run registry && npm run build
```

Then, at **`1440px`** and **`390px`** on all 6 pages (Playwright or browser console):

- [ ] `document.documentElement.scrollWidth === innerWidth` (zero horizontal overflow, including open Preferences and Type popovers)
- [ ] Shell and footer edges match (`57.6 / 1382.4` and `20 / 370`) and the brand centers at `innerWidth / 2`
- [ ] No header overlap at `1440`, `1024` and `960px`; hamburger visible and top-right below `1120px`
- [ ] No `data-i18n` / `data-home` key rendered raw in any of `pt`, `en`, `es`, `fr`
- [ ] `window.__gridlines()` ([`../meridian-gridlines/probe.js`](../meridian-gridlines/probe.js)) reports zero `MISS ≥ 2px`
- [ ] Cycle at least 5 surfaces (`ivory`, `aqua`, `terracotta`, `paper`, `obsidian`) with custom inks: every text role `≥ 4.5:1`

## 6. Install & Reuse in Your Own Project

```bash
npx skills add jhosephebtc/Meridian --skill meridian-layout-chrome
# or the whole kit
npx skills add jhosephebtc/Meridian
```

Copy `src/tokens.css`, `src/tokens.ts`, `src/site-chrome.css`, `src/site-chrome.ts`, `src/theme-sync.ts`, `src/page-enter.ts`, `src/i18n.ts` (and `assets/fonts/`), call `bootMeridianThemeSync()` before first paint, then `initI18n()`, `mountPaperGrain()` and `markPageReady()` (see [`../meridian-design-system/SKILL.md`](../meridian-design-system/SKILL.md)).
