/**
 * Barra masthead unificada (Sistema · Studio · Lab · Arquivo | Meridian | Fundo · Tipo · Preferências)
 * + Estúdio Wide Multi-Colunas de Atmosfera (40 superfícies + cor livre)
 * & Hierarquia Tipográfica / Botões com Slider Contínuo de Transparência (10%–100%).
 * + Painel Preferências unificado (Idioma PT/EN/ES/FR · Grão, Poeira & Riscos · Modo · Sinais · Atalhos · GitHub).
 */
import {
  GRAIN_SIZES,
  SURFACES,
  SURFACE_SPECTRUM,
  TYPE_INKS,
  type GrainPreset,
  type GrainSizeId,
  type OperationalMode,
  type SurfaceId,
  type TypeRoleId,
} from './tokens';
import {
  DEFAULT_TYPE_CONFIG,
  ROLE_ORDER,
  applyTypeConfigToDom,
  bootMeridianThemeSync,
  contrastRatioString,
  getActiveBaseColors,
  getCustomGroundHex,
  isValidSurfaceId,
  readTypeConfig,
  resolveRoleHex,
  setGlobalCustomGround,
  setGlobalMode,
  setGlobalSurface,
  type MeridianTypeConfig,
} from './theme-sync';
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
type SurfaceFilterGroup = 'all' | 'light' | 'chromatic' | 'dark';

const LIGHT_EDITORIAL_IDS = new Set<SurfaceId>([
  'ivory', 'alabaster', 'paper', 'pearl', 'linen', 'parchment', 'oat', 'sand', 'ash',
]);

