/** Barra e personalização global unificadas — todas as páginas compartilham Sistema · Studio · Lab · Arquivo, 21 superfícies e Aa Tipo. */

interface SurfaceMeta {
  id: string;
  name: string;
  hex: string;
  dark?: boolean;
}

const SURFACES: SurfaceMeta[] = [
  { id: 'ivory', name: 'Ivory Editorial', hex: '#FAF9F5' },
  { id: 'paper', name: 'Paper White', hex: '#FFFFFF' },
  { id: 'blush', name: 'Soft Blush', hex: '#E8C4C0' },
  { id: 'apricot', name: 'Soft Apricot', hex: '#E8C8A8' },
  { id: 'butter', name: 'Soft Butter', hex: '#E8D9A8' },
  { id: 'sage', name: 'Soft Sage', hex: '#B8C5A8' },
  { id: 'mist', name: 'Soft Mist', hex: '#C5D4CE' },
  { id: 'aqua', name: 'Signature Aqua', hex: '#A4CED0' },
  { id: 'sky', name: 'Soft Sky', hex: '#B0C8D6' },
  { id: 'slate', name: 'Soft Slate', hex: '#B5BFC9' },
  { id: 'lilac', name: 'Soft Lilac', hex: '#C9C0D8' },
  { id: 'terracotta', name: 'Warm Terracotta', hex: '#EDBB99' },
  { id: 'ash', name: 'Pale Ash', hex: '#E2DFD8' },
  { id: 'stone', name: 'Stone Gray', hex: '#8E8B84', dark: true },
  { id: 'clay', name: 'Field Ochre', hex: '#B39A6E' },
  { id: 'navy', name: 'Navy Ink', hex: '#1C3142', dark: true },
  { id: 'mocha', name: 'Mocha Ink', hex: '#3A2A22', dark: true },
  { id: 'pine', name: 'Pine Ink', hex: '#1E3328', dark: true },
  { id: 'umber', name: 'Deep Ochre', hex: '#4E3E24', dark: true },
  { id: 'charcoal', name: 'Charcoal', hex: '#3E3C38', dark: true },
  { id: 'obsidian', name: 'Obsidian Dark', hex: '#141413', dark: true },
];

const TYPE_TONES = [
  { id: 'surface', name: 'Tinta da superfície', hex: 'current' },
  { id: 'obsidian', name: 'Obsidian Dark', hex: '#141413' },
  { id: 'navy', name: 'Navy Ink', hex: '#1C3142' },
  { id: 'mocha', name: 'Mocha Ink', hex: '#3A2A22' },
  { id: 'pine', name: 'Pine Ink', hex: '#1E3328' },
  { id: 'umber', name: 'Deep Ochre', hex: '#4E3E24' },
  { id: 'charcoal', name: 'Charcoal', hex: '#3E3C38' },
  { id: 'muted', name: 'Tinta suavizada', hex: '#595959' },
];

interface TypeChoice {
  tone: string;
  opacity: number;
}

interface TypeConfig {
  primary: TypeChoice;
  secondary: TypeChoice;
  tertiary: TypeChoice;
}

const DEFAULT_TYPE_CONFIG: TypeConfig = {
  primary: { tone: 'surface', opacity: 100 },
  secondary: { tone: 'surface', opacity: 100 },
  tertiary: { tone: 'surface', opacity: 100 },
};

function readTypeConfig(): TypeConfig {
  try {
    const raw = localStorage.getItem('meridian-type-config');
    if (raw) {
      const p = JSON.parse(raw) as Partial<TypeConfig>;
      if (p.primary && p.secondary && p.tertiary) {
        return { primary: p.primary, secondary: p.secondary, tertiary: p.tertiary };
      }
    }
  } catch { /* ignore */ }
  return structuredClone(DEFAULT_TYPE_CONFIG);
}

function applyTypeConfig(cfg: TypeConfig): void {
  const root = document.documentElement;
  (['primary', 'secondary', 'tertiary'] as const).forEach((role) => {
    const ch = cfg[role];
    const inkProp = `--ds-type-${role}-ink`;
    const alphaProp = `--ds-type-${role}-alpha`;
    if (ch.tone === 'surface') {
      root.style.removeProperty(inkProp);
    } else {
      const tone = TYPE_TONES.find((t) => t.id === ch.tone);
      const hex = tone?.hex && tone.hex !== 'current' ? tone.hex : getComputedStyle(root).getPropertyValue('--ds-fg-muted').trim() || '#595959';
      root.style.setProperty(inkProp, hex);
    }
    if (ch.opacity === 100) root.style.removeProperty(alphaProp);
    else root.style.setProperty(alphaProp, String(ch.opacity / 100));
  });
  try {
    localStorage.setItem('meridian-type-config', JSON.stringify(cfg));
  } catch { /* ignore */ }
}

