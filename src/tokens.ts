/**
 * MERIDIAN DESIGN SYSTEM — tokens.ts (v1.1.0)
 * Ecossistema: Lunar + Earth AI + Gemini Studio
 * Linhagem: Anthropic Editorial + Deimos Archival + Emil Kowalski Design Engineering
 * Compatibilidade: 100% TypeScript estrito · React Native / Expo (Reanimated 4) · Web · SVG 1:1
 */

export type SurfaceId = 'ivory' | 'paper' | 'aqua' | 'terracotta' | 'obsidian';
export type OperationalMode = 'invisible' | 'technical';
export type SignalStyle = 'chromatic' | 'monochrome';
export type GrainPreset = 'off' | 'subtle' | 'editorial' | 'tactile';
export type SourceTier = 'A' | 'B' | 'C';

export interface SurfacePalette {
  readonly id: SurfaceId;
  readonly label: string;
  readonly lineage: string;
  readonly recommendedFor: string;
  readonly scheme: 'light' | 'dark';

  readonly bg: string;
  readonly surface1: string;
  readonly surface2: string;
  readonly surface3: string;
  readonly highlight: string;

  readonly fg: string;
  readonly fgSecondary: string;
  readonly fgMuted: string;
  readonly fgSubtle: string;

  readonly accent: string;
  readonly accentHover: string;
  readonly accentFg: string;
  readonly invertedBg: string;
  readonly invertedSurface: string;
  readonly invertedFg: string;
  readonly invertedMuted: string;
  readonly invertedBorder: string;

  readonly bgTintSubtle: string;
  readonly bgTintMuted: string;
  readonly bgTintActive: string;
  readonly rule: string;
  readonly ruleStrong: string;
  readonly border: string;
  readonly borderStrong: string;

  readonly spine1: string;
  readonly spine2: string;
  readonly spine3: string;

  readonly signals: {
    readonly support: string;
    readonly caution: string;
    readonly refute: string;
    readonly info: string;
  };

  readonly organic: {
    readonly olive: string;
    readonly sky: string;
    readonly coral: string;
    readonly ochre: string;
    readonly slate: string;
  };

  readonly imageBlend: 'multiply' | 'normal' | 'screen';
  readonly paperBlend: 'multiply' | 'screen';
  readonly paperOpacity: number;
  readonly contrastRatioFgOnBg: string;
}

