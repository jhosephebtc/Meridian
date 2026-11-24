/** Barra e personalização global unificadas — todas as páginas compartilham Sistema · Studio · Lab · Arquivo, 21 superfícies, Grão/Dust & Scratches e Aa Tipo. */
import { GRAIN_SIZES, type GrainPreset, type GrainSizeId } from './tokens';
import {
  getPaperGrainDustLevel,
  getPaperGrainIntensity,
  getPaperGrainOpacity,
  getPaperGrainScratchLevel,
  mountPaperGrain,
  setPaperGrainDouble,
  setPaperGrainDustLevel,
  setPaperGrainIntensity,
  setPaperGrainOpacity,
  setPaperGrainScratchLevel,
  setPaperGrainSize,
} from './paper-grain';

type ChromeLang = 'pt' | 'en' | 'es' | 'fr';

const CHROME_I18N: Record<ChromeLang, Record<string, string>> = {
  pt: {
    navAria: 'Navegação global Meridian',
    system: 'Sistema',
    studio: 'Studio',
    lab: 'Lab',
    archive: 'Arquivo',
    manifesto: 'Manifesto',
    farol: 'O Farol e o Meridiano',
    gann: 'Dossiê W.D. Gann',
    surfaceTitle: 'Atmosfera e cor de fundo (26 superfícies)',
    grain: 'Grão',
    grainTitle: 'Papel, Dust & Scratches em toda a página',
    intensity: 'Intensidade',
    off: 'Off',
    subtle: 'Suave',
    editorial: 'Edit.',
    tactile: 'Tátil',
    opacity: 'Opacidade',
    dust: 'Dust (Poeira)',
    scratches: 'Scratches (Riscos)',
    grainSize: 'Tamanho do grão',
    fine: 'Fino',
    medium: 'Médio',
    coarse: 'Grosso',
    chunky: 'Grumo',
    doubleLayer: 'Grão duplo (fibra + micro)',
    typeLabel: 'Tipo',
    typeTitle: 'Tinta e opacidade tipográfica',
    typeHeading: 'Cor & Opacidade de Texto',
    surfaceInk: 'Tinta da superfície',
    mutedInk: 'Tinta suavizada',
    footerMantra: '“Isso ajuda os navegadores a encontrar seu caminho?”',
    footerBackTop: 'Voltar ao topo ↑',
    footerSystem: 'Sistema',
    footerStudio: 'Studio Preview',
    footerLab: 'Components Lab',
    footerManifesto: 'Manifesto',
    footerFarol: 'O Farol e o Meridiano',
    footerGann: 'Dossiê W.D. Gann',
    footerPlotter: 'Gramática Plotter',
    footerAtelier: 'Atelier TS',
    footerNasa: 'Arquivo NASA',
  },
  en: {
    navAria: 'Meridian global navigation',
    system: 'System',
    studio: 'Studio',
    lab: 'Lab',
    archive: 'Archive',
    manifesto: 'Manifesto',
    farol: 'The Lighthouse & Meridian',
    gann: 'W.D. Gann Dossier',
    surfaceTitle: 'Surface atmosphere & background (26 surfaces)',
    grain: 'Grain',
    grainTitle: 'Page-wide Paper Grain, Dust & Scratches',
    intensity: 'Intensity',
    off: 'Off',
    subtle: 'Subtle',
    editorial: 'Edit.',
    tactile: 'Tactile',
    opacity: 'Opacity',
    dust: 'Dust',
    scratches: 'Scratches',
    grainSize: 'Grain size',
    fine: 'Fine',
    medium: 'Medium',
    coarse: 'Coarse',
    chunky: 'Chunky',
    doubleLayer: 'Double grain (fiber + micro)',
    typeLabel: 'Type',
    typeTitle: 'Text ink color and opacity',
    typeHeading: 'Text Color & Opacity',
    surfaceInk: 'Surface ink',
    mutedInk: 'Muted ink',
    footerMantra: '“Does this help navigators find their way?”',
    footerBackTop: 'Back to top ↑',
    footerSystem: 'System',
    footerStudio: 'Studio Preview',
    footerLab: 'Components Lab',
    footerManifesto: 'Manifesto',
    footerFarol: 'The Lighthouse & Meridian',
    footerGann: 'W.D. Gann Dossier',
    footerPlotter: 'Plotter Grammar',
    footerAtelier: 'Atelier TS',
    footerNasa: 'NASA Archive',
  },
  es: {
    navAria: 'Navegación global Meridian',
    system: 'Sistema',
    studio: 'Studio',
    lab: 'Lab',
    archive: 'Archivo',
    manifesto: 'Manifiesto',
    farol: 'El Faro y el Meridiano',
    gann: 'Dosier W.D. Gann',
    surfaceTitle: 'Atmósfera cromática y fondo (26 superficies)',
    grain: 'Grano',
    grainTitle: 'Grano, Dust y Scratches en toda la página',
    intensity: 'Intensidad',
    off: 'Off',
    subtle: 'Suave',
    editorial: 'Edit.',
    tactile: 'Táctil',
    opacity: 'Opacidad',
    dust: 'Dust (Polvo)',
    scratches: 'Scratches (Rayas)',
    grainSize: 'Tamaño del grano',
    fine: 'Fino',
    medium: 'Medio',
    coarse: 'Grueso',
    chunky: 'Grumo',
    doubleLayer: 'Doble grano (fibra + micro)',
    typeLabel: 'Tipo',
    typeTitle: 'Tinta y opacidad tipográfica',
    typeHeading: 'Color y Opacidad de Texto',
    surfaceInk: 'Tinta de superficie',
    mutedInk: 'Tinta suave',
    footerMantra: '“¿Esto ayuda a los navegantes a encontrar su camino?”',
    footerBackTop: 'Volver arriba ↑',
    footerSystem: 'Sistema',
    footerStudio: 'Studio Preview',
    footerLab: 'Components Lab',
    footerManifesto: 'Manifiesto',
    footerFarol: 'El Faro y el Meridiano',
    footerGann: 'Dosier W.D. Gann',
    footerPlotter: 'Gramática Plotter',
    footerAtelier: 'Atelier TS',
    footerNasa: 'Archivo NASA',
  },
  fr: {
    navAria: 'Navigation globale Meridian',
    system: 'Système',
    studio: 'Studio',
    lab: 'Lab',
    archive: 'Archive',
    manifesto: 'Manifeste',
    farol: 'Le Phare et le Méridien',
    gann: 'Dossier W.D. Gann',
    surfaceTitle: 'Atmosphère et couleur de fond (26 surfaces)',
    grain: 'Grain',
    grainTitle: 'Grain papier, Poussière & Rayures sur toute la page',
    intensity: 'Intensité',
    off: 'Off',
    subtle: 'Subtil',
    editorial: 'Édit.',
    tactile: 'Tactile',
    opacity: 'Opacité',
    dust: 'Poussière (Dust)',
    scratches: 'Rayures (Scratches)',
    grainSize: 'Taille du grain',
    fine: 'Fin',
    medium: 'Moyen',
    coarse: 'Épais',
    chunky: 'Grumeleux',
    doubleLayer: 'Double grain (fibre + micro)',
    typeLabel: 'Type',
    typeTitle: 'Encre et opacité typographiques',
    typeHeading: 'Couleur & Opacité du Texte',
    surfaceInk: 'Encre de surface',
    mutedInk: 'Encre atténuée',
    footerMantra: '« Cela aide-t-il les navigateurs à trouver leur chemin ? »',
    footerBackTop: 'Haut de page ↑',
    footerSystem: 'Système',
    footerStudio: 'Studio Preview',
    footerLab: 'Components Lab',
    footerManifesto: 'Manifeste',
    footerFarol: 'Le Phare et le Méridien',
    footerGann: 'Dossier W.D. Gann',
    footerPlotter: 'Grammaire Plotter',
    footerAtelier: 'Atelier TS',
    footerNasa: 'Archive NASA',
  },
};

