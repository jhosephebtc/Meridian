import {
  SURFACES,
  SURFACE_SPECTRUM,
  TYPE_INKS,
  type SurfaceId,
  type TypeRoleId,
  type OperationalMode,
} from './tokens';

export interface RoleColorChoice {
  tone: string; // 'surface' | 'muted' | 'custom' | TypeInkId
  customHex?: string;
  opacity: number; // 20..100
}

export interface MeridianTypeConfig {
  primary: RoleColorChoice;
  secondary: RoleColorChoice;
  tertiary: RoleColorChoice;
  buttonPrimaryFg: RoleColorChoice;
  buttonPrimaryBg: RoleColorChoice;
  buttonSecondaryFg: RoleColorChoice;
  accent: RoleColorChoice;
  ruleOpacity: number; // 4..28 (default 9)
}

export const SURFACE_STORAGE_KEY = 'meridian-surface';
export const CUSTOM_BG_STORAGE_KEY = 'meridian-custom-bg';
export const TYPE_CONFIG_STORAGE_KEY = 'meridian-type-config';
export const MODE_STORAGE_KEY = 'meridian-mode';
export const SIGNALS_STORAGE_KEY = 'meridian-signals';

export const DEFAULT_TYPE_CONFIG: MeridianTypeConfig = {
  primary: { tone: 'surface', opacity: 100 },
  secondary: { tone: 'surface', opacity: 100 },
  tertiary: { tone: 'surface', opacity: 100 },
  buttonPrimaryFg: { tone: 'surface', opacity: 100 },
  buttonPrimaryBg: { tone: 'surface', opacity: 100 },
  buttonSecondaryFg: { tone: 'surface', opacity: 100 },
  accent: { tone: 'surface', opacity: 100 },
  ruleOpacity: 9,
};

export const ROLE_ORDER: readonly TypeRoleId[] = [
  'primary',
  'secondary',
  'tertiary',
  'buttonPrimaryFg',
  'buttonPrimaryBg',
  'buttonSecondaryFg',
  'accent',
] as const;

let bc: BroadcastChannel | null = null;
function getChannel(): BroadcastChannel | null {
  if (bc) return bc;
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      bc = new BroadcastChannel('meridian-theme-v2');
    } catch {
      bc = null;
    }
  }
  return bc;
}

export function normalizeHex(raw: string | undefined | null, fallback = '#141413'): string {
  if (!raw) return fallback;
  const s = raw.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(s)) return s.toUpperCase();
  if (/^#[0-9a-fA-F]{3}$/.test(s)) {
    return (
      '#' +
      s[1] + s[1] +
      s[2] + s[2] +
      s[3] + s[3]
    ).toUpperCase();
  }
  return fallback;
}