function closeHeaderMenus(except?: Element | null): void {
  document.querySelectorAll<HTMLElement>('.header-menu[data-open="true"]').forEach((menu) => {
    if (except && (menu === except || menu.contains(except))) return;
    menu.dataset.open = 'false';
    const toggle = menu.parentElement?.querySelector<HTMLElement>('[data-menu-toggle]');
    toggle?.setAttribute('aria-expanded', 'false');
  });
}

const GH_STARS_CACHE_KEY = 'meridian-gh-stars-v1';
const GH_STARS_TTL_MS = 15 * 60 * 1000;

function formatStarCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

function applyStarBadges(slots: NodeListOf<HTMLElement>, count: number): void {
  const text = formatStarCount(count);
  slots.forEach((el) => {
    el.textContent = text;
    el.hidden = false;
  });
}

function hydrateGitHubStars(): void {
  const slots = document.querySelectorAll<HTMLElement>('[data-gh-stars]');
  if (!slots.length) return;

  try {
    const raw = sessionStorage.getItem(GH_STARS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { count?: unknown; ts?: unknown };
      if (
        typeof parsed.count === 'number'
        && typeof parsed.ts === 'number'
        && Date.now() - parsed.ts < GH_STARS_TTL_MS
      ) {
        applyStarBadges(slots, parsed.count);
        return;
      }
    }
  } catch { /* ignore */ }

  fetch('https://api.github.com/repos/jhosephebtc/Meridian', {
    headers: { Accept: 'application/vnd.github+json' },
  })
    .then((res) => (res.ok ? res.json() : null))
    .then((data: { stargazers_count?: unknown } | null) => {
      if (!data || typeof data.stargazers_count !== 'number') return;
      applyStarBadges(slots, data.stargazers_count);
      try {
        sessionStorage.setItem(
          GH_STARS_CACHE_KEY,
          JSON.stringify({ count: data.stargazers_count, ts: Date.now() }),
        );
      } catch { /* ignore */ }
    })
    .catch(() => { /* ignore */ });
}

function setSurfaceEverywhere(surfaceId: string, typeCfg: TypeConfig): void {
  if (!SURFACES.some((s) => s.id === surfaceId)) return;
  document.documentElement.setAttribute('data-surface', surfaceId);
  const meta = SURFACES.find((s) => s.id === surfaceId);
  if (meta) {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', meta.hex);
  }
  try {
    localStorage.setItem('meridian-surface', surfaceId);
  } catch { /* ignore */ }

  document.querySelectorAll<HTMLElement>('[data-chroma],[data-surface-pick],[data-global-surface]').forEach((b) => {
    const id = b.dataset.chroma || b.dataset.surfacePick || b.dataset.globalSurface;
    b.setAttribute('aria-pressed', id === surfaceId ? 'true' : 'false');
  });

  const label = document.getElementById('global-surface-label');
  const swatch = document.getElementById('global-surface-swatch');
  if (label && meta) label.textContent = meta.name.split(' ')[0];
  if (swatch && meta) swatch.style.background = meta.hex;

  applyTypeConfig(typeCfg);
}