function currentChromeLang(): ChromeLang {
  try {
    const saved = localStorage.getItem('meridian-lang');
    if (saved === 'pt' || saved === 'en' || saved === 'es' || saved === 'fr') return saved;
  } catch { /* ignore */ }
  const hl = (document.documentElement.lang || '').slice(0, 2).toLowerCase();
  if (hl === 'en' || hl === 'es' || hl === 'fr') return hl;
  return 'pt';
}

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
  { id: 'basalt', name: 'Basalt Noir', hex: '#191B1D', dark: true },
  { id: 'graphite', name: 'Graphite Mute', hex: '#1E1D1B', dark: true },
  { id: 'moss', name: 'Moss Shadow', hex: '#171C19', dark: true },
  { id: 'prune', name: 'Muted Eggplant', hex: '#1B171D', dark: true },
  { id: 'espresso', name: 'Smoked Umber', hex: '#1D1815', dark: true },
  { id: 'obsidian', name: 'Obsidian Dark', hex: '#141413', dark: true },
];

const TYPE_TONES = [
  { id: 'surface', name: 'Tinta da superfície', hex: 'current' },
  { id: 'obsidian', name: 'Obsidian Dark', hex: '#141413' },
  { id: 'basalt', name: 'Basalt Noir', hex: '#191B1D' },
  { id: 'graphite', name: 'Graphite Mute', hex: '#1E1D1B' },
  { id: 'moss', name: 'Moss Shadow', hex: '#171C19' },
  { id: 'prune', name: 'Muted Eggplant', hex: '#1B171D' },
  { id: 'espresso', name: 'Smoked Umber', hex: '#1D1815' },
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
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('meridian:surface', { detail: { surface: surfaceId } }));
  }
}