export const SURFACES: Record<SurfaceId, SurfacePalette> = {
  ivory: {
    id: 'ivory',
    label: 'Ivory Editorial',
    lineage: 'Anthropic Research',
    recommendedFor: 'Padrão universal B2C, pesquisa, leitura calma e vitrines editoriais',
    scheme: 'light',
    bg: '#FAF9F5',
    surface1: '#F5F4ED',
    surface2: '#E8E6DC',
    surface3: '#DEDCD1',
    highlight: '#FFFFFF',
    fg: '#141413',
    fgSecondary: '#30302E',
    fgMuted: '#5E5D59',
    fgSubtle: '#787770',
    accent: '#141413',
    accentHover: '#262624',
    accentFg: '#FAF9F5',
    invertedBg: '#141413',
    invertedSurface: '#262624',
    invertedFg: '#FAF9F5',
    invertedMuted: '#A1A098',
    invertedBorder: '#3D3D3A',
    bgTintSubtle: 'rgba(20, 20, 19, 0.045)',
    bgTintMuted: 'rgba(20, 20, 19, 0.085)',
    bgTintActive: 'rgba(20, 20, 19, 0.12)',
    rule: 'rgba(20, 20, 19, 0.11)',
    ruleStrong: 'rgba(20, 20, 19, 0.22)',
    border: 'rgba(20, 20, 19, 0.12)',
    borderStrong: 'rgba(20, 20, 19, 0.26)',
    spine1: '#F3F2EC',
    spine2: '#E8E6DC',
    spine3: '#DBD8CC',
    signals: { support: '#166534', caution: '#92400E', refute: '#991B1B', info: '#1E40AF' },
    organic: { olive: '#5E6E47', sky: '#477085', coral: '#B55A42', ochre: '#9A7134', slate: '#56606E' },
    imageBlend: 'multiply',
    paperBlend: 'multiply',
    paperOpacity: 0.68,
    contrastRatioFgOnBg: '17.6:1 (AAA)',
  },

  paper: {
    id: 'paper',
    label: 'Paper White',
    lineage: 'Deimos White',
    recommendedFor: 'Dossiês auditáveis, Raio-X de Endereço, PDFs, relatórios B2B e documentação',
    scheme: 'light',
    bg: '#FFFFFF',
    surface1: '#F8F8F6',
    surface2: '#EDEDEA',
    surface3: '#E0E0DC',
    highlight: '#FFFFFF',
    fg: '#0A0A0A',
    fgSecondary: '#242424',
    fgMuted: '#595959',
    fgSubtle: '#737373',
    accent: '#0A0A0A',
    accentHover: '#222222',
    accentFg: '#FFFFFF',
    invertedBg: '#0A0A0A',
    invertedSurface: '#181818',
    invertedFg: '#FFFFFF',
    invertedMuted: '#9E9E9E',
    invertedBorder: '#2E2E2E',
    bgTintSubtle: 'rgba(10, 10, 10, 0.045)',
    bgTintMuted: 'rgba(10, 10, 10, 0.085)',
    bgTintActive: 'rgba(10, 10, 10, 0.12)',
    rule: 'rgba(10, 10, 10, 0.10)',
    ruleStrong: 'rgba(10, 10, 10, 0.22)',
    border: 'rgba(10, 10, 10, 0.11)',
    borderStrong: 'rgba(10, 10, 10, 0.24)',
    spine1: '#F5F5F2',
    spine2: '#EAEAE6',
    spine3: '#DCDCD7',
    signals: { support: '#15803D', caution: '#A16207', refute: '#B91C1C', info: '#1D4ED8' },
    organic: { olive: '#5E6E47', sky: '#477085', coral: '#B55A42', ochre: '#9A7134', slate: '#56606E' },
    imageBlend: 'multiply',
    paperBlend: 'multiply',
    paperOpacity: 0.62,
    contrastRatioFgOnBg: '19.8:1 (AAA)',
  },

  aqua: {
    id: 'aqua',
    label: 'Signature Aqua',
    lineage: 'Deimos Blue',
    recommendedFor: 'Earth AI, Clima, Qualidade do Ar, AgroCiclos, Logística e Cartografia',
    scheme: 'light',
    bg: '#A4CED0',
    surface1: '#99C4C6',
    surface2: '#90B6B7',
    surface3: '#82A8AA',
    highlight: '#E4F0F1',
    fg: '#171614',
    fgSecondary: '#262928',
    fgMuted: '#3A4949',
    fgSubtle: '#4A5C5C',
    accent: '#171614',
    accentHover: '#2B2A27',
    accentFg: '#A4CED0',
    invertedBg: '#171614',
    invertedSurface: '#242624',
    invertedFg: '#E4F0F1',
    invertedMuted: '#9BB7B8',
    invertedBorder: '#3B4242',
    bgTintSubtle: 'rgba(23, 22, 20, 0.05)',
    bgTintMuted: 'rgba(23, 22, 20, 0.09)',
    bgTintActive: 'rgba(23, 22, 20, 0.13)',
    rule: 'rgba(23, 22, 20, 0.12)',
    ruleStrong: 'rgba(23, 22, 20, 0.24)',
    border: 'rgba(23, 22, 20, 0.13)',
    borderStrong: 'rgba(23, 22, 20, 0.26)',
    spine1: '#B4D7D9',
    spine2: '#96BCBD',
    spine3: '#7FA5A7',
    signals: { support: '#114B2F', caution: '#6E3E0B', refute: '#7F1D1D', info: '#16336B' },
    organic: { olive: '#364A29', sky: '#224759', coral: '#803523', ochre: '#664818', slate: '#2E3A47' },
    imageBlend: 'multiply',
    paperBlend: 'multiply',
    paperOpacity: 0.95,
    contrastRatioFgOnBg: '10.4:1 (AAA)',
  },

  terracotta: {
    id: 'terracotta',
    label: 'Warm Terracotta',
    lineage: 'Deimos Orange',
    recommendedFor: 'Cultura Pop, Social/Voz, Jornal 3 Min, Solar 3D, Biografias & Histórias',
    scheme: 'light',
    bg: '#EDBB99',
    surface1: '#E4B18F',
    surface2: '#D5A382',
    surface3: '#C59373',
    highlight: '#FAEBE0',
    fg: '#171614',
    fgSecondary: '#2B241F',
    fgMuted: '#513F33',
    fgSubtle: '#645144',
    accent: '#171614',
    accentHover: '#2E2B27',
    accentFg: '#EDBB99',
    invertedBg: '#171614',
    invertedSurface: '#26221F',
    invertedFg: '#FAEBE0',
    invertedMuted: '#C2A48F',
    invertedBorder: '#423831',
    bgTintSubtle: 'rgba(23, 22, 20, 0.05)',
    bgTintMuted: 'rgba(23, 22, 20, 0.09)',
    bgTintActive: 'rgba(23, 22, 20, 0.13)',
    rule: 'rgba(23, 22, 20, 0.12)',
    ruleStrong: 'rgba(23, 22, 20, 0.24)',
    border: 'rgba(23, 22, 20, 0.13)',
    borderStrong: 'rgba(23, 22, 20, 0.26)',
    spine1: '#F3CAAE',
    spine2: '#D8AA8C',
    spine3: '#C09579',
    signals: { support: '#14532D', caution: '#6B3409', refute: '#7F1D1D', info: '#1E3A6E' },
    organic: { olive: '#394A28', sky: '#244A5C', coral: '#7A2E1C', ochre: '#5E4115', slate: '#323A45' },
    imageBlend: 'multiply',
    paperBlend: 'multiply',
    paperOpacity: 0.95,
    contrastRatioFgOnBg: '10.4:1 (AAA)',
  },

  obsidian: {
    id: 'obsidian',
    label: 'Obsidian Dark',
    lineage: 'Anthropic Inverted + Deimos Dark',
    recommendedFor: 'Terminal Gann-Jenkins, Efemérides, Gráficos SVG Noturnos e Pro Desk',
    scheme: 'dark',
    bg: '#0E0E0D',
    surface1: '#161614',
    surface2: '#222220',
    surface3: '#30302E',
    highlight: 'rgba(250, 249, 245, 0.08)',
    fg: '#FAF9F5',
    fgSecondary: '#DCDAD1',
    fgMuted: '#A4A39B',
    fgSubtle: '#7A7972',
    accent: '#FAF9F5',
    accentHover: '#E8E6DC',
    accentFg: '#141413',
    invertedBg: '#FAF9F5',
    invertedSurface: '#E8E6DC',
    invertedFg: '#141413',
    invertedMuted: '#5E5D59',
    invertedBorder: '#DEDCD1',
    bgTintSubtle: 'rgba(250, 249, 245, 0.045)',
    bgTintMuted: 'rgba(250, 249, 245, 0.085)',
    bgTintActive: 'rgba(250, 249, 245, 0.13)',
    rule: 'rgba(250, 249, 245, 0.11)',
    ruleStrong: 'rgba(250, 249, 245, 0.22)',
    border: 'rgba(250, 249, 245, 0.12)',
    borderStrong: 'rgba(250, 249, 245, 0.26)',
    spine1: '#1C1C1A',
    spine2: '#151513',
    spine3: '#262624',
    signals: { support: '#4ADE80', caution: '#FBBF24', refute: '#F87171', info: '#60A5FA' },
    organic: { olive: '#98AE7B', sky: '#85B6CC', coral: '#E08D74', ochre: '#D9B16C', slate: '#97A4B5' },
    imageBlend: 'normal',
    paperBlend: 'screen',
    paperOpacity: 0.58,
    contrastRatioFgOnBg: '18.4:1 (AAA)',
  },
} as const;