function injectUnifiedSubpageChrome(typeCfg: TypeConfig): void {
  // index.html já possui o header nativo completo (.topbar)
  if (document.getElementById('btn-surface-menu')) return;

  const pageName = window.location.pathname.split('/').pop() || 'index.html';
  const header = document.querySelector<HTMLElement>('.ds-topbar, .gann-chrome-inner');
  if (!header) return;

  const isArchive = pageName === 'manifesto.html' || pageName === 'historia.html' || pageName === 'gann.html';
  const curSurface = document.documentElement.getAttribute('data-surface') || 'ivory';
  const curMeta = SURFACES.find((s) => s.id === curSurface) || SURFACES[0];

  // 1. Injetar links globais idênticos ao Sistema (Sistema · Studio · Lab · Arquivo ▾) logo após o brand
  if (!header.querySelector('.meridian-unified-nav')) {
    const nav = document.createElement('nav');
    nav.className = 'meridian-unified-nav';
    nav.setAttribute('aria-label', 'Navegação global Meridian');
    nav.innerHTML = `
      <a href="./index.html" class="meridian-nav-link"${pageName === 'index.html' ? ' aria-current="page"' : ''}>Sistema</a>
      <a href="./preview.html" class="meridian-nav-link"${pageName === 'preview.html' ? ' aria-current="page"' : ''}>Studio</a>
      <a href="./components.html" class="meridian-nav-link"${pageName === 'components.html' ? ' aria-current="page"' : ''}>Lab</a>
      <div class="menu-anchor"${isArchive ? ' data-current="true"' : ''}>
        <button type="button" class="site-menu-btn" data-menu-toggle aria-expanded="false" aria-haspopup="menu">
          <span>Arquivo</span>
          <svg class="menu-chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 L5 6.5 L8 3.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="header-menu" data-open="false" role="menu">
          <a href="./manifesto.html" role="menuitem"${pageName === 'manifesto.html' ? ' aria-current="page"' : ''}>Manifesto</a>
          <a href="./historia.html" role="menuitem"${pageName === 'historia.html' ? ' aria-current="page"' : ''}>O Farol e o Meridiano</a>
          <a href="./gann.html" role="menuitem"${pageName === 'gann.html' ? ' aria-current="page"' : ''}>Dossiê W.D. Gann</a>
        </div>
      </div>
    `;
    const brand = header.querySelector('.brand-mark, .gann-brand');
    if (brand && brand.nextSibling) header.insertBefore(nav, brand.nextSibling);
    else header.prepend(nav);
  }

  // 2. Transformar/adicionar seletores globais das 21 superfícies + Aa Tipo no canto direito
  const rightContainer = header.querySelector('.lab-topbar-actions, .topbar-right') || header;
  if (!rightContainer.querySelector('#global-surface-anchor')) {
    const surfAnchor = document.createElement('div');
    surfAnchor.className = 'menu-anchor align-end';
    surfAnchor.id = 'global-surface-anchor';
    surfAnchor.innerHTML = `
      <button type="button" class="site-menu-btn surface-menu-trigger" data-menu-toggle aria-expanded="false" aria-haspopup="menu" title="Atmosfera e cor de fundo (21 superfícies)">
        <span class="surface-menu-swatch" id="global-surface-swatch" style="background:${curMeta.hex};width:11px;height:11px;border-radius:50%;border:1px solid var(--ds-border-strong);display:inline-block;"></span>
        <span id="global-surface-label">${curMeta.name.split(' ')[0]}</span>
        <svg class="menu-chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 L5 6.5 L8 3.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="header-menu" data-open="false" role="menu" style="min-width:230px;">
        <div class="surface-menu-scroll" style="display:grid;gap:2px;max-height:320px;overflow:auto;">
          ${SURFACES.map((sf) => `
            <button type="button" class="header-menu-item" role="menuitemradio" data-global-surface="${sf.id}" aria-pressed="${sf.id === curSurface ? 'true' : 'false'}" style="justify-content:flex-start;gap:8px;">
              <span style="width:12px;height:12px;border-radius:50%;background:${sf.hex};border:1px solid var(--ds-border-strong);flex-shrink:0;"></span>
              <span style="flex:1;">${sf.name}</span>
              <span class="mono" style="font-size:10px;opacity:0.55;">${sf.hex}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    const typeAnchor = document.createElement('div');
    typeAnchor.className = 'menu-anchor align-end';
    typeAnchor.id = 'global-type-anchor';
    typeAnchor.innerHTML = `
      <button type="button" class="site-menu-btn" data-menu-toggle aria-expanded="false" aria-haspopup="dialog" title="Tinta e opacidade tipográfica">
        <span style="font-family:var(--ds-font-display);font-size:13px;">Aa</span>
        <span>Tipo</span>
        <svg class="menu-chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 L5 6.5 L8 3.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="header-menu" data-open="false" role="dialog" style="min-width:240px;padding:10px;" data-menu-keep>
        <div style="font-family:var(--ds-font-mono);font-size:10px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.6;margin-bottom:6px;">Cor &amp; Opacidade de Texto</div>
        <div style="display:grid;gap:2px;margin-bottom:10px;">
          ${TYPE_TONES.map((t) => `
            <button type="button" class="header-menu-item" data-global-type-tone="${t.id}" aria-pressed="${typeCfg.primary.tone === t.id ? 'true' : 'false'}" style="justify-content:flex-start;gap:8px;">
              <span style="width:10px;height:10px;border-radius:50%;background:${t.hex === 'current' ? 'var(--ds-fg)' : t.hex};border:1px solid var(--ds-border-strong);"></span>
              <span style="flex:1;">${t.name}</span>
            </button>
          `).join('')}
        </div>
        <div style="font-family:var(--ds-font-mono);font-size:10px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.6;margin-bottom:6px;">Opacidade</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;">
          ${[100, 78, 56].map((op) => `
            <button type="button" class="header-menu-item" data-global-type-opacity="${op}" aria-pressed="${typeCfg.primary.opacity === op ? 'true' : 'false'}" style="justify-content:center;">${op}%</button>
          `).join('')}
        </div>
      </div>
    `;

    const existingLang = rightContainer.querySelector('[data-lang-slot]');
    const oldSurfaceBtnWrap = rightContainer.querySelector('.menu-anchor');
    if (existingLang) {
      rightContainer.insertBefore(typeAnchor, existingLang);
      rightContainer.insertBefore(surfAnchor, typeAnchor);
    } else if (oldSurfaceBtnWrap) {
      rightContainer.insertBefore(surfAnchor, oldSurfaceBtnWrap);
      rightContainer.insertBefore(typeAnchor, oldSurfaceBtnWrap);
    } else {
      rightContainer.append(surfAnchor, typeAnchor);
    }
  }
}