function syncRangePct(input: HTMLInputElement | null): void {
  if (!input) return;
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const val = Number(input.value || 0);
  const pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
  input.style.setProperty('--range-pct', `${Math.max(0, Math.min(100, pct)).toFixed(1)}%`);
}

function ensureGrainMountedForSubpages(): void {
  if (document.getElementById('btn-surface-menu')) return;
  if (!document.getElementById('ds-paper-grain')) {
    mountPaperGrain();
  }
}

function buildGrainPopoverHtml(t: Record<string, string>): string {
  const curInt = getPaperGrainIntensity();
  const curOp = Math.round(getPaperGrainOpacity() * 100);
  const curSize = (document.documentElement.dataset.grainSize as GrainSizeId) || 'medium';
  const curDust = getPaperGrainDustLevel();
  const curScratch = getPaperGrainScratchLevel();
  const curDouble = document.documentElement.dataset.grainDouble === 'on';
  const intensities: { id: GrainPreset; label: string }[] = [
    { id: 'off', label: t.off },
    { id: 'subtle', label: t.subtle },
    { id: 'editorial', label: t.editorial },
    { id: 'tactile', label: t.tactile },
  ];
  const sizes: { id: GrainSizeId; label: string }[] = [
    { id: 'fine', label: t.fine },
    { id: 'medium', label: t.medium },
    { id: 'coarse', label: t.coarse },
    { id: 'chunky', label: t.chunky },
  ];
  return `
    <div style="font-family:var(--ds-font-mono);font-size:10px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.62;margin-bottom:6px;">${t.intensity}</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:10px;">
      ${intensities.map((it) => `
        <button type="button" class="header-menu-item" data-global-grain="${it.id}" aria-pressed="${curInt === it.id ? 'true' : 'false'}" style="justify-content:center;padding:5px 4px;font-size:11.5px;">${it.label}</button>
      `).join('')}
    </div>

    <div style="font-family:var(--ds-font-mono);font-size:10px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.62;margin-bottom:4px;">${t.opacity}</div>
    <div class="global-grain-slider-row">
      <input id="global-grain-opacity-range" type="range" min="20" max="100" step="5" value="${curOp}" aria-label="${t.opacity}" />
      <span id="global-grain-opacity-val" class="global-grain-slider-val">${curOp}%</span>
    </div>

    <div style="font-family:var(--ds-font-mono);font-size:10px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.62;margin-bottom:4px;">${t.dust}</div>
    <div class="global-grain-slider-row">
      <input id="global-dust-range" type="range" min="0" max="100" step="5" value="${curDust}" aria-label="${t.dust}" />
      <span id="global-dust-val" class="global-grain-slider-val">${curDust}%</span>
    </div>

    <div style="font-family:var(--ds-font-mono);font-size:10px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.62;margin-bottom:4px;">${t.scratches}</div>
    <div class="global-grain-slider-row">
      <input id="global-scratch-range" type="range" min="0" max="100" step="5" value="${curScratch}" aria-label="${t.scratches}" />
      <span id="global-scratch-val" class="global-grain-slider-val">${curScratch}%</span>
    </div>

    <div style="font-family:var(--ds-font-mono);font-size:10px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.62;margin-bottom:6px;">${t.grainSize}</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:8px;">
      ${sizes.map((sz) => `
        <button type="button" class="header-menu-item" data-global-grain-size="${sz.id}" aria-pressed="${curSize === sz.id ? 'true' : 'false'}" style="justify-content:center;padding:5px 4px;font-size:11.5px;">${sz.label}</button>
      `).join('')}
    </div>

    <button type="button" class="header-menu-item" data-global-grain-double aria-pressed="${curDouble ? 'true' : 'false'}" style="justify-content:center;font-size:12px;">
      ${t.doubleLayer}
    </button>
  `;
}