export const TYPOGRAPHY = {
  families: {
    display: {
      web: '"Instrument Serif", "Geist Serif", "Newsreader", Georgia, serif',
      ios: 'Georgia',
      android: 'serif',
    },
    sans: {
      web: '"Geist", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      ios: 'System',
      android: 'Roboto',
    },
    mono: {
      web: '"Geist Mono", "JetBrains Mono", ui-monospace, Menlo, monospace',
      ios: 'Menlo',
      android: 'monospace',
    },
  },
  scale: {
    h1: { fontSize: 44, lineHeight: 46, letterSpacing: -1.1, fontWeight: '400' as const, voice: 'display' as const },
    h2: { fontSize: 32, lineHeight: 35, letterSpacing: -0.6, fontWeight: '400' as const, voice: 'display' as const },
    h3: { fontSize: 24, lineHeight: 28, letterSpacing: -0.35, fontWeight: '400' as const, voice: 'display' as const },
    h4: { fontSize: 20, lineHeight: 24, letterSpacing: -0.2, fontWeight: '400' as const, voice: 'display' as const },
    lead: { fontSize: 22, lineHeight: 28, letterSpacing: -0.25, fontWeight: '400' as const, voice: 'display' as const },
    metric: { fontSize: 52, lineHeight: 52, letterSpacing: -1.4, fontWeight: '400' as const, voice: 'display' as const, tabularNums: true },
    bodyLg: { fontSize: 17, lineHeight: 27.5, letterSpacing: 0, fontWeight: '400' as const, voice: 'sans' as const },
    bodyMd: { fontSize: 15, lineHeight: 23, letterSpacing: 0, fontWeight: '400' as const, voice: 'sans' as const },
    bodySm: { fontSize: 13.5, lineHeight: 20, letterSpacing: 0, fontWeight: '400' as const, voice: 'sans' as const },
    uiMd: { fontSize: 13, lineHeight: 18, letterSpacing: 0, fontWeight: '500' as const, voice: 'sans' as const },
    monoMd: { fontSize: 13, lineHeight: 19.5, letterSpacing: 0, fontWeight: '400' as const, voice: 'mono' as const, tabularNums: true },
    monoSm: { fontSize: 12, lineHeight: 18, letterSpacing: 0.1, fontWeight: '400' as const, voice: 'mono' as const, tabularNums: true },
    monoXs: { fontSize: 11, lineHeight: 16.5, letterSpacing: 0.8, fontWeight: '500' as const, voice: 'mono' as const, tabularNums: true },
    monoMicro: { fontSize: 10, lineHeight: 14, letterSpacing: 0.4, fontWeight: '400' as const, voice: 'mono' as const, tabularNums: true },
  },
} as const;