function getSurfaceGroup(id: SurfaceId): 'light' | 'chromatic' | 'dark' {
  if (SURFACES[id].scheme === 'dark') return 'dark';
  if (LIGHT_EDITORIAL_IDS.has(id)) return 'light';
  return 'chromatic';
}

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
    surfaceTitle: 'Atmosfera e cor de fundo (40 superfícies + cor livre)',
    filterAll: 'Todas',
    filterLight: 'Claras',
    filterChromatic: 'Cromáticas',
    filterDark: 'Escuras',
    customGround: 'Fundo livre (#HEX)',
    resetGround: 'Papel padrão',
    prefsLabel: 'Preferências',
    prefsTitle: 'Preferências: Idioma, Grão, Poeira, Riscos, Modo & Atalhos',
    prefsLang: 'Idioma',
    prefsMode: 'Modo & Sinais',
    prefsActions: 'Atalhos & Página',
    modeB2c: 'B2C Invisível',
    modeTech: 'Técnico Pro',
    sigChroma: 'Cromático',
    sigMono: 'Monocromo',
    paletteCmdk: 'Paleta rápida',
    layoutHeader: 'Menu no topo',
    layoutRail: 'Menu lateral',
    grain: 'Papel, Poeira & Riscos',
    intensity: 'Intensidade',
    off: 'Off',
    subtle: 'Suave',
    editorial: 'Edit.',
    tactile: 'Tátil',
    opacity: 'Opacidade do grão',
    dust: 'Poeira (Dust)',
    scratches: 'Riscos (Scratches)',
    grainSize: 'Escala do grão',
    fine: 'Fino',
    medium: 'Médio',
    coarse: 'Grosso',
    chunky: 'Grumo',
    doubleLayer: 'Grão duplo (fibra + micro)',
    typeLabel: 'Tipo',
    typeTitle: 'Cores de conteúdo, botões e transparência',
    typeHeading: 'Cores de conteúdo & transparência',
    editingPrefix: 'Editando',
    rolesHeading: 'Alvos de cor',
    contentColorsHeading: 'Cores de conteúdo',
    transparencyOfSelected: 'Transparência da cor selecionada',
    role_primary: 'Primário',
    role_secondary: 'Secundário',
    role_tertiary: 'Terciário',
    role_accent: 'Links & destaques',
    role_buttonPrimaryBg: 'Botão 1º · fundo',
    role_buttonPrimaryFg: 'Botão 1º · texto',
    role_buttonSecondaryFg: 'Botão 2º · texto',
    role_buttonSecondaryBg: 'Botão 2º · fundo',
    roleDesc_primary: 'Títulos em Geist Serif, wordmarks e prosa principal',
    roleDesc_secondary: 'Leads, subtítulos, descrições de seção e navegação',
    roleDesc_tertiary: 'Metadados, legendas, índices, kickers e telemetria',
    roleDesc_accent: 'Links inline, claims pontilhados, sublinhados e barras',
    roleDesc_buttonPrimaryBg: 'Cor de preenchimento de botões primários e abas ativas',
    roleDesc_buttonPrimaryFg: 'Texto sobre botões primários e abas ativas',
    roleDesc_buttonSecondaryFg: 'Texto de botões secundários, terciários, ghost e chips',
    roleDesc_buttonSecondaryBg: 'Cor de fundo de botões secundários e terciários',
    surfaceInk: 'Automático',
    mutedInk: 'Suavizado',
    customInk: 'Cor livre',
    groupDarkInks: 'Escuras & minerais',
    groupEditorialInks: 'Cromáticas editoriais',
    groupLightInks: 'Claras & marfim',
    ruleAlpha: 'Fios & bordas',
    resetAllType: 'Restaurar tudo',
    sampleWord: 'Meridiano · 123',
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
    surfaceTitle: 'Surface atmosphere & background (40 surfaces + custom)',
    filterAll: 'All',
    filterLight: 'Light',
    filterChromatic: 'Chromatic',
    filterDark: 'Dark',
    customGround: 'Custom background',
    resetGround: 'Preset paper',
    prefsLabel: 'Preferences',
    prefsTitle: 'Preferences: Language, Paper Grain, Dust, Scratches, Mode & Shortcuts',
    prefsLang: 'Language',
    prefsMode: 'Mode & Signals',
    prefsActions: 'Shortcuts & View',
    modeB2c: 'B2C Invisible',
    modeTech: 'Technical Pro',
    sigChroma: 'Chromatic',
    sigMono: 'Monochrome',
    paletteCmdk: 'Command palette',
    layoutHeader: 'Top nav',
    layoutRail: 'Side rail',
    grain: 'Paper, Dust & Scratches',
    intensity: 'Intensity',
    off: 'Off',
    subtle: 'Subtle',
    editorial: 'Edit.',
    tactile: 'Tactile',
    opacity: 'Grain opacity',
    dust: 'Dust',
    scratches: 'Scratches',
    grainSize: 'Grain scale',
    fine: 'Fine',
    medium: 'Medium',
    coarse: 'Coarse',
    chunky: 'Chunky',
    doubleLayer: 'Double grain (fiber + micro)',
    typeLabel: 'Type',
    typeTitle: 'Content colors, buttons and transparency',
    typeHeading: 'Content colors & transparency',
    editingPrefix: 'Editing',
    rolesHeading: 'Color targets',
    contentColorsHeading: 'Content colors',
    transparencyOfSelected: 'Selected color transparency',
    role_primary: 'Primary',
    role_secondary: 'Secondary',
    role_tertiary: 'Tertiary',
    role_accent: 'Links & accents',
    role_buttonPrimaryBg: 'Primary btn · fill',
    role_buttonPrimaryFg: 'Primary btn · text',
    role_buttonSecondaryFg: 'Secondary btn · text',
    role_buttonSecondaryBg: 'Secondary btn · fill',
    roleDesc_primary: 'Geist Serif headings, wordmarks, and body prose',
    roleDesc_secondary: 'Leads, subtitles, section intros, and navigation',
    roleDesc_tertiary: 'Metadata, captions, indices, kickers, and telemetry',
    roleDesc_accent: 'Inline links, dotted claims, underlines, and bars',
    roleDesc_buttonPrimaryBg: 'Fill color of primary buttons and active clip-tabs',
    roleDesc_buttonPrimaryFg: 'Text inside primary buttons and active clip-tabs',
    roleDesc_buttonSecondaryFg: 'Text of secondary, tertiary, ghost, and pill buttons',
    roleDesc_buttonSecondaryBg: 'Background fill of secondary and tertiary buttons',
    surfaceInk: 'Automatic',
    mutedInk: 'Muted ink',
    customInk: 'Custom HEX',
    groupDarkInks: 'Dark & mineral',
    groupEditorialInks: 'Editorial chromatic',
    groupLightInks: 'Light & ivory',
    ruleAlpha: 'Hairlines & borders',
    resetAllType: 'Reset defaults',
    sampleWord: 'Meridian · 123',
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
    surfaceTitle: 'Atmósfera y color de fondo (40 superficies + libre)',
    filterAll: 'Todas',
    filterLight: 'Claras',
    filterChromatic: 'Cromáticas',
    filterDark: 'Oscuras',
    customGround: 'Fondo personalizado',
    resetGround: 'Papel base',
    prefsLabel: 'Preferencias',
    prefsTitle: 'Preferencias: Idioma, Grano, Polvo, Rayas, Modo y Atajos',
    prefsLang: 'Idioma',
    prefsMode: 'Modo y Señales',
    prefsActions: 'Atajos y Vista',
    modeB2c: 'B2C Invisible',
    modeTech: 'Técnico Pro',
    sigChroma: 'Cromático',
    sigMono: 'Monocromo',
    paletteCmdk: 'Paleta rápida',
    layoutHeader: 'Menú superior',
    layoutRail: 'Menú lateral',
    grain: 'Papel, Polvo y Rayas',
    intensity: 'Intensidad',
    off: 'Off',
    subtle: 'Suave',
    editorial: 'Edit.',
    tactile: 'Táctil',
    opacity: 'Opacidad del grano',
    dust: 'Polvo (Dust)',
    scratches: 'Rayas (Scratches)',
    grainSize: 'Escala del grano',
    fine: 'Fino',
    medium: 'Medio',
    coarse: 'Grueso',
    chunky: 'Grumo',
    doubleLayer: 'Doble grano (fibra + micro)',
    typeLabel: 'Tipo',
    typeTitle: 'Colores de contenido, botones y transparencia',
    typeHeading: 'Colores de contenido y transparencia',
    editingPrefix: 'Editando',
    rolesHeading: 'Objetivos de color',
    contentColorsHeading: 'Colores de contenido',
    transparencyOfSelected: 'Transparencia del color seleccionado',
    role_primary: 'Primario',
    role_secondary: 'Secundario',
    role_tertiary: 'Terciario',
    role_accent: 'Enlaces y acentos',
    role_buttonPrimaryBg: 'Botón 1º · fondo',
    role_buttonPrimaryFg: 'Botón 1º · texto',
    role_buttonSecondaryFg: 'Botón 2º · texto',
    role_buttonSecondaryBg: 'Botón 2º · fondo',
    roleDesc_primary: 'Títulos en Geist Serif, marcas y prosa principal',
    roleDesc_secondary: 'Entradillas, subtítulos, descripciones y navegación',
    roleDesc_tertiary: 'Metadatos, leyendas, índices y telemetría',
    roleDesc_accent: 'Enlaces, citas punteadas, subrayados y barras',
    roleDesc_buttonPrimaryBg: 'Relleno de botones primarios y pestañas activas',
    roleDesc_buttonPrimaryFg: 'Texto sobre botones primarios y pestañas activas',
    roleDesc_buttonSecondaryFg: 'Texto de botones secundarios, terciarios y chips',
    roleDesc_buttonSecondaryBg: 'Fondo de botones secundarios y terciarios',
    surfaceInk: 'Automático',
    mutedInk: 'Tinta suave',
    customInk: 'Color libre',
    groupDarkInks: 'Oscuras y minerales',
    groupEditorialInks: 'Cromáticas editoriales',
    groupLightInks: 'Claras y marfil',
    ruleAlpha: 'Líneas y bordes',
    resetAllType: 'Restaurar todo',
    sampleWord: 'Meridiano · 123',
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
    surfaceTitle: 'Atmosphère et fond (40 surfaces + couleur libre)',
    filterAll: 'Toutes',
    filterLight: 'Claires',
    filterChromatic: 'Chromatiques',
    filterDark: 'Sombres',
    customGround: 'Fond libre (#HEX)',
    resetGround: 'Papier base',
    prefsLabel: 'Préférences',
    prefsTitle: 'Préférences : Langue, Grain, Poussière, Rayures, Mode & Raccourcis',
    prefsLang: 'Langue',
    prefsMode: 'Mode & Signaux',
    prefsActions: 'Raccourcis & Vue',
    modeB2c: 'B2C Invisible',
    modeTech: 'Technique Pro',
    sigChroma: 'Chromatique',
    sigMono: 'Monochrome',
    paletteCmdk: 'Palette rapide',
    layoutHeader: 'Navigation haut',
    layoutRail: 'Volet latéral',
    grain: 'Papier, Poussière & Rayures',
    intensity: 'Intensité',
    off: 'Off',
    subtle: 'Subtil',
    editorial: 'Édit.',
    tactile: 'Tactile',
    opacity: 'Opacité du grain',
    dust: 'Poussière (Dust)',
    scratches: 'Rayures (Scratches)',
    grainSize: 'Échelle du grain',
    fine: 'Fin',
    medium: 'Moyen',
    coarse: 'Épais',
    chunky: 'Grumeleux',
    doubleLayer: 'Double grain (fibre + micro)',
    typeLabel: 'Type',
    typeTitle: 'Couleurs du contenu, boutons et transparence',
    typeHeading: 'Couleurs du contenu & transparence',
    editingPrefix: 'Édition',
    rolesHeading: 'Cibles couleur',
    contentColorsHeading: 'Couleurs du contenu',
    transparencyOfSelected: 'Transparence de la couleur sélectionnée',
    role_primary: 'Primaire',
    role_secondary: 'Secondaire',
    role_tertiary: 'Tertiaire',
    role_accent: 'Liens & accents',
    role_buttonPrimaryBg: 'Bouton 1er · fond',
    role_buttonPrimaryFg: 'Bouton 1er · texte',
    role_buttonSecondaryFg: 'Bouton 2nd · texte',
    role_buttonSecondaryBg: 'Bouton 2nd · fond',
    roleDesc_primary: 'Titres Geist Serif, logotypes et prose principale',
    roleDesc_secondary: 'Chapeaux, sous-titres, intros et navigation',
    roleDesc_tertiary: 'Métadonnées, légendes, index et télémétrie',
    roleDesc_accent: 'Liens, citations pointillées, soulignements et barres',
    roleDesc_buttonPrimaryBg: 'Fond des boutons primaires et onglets actifs',
    roleDesc_buttonPrimaryFg: 'Texte des boutons primaires et onglets actifs',
    roleDesc_buttonSecondaryFg: 'Texte des boutons secondaires, tertiaires et puces',
    roleDesc_buttonSecondaryBg: 'Fond des boutons secondaires et tertiaires',
    surfaceInk: 'Automatique',
    mutedInk: 'Encre atténuée',
    customInk: 'Couleur libre',
    groupDarkInks: 'Sombres & minérales',
    groupEditorialInks: 'Chromatiques éditoriales',
    groupLightInks: 'Claires & ivoire',
    ruleAlpha: 'Filets & bordures',
    resetAllType: 'Tout réinitialiser',
    sampleWord: 'Méridien · 123',
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