export function bindSiteChrome(): void {
  if (document.documentElement.dataset.siteChrome === 'on') return;
  document.documentElement.dataset.siteChrome = 'on';

  const typeCfg = readTypeConfig();
  try {
    const savedSurface = localStorage.getItem('meridian-surface');
    if (savedSurface && SURFACES.some((s) => s.id === savedSurface)) {
      setSurfaceEverywhere(savedSurface, typeCfg);
    } else {
      applyTypeConfig(typeCfg);
    }
  } catch { /* ignore */ }

  injectUnifiedSubpageChrome(typeCfg);
  hydrateGitHubStars();

  document.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    if (!target) return;

    const globalSurf = target.closest<HTMLElement>('[data-global-surface]');
    if (globalSurf?.dataset.globalSurface) {
      setSurfaceEverywhere(globalSurf.dataset.globalSurface, typeCfg);
      closeHeaderMenus();
      return;
    }

    const chromaBtn = target.closest<HTMLElement>('[data-chroma]');
    if (chromaBtn?.dataset.chroma) {
      setSurfaceEverywhere(chromaBtn.dataset.chroma, typeCfg);
    }
    const surfaceBtn = target.closest<HTMLElement>('[data-set-surface], [data-surface-pick]');
    const picked = surfaceBtn?.dataset.setSurface || surfaceBtn?.dataset.surfacePick;
    if (picked) {
      setSurfaceEverywhere(picked, typeCfg);
    }

    const toneBtn = target.closest<HTMLElement>('[data-global-type-tone]');
    if (toneBtn?.dataset.globalTypeTone) {
      const t = toneBtn.dataset.globalTypeTone;
      typeCfg.primary.tone = t;
      typeCfg.secondary.tone = t;
      typeCfg.tertiary.tone = t;
      applyTypeConfig(typeCfg);
      document.querySelectorAll<HTMLElement>('[data-global-type-tone]').forEach((b) => {
        b.setAttribute('aria-pressed', b.dataset.globalTypeTone === t ? 'true' : 'false');
      });
      return;
    }

    const opBtn = target.closest<HTMLElement>('[data-global-type-opacity]');
    if (opBtn?.dataset.globalTypeOpacity) {
      const op = Number(opBtn.dataset.globalTypeOpacity) || 100;
      typeCfg.primary.opacity = op;
      typeCfg.secondary.opacity = op;
      typeCfg.tertiary.opacity = op;
      applyTypeConfig(typeCfg);
      document.querySelectorAll<HTMLElement>('[data-global-type-opacity]').forEach((b) => {
        b.setAttribute('aria-pressed', Number(b.dataset.globalTypeOpacity) === op ? 'true' : 'false');
      });
      return;
    }

    const toggle = target.closest<HTMLElement>('[data-menu-toggle]');
    if (toggle) {
      const menu = toggle.parentElement?.querySelector<HTMLElement>(':scope > .header-menu');
      if (!menu) return;
      const willOpen = menu.dataset.open !== 'true';
      closeHeaderMenus();
      menu.dataset.open = willOpen ? 'true' : 'false';
      toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      return;
    }

    if (target.closest('[data-menu-keep]')) return;
    if (target.closest('.header-menu')) {
      closeHeaderMenus();
      return;
    }
    if (!target.closest('.menu-anchor')) closeHeaderMenus();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeHeaderMenus();
  });
}