export const SPACING = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64, 20: 80, 24: 96,
} as const;

export const RADII = {
  none: 0,
  plate: 4,
  squircle: 8,
  card: 12,
  pill: 9999,
} as const;

export const BREAKPOINTS = {
  mobileMax: 640,
  tabletMax: 900,
  desktopMin: 901,
  largeMin: 1180,
  wideMin: 1440,
} as const;

/**
 * MOTION TOKENS — Emil Kowalski (`animate` + `animate-expo` + `apple-design`)
 * Regras absolutas:
 *  - Nunca usar `ease-in` em UI
 *  - Nunca começar entrada de `scale(0)` (mínimo `0.95`)
 *  - Ações de teclado (⌘K, atalhos, troca de abas 100×/dia) = ZERO animação
 *  - Em React Native / Expo: sempre UI thread via Reanimated 4 (nunca `PanResponder` ou `setState` por frame)
 */
export const MOTION = {
  bezier: {
    /** Emil Strong Ease-Out — entradas, dropdowns, tooltips, feedback */
    easeOut: [0.23, 1, 0.32, 1] as const,
    /** Emil Strong Ease-In-Out — movimento/morph em tela, clip-path tabs */
    easeInOut: [0.77, 0, 0.175, 1] as const,
    /** Emil / Vaul iOS Sheet Curve — drawers & bottom sheets */
    drawer: [0.32, 0.72, 0, 1] as const,
    /** Anthropic Tab Indicator — deslizamento ágil de indicador */
    snappy: [0.85, 0, 0, 1] as const,
    /** Deimos Editorial — placas de imagem & hover scale */
    editorial: [0.22, 1, 0.36, 1] as const,
    /** Deimos 3D Volume — estante de dossiês táteis */
    volume: [0.22, 0.8, 0.25, 1] as const,
  },
  duration: {
    none: 0,           // Atalhos de teclado (⌘K), troca de abas de alta frequência
    press: 120,        // :active scale(0.97) — 100–160ms
    tooltip: 140,      // Tooltips & micro-popovers — 125–200ms
    fast: 160,         // Hover / cor / rotação de ícone
    base: 220,         // Dropdowns, selects, segment controls — < 300ms
    drawer: 380,       // Drawers / sheets (exceção Emil: 200–500ms)
    toast: 400,        // Sonner Toast stack (exceção Emil)
    reveal: 560,       // Revelação editorial de placa
    volume: 800,       // Abertura de volume 3D
  },
  /** Presets de mola para Reanimated 4 / Motion (parâmetros de designer Apple) */
  springs: {
    /** Settle padrão sem overshoot (UI de alta precisão) */
    settle: { duration: 400, dampingRatio: 1.0, overshootClamping: true },
    /** Snap-back ou arremesso após gesto (bounce sutil apenas quando há momentum) */
    momentum: { duration: 400, dampingRatio: 0.8, overshootClamping: false },
    /** Bottom Sheet / Drawer com velocidade herdada */
    sheet: { duration: 300, dampingRatio: 0.8, overshootClamping: false },
  },
  gesture: {
    pressScale: 0.97,
    enterScale: 0.96,
    minHitTarget: 44,          // 44×44pt iOS / 48dp Android
    flickVelocityPxPerMs: 0.11, // Emil / Sonner velocity dismiss threshold
    decelerationRate: 0.998,    // Apple momentum projection constant
    rubberbandConstant: 0.55,   // Apple edge resistance constant
  },
  /** Frequency Gate de Emil Kowalski: decide se algo deve animar */
  frequencyGate: {
    highFrequency100PerDay: 'none' as const,      // ⌘K, atalhos, troca de abas raiz
    mediumFrequency10PerDay: 'minimal' as const,  // Press scale, hover sutil < 160ms
    occasional: 'standard' as const,              // Drawers, toasts, popovers < 300ms
    rareFirstTime: 'delight' as const,            // Onboarding, marco concluído
  },
  /** Mapa semântico de Haptics para Expo (`expo-haptics`) — sempre no mesmo frame do visual */
  haptics: {
    tick: 'selection' as const,           // Slider, scrub da Lifeline, controle segmentado
    snap: 'impactLight' as const,         // Sheet trava no detent, drag confirma
    commit: 'impactMedium' as const,      // Hold-to-confirm completado, ação destrutiva
    success: 'notificationSuccess' as const,
    error: 'notificationError' as const,
  },
} as const;