let activeSurfaceFilter: SurfaceFilterGroup = 'all';
let activeTypeRole: TypeRoleId = 'primary';

function syncRangePct(input: HTMLInputElement | null): void {
  if (!input) return;
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const val = Number(input.value || 0);
  const pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
  input.style.setProperty('--range-pct', `${Math.max(0, Math.min(100, pct)).toFixed(1)}%`);
}

function closeHeaderMenus(except?: Element | null): void {
  document.querySelectorAll<HTMLElement>('.header-menu[data-open="true"], .popover[data-open="true"]').forEach((menu) => {
    if (except && (menu === except || menu.contains(except))) return;
    menu.dataset.open = 'false';
    if (menu.classList.contains('popover')) menu.setAttribute('aria-hidden', 'true');
    const toggle = menu.parentElement?.querySelector<HTMLElement>('[data-menu-toggle], #btn-surface-menu, #btn-type-menu');
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
        typeof parsed.count === 'number' &&
        typeof parsed.ts === 'number' &&
        Date.now() - parsed.ts < GH_STARS_TTL_MS
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

function ensureGrainMountedForSubpages(): void {
  if (document.getElementById('btn-surface-menu')) return;
  if (!document.getElementById('ds-paper-grain')) {
    mountPaperGrain();
  }
}

function buildSurfaceStudioInnerHtml(t: Record<string, string>): string {
  const curSurfaceRaw = document.documentElement.getAttribute('data-surface');
  const curSurface: SurfaceId = isValidSurfaceId(curSurfaceRaw) ? curSurfaceRaw : 'ivory';
  const customBg = getCustomGroundHex();
  const base = getActiveBaseColors(curSurface, customBg);

  const filters: { id: SurfaceFilterGroup; label: string; count: number }[] = [
    { id: 'all', label: t.filterAll, count: SURFACE_SPECTRUM.length },
    { id: 'light', label: t.filterLight, count: SURFACE_SPECTRUM.filter((id) => getSurfaceGroup(id) === 'light').length },
    { id: 'chromatic', label: t.filterChromatic, count: SURFACE_SPECTRUM.filter((id) => getSurfaceGroup(id) === 'chromatic').length },
    { id: 'dark', label: t.filterDark, count: SURFACE_SPECTRUM.filter((id) => getSurfaceGroup(id) === 'dark').length },
  ];

  const visibleIds = SURFACE_SPECTRUM.filter((id) =>
    activeSurfaceFilter === 'all' ? true : getSurfaceGroup(id) === activeSurfaceFilter,
  );

  return `
    <div class="meridian-studio-filter-bar" role="tablist" data-menu-keep>
      ${filters.map((f) => `
        <button type="button" class="meridian-filter-pill" data-surface-filter="${f.id}" aria-pressed="${activeSurfaceFilter === f.id ? 'true' : 'false'}" data-menu-keep>
          <span>${f.label}</span>
          <span class="meridian-filter-count">${f.count}</span>
        </button>
      `).join('')}
    </div>

    <div class="meridian-custom-ground-row" data-menu-keep>
      <label class="meridian-color-pick-label" data-menu-keep>
        <input type="color" class="meridian-native-color" data-custom-ground-input value="${base.bg}" aria-label="${t.customGround}" />
        <span class="meridian-color-dot" style="background:${base.bg}"></span>
        <span>${t.customGround}</span>
      </label>
      <span class="mono meridian-hex-tag">${base.bg}</span>
      ${customBg ? `<button type="button" class="meridian-mini-reset" data-reset-custom-ground data-menu-keep>${t.resetGround}</button>` : ''}
    </div>

    <div class="surface-menu-scroll meridian-surface-list">
      ${visibleIds.map((id) => {
        const sf = SURFACES[id];
        const isPressed = !customBg && id === curSurface;
        return `
          <button type="button" class="header-menu-item surface-menu-item" role="menuitemradio" data-global-surface="${id}" data-set-surface="${id}" aria-pressed="${isPressed ? 'true' : 'false'}">
            <span class="surface-menu-swatch" style="width:13px;height:13px;border-radius:50%;background:${sf.bg};border:1px solid var(--ds-border-strong);flex-shrink:0;"></span>
            <span style="flex:1;overflow:hidden;text-overflow:ellipsis;">${sf.label}</span>
            <span class="mono surface-menu-item-meta" style="font-size:10.5px;color:var(--ds-type-tertiary);">${sf.bg}</span>
          </button>
        `;
      }).join('')}
    </div>
  `;
}

function buildTypeStudioInnerHtml(t: Record<string, string>, cfg: MeridianTypeConfig): string {
  const base = getActiveBaseColors();
  const choice = cfg[activeTypeRole];
  const resolvedHex = resolveRoleHex(activeTypeRole, cfg, base);
  const contrastBg =
    activeTypeRole === 'buttonPrimaryFg'
      ? resolveRoleHex('buttonPrimaryBg', cfg, base)
      : activeTypeRole === 'buttonSecondaryFg'
        ? resolveRoleHex('buttonSecondaryBg', cfg, base)
        : base.bg;
  const ratio = contrastRatioString(contrastBg, resolvedHex);

  const renderColumn = (group: 'dark' | 'editorial' | 'light', title: string) => {
    const items = TYPE_INKS.filter((i) => i.group === group);
    return `
      <div class="meridian-ink-col" data-menu-keep>
        <div class="meridian-studio-sublabel">${title}</div>
        <div class="meridian-ink-col-list" role="radiogroup" aria-label="${title}">
          ${items.map((ink) => {
            const active = choice.tone === ink.id;
            return `
              <button type="button" class="meridian-ink-chip" data-studio-role="${activeTypeRole}" data-studio-tone="${ink.id}" aria-pressed="${active ? 'true' : 'false'}" title="${ink.label} (${ink.hex})" data-menu-keep>
                <span class="meridian-ink-chip-dot" style="background:${ink.hex}"></span>
                <span class="meridian-ink-chip-name">${ink.label}</span>
              </button>
            `;
          }).join('')}
        </div>
      </div>
    `;
  };

  let sampleStyle = `color:${resolvedHex};opacity:${(choice.opacity / 100).toFixed(2)};`;
  if (activeTypeRole === 'buttonPrimaryFg' || activeTypeRole === 'buttonPrimaryBg') {
    sampleStyle = `background:${resolveRoleHex('buttonPrimaryBg', cfg, base)};color:${resolveRoleHex('buttonPrimaryFg', cfg, base)};opacity:${(choice.opacity / 100).toFixed(2)};padding:4px 11px;border-radius:999px;`;
  } else if (activeTypeRole === 'buttonSecondaryFg' || activeTypeRole === 'buttonSecondaryBg') {
    sampleStyle = `background:${resolveRoleHex('buttonSecondaryBg', cfg, base)};color:${resolveRoleHex('buttonSecondaryFg', cfg, base)};border:1px solid var(--ds-border-strong);opacity:${(choice.opacity / 100).toFixed(2)};padding:4px 11px;border-radius:999px;`;
  }

  return `
    <div class="meridian-studio-header" data-menu-keep>
      <div class="meridian-studio-head-left">
        <span class="meridian-studio-title">${t.typeHeading}</span>
        <span class="meridian-editing-chip">${t.editingPrefix}: <strong data-studio-active-role-label>${t[`role_${activeTypeRole}`]}</strong></span>
      </div>
      <button type="button" class="meridian-mini-reset" data-studio-reset-all data-menu-keep>${t.resetAllType}</button>
    </div>

    <div class="meridian-type-columns" data-menu-keep>
      <div class="meridian-type-col-roles" role="tablist" aria-label="${t.rolesHeading}" data-menu-keep>
        <div class="meridian-studio-sublabel" style="margin-top:0;">${t.rolesHeading}</div>
        ${ROLE_ORDER.map((r) => {
          const rHex = resolveRoleHex(r, cfg, base);
          const isEdited = cfg[r].tone !== 'surface' || cfg[r].opacity !== 100;
          return `
            <button type="button" class="meridian-role-tab" role="tab" data-studio-select-role="${r}" aria-selected="${activeTypeRole === r ? 'true' : 'false'}" data-edited="${isEdited ? 'true' : 'false'}" data-menu-keep>
              <span class="meridian-role-dot" style="background:${rHex}"></span>
              <span class="meridian-role-name">${t[`role_${r}`] || r}</span>
              <span class="mono meridian-role-alpha" data-role-alpha-pill="${r}">${cfg[r].opacity}%</span>
            </button>
          `;
        }).join('')}
      </div>

      <div class="meridian-type-col-inks" data-menu-keep>
        <div class="meridian-auto-row" data-menu-keep>
          <button type="button" class="meridian-auto-btn" data-studio-role="${activeTypeRole}" data-studio-tone="surface" aria-pressed="${choice.tone === 'surface' ? 'true' : 'false'}" data-menu-keep>
            <span class="meridian-role-dot" style="background:${resolveRoleHex(activeTypeRole, DEFAULT_TYPE_CONFIG, base)}"></span>
            <span>${t.surfaceInk}</span>
          </button>
          <button type="button" class="meridian-auto-btn" data-studio-role="${activeTypeRole}" data-studio-tone="muted" aria-pressed="${choice.tone === 'muted' ? 'true' : 'false'}" data-menu-keep>
            <span class="meridian-role-dot" style="background:${base.fgMuted}"></span>
            <span>${t.mutedInk}</span>
          </button>
          <label class="meridian-auto-btn meridian-custom-ink-btn" data-pressed="${choice.tone === 'custom' ? 'true' : 'false'}" data-menu-keep>
            <input type="color" class="meridian-native-color" data-studio-custom-ink="${activeTypeRole}" value="${resolvedHex}" aria-label="${t.customInk}" />
            <span class="meridian-role-dot" style="background:${resolvedHex}"></span>
            <span>${t.customInk} · ${resolvedHex}</span>
          </label>
        </div>

        <div class="meridian-ink-three-cols" data-menu-keep>
          ${renderColumn('dark', t.groupDarkInks)}
          ${renderColumn('editorial', t.groupEditorialInks)}
          ${renderColumn('light', t.groupLightInks)}
        </div>
      </div>
    </div>

    <div class="meridian-type-footer" data-menu-keep>
      <div class="meridian-type-trans-col" data-menu-keep>
        <div class="meridian-slider-head">
          <span>${t.transparencyOfSelected} (<strong>${t[`role_${activeTypeRole}`]}</strong>)</span>
          <span class="mono tabular" data-studio-opacity-readout>${choice.opacity}%</span>
        </div>
        <div class="global-grain-slider-row" style="margin-bottom:6px;">
          <input type="range" min="10" max="100" step="1" value="${choice.opacity}" data-studio-opacity-range="${activeTypeRole}" aria-label="${t.transparencyOfSelected}" />
        </div>
        <div class="meridian-opacity-steps">
          ${[100, 85, 70, 55, 35].map((op) => `
            <button type="button" class="meridian-step-pill" data-studio-role="${activeTypeRole}" data-studio-opacity="${op}" aria-pressed="${choice.opacity === op ? 'true' : 'false'}" data-menu-keep>${op}%</button>
          `).join('')}
        </div>
      </div>

      <div class="meridian-type-meta-col" data-menu-keep>
        <div class="meridian-role-preview-sample" data-menu-keep>
          <span class="meridian-sample-badge" data-studio-sample-badge style="${sampleStyle}">${t.sampleWord}</span>
          <span class="mono meridian-hex-tag" data-studio-contrast-readout>${resolvedHex} · ${choice.opacity}% · ${ratio}</span>
        </div>
        <span class="meridian-role-desc">${t[`roleDesc_${activeTypeRole}`] || ''}</span>
        <div class="meridian-rule-inline" data-menu-keep>
          <span class="meridian-slider-label">${t.ruleAlpha}</span>
          <input type="range" min="4" max="28" step="1" value="${cfg.ruleOpacity}" data-studio-rule-range aria-label="${t.ruleAlpha}" />
          <span class="mono tabular meridian-hex-tag" data-studio-rule-readout>${cfg.ruleOpacity}%</span>
        </div>
      </div>
    </div>
  `;
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
    <div class="meridian-studio-sublabel" style="margin-top:0;">${t.intensity}</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:8px;">
      ${intensities.map((it) => `
        <button type="button" class="header-menu-item" data-global-grain="${it.id}" aria-pressed="${curInt === it.id ? 'true' : 'false'}" style="justify-content:center;padding:5px 4px;font-size:11.5px;" data-menu-keep>${it.label}</button>
      `).join('')}
    </div>

    <div class="meridian-slider-head"><span>${t.opacity}</span><span id="global-grain-opacity-val" class="mono tabular">${curOp}%</span></div>
    <div class="global-grain-slider-row">
      <input id="global-grain-opacity-range" type="range" min="20" max="100" step="5" value="${curOp}" aria-label="${t.opacity}" />
    </div>

    <div class="meridian-slider-head"><span>${t.dust}</span><span id="global-dust-val" class="mono tabular">${curDust}%</span></div>
    <div class="global-grain-slider-row">
      <input id="global-dust-range" type="range" min="0" max="100" step="5" value="${curDust}" aria-label="${t.dust}" />
    </div>

    <div class="meridian-slider-head"><span>${t.scratches}</span><span id="global-scratch-val" class="mono tabular">${curScratch}%</span></div>
    <div class="global-grain-slider-row">
      <input id="global-scratch-range" type="range" min="0" max="100" step="5" value="${curScratch}" aria-label="${t.scratches}" />
    </div>

    <div class="meridian-studio-sublabel">${t.grainSize}</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:8px;">
      ${sizes.map((sz) => `
        <button type="button" class="header-menu-item" data-global-grain-size="${sz.id}" aria-pressed="${curSize === sz.id ? 'true' : 'false'}" style="justify-content:center;padding:5px 4px;font-size:11.5px;" data-menu-keep>${sz.label}</button>
      `).join('')}
    </div>

    <button type="button" class="header-menu-item" data-global-grain-double aria-pressed="${curDouble ? 'true' : 'false'}" style="justify-content:center;font-size:12px;" data-menu-keep>
      ${t.doubleLayer}
    </button>
  `;
}

function hydrateStudioRangeTracks(root: ParentNode = document): void {
  root.querySelectorAll<HTMLInputElement>(
    '[data-studio-opacity-range], [data-studio-rule-range], #global-grain-opacity-range, #global-dust-range, #global-scratch-range',
  ).forEach((inp) => syncRangePct(inp));
}

function syncSubpagePrefsControls(): void {
  const mode = (document.documentElement.getAttribute('data-mode') || 'invisible') as OperationalMode;
  const sig = document.documentElement.getAttribute('data-signals') || 'chromatic';
  const layout = document.documentElement.getAttribute('data-layout') || 'masthead';
  document.querySelectorAll<HTMLElement>('[data-global-mode]').forEach((b) => {
    b.setAttribute('aria-pressed', b.dataset.globalMode === mode ? 'true' : 'false');
  });
  document.querySelectorAll<HTMLElement>('[data-global-signals]').forEach((b) => {
    b.setAttribute('aria-pressed', b.dataset.globalSignals === sig ? 'true' : 'false');
  });
  document.querySelectorAll<HTMLElement>('[data-global-layout]').forEach((b) => {
    b.setAttribute('aria-pressed', b.dataset.globalLayout === layout ? 'true' : 'false');
  });
}

function refreshAllStudioMenus(): void {
  const t = CHROME_I18N[currentChromeLang()];
  const cfg = readTypeConfig();
  const curSurfaceRaw = document.documentElement.getAttribute('data-surface');
  const curSurface: SurfaceId = isValidSurfaceId(curSurfaceRaw) ? curSurfaceRaw : 'ivory';
  const customBg = getCustomGroundHex();
  const base = getActiveBaseColors(curSurface, customBg);
  const surfaceMeta = SURFACES[curSurface] || SURFACES.ivory;

  const labelText = customBg
    ? customBg
    : surfaceMeta.label.replace(/^(Soft |Signature |Warm |Raw |Vellum |Cool |Deep |Muted )/, '').split(' ')[0];
  ['global-surface-label', 'surface-menu-label'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = labelText;
  });
  ['global-surface-swatch', 'surface-menu-swatch'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.background = base.bg;
  });

  document.querySelectorAll<HTMLElement>('[data-meridian-surface-studio], #surface-menu').forEach((host) => {
    host.innerHTML = buildSurfaceStudioInnerHtml(t);
  });

  document.querySelectorAll<HTMLElement>('[data-meridian-type-studio], #type-menu-scroll').forEach((host) => {
    host.innerHTML = buildTypeStudioInnerHtml(t, cfg);
    hydrateStudioRangeTracks(host);
  });
}

function updateLiveOpacityPreview(host: Element | null, role: TypeRoleId, cfg: MeridianTypeConfig): void {
  if (!host) return;
  const base = getActiveBaseColors();
  const hex = resolveRoleHex(role, cfg, base);
  const op = cfg[role].opacity;
  const contrastBg =
    role === 'buttonPrimaryFg'
      ? resolveRoleHex('buttonPrimaryBg', cfg, base)
      : role === 'buttonSecondaryFg'
        ? resolveRoleHex('buttonSecondaryBg', cfg, base)
        : base.bg;
  const ratio = contrastRatioString(contrastBg, hex);

  const readout = host.querySelector<HTMLElement>('[data-studio-opacity-readout]');
  if (readout) readout.textContent = `${op}%`;
  const pill = host.querySelector<HTMLElement>(`[data-role-alpha-pill="${role}"]`);
  if (pill) pill.textContent = `${op}%`;
  const contrastEl = host.querySelector<HTMLElement>('[data-studio-contrast-readout]');
  if (contrastEl) contrastEl.textContent = `${hex} · ${op}% · ${ratio}`;
  const sample = host.querySelector<HTMLElement>('[data-studio-sample-badge]');
  if (sample) sample.style.opacity = (op / 100).toFixed(2);
  host.querySelectorAll<HTMLElement>('[data-studio-opacity]').forEach((b) => {
    b.setAttribute('aria-pressed', Number(b.dataset.studioOpacity) === op ? 'true' : 'false');
  });
}

function bindGrainRangeListeners(scope: ParentNode): void {
  const opRange = scope.querySelector<HTMLInputElement>('#global-grain-opacity-range');
  const opVal = scope.querySelector<HTMLElement>('#global-grain-opacity-val');
  opRange?.addEventListener('input', () => {
    syncRangePct(opRange);
    const pct = Math.max(20, Math.min(100, Number(opRange.value)));
    if (opVal) opVal.textContent = `${pct}%`;
    setPaperGrainOpacity(pct / 100);
  });

  const dustRange = scope.querySelector<HTMLInputElement>('#global-dust-range');
  const dustVal = scope.querySelector<HTMLElement>('#global-dust-val');
  dustRange?.addEventListener('input', () => {
    syncRangePct(dustRange);
    ensureGrainMountedForSubpages();
    const lv = setPaperGrainDustLevel(Number(dustRange.value));
    if (dustVal) dustVal.textContent = `${lv}%`;
  });

  const scratchRange = scope.querySelector<HTMLInputElement>('#global-scratch-range');
  const scratchVal = scope.querySelector<HTMLElement>('#global-scratch-val');
  scratchRange?.addEventListener('input', () => {
    syncRangePct(scratchRange);
    ensureGrainMountedForSubpages();
    const lv = setPaperGrainScratchLevel(Number(scratchRange.value));
    if (scratchVal) scratchVal.textContent = `${lv}%`;
  });
}

function injectUnifiedSubpageChrome(): void {
  const t = CHROME_I18N[currentChromeLang()];
  const cfg = readTypeConfig();

  // On index.html, upgrade existing #surface-menu and #type-menu in place
  if (document.getElementById('btn-surface-menu')) {
    document.getElementById('type-menu')?.classList.add('meridian-type-studio-popover');
    document.getElementById('surface-menu')?.classList.add('meridian-surface-studio-popover');
    document.getElementById('menu-shortcuts')?.classList.add('meridian-prefs-popover');
    refreshAllStudioMenus();
    return;
  }

  const pageName = window.location.pathname.split('/').pop() || 'index.html';
  const header = document.querySelector<HTMLElement>('.ds-topbar, .gann-chrome-inner');
  if (!header) return;

  const isArchive = pageName === 'manifesto.html' || pageName === 'historia.html' || pageName === 'gann.html';
  const curSurfaceRaw = document.documentElement.getAttribute('data-surface');
  const curSurface: SurfaceId = isValidSurfaceId(curSurfaceRaw) ? curSurfaceRaw : 'ivory';
  const customBg = getCustomGroundHex();
  const base = getActiveBaseColors(curSurface, customBg);
  const curMeta = SURFACES[curSurface] || SURFACES.ivory;

  // Before rebuilding chrome on language switch, rescue existing [data-lang-slot] / .site-gh-star if stored inside #global-prefs-anchor
  const prevPrefs = document.getElementById('global-prefs-anchor');
  const langSlot = header.querySelector<HTMLElement>('[data-lang-slot]') || prevPrefs?.querySelector<HTMLElement>('[data-lang-slot]') || null;
  const ghStar = header.querySelector<HTMLElement>('.site-gh-star') || prevPrefs?.querySelector<HTMLElement>('.site-gh-star') || null;

  header.querySelector('.meridian-unified-nav')?.remove();
  header.querySelector('#global-surface-anchor')?.remove();
  header.querySelector('#global-grain-anchor')?.remove();
  header.querySelector('#global-type-anchor')?.remove();
  header.querySelector('#global-prefs-anchor')?.remove();

  // 1. Left column in 1fr-auto-1fr masthead
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

  // 2. Right column: Strictly 3 clean controls [● Surface v] [Aa Tipo v] [Preferências v]
  let rightContainer = header.querySelector<HTMLElement>('.lab-topbar-actions, .topbar-right, .meridian-chrome-actions');
  if (!rightContainer) {
    rightContainer = document.createElement('div');
    rightContainer.className = 'meridian-chrome-actions';
    Array.from(header.children).forEach((child) => {
      if (
        child === nav ||
        child.classList.contains('gann-brand') ||
        child.classList.contains('gann-burger') ||
        child.classList.contains('gann-nav-center')
      ) {
        return;
      }
      rightContainer?.appendChild(child);
    });
    header.appendChild(rightContainer);
  }

  // Hide legacy redundant controls in rightContainer (keep DOM nodes alive for listeners!)
  Array.from(rightContainer.children).forEach((el) => {
    const h = el as HTMLElement;
    if (h.classList.contains('menu-anchor') || h.classList.contains('popover-wrap') || h.hasAttribute('data-lang-slot') || h.classList.contains('site-gh-star')) {
      if (!h.id?.startsWith('global-')) {
        h.classList.add('meridian-legacy-hidden');
      }
    }
  });

  const labelShort = customBg
    ? customBg
    : curMeta.label.replace(/^(Soft |Signature |Warm |Raw |Vellum |Cool |Deep |Muted )/, '').split(' ')[0];

  const surfAnchor = document.createElement('div');
  surfAnchor.className = 'menu-anchor align-end';
  surfAnchor.id = 'global-surface-anchor';
  surfAnchor.innerHTML = `
    <button type="button" class="site-menu-btn surface-menu-trigger" data-menu-toggle aria-expanded="false" aria-haspopup="dialog" title="${t.surfaceTitle}">
      <span class="surface-menu-swatch" id="global-surface-swatch" style="background:${base.bg};width:11px;height:11px;border-radius:50%;border:1px solid var(--ds-border-strong);display:inline-block;"></span>
      <span class="surface-menu-label" id="global-surface-label">${labelShort}</span>
      <svg class="menu-chevron surface-menu-chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 L5 6.5 L8 3.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <div class="header-menu meridian-surface-studio-popover" data-open="false" role="dialog" data-meridian-surface-studio data-menu-keep>
      ${buildSurfaceStudioInnerHtml(t)}
    </div>
  `;

  const typeAnchor = document.createElement('div');
  typeAnchor.className = 'menu-anchor align-end';
  typeAnchor.id = 'global-type-anchor';
  typeAnchor.innerHTML = `
    <button type="button" class="site-menu-btn" data-menu-toggle aria-expanded="false" aria-haspopup="dialog" title="${t.typeTitle}">
      <span style="font-family:var(--ds-font-display);font-size:13.5px;">Aa</span>
      <span class="surface-menu-label">${t.typeLabel}</span>
      <svg class="menu-chevron surface-menu-chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 L5 6.5 L8 3.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <div class="header-menu meridian-type-studio-popover" data-open="false" role="dialog" data-meridian-type-studio data-menu-keep>
      ${buildTypeStudioInnerHtml(t, cfg)}
    </div>
  `;

  const hasCmdk = Boolean(document.getElementById('btn-cmdk') || document.getElementById('lab-open-cmdk'));
  const hasLayout = Boolean(document.querySelector('[data-layout-pick]'));

  const prefsAnchor = document.createElement('div');
  prefsAnchor.className = 'menu-anchor align-end';
  prefsAnchor.id = 'global-prefs-anchor';
  prefsAnchor.innerHTML = `
    <button type="button" class="site-menu-btn" data-menu-toggle aria-expanded="false" aria-haspopup="dialog" title="${t.prefsTitle}">
      <span>${t.prefsLabel}</span>
      <svg class="menu-chevron" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5 L5 6.5 L8 3.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <div class="header-menu meridian-prefs-popover" data-open="false" role="dialog" data-menu-keep>
      <div class="meridian-prefs-grid">
        <div class="meridian-prefs-col">
          <div class="meridian-studio-sublabel" style="margin-top:0;">${t.prefsLang}</div>
          <div class="meridian-prefs-lang-host" data-prefs-lang-host></div>

          <div class="meridian-studio-sublabel">${t.prefsMode}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">
            <button type="button" class="meridian-filter-pill" data-global-mode="invisible" aria-pressed="true" data-menu-keep>${t.modeB2c}</button>
            <button type="button" class="meridian-filter-pill" data-global-mode="technical" aria-pressed="false" data-menu-keep>${t.modeTech}</button>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:4px;">
            <button type="button" class="meridian-filter-pill" data-global-signals="chromatic" aria-pressed="true" data-menu-keep>${t.sigChroma}</button>
            <button type="button" class="meridian-filter-pill" data-global-signals="monochrome" aria-pressed="false" data-menu-keep>${t.sigMono}</button>
          </div>

          <div class="meridian-studio-sublabel">${t.prefsActions}</div>
          <div style="display:flex;flex-direction:column;gap:4px;">
            ${hasCmdk ? `<button type="button" class="header-menu-item" data-global-cmdk>${t.paletteCmdk} <span class="mono" style="font-size:10.5px;opacity:0.65;">⌘K</span></button>` : ''}
            ${hasLayout ? `
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;">
                <button type="button" class="meridian-filter-pill" data-global-layout="masthead" aria-pressed="true" data-menu-keep>${t.layoutHeader}</button>
                <button type="button" class="meridian-filter-pill" data-global-layout="rail" aria-pressed="false" data-menu-keep>${t.layoutRail}</button>
              </div>
            ` : ''}
            <div class="meridian-prefs-star-host" data-prefs-star-host></div>
          </div>
        </div>

        <div class="meridian-prefs-col meridian-prefs-grain-col">
          <div class="meridian-studio-sublabel" style="margin-top:0;">${t.grain}</div>
          ${buildGrainPopoverHtml(t)}
        </div>
      </div>
    </div>
  `;

  // Move live [data-lang-slot] and .site-gh-star inside the Preferences modal so listeners/counts stay 100% intact and topbar stays ultra-clean!
  if (langSlot) {
    langSlot.classList.remove('meridian-legacy-hidden');
    langSlot.setAttribute('data-menu-keep', '');
    prefsAnchor.querySelector('[data-prefs-lang-host]')?.appendChild(langSlot);
  }
  if (ghStar) {
    ghStar.classList.remove('meridian-legacy-hidden');
    prefsAnchor.querySelector('[data-prefs-star-host]')?.appendChild(ghStar);
  }

  rightContainer.append(surfAnchor, typeAnchor, prefsAnchor);
  syncSubpagePrefsControls();
  hydrateStudioRangeTracks(rightContainer);
  bindGrainRangeListeners(prefsAnchor);
}

function syncEditorialFooterI18n(): void {
  const t = CHROME_I18N[currentChromeLang()];
  document.querySelectorAll<HTMLElement>('[data-ef-i18n]').forEach((el) => {
    const key = el.dataset.efI18n;
    if (key && t[key]) el.textContent = t[key];
  });
}

export function bindSiteChrome(): void {
  bootMeridianThemeSync();

  if (document.documentElement.dataset.siteChrome === 'on') return;
  document.documentElement.dataset.siteChrome = 'on';

  injectUnifiedSubpageChrome();
  syncEditorialFooterI18n();
  hydrateGitHubStars();

  window.addEventListener('meridian:lang', () => {
    injectUnifiedSubpageChrome();
    syncEditorialFooterI18n();
  });

  window.addEventListener('meridian:surface', () => {
    refreshAllStudioMenus();
  });

  window.addEventListener('meridian:type', () => {
    refreshAllStudioMenus();
  });

  window.addEventListener('meridian:mode', () => {
    syncSubpagePrefsControls();
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
    if (opRange) { opRange.value = String(opPct); syncRangePct(opRange); }
    if (opVal) opVal.textContent = `${opPct}%`;

    const dRange = document.getElementById('global-dust-range') as HTMLInputElement | null;
    const dVal = document.getElementById('global-dust-val');
    if (dRange) { dRange.value = String(dustPct); syncRangePct(dRange); }
    if (dVal) dVal.textContent = `${dustPct}%`;

    const sRange = document.getElementById('global-scratch-range') as HTMLInputElement | null;
    const sVal = document.getElementById('global-scratch-val');
    if (sRange) { sRange.value = String(scratchPct); syncRangePct(sRange); }
    if (sVal) sVal.textContent = `${scratchPct}%`;
  });

  document.addEventListener('input', (event) => {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    if (target.matches('[data-custom-ground-input]')) {
      const val = (target as HTMLInputElement).value;
      setGlobalCustomGround(val);
      return;
    }

    if (target.matches('[data-studio-custom-ink]')) {
      const role = (target as HTMLInputElement).dataset.studioCustomInk as TypeRoleId | undefined;
      if (!role || !ROLE_ORDER.includes(role)) return;
      const cfg = readTypeConfig();
      cfg[role] = { ...cfg[role], tone: 'custom', customHex: (target as HTMLInputElement).value };
      applyTypeConfigToDom(cfg);
      return;
    }

    if (target.matches('[data-studio-opacity-range]')) {
      const input = target as HTMLInputElement;
      syncRangePct(input);
      const role = input.dataset.studioOpacityRange as TypeRoleId | undefined;
      if (!role || !ROLE_ORDER.includes(role)) return;
      const op = Math.max(10, Math.min(100, Number(input.value)));
      const cfg = readTypeConfig();
      cfg[role] = { ...cfg[role], opacity: op };
      const host = input.closest('[data-meridian-type-studio], #type-menu-scroll');
      updateLiveOpacityPreview(host, role, cfg);
      applyTypeConfigToDom(cfg, { persist: true, broadcast: true, notify: false });
      return;
    }

    if (target.matches('[data-studio-rule-range]')) {
      const input = target as HTMLInputElement;
      syncRangePct(input);
      const rv = Math.max(4, Math.min(28, Number(input.value)));
      const cfg = readTypeConfig();
      cfg.ruleOpacity = rv;
      const host = input.closest('[data-meridian-type-studio], #type-menu-scroll');
      const readout = host?.querySelector<HTMLElement>('[data-studio-rule-readout]');
      if (readout) readout.textContent = `${rv}%`;
      applyTypeConfigToDom(cfg, { persist: true, broadcast: true, notify: false });
      return;
    }
  });

  document.addEventListener('change', (event) => {
    const target = event.target as HTMLElement | null;
    if (target?.matches('[data-studio-opacity-range], [data-studio-rule-range]')) {
      window.dispatchEvent(new CustomEvent('meridian:type', { detail: { config: readTypeConfig() } }));
    }
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

    const filterBtn = target.closest<HTMLElement>('[data-surface-filter]');
    if (filterBtn?.dataset.surfaceFilter) {
      activeSurfaceFilter = filterBtn.dataset.surfaceFilter as SurfaceFilterGroup;
      refreshAllStudioMenus();
      return;
    }

    const resetGroundBtn = target.closest<HTMLElement>('[data-reset-custom-ground]');
    if (resetGroundBtn) {
      setGlobalCustomGround(null);
      return;
    }

    const globalSurf = target.closest<HTMLElement>('[data-global-surface]');
    if (globalSurf?.dataset.globalSurface) {
      setGlobalSurface(globalSurf.dataset.globalSurface);
      if (!document.getElementById('btn-surface-menu')) {
        closeHeaderMenus();
      }
      return;
    }

    const chromaBtn = target.closest<HTMLElement>('[data-chroma]');
    if (chromaBtn?.dataset.chroma) {
      setGlobalSurface(chromaBtn.dataset.chroma);
      return;
    }

    const surfaceBtn = target.closest<HTMLElement>('[data-set-surface], [data-surface-pick]');
    const picked = surfaceBtn?.dataset.setSurface || surfaceBtn?.dataset.surfacePick;
    if (picked) {
      setGlobalSurface(picked);
    }

    const roleTabBtn = target.closest<HTMLElement>('[data-studio-select-role]');
    if (roleTabBtn?.dataset.studioSelectRole) {
      activeTypeRole = roleTabBtn.dataset.studioSelectRole as TypeRoleId;
      refreshAllStudioMenus();
      return;
    }

    const studioToneBtn = target.closest<HTMLElement>('[data-studio-tone]');
    if (studioToneBtn?.dataset.studioTone && studioToneBtn.dataset.studioRole) {
      const role = studioToneBtn.dataset.studioRole as TypeRoleId;
      const tone = studioToneBtn.dataset.studioTone;
      const cfg = readTypeConfig();
      cfg[role] = { opacity: cfg[role].opacity, tone };
      applyTypeConfigToDom(cfg);
      return;
    }

    const studioOpBtn = target.closest<HTMLElement>('[data-studio-opacity]');
    if (studioOpBtn?.dataset.studioOpacity && studioOpBtn.dataset.studioRole) {
      const role = studioOpBtn.dataset.studioRole as TypeRoleId;
      const op = Math.max(10, Math.min(100, Number(studioOpBtn.dataset.studioOpacity) || 100));
      const cfg = readTypeConfig();
      cfg[role] = { ...cfg[role], opacity: op };
      applyTypeConfigToDom(cfg);
      return;
    }

    const resetAllBtn = target.closest<HTMLElement>('[data-studio-reset-all]');
    if (resetAllBtn) {
      setGlobalCustomGround(null, { notify: false });
      applyTypeConfigToDom(structuredClone(DEFAULT_TYPE_CONFIG));
      return;
    }

    const gModeBtn = target.closest<HTMLElement>('[data-global-mode]');
    if (gModeBtn?.dataset.globalMode) {
      setGlobalMode(gModeBtn.dataset.globalMode as OperationalMode);
      return;
    }

    const gSigBtn = target.closest<HTMLElement>('[data-global-signals]');
    if (gSigBtn?.dataset.globalSignals) {
      document.documentElement.setAttribute('data-signals', gSigBtn.dataset.globalSignals);
      syncSubpagePrefsControls();
      return;
    }

    const gLayoutBtn = target.closest<HTMLElement>('[data-global-layout]');
    if (gLayoutBtn?.dataset.globalLayout) {
      const pick = document.querySelector<HTMLButtonElement>(`[data-layout-pick="${gLayoutBtn.dataset.globalLayout}"]`);
      pick?.click();
      syncSubpagePrefsControls();
      return;
    }

    const gCmdkBtn = target.closest<HTMLElement>('[data-global-cmdk]');
    if (gCmdkBtn) {
      closeHeaderMenus();
      (document.getElementById('btn-cmdk') || document.getElementById('lab-open-cmdk'))?.click();
      return;
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
  bootMeridianThemeSync();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindSiteChrome, { once: true });
  } else {
    bindSiteChrome();
  }
}