export function hexToRgbTuple(hex: string): [number, number, number] {
  const clean = normalizeHex(hex, '#141413').slice(1);
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`.toUpperCase();
}

export function mixHex(hexA: string, hexB: string, weightB: number): string {
  const [r1, g1, b1] = hexToRgbTuple(hexA);
  const [r2, g2, b2] = hexToRgbTuple(hexB);
  const t = Math.max(0, Math.min(1, weightB));
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgbTuple(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatioString(bgHex: string, fgHex: string): string {
  const l1 = relativeLuminance(bgHex);
  const l2 = relativeLuminance(fgHex);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  const tier = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'A';
  return `${ratio.toFixed(1)}:1 (${tier})`;
}

export function hexWithAlpha(hex: string, opacityPct: number): string {
  const clean = normalizeHex(hex, '#141413');
  const pct = Math.max(15, Math.min(100, Math.round(opacityPct)));
  if (pct >= 100) return clean;
  const [r, g, b] = hexToRgbTuple(clean);
  return `rgba(${r}, ${g}, ${b}, ${(pct / 100).toFixed(3).replace(/0+$/, '').replace(/\.$/, '')})`;
}

export function isValidSurfaceId(id: string | null | undefined): id is SurfaceId {
  return Boolean(id && id in SURFACES);
}

export function getCustomGroundHex(): string | null {
  try {
    const raw = localStorage.getItem(CUSTOM_BG_STORAGE_KEY);
    if (raw && /^#[0-9a-fA-F]{6}$/.test(raw.trim())) return raw.trim().toUpperCase();
  } catch { /* ignore */ }
  return null;
}

function normalizeChoice(raw: unknown): RoleColorChoice {
  if (raw && typeof raw === 'object') {
    const r = raw as Partial<RoleColorChoice>;
    const tone = typeof r.tone === 'string' && r.tone ? r.tone : 'surface';
    const opacity = typeof r.opacity === 'number' && Number.isFinite(r.opacity)
      ? Math.max(20, Math.min(100, Math.round(r.opacity)))
      : 100;
    const customHex = typeof r.customHex === 'string' && /^#[0-9a-fA-F]{3,6}$/.test(r.customHex.trim())
      ? normalizeHex(r.customHex)
      : undefined;
    return customHex ? { tone, customHex, opacity } : { tone, opacity };
  }
  return { tone: 'surface', opacity: 100 };
}

export function readTypeConfig(): MeridianTypeConfig {
  try {
    const raw = localStorage.getItem(TYPE_CONFIG_STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<MeridianTypeConfig>;
      return {
        primary: normalizeChoice(p.primary),
        secondary: normalizeChoice(p.secondary),
        tertiary: normalizeChoice(p.tertiary),
        buttonPrimaryFg: normalizeChoice(p.buttonPrimaryFg),
        buttonPrimaryBg: normalizeChoice(p.buttonPrimaryBg),
        buttonSecondaryFg: normalizeChoice(p.buttonSecondaryFg),
        accent: normalizeChoice(p.accent),
        ruleOpacity:
          typeof p.ruleOpacity === 'number' && Number.isFinite(p.ruleOpacity)
            ? Math.max(4, Math.min(28, Math.round(p.ruleOpacity)))
            : 9,
      };
    }
  } catch { /* ignore */ }
  return structuredClone(DEFAULT_TYPE_CONFIG);
}

export interface ActiveBaseColors {
  bg: string;
  surface1: string;
  surface2: string;
  surface3: string;
  fg: string;
  fgSecondary: string;
  fgMuted: string;
  fgSubtle: string;
  accent: string;
  accentFg: string;
  scheme: 'light' | 'dark';
}

export function getActiveBaseColors(surfaceId?: SurfaceId, customBg?: string | null): ActiveBaseColors {
  const sid: SurfaceId = surfaceId && isValidSurfaceId(surfaceId)
    ? surfaceId
    : (isValidSurfaceId(document.documentElement.getAttribute('data-surface'))
        ? (document.documentElement.getAttribute('data-surface') as SurfaceId)
        : 'ivory');
  const pal = SURFACES[sid] || SURFACES.ivory;
  const cbg = customBg !== undefined ? customBg : getCustomGroundHex();
  if (!cbg) {
    return {
      bg: pal.bg,
      surface1: pal.surface1,
      surface2: pal.surface2,
      surface3: pal.surface3,
      fg: pal.fg,
      fgSecondary: pal.fgSecondary,
      fgMuted: pal.fgMuted,
      fgSubtle: pal.fgSubtle,
      accent: pal.accent,
      accentFg: pal.accentFg,
      scheme: pal.scheme,
    };
  }
  const lum = relativeLuminance(cbg);
  const dark = lum < 0.24;
  const fg = dark ? '#FAF9F5' : '#141413';
  return {
    bg: cbg,
    surface1: dark ? mixHex(cbg, '#FFFFFF', 0.05) : mixHex(cbg, '#000000', 0.035),
    surface2: dark ? mixHex(cbg, '#FFFFFF', 0.1) : mixHex(cbg, '#000000', 0.08),
    surface3: dark ? mixHex(cbg, '#FFFFFF', 0.16) : mixHex(cbg, '#000000', 0.13),
    fg,
    fgSecondary: mixHex(fg, cbg, 0.16),
    fgMuted: mixHex(fg, cbg, 0.42),
    fgSubtle: mixHex(fg, cbg, 0.56),
    accent: fg,
    accentFg: cbg,
    scheme: dark ? 'dark' : 'light',
  };
}

export function resolveRoleHex(
  role: TypeRoleId,
  cfg: MeridianTypeConfig,
  base: ActiveBaseColors,
): string {
  const choice = cfg[role];
  if (choice.tone === 'custom' && choice.customHex) {
    return normalizeHex(choice.customHex, base.fg);
  }
  if (choice.tone !== 'surface' && choice.tone !== 'muted') {
    const found = TYPE_INKS.find((i) => i.id === choice.tone);
    if (found) return found.hex;
  }
  if (choice.tone === 'muted') {
    return base.fgMuted;
  }
  // 'surface' default per role:
  switch (role) {
    case 'primary':
      return base.fg;
    case 'secondary':
      return base.fgSecondary;
    case 'tertiary':
      return base.fgMuted;
    case 'buttonPrimaryBg': {
      // Follows primary ink if customized, else base.accent
      return cfg.primary.tone !== 'surface' ? resolveRoleHex('primary', cfg, base) : base.accent;
    }
    case 'buttonPrimaryFg':
      return base.accentFg;
    case 'buttonSecondaryFg':
      return cfg.primary.tone !== 'surface' ? resolveRoleHex('primary', cfg, base) : base.fg;
    case 'accent':
      return cfg.primary.tone !== 'surface' ? resolveRoleHex('primary', cfg, base) : base.fg;
  }
}

const CUSTOM_BG_PROPS = [
  '--ds-bg',
  '--ds-surface-1',
  '--ds-surface-2',
  '--ds-surface-3',
  '--ds-highlight',
  '--ds-paper-blend',
  '--ds-paper-filter',
  '--ds-image-blend',
] as const;

export function applyCustomGroundToDom(customBg: string | null, surfaceId?: SurfaceId): ActiveBaseColors {
  const root = document.documentElement;
  const base = getActiveBaseColors(surfaceId, customBg);
  if (!customBg) {
    CUSTOM_BG_PROPS.forEach((p) => root.style.removeProperty(p));
    delete root.dataset.customScheme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', base.bg);
    return base;
  }
  root.style.setProperty('--ds-bg', base.bg);
  root.style.setProperty('--ds-surface-1', base.surface1);
  root.style.setProperty('--ds-surface-2', base.surface2);
  root.style.setProperty('--ds-surface-3', base.surface3);
  root.style.setProperty('--ds-highlight', base.scheme === 'dark' ? 'rgba(250, 249, 245, 0.08)' : '#FFFFFF');
  root.style.setProperty('--ds-paper-blend', base.scheme === 'dark' ? 'screen' : 'multiply');
  root.style.setProperty('--ds-paper-filter', base.scheme === 'dark' ? 'invert(1)' : 'none');
  root.style.setProperty('--ds-image-blend', base.scheme === 'dark' ? 'normal' : 'multiply');
  root.dataset.customScheme = base.scheme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', base.bg);
  return base;
}

const ROLE_CSS_CLEANUP = [
  '--ds-type-primary-ink',
  '--ds-type-secondary-ink',
  '--ds-type-tertiary-ink',
  '--ds-type-primary-alpha',
  '--ds-type-secondary-alpha',
  '--ds-type-tertiary-alpha',
  '--ds-type-primary',
  '--ds-type-secondary',
  '--ds-type-tertiary',
  '--ds-fg',
  '--ds-fg-secondary',
  '--ds-fg-muted',
  '--ds-fg-subtle',
  '--ds-accent',
  '--ds-accent-hover',
  '--ds-accent-fg',
  '--ds-btn-primary-bg',
  '--ds-btn-primary-fg',
  '--ds-btn-secondary-fg',
  '--ds-type-accent',
  '--ds-structural-ink',
  '--ds-rule-alpha',
  '--ds-rule-strong-alpha',
] as const;

export function isDefaultTypeConfig(cfg: MeridianTypeConfig): boolean {
  return (
    ROLE_ORDER.every((r) => cfg[r].tone === 'surface' && cfg[r].opacity === 100) &&
    cfg.ruleOpacity === 9
  );
}

export function applyTypeConfigToDom(
  cfg: MeridianTypeConfig,
  opts: { persist?: boolean; broadcast?: boolean; notify?: boolean } = {},
): void {
  const { persist = true, broadcast = true, notify = true } = opts;
  const root = document.documentElement;
  const customBg = getCustomGroundHex();
  const base = applyCustomGroundToDom(customBg);

  if (isDefaultTypeConfig(cfg) && !customBg) {
    ROLE_CSS_CLEANUP.forEach((p) => root.style.removeProperty(p));
  } else {
    const primaryHex = resolveRoleHex('primary', cfg, base);
    const secondaryHex = resolveRoleHex('secondary', cfg, base);
    const tertiaryHex = resolveRoleHex('tertiary', cfg, base);
    const btnPriFgHex = resolveRoleHex('buttonPrimaryFg', cfg, base);
    const btnPriBgHex = resolveRoleHex('buttonPrimaryBg', cfg, base);
    const btnSecFgHex = resolveRoleHex('buttonSecondaryFg', cfg, base);
    const accentHex = resolveRoleHex('accent', cfg, base);

    const primaryCss = hexWithAlpha(primaryHex, cfg.primary.opacity);
    const secondaryCss = hexWithAlpha(secondaryHex, cfg.secondary.opacity);
    const tertiaryCss = hexWithAlpha(tertiaryHex, cfg.tertiary.opacity);
    const subtleCss = hexWithAlpha(tertiaryHex, Math.max(20, Math.round(cfg.tertiary.opacity * 0.78)));
    const btnPriFgCss = hexWithAlpha(btnPriFgHex, cfg.buttonPrimaryFg.opacity);
    const btnPriBgCss = hexWithAlpha(btnPriBgHex, cfg.buttonPrimaryBg.opacity);
    const btnPriHoverHex = mixHex(btnPriBgHex, base.bg, 0.14);
    const btnPriHoverCss = hexWithAlpha(btnPriHoverHex, cfg.buttonPrimaryBg.opacity);
    const btnSecFgCss = hexWithAlpha(btnSecFgHex, cfg.buttonSecondaryFg.opacity);
    const accentCss = hexWithAlpha(accentHex, cfg.accent.opacity);

    root.style.setProperty('--ds-structural-ink', primaryHex);
    root.style.setProperty('--ds-type-primary-ink', primaryHex);
    root.style.setProperty('--ds-type-secondary-ink', secondaryHex);
    root.style.setProperty('--ds-type-tertiary-ink', tertiaryHex);
    root.style.setProperty('--ds-type-primary-alpha', String(cfg.primary.opacity / 100));
    root.style.setProperty('--ds-type-secondary-alpha', String(cfg.secondary.opacity / 100));
    root.style.setProperty('--ds-type-tertiary-alpha', String(cfg.tertiary.opacity / 100));

    root.style.setProperty('--ds-type-primary', primaryCss);
    root.style.setProperty('--ds-type-secondary', secondaryCss);
    root.style.setProperty('--ds-type-tertiary', tertiaryCss);

    // Cascade to EVERY component, page, SVG plotter, table, caption & control!
    root.style.setProperty('--ds-fg', primaryCss);
    root.style.setProperty('--ds-fg-secondary', secondaryCss);
    root.style.setProperty('--ds-fg-muted', tertiaryCss);
    root.style.setProperty('--ds-fg-subtle', subtleCss);

    root.style.setProperty('--ds-btn-primary-bg', btnPriBgCss);
    root.style.setProperty('--ds-btn-primary-fg', btnPriFgCss);
    root.style.setProperty('--ds-btn-secondary-fg', btnSecFgCss);
    root.style.setProperty('--ds-accent', btnPriBgCss);
    root.style.setProperty('--ds-accent-hover', btnPriHoverCss);
    root.style.setProperty('--ds-accent-fg', btnPriFgCss);
    root.style.setProperty('--ds-type-accent', accentCss);

    const ruleAlpha = Math.max(4, Math.min(28, Math.round(cfg.ruleOpacity)));
    const ruleStrongAlpha = Math.min(36, Math.round(ruleAlpha * 1.35));
    root.style.setProperty('--ds-rule-alpha', `${ruleAlpha}%`);
    root.style.setProperty('--ds-rule-strong-alpha', `${ruleStrongAlpha}%`);
  }

  if (persist) {
    try {
      localStorage.setItem(TYPE_CONFIG_STORAGE_KEY, JSON.stringify(cfg));
    } catch { /* ignore */ }
  }
  if (broadcast) {
    getChannel()?.postMessage({ kind: 'type', cfg });
  }
  if (notify && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('meridian:type', { detail: { config: cfg } }));
  }
}

export function setGlobalSurface(
  surfaceId: string,
  opts: { clearCustomBg?: boolean; persist?: boolean; broadcast?: boolean; notify?: boolean } = {},
): SurfaceId {
  const { clearCustomBg = true, persist = true, broadcast = true, notify = true } = opts;
  const sid: SurfaceId = isValidSurfaceId(surfaceId) ? surfaceId : 'ivory';
  const root = document.documentElement;
  root.setAttribute('data-surface', sid);

  if (clearCustomBg) {
    try {
      localStorage.removeItem(CUSTOM_BG_STORAGE_KEY);
    } catch { /* ignore */ }
  }

  if (persist) {
    try {
      localStorage.setItem(SURFACE_STORAGE_KEY, sid);
    } catch { /* ignore */ }
  }

  const cfg = readTypeConfig();
  applyTypeConfigToDom(cfg, { persist: false, broadcast: false, notify: false });

  document.querySelectorAll<HTMLElement>('[data-chroma],[data-surface-pick],[data-global-surface],[data-set-surface]').forEach((b) => {
    const id = b.dataset.chroma || b.dataset.surfacePick || b.dataset.globalSurface || b.dataset.setSurface;
    const active = id === sid && !getCustomGroundHex();
    b.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  if (broadcast) {
    getChannel()?.postMessage({ kind: 'surface', surface: sid, customBg: getCustomGroundHex() });
  }
  if (notify && typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('meridian:surface', { detail: { surface: sid, surfaceId: sid, customBg: getCustomGroundHex() } }),
    );
  }
  return sid;
}

export function setGlobalCustomGround(
  hex: string | null,
  opts: { persist?: boolean; broadcast?: boolean; notify?: boolean } = {},
): void {
  const { persist = true, broadcast = true, notify = true } = opts;
  const clean = hex ? normalizeHex(hex) : null;
  if (persist) {
    try {
      if (clean) localStorage.setItem(CUSTOM_BG_STORAGE_KEY, clean);
      else localStorage.removeItem(CUSTOM_BG_STORAGE_KEY);
    } catch { /* ignore */ }
  }
  const sid = (document.documentElement.getAttribute('data-surface') as SurfaceId) || 'ivory';
  applyTypeConfigToDom(readTypeConfig(), { persist: false, broadcast: false, notify: false });

  document.querySelectorAll<HTMLElement>('[data-chroma],[data-surface-pick],[data-global-surface],[data-set-surface]').forEach((b) => {
    const id = b.dataset.chroma || b.dataset.surfacePick || b.dataset.globalSurface || b.dataset.setSurface;
    b.setAttribute('aria-pressed', !clean && id === sid ? 'true' : 'false');
  });

  if (broadcast) {
    getChannel()?.postMessage({ kind: 'custom-bg', customBg: clean, surface: sid });
  }
  if (notify && typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('meridian:surface', { detail: { surface: sid, surfaceId: sid, customBg: clean } }),
    );
  }
}

export function setGlobalMode(
  mode: OperationalMode,
  opts: { persist?: boolean; broadcast?: boolean; notify?: boolean } = {},
): void {
  const { persist = true, broadcast = true, notify = true } = opts;
  const m: OperationalMode = mode === 'technical' ? 'technical' : 'invisible';
  document.documentElement.setAttribute('data-mode', m);
  if (persist) {
    try {
      localStorage.setItem(MODE_STORAGE_KEY, m);
    } catch { /* ignore */ }
  }
  if (broadcast) {
    getChannel()?.postMessage({ kind: 'mode', mode: m });
  }
  if (notify && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('meridian:mode', { detail: { mode: m } }));
  }
}

let syncListenersBound = false;

/**
 * Synchronizes theme state on page entry across ALL 6 pages:
 * - If the user already has a saved surface/type config from a previous page or selection,
 *   applies it immediately to this page.
 * - If this is the user's VERY FIRST page entry (nothing saved yet), captures the active
 *   page's initial `data-surface` and persists it so every subsequent page they open
 *   matches what was active when they entered!
 */
export function bootMeridianThemeSync(): { surface: SurfaceId; typeConfig: MeridianTypeConfig } {
  const root = document.documentElement;
  let savedSurface: string | null = null;
  let hasTypeSaved = false;
  try {
    savedSurface = localStorage.getItem(SURFACE_STORAGE_KEY);
    hasTypeSaved = localStorage.getItem(TYPE_CONFIG_STORAGE_KEY) !== null;
  } catch { /* ignore */ }

  let activeSurface: SurfaceId;
  if (isValidSurfaceId(savedSurface)) {
    activeSurface = savedSurface;
    root.setAttribute('data-surface', activeSurface);
  } else {
    const htmlInitial = root.getAttribute('data-surface');
    activeSurface = isValidSurfaceId(htmlInitial) ? htmlInitial : 'ivory';
    root.setAttribute('data-surface', activeSurface);
    try {
      localStorage.setItem(SURFACE_STORAGE_KEY, activeSurface);
    } catch { /* ignore */ }
  }

  const typeConfig = readTypeConfig();
  if (!hasTypeSaved) {
    try {
      localStorage.setItem(TYPE_CONFIG_STORAGE_KEY, JSON.stringify(typeConfig));
    } catch { /* ignore */ }
  }
  applyTypeConfigToDom(typeConfig, { persist: false, broadcast: false, notify: false });

  if (!syncListenersBound && typeof window !== 'undefined') {
    syncListenersBound = true;

    window.addEventListener('storage', (ev) => {
      if (ev.key === SURFACE_STORAGE_KEY && isValidSurfaceId(ev.newValue)) {
        setGlobalSurface(ev.newValue, { clearCustomBg: false, persist: false, broadcast: false, notify: true });
      } else if (ev.key === CUSTOM_BG_STORAGE_KEY) {
        setGlobalCustomGround(ev.newValue, { persist: false, broadcast: false, notify: true });
      } else if (ev.key === TYPE_CONFIG_STORAGE_KEY) {
        applyTypeConfigToDom(readTypeConfig(), { persist: false, broadcast: false, notify: true });
      } else if (ev.key === MODE_STORAGE_KEY && (ev.newValue === 'invisible' || ev.newValue === 'technical')) {
        setGlobalMode(ev.newValue, { persist: false, broadcast: false, notify: true });
      }
    });

    getChannel()?.addEventListener('message', (ev) => {
      const data = ev.data as { kind?: string; surface?: string; customBg?: string | null; cfg?: MeridianTypeConfig; mode?: OperationalMode } | null;
      if (!data) return;
      if (data.kind === 'surface' && isValidSurfaceId(data.surface)) {
        setGlobalSurface(data.surface, { clearCustomBg: false, persist: false, broadcast: false, notify: true });
      } else if (data.kind === 'custom-bg') {
        setGlobalCustomGround(data.customBg ?? null, { persist: false, broadcast: false, notify: true });
      } else if (data.kind === 'type') {
        applyTypeConfigToDom(readTypeConfig(), { persist: false, broadcast: false, notify: true });
      } else if (data.kind === 'mode' && data.mode) {
        setGlobalMode(data.mode, { persist: false, broadcast: false, notify: true });
      }
    });

    (window as unknown as Record<string, unknown>).__MERIDIAN_THEME__ = {
      SURFACES,
      SURFACE_SPECTRUM,
      TYPE_INKS,
      readTypeConfig,
      applyTypeConfigToDom,
      setGlobalSurface,
      setGlobalCustomGround,
      setGlobalMode,
      getActiveBaseColors,
      resolveRoleHex,
      contrastRatioString,
      getCustomGroundHex,
    };
  }

  return { surface: activeSurface, typeConfig };
}