function injectUnifiedSubpageChrome(typeCfg: TypeConfig): void {
  // index.html já possui o header nativo completo (.topbar)
  if (document.getElementById('btn-surface-menu')) return;

  const pageName = window.location.pathname.split('/').pop() || 'index.html';
  const header = document.querySelector<HTMLElement>('.ds-topbar, .gann-chrome-inner');
  if (!header) return;

  const t = CHROME_I18N[currentChromeLang()];
  const isArchive = pageName === 'manifesto.html' || pageName === 'historia.html' || pageName === 'gann.html';
  const curSurface = document.documentElement.getAttribute('data-surface') || 'ivory';
  const curMeta = SURFACES.find((s) => s.id === curSurface) || SURFACES[0];

  // Limpa cópias anteriores ao trocar de idioma
  header.querySelector('.meridian-unified-nav')?.remove();
  header.querySelector('#global-surface-anchor')?.remove();
  header.querySelector('#global-grain-anchor')?.remove();
  header.querySelector('#global-type-anchor')?.remove();

  // 1. Links globais à esquerda no masthead 1fr-auto-1fr (Sistema · Studio · Lab · Arquivo ▾)
  const nav = document.createElement('nav');
  nav.className = 'meridian-unified-nav';
  nav.setAttribute('aria-label', t.navAria);
  nav.innerHTML = `
    <a href="./index.html" class="meridian-nav-link"${pageName === 'index.html' ? ' aria-current="page"' : ''}>${t.system}</a>
    <a href="./preview.html" class="meridian-nav-link"${pageName === 'preview.html' ? ' aria-current="page"' : ''}>${t.studio}</a>
    <a href="./components.html" class="meridian-nav-link"${pageName === 'components.html' ? ' aria-current="page"' : ''}>${t.lab}</a>
    <div class="menu-anchor"${isArchive ? ' data-current="true"' : ''}>
      <button type="button" class="site-menu-btn" data-menu-toggle aria-expanded="false" aria-haspopup="menu">
        <span>${t.archive}</span>
        <svg class="menu-chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 L5 6.5 L8 3.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="header-menu" data-open="false" role="menu">
        <a href="./manifesto.html" role="menuitem"${pageName === 'manifesto.html' ? ' aria-current="page"' : ''}>${t.manifesto}</a>
        <a href="./historia.html" role="menuitem"${pageName === 'historia.html' ? ' aria-current="page"' : ''}>${t.farol}</a>
        <a href="./gann.html" role="menuitem"${pageName === 'gann.html' ? ' aria-current="page"' : ''}>${t.gann}</a>
      </div>
    </div>
  `;
  const brand = header.querySelector('.brand-mark, .gann-brand');
  if (brand) header.insertBefore(nav, brand);
  else header.prepend(nav);

  // 2. Controles globais agrupados na coluna direita (1fr justify-self:end)
  let rightContainer = header.querySelector<HTMLElement>('.lab-topbar-actions, .topbar-right, .meridian-chrome-actions');
  if (!rightContainer) {
    rightContainer = document.createElement('div');
    rightContainer.className = 'meridian-chrome-actions';
    Array.from(header.children).forEach((child) => {
      if (
        child === nav
        || child.classList.contains('gann-brand')
        || child.classList.contains('gann-burger')
        || child.classList.contains('gann-nav-center')
      ) {
        return;
      }
      rightContainer?.appendChild(child);
    });
    header.appendChild(rightContainer);
  }

  // Oculta seletores legados redundantes sem quebrar event listeners das páginas
  rightContainer.querySelectorAll<HTMLElement>('.menu-anchor, .popover-wrap').forEach((wrap) => {
    if (wrap.closest('.meridian-unified-nav')) return;
    if (wrap.id === 'global-surface-anchor' || wrap.id === 'global-grain-anchor' || wrap.id === 'global-type-anchor') return;
    wrap.classList.add('meridian-legacy-hidden');
  });

  const surfAnchor = document.createElement('div');
  surfAnchor.className = 'menu-anchor align-end';
  surfAnchor.id = 'global-surface-anchor';
  surfAnchor.innerHTML = `
    <button type="button" class="site-menu-btn surface-menu-trigger" data-menu-toggle aria-expanded="false" aria-haspopup="menu" title="${t.surfaceTitle}">
      <span class="surface-menu-swatch" id="global-surface-swatch" style="background:${curMeta.hex};width:11px;height:11px;border-radius:50%;border:1px solid var(--ds-border-strong);display:inline-block;"></span>
      <span class="surface-menu-label" id="global-surface-label">${curMeta.name.split(' ')[0]}</span>
      <svg class="menu-chevron surface-menu-chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 L5 6.5 L8 3.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
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

  const grainAnchor = document.createElement('div');
  grainAnchor.className = 'menu-anchor align-end';
  grainAnchor.id = 'global-grain-anchor';
  grainAnchor.innerHTML = `
    <button type="button" class="site-menu-btn" data-menu-toggle aria-expanded="false" aria-haspopup="dialog" title="${t.grainTitle}">
      <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="5" cy="5" r="1.4" fill="currentColor"/>
        <circle cx="10.5" cy="5.5" r="1.1" fill="currentColor" opacity="0.6"/>
        <circle cx="15" cy="5" r="1.3" fill="currentColor"/>
        <circle cx="7.5" cy="10.5" r="1.2" fill="currentColor"/>
        <circle cx="13.5" cy="10" r="1.1" fill="currentColor" opacity="0.75"/>
        <circle cx="5" cy="15" r="1.1" fill="currentColor" opacity="0.65"/>
        <circle cx="11" cy="15" r="1.4" fill="currentColor"/>
        <line x1="15.5" y1="12" x2="17" y2="17" stroke="currentColor" stroke-width="1.1" opacity="0.65"/>
      </svg>
      <span class="grain-btn-label">${t.grain}</span>
      <svg class="menu-chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 L5 6.5 L8 3.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <div class="header-menu global-grain-popover" data-open="false" role="dialog" data-menu-keep>
      ${buildGrainPopoverHtml(t)}
    </div>
  `;

  const typeAnchor = document.createElement('div');
  typeAnchor.className = 'menu-anchor align-end';
  typeAnchor.id = 'global-type-anchor';
  typeAnchor.innerHTML = `
    <button type="button" class="site-menu-btn" data-menu-toggle aria-expanded="false" aria-haspopup="dialog" title="${t.typeTitle}">
      <span style="font-family:var(--ds-font-display);font-size:13px;">Aa</span>
      <span class="surface-menu-label">${t.typeLabel}</span>
      <svg class="menu-chevron surface-menu-chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 L5 6.5 L8 3.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <div class="header-menu" data-open="false" role="dialog" style="min-width:240px;padding:10px;" data-menu-keep>
      <div style="font-family:var(--ds-font-mono);font-size:10px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.6;margin-bottom:6px;">${t.typeHeading}</div>
      <div style="display:grid;gap:2px;margin-bottom:10px;">
        ${TYPE_TONES.map((tone) => {
          const toneName = tone.id === 'surface' ? t.surfaceInk : tone.id === 'muted' ? t.mutedInk : tone.name;
          return `
            <button type="button" class="header-menu-item" data-global-type-tone="${tone.id}" aria-pressed="${typeCfg.primary.tone === tone.id ? 'true' : 'false'}" style="justify-content:flex-start;gap:8px;">
              <span style="width:10px;height:10px;border-radius:50%;background:${tone.hex === 'current' ? 'var(--ds-fg)' : tone.hex};border:1px solid var(--ds-border-strong);"></span>
              <span style="flex:1;">${toneName}</span>
            </button>
          `;
        }).join('')}
      </div>
      <div style="font-family:var(--ds-font-mono);font-size:10px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.6;margin-bottom:6px;">${t.opacity}</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;">
        ${[100, 78, 56].map((op) => `
          <button type="button" class="header-menu-item" data-global-type-opacity="${op}" aria-pressed="${typeCfg.primary.opacity === op ? 'true' : 'false'}" style="justify-content:center;">${op}%</button>
        `).join('')}
      </div>
    </div>
  `;

  const existingLang = rightContainer.querySelector('[data-lang-slot]');
  const existingStar = rightContainer.querySelector('.site-gh-star');
  if (existingLang) {
    rightContainer.insertBefore(surfAnchor, existingLang);
    rightContainer.insertBefore(grainAnchor, existingLang);
    rightContainer.insertBefore(typeAnchor, existingLang);
  } else if (existingStar) {
    rightContainer.insertBefore(surfAnchor, existingStar);
    rightContainer.insertBefore(grainAnchor, existingStar);
    rightContainer.insertBefore(typeAnchor, existingStar);
  } else {
    rightContainer.append(surfAnchor, grainAnchor, typeAnchor);
  }

  // Bind sliders inside global-grain-anchor
  const opRange = grainAnchor.querySelector<HTMLInputElement>('#global-grain-opacity-range');
  const opVal = grainAnchor.querySelector<HTMLElement>('#global-grain-opacity-val');
  syncRangePct(opRange);
  opRange?.addEventListener('input', () => {
    syncRangePct(opRange);
    const pct = Math.max(20, Math.min(100, Number(opRange.value)));
    if (opVal) opVal.textContent = `${pct}%`;
    setPaperGrainOpacity(pct / 100);
  });

  const dustRange = grainAnchor.querySelector<HTMLInputElement>('#global-dust-range');
  const dustVal = grainAnchor.querySelector<HTMLElement>('#global-dust-val');
  syncRangePct(dustRange);
  dustRange?.addEventListener('input', () => {
    syncRangePct(dustRange);
    ensureGrainMountedForSubpages();
    const lv = setPaperGrainDustLevel(Number(dustRange.value));
    if (dustVal) dustVal.textContent = `${lv}%`;
  });

  const scratchRange = grainAnchor.querySelector<HTMLInputElement>('#global-scratch-range');
  const scratchVal = grainAnchor.querySelector<HTMLElement>('#global-scratch-val');
  syncRangePct(scratchRange);
  scratchRange?.addEventListener('input', () => {
    syncRangePct(scratchRange);
    ensureGrainMountedForSubpages();
    const lv = setPaperGrainScratchLevel(Number(scratchRange.value));
    if (scratchVal) scratchVal.textContent = `${lv}%`;
  });
}

function syncEditorialFooterI18n(): void {
  const t = CHROME_I18N[currentChromeLang()];
  document.querySelectorAll<HTMLElement>('[data-ef-i18n]').forEach((el) => {
    const key = el.dataset.efI18n;
    if (key && t[key]) el.textContent = t[key];
  });
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
  syncEditorialFooterI18n();
  hydrateGitHubStars();

  window.addEventListener('meridian:lang', () => {
    injectUnifiedSubpageChrome(typeCfg);
    syncEditorialFooterI18n();
  });

  window.addEventListener('meridian:grain', () => {
    const int = getPaperGrainIntensity();
    const sz = (document.documentElement.dataset.grainSize as GrainSizeId) || 'medium';
    const dbl = document.documentElement.dataset.grainDouble === 'on';
    const opPct = Math.round(getPaperGrainOpacity() * 100);
    const dustPct = getPaperGrainDustLevel();
    const scratchPct = getPaperGrainScratchLevel();

    document.querySelectorAll<HTMLElement>('[data-global-grain]').forEach((b) => {
      b.setAttribute('aria-pressed', b.dataset.globalGrain === int ? 'true' : 'false');
    });
    document.querySelectorAll<HTMLElement>('[data-global-grain-size]').forEach((b) => {
      b.setAttribute('aria-pressed', b.dataset.globalGrainSize === sz ? 'true' : 'false');
    });
    document.querySelectorAll<HTMLElement>('[data-global-grain-double]').forEach((b) => {
      b.setAttribute('aria-pressed', dbl ? 'true' : 'false');
    });
    const opRange = document.getElementById('global-grain-opacity-range') as HTMLInputElement | null;
    const opVal = document.getElementById('global-grain-opacity-val');
    if (opRange) opRange.value = String(opPct);
    if (opVal) opVal.textContent = `${opPct}%`;

    const dRange = document.getElementById('global-dust-range') as HTMLInputElement | null;
    const dVal = document.getElementById('global-dust-val');
    if (dRange) dRange.value = String(dustPct);
    if (dVal) dVal.textContent = `${dustPct}%`;

    const sRange = document.getElementById('global-scratch-range') as HTMLInputElement | null;
    const sVal = document.getElementById('global-scratch-val');
    if (sRange) sRange.value = String(scratchPct);
    if (sVal) sVal.textContent = `${scratchPct}%`;
  });

  document.addEventListener('click', (event) => {
    const target = event.target as Element | null;
    if (!target) return;

    const scrollTopBtn = target.closest<HTMLElement>('[data-scroll-top]');
    if (scrollTopBtn) {
      event.preventDefault();
      const instant = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: instant ? 'auto' : 'smooth' });
      return;
    }

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

    const gIntBtn = target.closest<HTMLElement>('[data-global-grain]');
    if (gIntBtn?.dataset.globalGrain) {
      ensureGrainMountedForSubpages();
      setPaperGrainIntensity(gIntBtn.dataset.globalGrain as GrainPreset);
      return;
    }

    const gSizeBtn = target.closest<HTMLElement>('[data-global-grain-size]');
    if (gSizeBtn?.dataset.globalGrainSize && gSizeBtn.dataset.globalGrainSize in GRAIN_SIZES) {
      ensureGrainMountedForSubpages();
      setPaperGrainSize(gSizeBtn.dataset.globalGrainSize as GrainSizeId);
      return;
    }

    const gDblBtn = target.closest<HTMLElement>('[data-global-grain-double]');
    if (gDblBtn) {
      ensureGrainMountedForSubpages();
      const next = document.documentElement.dataset.grainDouble !== 'on';
      setPaperGrainDouble(next);
      return;
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

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindSiteChrome, { once: true });
  } else {
    bindSiteChrome();
  }
}