export const MODE_PROFILES: Record<
  OperationalMode,
  {
    readonly label: string;
    readonly defaultSurface: SurfaceId;
    readonly density: number;
    readonly cardPadding: number;
    readonly showAuditLayers: boolean;
    readonly showTechnicalDegrees: boolean;
    readonly emphasizePhysicalPriority: boolean;
  }
> = {
  invisible: {
    label: 'Modo Invisível (Cotidiano B2C)',
    defaultSurface: 'ivory',
    density: 1,
    cardPadding: 24,
    showAuditLayers: false,
    showTechnicalDegrees: false,
    emphasizePhysicalPriority: true,
  },
  technical: {
    label: 'Modo Técnico Auditável (Pro / Ciclos)',
    defaultSurface: 'obsidian',
    density: 0.88,
    cardPadding: 18,
    showAuditLayers: true,
    showTechnicalDegrees: true,
    emphasizePhysicalPriority: false,
  },
};

export interface SvgChartPalette {
  readonly canvas: string;
  readonly inkPrimary: string;
  readonly inkSecondary: string;
  readonly gridMajor: string;
  readonly gridMinor: string;
  readonly ringFill: string;
  readonly series: readonly [string, string, string, string, string];
  readonly signals: SurfacePalette['signals'];
  readonly strokeWidths: {
    readonly hairline: number;
    readonly axis: number;
    readonly vector: number;
    readonly focal: number;
  };
}

/** Projeção exponencial de momentum (Apple Designing Fluid Interfaces / Emil) */
export function projectMomentum(initialVelocityPxPerSec: number, decelerationRate = MOTION.gesture.decelerationRate): number {
  return (initialVelocityPxPerSec / 1000) * (decelerationRate / (1 - decelerationRate));
}

/** Resistência rubber-band suave em bordas de drag (nunca hard-stop) */
export function rubberband(overshoot: number, dimension: number, constant = MOTION.gesture.rubberbandConstant): number {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

export function getSurfaceTheme(
  surface: SurfaceId = 'ivory',
  signalStyle: SignalStyle = 'chromatic'
): SurfacePalette {
  const base = SURFACES[surface];
  if (signalStyle === 'chromatic') return base;
  return {
    ...base,
    signals: { support: base.fg, caution: base.fg, refute: base.fg, info: base.fg },
  };
}

export function getSvgChartPalette(
  surface: SurfaceId = 'ivory',
  signalStyle: SignalStyle = 'chromatic'
): SvgChartPalette {
  const t = getSurfaceTheme(surface, signalStyle);
  return {
    canvas: t.bg,
    inkPrimary: t.fg,
    inkSecondary: t.fgMuted,
    gridMajor: t.ruleStrong,
    gridMinor: t.rule,
    ringFill: t.bgTintSubtle,
    series: [t.fg, t.organic.sky, t.organic.coral, t.organic.olive, t.organic.ochre],
    signals: t.signals,
    strokeWidths: { hairline: 0.75, axis: 1, vector: 1.5, focal: 2.25 },
  };
}

export function rnElevation(level: 'flat' | 'raised' | 'modal', scheme: 'light' | 'dark' = 'light') {
  if (level === 'flat') return { elevation: 0, shadowOpacity: 0 } as const;
  const opacity = scheme === 'dark' ? (level === 'modal' ? 0.55 : 0.38) : level === 'modal' ? 0.18 : 0.11;
  return {
    shadowColor: '#111216',
    shadowOffset: { width: 0, height: level === 'modal' ? 12 : 4 },
    shadowOpacity: opacity,
    shadowRadius: level === 'modal' ? 24 : 10,
    elevation: level === 'modal' ? 10 : 4,
  } as const;
}

export function toCssVariables(surface: SurfaceId = 'ivory'): Record<string, string> {
  const t = SURFACES[surface];
  return {
    '--ds-bg': t.bg,
    '--ds-surface-1': t.surface1,
    '--ds-surface-2': t.surface2,
    '--ds-surface-3': t.surface3,
    '--ds-highlight': t.highlight,
    '--ds-fg': t.fg,
    '--ds-fg-secondary': t.fgSecondary,
    '--ds-fg-muted': t.fgMuted,
    '--ds-fg-subtle': t.fgSubtle,
    '--ds-accent': t.accent,
    '--ds-accent-fg': t.accentFg,
    '--ds-rule': t.rule,
    '--ds-rule-strong': t.ruleStrong,
    '--ds-border': t.border,
    '--ds-border-strong': t.borderStrong,
  };
}
