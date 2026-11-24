/**
 * MERIDIAN DESIGN SYSTEM — tokens.ts (v1.4.0)
 * Ecossistema: Meridian
 * Linhagem: Meridian Editorial + Meridian Arquival + Meridian Motion
 * Soft Chromatic · PaperGrain canvas · HalfTone fino · Scrollbar hairline · Burger→X
 * Compatibilidade: 100% TypeScript estrito · React Native / Expo (Reanimated 4) · Web · SVG 1:1
 */

export type SurfaceId =
  | 'ivory'
  | 'paper'
  | 'aqua'
  | 'terracotta'
  | 'obsidian'
  | 'blush'
  | 'apricot'
  | 'butter'
  | 'sage'
  | 'mist'
  | 'sky'
  | 'slate'
  | 'lilac'
  | 'ash'
  | 'stone'
  | 'clay'
  | 'navy'
  | 'mocha'
  | 'pine'
  | 'umber'
  | 'charcoal'
  | 'basalt'
  | 'graphite'
  | 'moss'
  | 'prune'
  | 'espresso';
export type OperationalMode = 'invisible' | 'technical';
export type SignalStyle = 'chromatic' | 'monochrome';
export type GrainPreset = 'off' | 'subtle' | 'editorial' | 'tactile';
/** Escala espacial do PaperGrain (fine = pó fino · chunky = grão grosso) */
export type GrainSizeId = 'fine' | 'medium' | 'coarse' | 'chunky';
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
    lineage: 'Meridian Editorial',
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
    rule: 'rgba(20, 20, 19, 0.09)',
    ruleStrong: 'rgba(20, 20, 19, 0.12)',
    border: 'rgba(20, 20, 19, 0.09)',
    borderStrong: 'rgba(20, 20, 19, 0.12)',
    spine1: '#F3F2EC',
    spine2: '#E8E6DC',
    spine3: '#DBD8CC',
    signals: { support: '#166534', caution: '#92400E', refute: '#991B1B', info: '#1E40AF' },
    organic: { olive: '#5E6E47', sky: '#477085', coral: '#B55A42', ochre: '#9A7134', slate: '#56606E' },
    imageBlend: 'multiply',
    paperBlend: 'multiply',
    paperOpacity: 0.88,
    contrastRatioFgOnBg: '17.6:1 (AAA)',
  },

  paper: {
    id: 'paper',
    label: 'Paper White',
    lineage: 'Paper Archive',
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
    rule: 'rgba(10, 10, 10, 0.09)',
    ruleStrong: 'rgba(10, 10, 10, 0.12)',
    border: 'rgba(10, 10, 10, 0.09)',
    borderStrong: 'rgba(10, 10, 10, 0.12)',
    spine1: '#F5F5F2',
    spine2: '#EAEAE6',
    spine3: '#DCDCD7',
    signals: { support: '#15803D', caution: '#A16207', refute: '#B91C1C', info: '#1D4ED8' },
    organic: { olive: '#5E6E47', sky: '#477085', coral: '#B55A42', ochre: '#9A7134', slate: '#56606E' },
    imageBlend: 'multiply',
    paperBlend: 'multiply',
    paperOpacity: 0.82,
    contrastRatioFgOnBg: '19.8:1 (AAA)',
  },

  aqua: {
    id: 'aqua',
    label: 'Signature Aqua',
    lineage: 'Aqua Archive',
    recommendedFor: 'Ambiente, Clima, Qualidade do Ar, AgroCiclos, Logística e Cartografia',
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
    rule: 'rgba(23, 22, 20, 0.09)',
    ruleStrong: 'rgba(23, 22, 20, 0.12)',
    border: 'rgba(23, 22, 20, 0.09)',
    borderStrong: 'rgba(23, 22, 20, 0.12)',
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
    lineage: 'Terracotta Archive',
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
    rule: 'rgba(23, 22, 20, 0.09)',
    ruleStrong: 'rgba(23, 22, 20, 0.12)',
    border: 'rgba(23, 22, 20, 0.09)',
    borderStrong: 'rgba(23, 22, 20, 0.12)',
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
    lineage: 'Meridian Inverted + Obsidian Archive',
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
    rule: 'rgba(250, 249, 245, 0.09)',
    ruleStrong: 'rgba(250, 249, 245, 0.12)',
    border: 'rgba(250, 249, 245, 0.09)',
    borderStrong: 'rgba(250, 249, 245, 0.12)',
    spine1: '#1C1C1A',
    spine2: '#151513',
    spine3: '#262624',
    signals: { support: '#4ADE80', caution: '#FBBF24', refute: '#F87171', info: '#60A5FA' },
    organic: { olive: '#98AE7B', sky: '#85B6CC', coral: '#E08D74', ochre: '#D9B16C', slate: '#97A4B5' },
    imageBlend: 'normal',
    paperBlend: 'screen',
    paperOpacity: 0.55,
    contrastRatioFgOnBg: '18.4:1 (AAA)',
  },

  blush: {
    id: 'blush',
    label: 'Soft Blush',
    lineage: 'Soft Chromatic',
    recommendedFor: 'Espectro suave, dossiês culturais e capas HalfTone',
    scheme: 'light',
    bg: '#E8C4C0',
    surface1: '#E0B9B5',
    surface2: '#D2AAA6',
    surface3: '#C29A96',
    highlight: '#F7E8E6',
    fg: '#1A1414',
    fgSecondary: '#2E2424',
    fgMuted: '#5A4544',
    fgSubtle: '#6E5655',
    accent: '#1A1414',
    accentHover: '#2E2424',
    accentFg: '#E8C4C0',
    invertedBg: '#1A1414',
    invertedSurface: '#2A2222',
    invertedFg: '#F7E8E6',
    invertedMuted: '#C4A09C',
    invertedBorder: '#3E3333',
    bgTintSubtle: 'rgba(26, 20, 20, 0.045)',
    bgTintMuted: 'rgba(26, 20, 20, 0.085)',
    bgTintActive: 'rgba(26, 20, 20, 0.12)',
    rule: 'rgba(26, 20, 20, 0.09)',
    ruleStrong: 'rgba(26, 20, 20, 0.12)',
    border: 'rgba(26, 20, 20, 0.09)',
    borderStrong: 'rgba(26, 20, 20, 0.12)',
    spine1: '#EFD1CD',
    spine2: '#D9B0AC',
    spine3: '#C59E9A',
    signals: { support: '#14532D', caution: '#6B3409', refute: '#7F1D1D', info: '#1E3A6E' },
    organic: { olive: '#394A28', sky: '#244A5C', coral: '#7A2E1C', ochre: '#5E4115', slate: '#323A45' },
    imageBlend: 'multiply',
    paperBlend: 'multiply',
    paperOpacity: 0.92,
    contrastRatioFgOnBg: '9.8:1 (AAA)',
  },

  butter: {
    id: 'butter',
    label: 'Soft Butter',
    lineage: 'Soft Chromatic',
    recommendedFor: 'Espectro suave, solar e notas editoriais quentes',
    scheme: 'light',
    bg: '#E8D9A8',
    surface1: '#E0D09C',
    surface2: '#D2C28C',
    surface3: '#C2B27C',
    highlight: '#F6F0DC',
    fg: '#1A1810',
    fgSecondary: '#2E2A1C',
    fgMuted: '#5A5238',
    fgSubtle: '#6E6548',
    accent: '#1A1810',
    accentHover: '#2E2A1C',
    accentFg: '#E8D9A8',
    invertedBg: '#1A1810',
    invertedSurface: '#2A2618',
    invertedFg: '#F6F0DC',
    invertedMuted: '#C4B88A',
    invertedBorder: '#3E3A28',
    bgTintSubtle: 'rgba(26, 24, 16, 0.045)',
    bgTintMuted: 'rgba(26, 24, 16, 0.085)',
    bgTintActive: 'rgba(26, 24, 16, 0.12)',
    rule: 'rgba(26, 24, 16, 0.09)',
    ruleStrong: 'rgba(26, 24, 16, 0.12)',
    border: 'rgba(26, 24, 16, 0.09)',
    borderStrong: 'rgba(26, 24, 16, 0.12)',
    spine1: '#EFE4BC',
    spine2: '#D9C998',
    spine3: '#C5B586',
    signals: { support: '#14532D', caution: '#6B3409', refute: '#7F1D1D', info: '#1E3A6E' },
    organic: { olive: '#394A28', sky: '#244A5C', coral: '#7A2E1C', ochre: '#5E4115', slate: '#323A45' },
    imageBlend: 'multiply',
    paperBlend: 'multiply',
    paperOpacity: 0.9,
    contrastRatioFgOnBg: '10.1:1 (AAA)',
  },

  mist: {
    id: 'mist',
    label: 'Soft Mist',
    lineage: 'Soft Chromatic',
    recommendedFor: 'Espectro suave, clima e leitura ambiental',
    scheme: 'light',
    bg: '#C5D4CE',
    surface1: '#B9C9C2',
    surface2: '#A8B9B2',
    surface3: '#96A8A0',
    highlight: '#E8F0EC',
    fg: '#141816',
    fgSecondary: '#242E2A',
    fgMuted: '#3E4E48',
    fgSubtle: '#506258',
    accent: '#141816',
    accentHover: '#242E2A',
    accentFg: '#C5D4CE',
    invertedBg: '#141816',
    invertedSurface: '#222A26',
    invertedFg: '#E8F0EC',
    invertedMuted: '#9BB0A8',
    invertedBorder: '#343E38',
    bgTintSubtle: 'rgba(20, 24, 22, 0.045)',
    bgTintMuted: 'rgba(20, 24, 22, 0.085)',
    bgTintActive: 'rgba(20, 24, 22, 0.12)',
    rule: 'rgba(20, 24, 22, 0.09)',
    ruleStrong: 'rgba(20, 24, 22, 0.12)',
    border: 'rgba(20, 24, 22, 0.09)',
    borderStrong: 'rgba(20, 24, 22, 0.12)',
    spine1: '#D2DFDA',
    spine2: '#B6C6C0',
    spine3: '#A0B2AA',
    signals: { support: '#114B2F', caution: '#6E3E0B', refute: '#7F1D1D', info: '#16336B' },
    organic: { olive: '#394A28', sky: '#244A5C', coral: '#7A2E1C', ochre: '#5E4115', slate: '#323A45' },
    imageBlend: 'multiply',
    paperBlend: 'multiply',
    paperOpacity: 0.9,
    contrastRatioFgOnBg: '9.6:1 (AAA)',
  },

  lilac: {
    id: 'lilac',
    label: 'Soft Lilac',
    lineage: 'Soft Chromatic',
    recommendedFor: 'Espectro suave, cultura e capas editoriais',
    scheme: 'light',
    bg: '#C9C0D8',
    surface1: '#BDB4CE',
    surface2: '#ADA2C0',
    surface3: '#9C90B0',
    highlight: '#EBE6F2',
    fg: '#16141A',
    fgSecondary: '#28242E',
    fgMuted: '#4A4458',
    fgSubtle: '#5E566C',
    accent: '#16141A',
    accentHover: '#28242E',
    accentFg: '#C9C0D8',
    invertedBg: '#16141A',
    invertedSurface: '#26222E',
    invertedFg: '#EBE6F2',
    invertedMuted: '#A89CB8',
    invertedBorder: '#3A3444',
    bgTintSubtle: 'rgba(22, 20, 26, 0.045)',
    bgTintMuted: 'rgba(22, 20, 26, 0.085)',
    bgTintActive: 'rgba(22, 20, 26, 0.12)',
    rule: 'rgba(22, 20, 26, 0.09)',
    ruleStrong: 'rgba(22, 20, 26, 0.12)',
    border: 'rgba(22, 20, 26, 0.09)',
    borderStrong: 'rgba(22, 20, 26, 0.12)',
    spine1: '#D6CEE2',
    spine2: '#BBB0CC',
    spine3: '#A89CB8',
    signals: { support: '#14532D', caution: '#6B3409', refute: '#7F1D1D', info: '#1E3A6E' },
    organic: { olive: '#394A28', sky: '#244A5C', coral: '#7A2E1C', ochre: '#5E4115', slate: '#323A45' },
    imageBlend: 'multiply',
    paperBlend: 'multiply',
    paperOpacity: 0.9,
    contrastRatioFgOnBg: '9.7:1 (AAA)',
  },

  apricot: {
    id: 'apricot',
    label: 'Soft Apricot',
    lineage: 'Soft Chromatic',
    recommendedFor: 'Espectro suave, solar e capas quentes',
    scheme: 'light',
    bg: '#E8C8A8',
    surface1: '#E0BFA0',
    surface2: '#D2AF90',
    surface3: '#C29F80',
    highlight: '#F7EBDE',
    fg: '#1A1612',
    fgSecondary: '#2E2820',
    fgMuted: '#5A4A3A',
    fgSubtle: '#6E5C4A',
    accent: '#1A1612',
    accentHover: '#2E2820',
    accentFg: '#E8C8A8',
    invertedBg: '#1A1612',
    invertedSurface: '#2A241C',
    invertedFg: '#F7EBDE',
    invertedMuted: '#C4A888',
    invertedBorder: '#3E3630',
    bgTintSubtle: 'rgba(26, 22, 18, 0.045)',
    bgTintMuted: 'rgba(26, 22, 18, 0.085)',
    bgTintActive: 'rgba(26, 22, 18, 0.12)',
    rule: 'rgba(26, 22, 18, 0.09)',
    ruleStrong: 'rgba(26, 22, 18, 0.12)',
    border: 'rgba(26, 22, 18, 0.09)',
    borderStrong: 'rgba(26, 22, 18, 0.12)',
    spine1: '#EFDBC2',
    spine2: '#D9B898',
    spine3: '#C5A686',
    signals: { support: '#14532D', caution: '#6B3409', refute: '#7F1D1D', info: '#1E3A6E' },
    organic: { olive: '#394A28', sky: '#244A5C', coral: '#7A2E1C', ochre: '#5E4115', slate: '#323A45' },
    imageBlend: 'multiply',
    paperBlend: 'multiply',
    paperOpacity: 0.9,
    contrastRatioFgOnBg: '10.0:1 (AAA)',
  },

  sage: {
    id: 'sage',
    label: 'Soft Sage',
    lineage: 'Soft Chromatic',
    recommendedFor: 'Espectro suave, agro e leitura ambiental',
    scheme: 'light',
    bg: '#B8C5A8',
    surface1: '#ACB99C',
    surface2: '#9AAB8A',
    surface3: '#889A78',
    highlight: '#E6EDE0',
    fg: '#141812',
    fgSecondary: '#242E22',
    fgMuted: '#3E4E38',
    fgSubtle: '#506248',
    accent: '#141812',
    accentHover: '#242E22',
    accentFg: '#B8C5A8',
    invertedBg: '#141812',
    invertedSurface: '#222A1E',
    invertedFg: '#E6EDE0',
    invertedMuted: '#9BB08A',
    invertedBorder: '#343E30',
    bgTintSubtle: 'rgba(20, 24, 18, 0.045)',
    bgTintMuted: 'rgba(20, 24, 18, 0.085)',
    bgTintActive: 'rgba(20, 24, 18, 0.12)',
    rule: 'rgba(20, 24, 18, 0.09)',
    ruleStrong: 'rgba(20, 24, 18, 0.12)',
    border: 'rgba(20, 24, 18, 0.09)',
    borderStrong: 'rgba(20, 24, 18, 0.12)',
    spine1: '#C8D4BA',
    spine2: '#A8B898',
    spine3: '#94A686',
    signals: { support: '#114B2F', caution: '#6E3E0B', refute: '#7F1D1D', info: '#16336B' },
    organic: { olive: '#394A28', sky: '#244A5C', coral: '#7A2E1C', ochre: '#5E4115', slate: '#323A45' },
    imageBlend: 'multiply',
    paperBlend: 'multiply',
    paperOpacity: 0.9,
    contrastRatioFgOnBg: '9.8:1 (AAA)',
  },

  sky: {
    id: 'sky',
    label: 'Soft Sky',
    lineage: 'Soft Chromatic',
    recommendedFor: 'Espectro suave, clima e cartografia leve',
    scheme: 'light',
    bg: '#B0C8D6',
    surface1: '#A4BCCA',
    surface2: '#92AAB8',
    surface3: '#8098A6',
    highlight: '#E2EEF4',
    fg: '#12161A',
    fgSecondary: '#222A30',
    fgMuted: '#3A4A54',
    fgSubtle: '#4C5E68',
    accent: '#12161A',
    accentHover: '#222A30',
    accentFg: '#B0C8D6',
    invertedBg: '#12161A',
    invertedSurface: '#1E262C',
    invertedFg: '#E2EEF4',
    invertedMuted: '#8CA8B8',
    invertedBorder: '#323C44',
    bgTintSubtle: 'rgba(18, 22, 26, 0.045)',
    bgTintMuted: 'rgba(18, 22, 26, 0.085)',
    bgTintActive: 'rgba(18, 22, 26, 0.12)',
    rule: 'rgba(18, 22, 26, 0.09)',
    ruleStrong: 'rgba(18, 22, 26, 0.12)',
    border: 'rgba(18, 22, 26, 0.09)',
    borderStrong: 'rgba(18, 22, 26, 0.12)',
    spine1: '#C2D6E2',
    spine2: '#A0B8C6',
    spine3: '#8CA8B6',
    signals: { support: '#114B2F', caution: '#6E3E0B', refute: '#7F1D1D', info: '#16336B' },
    organic: { olive: '#394A28', sky: '#244A5C', coral: '#7A2E1C', ochre: '#5E4115', slate: '#323A45' },
    imageBlend: 'multiply',
    paperBlend: 'multiply',
    paperOpacity: 0.9,
    contrastRatioFgOnBg: '9.9:1 (AAA)',
  },

  slate: {
    id: 'slate',
    label: 'Soft Slate',
    lineage: 'Soft Chromatic',
    recommendedFor: 'Espectro suave, finanças e dossiês B2B',
    scheme: 'light',
    bg: '#B5BFC9',
    surface1: '#A9B3BD',
    surface2: '#98A2AC',
    surface3: '#86909A',
    highlight: '#E6EBEF',
    fg: '#141618',
    fgSecondary: '#24282C',
    fgMuted: '#3E464E',
    fgSubtle: '#505860',
    accent: '#141618',
    accentHover: '#24282C',
    accentFg: '#B5BFC9',
    invertedBg: '#141618',
    invertedSurface: '#22262A',
    invertedFg: '#E6EBEF',
    invertedMuted: '#94A0AA',
    invertedBorder: '#343A40',
    bgTintSubtle: 'rgba(20, 22, 24, 0.045)',
    bgTintMuted: 'rgba(20, 22, 24, 0.085)',
    bgTintActive: 'rgba(20, 22, 24, 0.12)',
    rule: 'rgba(20, 22, 24, 0.09)',
    ruleStrong: 'rgba(20, 22, 24, 0.12)',
    border: 'rgba(20, 22, 24, 0.09)',
    borderStrong: 'rgba(20, 22, 24, 0.12)',
    spine1: '#C6CED6',
    spine2: '#A8B2BC',
    spine3: '#949EA8',
    signals: { support: '#14532D', caution: '#6B3409', refute: '#7F1D1D', info: '#1E3A6E' },
    organic: { olive: '#394A28', sky: '#244A5C', coral: '#7A2E1C', ochre: '#5E4115', slate: '#323A45' },
    imageBlend: 'multiply',
    paperBlend: 'multiply',
    paperOpacity: 0.88,
    contrastRatioFgOnBg: '9.7:1 (AAA)',
  },

  ash: {
    id: 'ash',
    label: 'Pale Ash',
    lineage: 'Soft Chromatic',
    recommendedFor: 'Papel cinza claro, neutro, ao lado do marfim',
    scheme: 'light',
    bg: '#E2DFD8',
    surface1: '#D6D3CC',
    surface2: '#C8C5BE',
    surface3: '#BAB7B0',
    highlight: '#F4F1EA',
    fg: '#141413',
    fgSecondary: '#2C2B28',
    fgMuted: '#5A5852',
    fgSubtle: '#706E68',
    accent: '#141413',
    accentHover: '#2C2B28',
    accentFg: '#E2DFD8',
    invertedBg: '#141413',
    invertedSurface: '#2C2B28',
    invertedFg: '#F4F1EA',
    invertedMuted: '#C8C5BE',
    invertedBorder: '#5A5852',
    bgTintSubtle: 'rgba(20, 20, 19, 0.045)',
    bgTintMuted: 'rgba(20, 20, 19, 0.085)',
    bgTintActive: 'rgba(20, 20, 19, 0.12)',
    rule: 'rgba(20, 20, 19, 0.09)',
    ruleStrong: 'rgba(20, 20, 19, 0.12)',
    border: 'rgba(20, 20, 19, 0.09)',
    borderStrong: 'rgba(20, 20, 19, 0.12)',
    spine1: '#E8E5DE',
    spine2: '#D4D1CA',
    spine3: '#C2BFB8',
    signals: { support: '#166534', caution: '#92400E', refute: '#991B1B', info: '#1E40AF' },
    organic: { olive: '#5E6E47', sky: '#477085', coral: '#B55A42', ochre: '#9A7134', slate: '#56606E' },
    imageBlend: 'multiply',
    paperBlend: 'multiply',
    paperOpacity: 0.9,
    contrastRatioFgOnBg: '13.9:1 (AAA)',
  },

  stone: {
    id: 'stone',
    label: 'Stone Gray',
    lineage: 'Soft Chromatic',
    recommendedFor: 'Cinza médio neutro, distinto do Soft Slate',
    scheme: 'light',
    bg: '#8E8B84',
    surface1: '#827F78',
    surface2: '#76736C',
    surface3: '#6A6760',
    highlight: '#C8C5BE',
    fg: '#141413',
    fgSecondary: '#242320',
    fgMuted: '#2C2B28',
    fgSubtle: '#3A3834',
    accent: '#141413',
    accentHover: '#242320',
    accentFg: '#8E8B84',
    invertedBg: '#141413',
    invertedSurface: '#242320',
    invertedFg: '#C8C5BE',
    invertedMuted: '#76736C',
    invertedBorder: '#2C2B28',
    bgTintSubtle: 'rgba(20, 20, 19, 0.045)',
    bgTintMuted: 'rgba(20, 20, 19, 0.085)',
    bgTintActive: 'rgba(20, 20, 19, 0.12)',
    rule: 'rgba(20, 20, 19, 0.09)',
    ruleStrong: 'rgba(20, 20, 19, 0.12)',
    border: 'rgba(20, 20, 19, 0.09)',
    borderStrong: 'rgba(20, 20, 19, 0.12)',
    spine1: '#9A978F',
    spine2: '#827F78',
    spine3: '#6E6B64',
    signals: { support: '#166534', caution: '#92400E', refute: '#991B1B', info: '#1E40AF' },
    organic: { olive: '#5E6E47', sky: '#477085', coral: '#B55A42', ochre: '#9A7134', slate: '#56606E' },
    imageBlend: 'multiply',
    paperBlend: 'multiply',
    paperOpacity: 0.9,
    contrastRatioFgOnBg: '5.4:1 (AA)',
  },

  clay: {
    id: 'clay',
    label: 'Field Ochre',
    lineage: 'Soft Chromatic',
    recommendedFor: 'Ocre médio terroso, sem o amarelo do Soft Butter',
    scheme: 'light',
    bg: '#B39A6E',
    surface1: '#A78E64',
    surface2: '#9A825A',
    surface3: '#8C764E',
    highlight: '#E6D8BC',
    fg: '#1A1610',
    fgSecondary: '#2E2818',
    fgMuted: '#3A3018',
    fgSubtle: '#4A3E28',
    accent: '#1A1610',
    accentHover: '#2E2818',
    accentFg: '#B39A6E',
    invertedBg: '#1A1610',
    invertedSurface: '#2E2818',
    invertedFg: '#E6D8BC',
    invertedMuted: '#9A825A',
    invertedBorder: '#3A3018',
    bgTintSubtle: 'rgba(26, 22, 16, 0.045)',
    bgTintMuted: 'rgba(26, 22, 16, 0.085)',
    bgTintActive: 'rgba(26, 22, 16, 0.12)',
    rule: 'rgba(26, 22, 16, 0.09)',
    ruleStrong: 'rgba(26, 22, 16, 0.12)',
    border: 'rgba(26, 22, 16, 0.09)',
    borderStrong: 'rgba(26, 22, 16, 0.12)',
    spine1: '#C2A87C',
    spine2: '#A89064',
    spine3: '#947E54',
    signals: { support: '#166534', caution: '#92400E', refute: '#991B1B', info: '#1E40AF' },
    organic: { olive: '#5E6E47', sky: '#477085', coral: '#B55A42', ochre: '#9A7134', slate: '#56606E' },
    imageBlend: 'multiply',
    paperBlend: 'multiply',
    paperOpacity: 0.9,
    contrastRatioFgOnBg: '6.7:1 (AA)',
  },

  navy: {
    id: 'navy',
    label: 'Navy Ink',
    lineage: 'Ink Archive',
    recommendedFor: 'Tinta azul-marinho dessaturada, alternativa ao Obsidian',
    scheme: 'dark',
    bg: '#1C3142',
    surface1: '#243848',
    surface2: '#2E4454',
    surface3: '#3A5060',
    highlight: 'rgba(243, 246, 246, 0.08)',
    fg: '#F3F6F6',
    fgSecondary: '#D5DEE3',
    fgMuted: '#A8B6BE',
    fgSubtle: '#7E909A',
    accent: '#F3F6F6',
    accentHover: '#D5DEE3',
    accentFg: '#1C3142',
    invertedBg: '#F3F6F6',
    invertedSurface: '#D5DEE3',
    invertedFg: '#1C3142',
    invertedMuted: '#3A5060',
    invertedBorder: '#A8B6BE',
    bgTintSubtle: 'rgba(243, 246, 246, 0.045)',
    bgTintMuted: 'rgba(243, 246, 246, 0.085)',
    bgTintActive: 'rgba(243, 246, 246, 0.12)',
    rule: 'rgba(243, 246, 246, 0.09)',
    ruleStrong: 'rgba(243, 246, 246, 0.12)',
    border: 'rgba(243, 246, 246, 0.09)',
    borderStrong: 'rgba(243, 246, 246, 0.12)',
    spine1: '#1A2C3A',
    spine2: '#152430',
    spine3: '#2A3E4C',
    signals: { support: '#4ADE80', caution: '#FBBF24', refute: '#F87171', info: '#60A5FA' },
    organic: { olive: '#98AE7B', sky: '#85B6CC', coral: '#E08D74', ochre: '#D9B16C', slate: '#97A4B5' },
    imageBlend: 'normal',
    paperBlend: 'screen',
    paperOpacity: 0.55,
    contrastRatioFgOnBg: '12.3:1 (AAA)',
  },

  mocha: {
    id: 'mocha',
    label: 'Mocha Ink',
    lineage: 'Ink Archive',
    recommendedFor: 'Marrom café profundo, quente, sem laranja',
    scheme: 'dark',
    bg: '#3A2A22',
    surface1: '#463228',
    surface2: '#523C30',
    surface3: '#5E463A',
    highlight: 'rgba(246, 241, 236, 0.08)',
    fg: '#F6F1EC',
    fgSecondary: '#E4D8D0',
    fgMuted: '#C4B2A6',
    fgSubtle: '#9A887C',
    accent: '#F6F1EC',
    accentHover: '#E4D8D0',
    accentFg: '#3A2A22',
    invertedBg: '#F6F1EC',
    invertedSurface: '#E4D8D0',
    invertedFg: '#3A2A22',
    invertedMuted: '#5E463A',
    invertedBorder: '#C4B2A6',
    bgTintSubtle: 'rgba(246, 241, 236, 0.045)',
    bgTintMuted: 'rgba(246, 241, 236, 0.085)',
    bgTintActive: 'rgba(246, 241, 236, 0.12)',
    rule: 'rgba(246, 241, 236, 0.09)',
    ruleStrong: 'rgba(246, 241, 236, 0.12)',
    border: 'rgba(246, 241, 236, 0.09)',
    borderStrong: 'rgba(246, 241, 236, 0.12)',
    spine1: '#32241E',
    spine2: '#2A1E18',
    spine3: '#4A342C',
    signals: { support: '#4ADE80', caution: '#FBBF24', refute: '#F87171', info: '#60A5FA' },
    organic: { olive: '#98AE7B', sky: '#85B6CC', coral: '#E08D74', ochre: '#D9B16C', slate: '#97A4B5' },
    imageBlend: 'normal',
    paperBlend: 'screen',
    paperOpacity: 0.55,
    contrastRatioFgOnBg: '12.2:1 (AAA)',
  },

  pine: {
    id: 'pine',
    label: 'Pine Ink',
    lineage: 'Ink Archive',
    recommendedFor: 'Verde profundo, tinta, além do Soft Sage',
    scheme: 'dark',
    bg: '#1E3328',
    surface1: '#264034',
    surface2: '#2E4A3C',
    surface3: '#385646',
    highlight: 'rgba(242, 246, 243, 0.08)',
    fg: '#F2F6F3',
    fgSecondary: '#D4E0D8',
    fgMuted: '#A8BAAE',
    fgSubtle: '#7E9486',
    accent: '#F2F6F3',
    accentHover: '#D4E0D8',
    accentFg: '#1E3328',
    invertedBg: '#F2F6F3',
    invertedSurface: '#D4E0D8',
    invertedFg: '#1E3328',
    invertedMuted: '#385646',
    invertedBorder: '#A8BAAE',
    bgTintSubtle: 'rgba(242, 246, 243, 0.045)',
    bgTintMuted: 'rgba(242, 246, 243, 0.085)',
    bgTintActive: 'rgba(242, 246, 243, 0.12)',
    rule: 'rgba(242, 246, 243, 0.09)',
    ruleStrong: 'rgba(242, 246, 243, 0.12)',
    border: 'rgba(242, 246, 243, 0.09)',
    borderStrong: 'rgba(242, 246, 243, 0.12)',
    spine1: '#1A2C22',
    spine2: '#14241C',
    spine3: '#2A4034',
    signals: { support: '#4ADE80', caution: '#FBBF24', refute: '#F87171', info: '#60A5FA' },
    organic: { olive: '#98AE7B', sky: '#85B6CC', coral: '#E08D74', ochre: '#D9B16C', slate: '#97A4B5' },
    imageBlend: 'normal',
    paperBlend: 'screen',
    paperOpacity: 0.55,
    contrastRatioFgOnBg: '12.4:1 (AAA)',
  },

  umber: {
    id: 'umber',
    label: 'Deep Ochre',
    lineage: 'Ink Archive',
    recommendedFor: 'Ocre profundo, terra, sem folha de ouro',
    scheme: 'dark',
    bg: '#4E3E24',
    surface1: '#5C4A2C',
    surface2: '#6A5634',
    surface3: '#78623C',
    highlight: 'rgba(247, 243, 234, 0.08)',
    fg: '#F7F3EA',
    fgSecondary: '#E6DCC8',
    fgMuted: '#C4B496',
    fgSubtle: '#9A8A70',
    accent: '#F7F3EA',
    accentHover: '#E6DCC8',
    accentFg: '#4E3E24',
    invertedBg: '#F7F3EA',
    invertedSurface: '#E6DCC8',
    invertedFg: '#4E3E24',
    invertedMuted: '#78623C',
    invertedBorder: '#C4B496',
    bgTintSubtle: 'rgba(247, 243, 234, 0.045)',
    bgTintMuted: 'rgba(247, 243, 234, 0.085)',
    bgTintActive: 'rgba(247, 243, 234, 0.12)',
    rule: 'rgba(247, 243, 234, 0.09)',
    ruleStrong: 'rgba(247, 243, 234, 0.12)',
    border: 'rgba(247, 243, 234, 0.09)',
    borderStrong: 'rgba(247, 243, 234, 0.12)',
    spine1: '#44361E',
    spine2: '#3A2E18',
    spine3: '#5C4A2C',
    signals: { support: '#4ADE80', caution: '#FBBF24', refute: '#F87171', info: '#60A5FA' },
    organic: { olive: '#98AE7B', sky: '#85B6CC', coral: '#E08D74', ochre: '#D9B16C', slate: '#97A4B5' },
    imageBlend: 'normal',
    paperBlend: 'screen',
    paperOpacity: 0.55,
    contrastRatioFgOnBg: '9.3:1 (AAA)',
  },

  charcoal: {
    id: 'charcoal',
    label: 'Charcoal',
    lineage: 'Ink Archive',
    recommendedFor: 'Carvão mais claro que o Obsidian Dark',
    scheme: 'dark',
    bg: '#3E3C38',
    surface1: '#4A4844',
    surface2: '#565450',
    surface3: '#64625C',
    highlight: 'rgba(244, 242, 236, 0.08)',
    fg: '#F4F2EC',
    fgSecondary: '#E0DDD6',
    fgMuted: '#B8B4AC',
    fgSubtle: '#8E8A82',
    accent: '#F4F2EC',
    accentHover: '#E0DDD6',
    accentFg: '#3E3C38',
    invertedBg: '#F4F2EC',
    invertedSurface: '#E0DDD6',
    invertedFg: '#3E3C38',
    invertedMuted: '#64625C',
    invertedBorder: '#B8B4AC',
    bgTintSubtle: 'rgba(244, 242, 236, 0.045)',
    bgTintMuted: 'rgba(244, 242, 236, 0.085)',
    bgTintActive: 'rgba(244, 242, 236, 0.12)',
    rule: 'rgba(244, 242, 236, 0.09)',
    ruleStrong: 'rgba(244, 242, 236, 0.12)',
    border: 'rgba(244, 242, 236, 0.09)',
    borderStrong: 'rgba(244, 242, 236, 0.12)',
    spine1: '#36342F',
    spine2: '#2E2C28',
    spine3: '#4A4844',
    signals: { support: '#4ADE80', caution: '#FBBF24', refute: '#F87171', info: '#60A5FA' },
    organic: { olive: '#98AE7B', sky: '#85B6CC', coral: '#E08D74', ochre: '#D9B16C', slate: '#97A4B5' },
    imageBlend: 'normal',
    paperBlend: 'screen',
    paperOpacity: 0.55,
    contrastRatioFgOnBg: '9.8:1 (AAA)',
  },

  basalt: {
    id: 'basalt',
    label: 'Basalt Noir',
    lineage: 'Muted Near-Black Ink',
    recommendedFor: 'Fundo quase preto frio e dessaturado (ardósia noturna)',
    scheme: 'dark',
    bg: '#191B1D',
    surface1: '#212427',
    surface2: '#2B2E32',
    surface3: '#363A3F',
    highlight: 'rgba(243, 244, 244, 0.08)',
    fg: '#F3F4F4',
    fgSecondary: '#D4D7DA',
    fgMuted: '#9FA4A8',
    fgSubtle: '#787D82',
    accent: '#F3F4F4',
    accentHover: '#D4D7DA',
    accentFg: '#191B1D',
    invertedBg: '#F3F4F4',
    invertedSurface: '#D4D7DA',
    invertedFg: '#191B1D',
    invertedMuted: '#363A3F',
    invertedBorder: '#9FA4A8',
    bgTintSubtle: 'rgba(243, 244, 244, 0.045)',
    bgTintMuted: 'rgba(243, 244, 244, 0.085)',
    bgTintActive: 'rgba(243, 244, 244, 0.12)',
    rule: 'rgba(243, 244, 244, 0.09)',
    ruleStrong: 'rgba(243, 244, 244, 0.12)',
    border: 'rgba(243, 244, 244, 0.09)',
    borderStrong: 'rgba(243, 244, 244, 0.12)',
    spine1: '#16181A',
    spine2: '#111315',
    spine3: '#24272B',
    signals: { support: '#4ADE80', caution: '#FBBF24', refute: '#F87171', info: '#60A5FA' },
    organic: { olive: '#98AE7B', sky: '#85B6CC', coral: '#E08D74', ochre: '#D9B16C', slate: '#97A4B5' },
    imageBlend: 'normal',
    paperBlend: 'screen',
    paperOpacity: 0.55,
    contrastRatioFgOnBg: '16.4:1 (AAA)',
  },

  graphite: {
    id: 'graphite',
    label: 'Graphite Mute',
    lineage: 'Muted Near-Black Ink',
    recommendedFor: 'Grafite mineral dessaturado próximo ao preto com calor neutro',
    scheme: 'dark',
    bg: '#1E1D1B',
    surface1: '#272522',
    surface2: '#312E2A',
    surface3: '#3D3934',
    highlight: 'rgba(245, 243, 238, 0.08)',
    fg: '#F5F3EE',
    fgSecondary: '#DAD7D0',
    fgMuted: '#A6A29A',
    fgSubtle: '#7E7A72',
    accent: '#F5F3EE',
    accentHover: '#DAD7D0',
    accentFg: '#1E1D1B',
    invertedBg: '#F5F3EE',
    invertedSurface: '#DAD7D0',
    invertedFg: '#1E1D1B',
    invertedMuted: '#3D3934',
    invertedBorder: '#A6A29A',
    bgTintSubtle: 'rgba(245, 243, 238, 0.045)',
    bgTintMuted: 'rgba(245, 243, 238, 0.085)',
    bgTintActive: 'rgba(245, 243, 238, 0.12)',
    rule: 'rgba(245, 243, 238, 0.09)',
    ruleStrong: 'rgba(245, 243, 238, 0.12)',
    border: 'rgba(245, 243, 238, 0.09)',
    borderStrong: 'rgba(245, 243, 238, 0.12)',
    spine1: '#1A1917',
    spine2: '#141311',
    spine3: '#292724',
    signals: { support: '#4ADE80', caution: '#FBBF24', refute: '#F87171', info: '#60A5FA' },
    organic: { olive: '#98AE7B', sky: '#85B6CC', coral: '#E08D74', ochre: '#D9B16C', slate: '#97A4B5' },
    imageBlend: 'normal',
    paperBlend: 'screen',
    paperOpacity: 0.55,
    contrastRatioFgOnBg: '15.7:1 (AAA)',
  },

  moss: {
    id: 'moss',
    label: 'Moss Shadow',
    lineage: 'Muted Near-Black Ink',
    recommendedFor: 'Sombra florestal dessaturada próxima ao preto para leitura calma',
    scheme: 'dark',
    bg: '#171C19',
    surface1: '#1E2521',
    surface2: '#27302B',
    surface3: '#323D36',
    highlight: 'rgba(242, 245, 243, 0.08)',
    fg: '#F2F5F3',
    fgSecondary: '#D2DBD5',
    fgMuted: '#9BA59F',
    fgSubtle: '#758079',
    accent: '#F2F5F3',
    accentHover: '#D2DBD5',
    accentFg: '#171C19',
    invertedBg: '#F2F5F3',
    invertedSurface: '#D2DBD5',
    invertedFg: '#171C19',
    invertedMuted: '#323D36',
    invertedBorder: '#9BA59F',
    bgTintSubtle: 'rgba(242, 245, 243, 0.045)',
    bgTintMuted: 'rgba(242, 245, 243, 0.085)',
    bgTintActive: 'rgba(242, 245, 243, 0.12)',
    rule: 'rgba(242, 245, 243, 0.09)',
    ruleStrong: 'rgba(242, 245, 243, 0.12)',
    border: 'rgba(242, 245, 243, 0.09)',
    borderStrong: 'rgba(242, 245, 243, 0.12)',
    spine1: '#141816',
    spine2: '#101412',
    spine3: '#212824',
    signals: { support: '#4ADE80', caution: '#FBBF24', refute: '#F87171', info: '#60A5FA' },
    organic: { olive: '#98AE7B', sky: '#85B6CC', coral: '#E08D74', ochre: '#D9B16C', slate: '#97A4B5' },
    imageBlend: 'normal',
    paperBlend: 'screen',
    paperOpacity: 0.55,
    contrastRatioFgOnBg: '16.5:1 (AAA)',
  },

  prune: {
    id: 'prune',
    label: 'Muted Eggplant',
    lineage: 'Muted Near-Black Ink',
    recommendedFor: 'Ameixa mineral fechada e dessaturada para dossiês noturnos',
    scheme: 'dark',
    bg: '#1B171D',
    surface1: '#231E26',
    surface2: '#2D2730',
    surface3: '#38313C',
    highlight: 'rgba(244, 242, 245, 0.08)',
    fg: '#F4F2F5',
    fgSecondary: '#D8D3DC',
    fgMuted: '#A49DA8',
    fgSubtle: '#7B7480',
    accent: '#F4F2F5',
    accentHover: '#D8D3DC',
    accentFg: '#1B171D',
    invertedBg: '#F4F2F5',
    invertedSurface: '#D8D3DC',
    invertedFg: '#1B171D',
    invertedMuted: '#38313C',
    invertedBorder: '#A49DA8',
    bgTintSubtle: 'rgba(244, 242, 245, 0.045)',
    bgTintMuted: 'rgba(244, 242, 245, 0.085)',
    bgTintActive: 'rgba(244, 242, 245, 0.12)',
    rule: 'rgba(244, 242, 245, 0.09)',
    ruleStrong: 'rgba(244, 242, 245, 0.12)',
    border: 'rgba(244, 242, 245, 0.09)',
    borderStrong: 'rgba(244, 242, 245, 0.12)',
    spine1: '#171419',
    spine2: '#121014',
    spine3: '#262129',
    signals: { support: '#4ADE80', caution: '#FBBF24', refute: '#F87171', info: '#60A5FA' },
    organic: { olive: '#98AE7B', sky: '#85B6CC', coral: '#E08D74', ochre: '#D9B16C', slate: '#97A4B5' },
    imageBlend: 'normal',
    paperBlend: 'screen',
    paperOpacity: 0.55,
    contrastRatioFgOnBg: '16.3:1 (AAA)',
  },

  espresso: {
    id: 'espresso',
    label: 'Smoked Umber',
    lineage: 'Muted Near-Black Ink',
    recommendedFor: 'Sepia defumado dessaturado quase preto com calor de arquivo',
    scheme: 'dark',
    bg: '#1D1815',
    surface1: '#26201C',
    surface2: '#302823',
    surface3: '#3B322C',
    highlight: 'rgba(246, 242, 238, 0.08)',
    fg: '#F6F2EE',
    fgSecondary: '#DCD5CE',
    fgMuted: '#A89E96',
    fgSubtle: '#7F766F',
    accent: '#F6F2EE',
    accentHover: '#DCD5CE',
    accentFg: '#1D1815',
    invertedBg: '#F6F2EE',
    invertedSurface: '#DCD5CE',
    invertedFg: '#1D1815',
    invertedMuted: '#3B322C',
    invertedBorder: '#A89E96',
    bgTintSubtle: 'rgba(246, 242, 238, 0.045)',
    bgTintMuted: 'rgba(246, 242, 238, 0.085)',
    bgTintActive: 'rgba(246, 242, 238, 0.12)',
    rule: 'rgba(246, 242, 238, 0.09)',
    ruleStrong: 'rgba(246, 242, 238, 0.12)',
    border: 'rgba(246, 242, 238, 0.09)',
    borderStrong: 'rgba(246, 242, 238, 0.12)',
    spine1: '#191512',
    spine2: '#14100E',
    spine3: '#29221E',
    signals: { support: '#4ADE80', caution: '#FBBF24', refute: '#F87171', info: '#60A5FA' },
    organic: { olive: '#98AE7B', sky: '#85B6CC', coral: '#E08D74', ochre: '#D9B16C', slate: '#97A4B5' },
    imageBlend: 'normal',
    paperBlend: 'screen',
    paperOpacity: 0.55,
    contrastRatioFgOnBg: '16.1:1 (AAA)',
  },
} as const;

export const TYPOGRAPHY = {
  families: {
    display: {
      web: '"Geist Serif", Georgia, serif',
      ios: 'Georgia',
      android: 'serif',
    },
    sans: {
      web: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      ios: 'System',
      android: 'Roboto',
    },
    mono: {
      web: '"Geist Mono", ui-monospace, Menlo, monospace',
      ios: 'Menlo',
      android: 'monospace',
    },
  },
  /** Pesos variáveis contidos (Geist 100..900 · Geist Mono 100..900 · Geist Serif fixo em 400). */
  weights: {
    display: 400,
    light: 340,
    prose: 360,
    nav: 380,
    regular: 400,
    ui: 450,
    emphasis: 500,
    mono: 360,
    eyebrow: 400,
  },
  /** Leading unitless — espelha `--ds-lh-*` (calibração Geist × Milor). */
  leading: {
    mega: 1.01,
    display: 1.06,
    heading: 1.13,
    lead: 1.42,
    metric: 1,
    bodyLg: 1.66,
    body: 1.6,
    ui: 1.35,
    mono: 1.48,
  },
  /** Tracking em em — espelha `--ds-tracking-*`. */
  tracking: {
    mega: -0.036,
    display: -0.03,
    heading: -0.022,
    lead: -0.014,
    metric: -0.028,
    body: -0.003,
    nav: 0.022,
    ui: 0.006,
    normal: 0,
    mono: 0.015,
    eyebrow: 0.07,
  },
  scale: {
    mega: { fontSize: 76, lineHeight: 76.8, letterSpacing: -2.74, fontWeight: '400' as const, voice: 'display' as const },
    h1: { fontSize: 52, lineHeight: 55.1, letterSpacing: -1.56, fontWeight: '400' as const, voice: 'display' as const },
    h2: { fontSize: 38, lineHeight: 42.9, letterSpacing: -0.84, fontWeight: '400' as const, voice: 'display' as const },
    h3: { fontSize: 25, lineHeight: 28.3, letterSpacing: -0.55, fontWeight: '400' as const, voice: 'display' as const },
    h4: { fontSize: 20, lineHeight: 23.2, letterSpacing: -0.36, fontWeight: '400' as const, voice: 'display' as const },
    lead: { fontSize: 22, lineHeight: 31.2, letterSpacing: -0.31, fontWeight: '400' as const, voice: 'display' as const },
    metric: { fontSize: 52, lineHeight: 52, letterSpacing: -1.46, fontWeight: '400' as const, voice: 'display' as const, tabularNums: true },
    bodyLg: { fontSize: 16.5, lineHeight: 27.4, letterSpacing: -0.05, fontWeight: '400' as const, variableWeight: 360, voice: 'sans' as const },
    bodyMd: { fontSize: 15, lineHeight: 24, letterSpacing: -0.04, fontWeight: '400' as const, variableWeight: 360, voice: 'sans' as const },
    bodySm: { fontSize: 14, lineHeight: 22.9, letterSpacing: 0.03, fontWeight: '300' as const, variableWeight: 340, voice: 'sans' as const },
    uiMd: { fontSize: 13, lineHeight: 17.6, letterSpacing: 0.08, fontWeight: '500' as const, variableWeight: 450, voice: 'sans' as const },
    monoMd: { fontSize: 13, lineHeight: 19.2, letterSpacing: 0.2, fontWeight: '400' as const, variableWeight: 360, voice: 'mono' as const, tabularNums: true },
    monoSm: { fontSize: 12, lineHeight: 17.8, letterSpacing: 0.18, fontWeight: '400' as const, variableWeight: 360, voice: 'mono' as const, tabularNums: true },
    monoXs: { fontSize: 10.5, lineHeight: 15.5, letterSpacing: 0.74, fontWeight: '400' as const, variableWeight: 400, voice: 'mono' as const, tabularNums: true },
    monoMicro: { fontSize: 10, lineHeight: 14.8, letterSpacing: 0.15, fontWeight: '400' as const, variableWeight: 360, voice: 'mono' as const, tabularNums: true },
  },
} as const;

export const SPACING = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64, 20: 80, 24: 96,
  /** Ritmo de blocos — espelha `--ds-stack-*` / `--ds-section-y` / `--ds-shell-*`. */
  stackTight: 6,
  stackSnug: 10,
  stackMd: 16,
  stackLoose: 32,
  stackXl: 48,
  sectionYMin: 56,
  sectionYMax: 104,
  shellMax: 1440,
  shellGutterMin: 20,
  shellGutterMax: 64,
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
 * MOTION TOKENS — Meridian Motion (`animate` + `animate-expo` + `motion-native`)
 * Regras absolutas:
 *  - Nunca usar `ease-in` em UI
 *  - Nunca começar entrada de `scale(0)` (mínimo `0.95`)
 *  - Ações de teclado (⌘K, atalhos, troca de abas 100×/dia) = ZERO animação
 *  - Em React Native / Expo: sempre UI thread via Reanimated 4 (nunca `PanResponder` ou `setState` por frame)
 */
export const MOTION = {
  bezier: {
    /** Ease-Out forte — entradas, dropdowns, tooltips, feedback */
    easeOut: [0.23, 1, 0.32, 1] as const,
    /** Ease-In-Out forte — movimento/morph em tela, clip-path tabs */
    easeInOut: [0.77, 0, 0.175, 1] as const,
    /** curva de sheet — drawers & bottom sheets */
    drawer: [0.32, 0.72, 0, 1] as const,
    /** Tab Indicator — deslizamento ágil de indicador */
    snappy: [0.85, 0, 0, 1] as const,
    /** editorial Meridian — placas de imagem & hover scale */
    editorial: [0.22, 1, 0.36, 1] as const,
    /** volume 3D Volume — estante de dossiês táteis */
    volume: [0.22, 0.8, 0.25, 1] as const,
  },
  duration: {
    none: 0,           // Atalhos de teclado (⌘K), troca de abas de alta frequência
    press: 120,        // :active scale(0.97) — 100–160ms
    tooltip: 140,      // Tooltips & micro-popovers — 125–200ms
    fast: 160,         // Hover / cor / rotação de ícone
    base: 220,         // Dropdowns, selects, segment controls — < 300ms
    drawer: 380,       // Drawers / sheets (exceção drawer: 200–500ms)
    toast: 400,        // Toast stack (exceção drawer)
    reveal: 560,       // Revelação editorial de placa
    volume: 800,       // Abertura de volume 3D
  },
  /** Presets de mola para Reanimated 4 / Motion (parâmetros de mola) */
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
    flickVelocityPxPerMs: 0.11, // Toast velocity dismiss threshold
    decelerationRate: 0.998,    // momentum projection constant
    rubberbandConstant: 0.55,   // edge resistance constant
  },
  /** Frequency Gate de Meridian Motion: decide se algo deve animar */
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

/** Projeção exponencial de momentum (interfaces fluidas) */
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
  // Elevação Meridian: sem sombra de drop — só modal mantém sombra estrutural
  if (level === 'flat' || level === 'raised') return { elevation: 0, shadowOpacity: 0 } as const;
  const opacity = scheme === 'dark' ? 0.55 : 0.18;
  return {
    shadowColor: '#111216',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: opacity,
    shadowRadius: 24,
    elevation: 10,
  } as const;
}

/** Ordem do espectro cromático suave (swatches / Gann / preview) */
export const SURFACE_SPECTRUM: readonly SurfaceId[] = [
  'ivory',
  'paper',
  'blush',
  'apricot',
  'butter',
  'sage',
  'mist',
  'aqua',
  'sky',
  'slate',
  'lilac',
  'terracotta',
  'ash',
  'stone',
  'clay',
  'navy',
  'mocha',
  'pine',
  'umber',
  'charcoal',
  'basalt',
  'graphite',
  'moss',
  'prune',
  'espresso',
  'obsidian',
] as const;

export type TypeRoleId = 'primary' | 'secondary' | 'tertiary';

/**
 * Tintas oferecidas às vozes primary / secondary / tertiary.
 * Papéis claros ficam de fora — falham contraste sobre o fundo.
 * `surface` e `muted` resolvem para --ds-fg* da atmosfera ativa.
 */
export const TYPE_INKS = [
  { id: 'obsidian', label: 'Obsidian Dark', hex: '#141413' },
  { id: 'basalt', label: 'Basalt Noir', hex: '#191B1D' },
  { id: 'graphite', label: 'Graphite Mute', hex: '#1E1D1B' },
  { id: 'moss', label: 'Moss Shadow', hex: '#171C19' },
  { id: 'prune', label: 'Muted Eggplant', hex: '#1B171D' },
  { id: 'espresso', label: 'Smoked Umber', hex: '#1D1815' },
  { id: 'navy', label: 'Navy Ink', hex: '#1C3142' },
  { id: 'mocha', label: 'Mocha Ink', hex: '#3A2A22' },
  { id: 'pine', label: 'Pine Ink', hex: '#1E3328' },
  { id: 'umber', label: 'Deep Ochre', hex: '#4E3E24' },
  { id: 'charcoal', label: 'Charcoal', hex: '#3E3C38' },
] as const;

/** Passos de opacidade das vozes. 1 é o sólido de hoje. */
export const TYPE_OPACITY_STEPS = [1, 0.78, 0.56] as const;

/**
 * Escalas espaciais do PaperGrain.
 * `canvasScale` menor → menos pixels esticados → grão visualmente maior.
 * Manchas (blot*) desligadas — só micro-speckle + fibras.
 */
export const GRAIN_SIZES: Record<
  GrainSizeId,
  {
    readonly id: GrainSizeId;
    readonly label: string;
    readonly canvasScale: number;
    readonly blotScale: number;
    readonly blotDensity: number;
    readonly blotAlpha: number;
    readonly fiberScale: number;
    readonly fiberDensity: number;
    readonly speckleHotspot: number;
    readonly seedSalt: number;
  }
> = {
  fine: {
    id: 'fine',
    label: 'Fino',
    canvasScale: 0.96,
    blotScale: 0,
    blotDensity: 0,
    blotAlpha: 0,
    fiberScale: 0.48,
    fiberDensity: 0.95,
    speckleHotspot: 0.32,
    seedSalt: 11,
  },
  medium: {
    id: 'medium',
    label: 'Médio',
    canvasScale: 0.84,
    blotScale: 0,
    blotDensity: 0,
    blotAlpha: 0,
    fiberScale: 0.62,
    fiberDensity: 0.78,
    speckleHotspot: 0.5,
    seedSalt: 0,
  },
  coarse: {
    id: 'coarse',
    label: 'Grosso',
    canvasScale: 0.7,
    blotScale: 0,
    blotDensity: 0,
    blotAlpha: 0,
    fiberScale: 0.78,
    fiberDensity: 0.64,
    speckleHotspot: 0.7,
    seedSalt: 29,
  },
  chunky: {
    id: 'chunky',
    label: 'Grumoso',
    canvasScale: 0.6,
    blotScale: 0,
    blotDensity: 0,
    blotAlpha: 0,
    fiberScale: 0.9,
    fiberDensity: 0.55,
    speckleHotspot: 0.85,
    seedSalt: 47,
  },
} as const;

export const GRAIN_SIZE_ORDER: readonly GrainSizeId[] = [
  'fine',
  'medium',
  'coarse',
  'chunky',
] as const;

/**
 * PaperGrain v1.4+ — canvas overlay (`#ds-paper-grain`), NUNCA data-URL em CSS var.
 * Intensidade: `data-grain` · Opacidade: `--ds-grain-opacity` · Tamanho / dust / scratch.
 */
export const PAPER_SHADER = {
  mode: 'canvas' as const,
  layerId: 'ds-paper-grain',
  layerClass: 'ds-paper-grain-layer',
  defaultSeed: 20261120,
  defaultSpeckle: 0.72,
  defaultFiber: 1,
  defaultSize: 'medium' as GrainSizeId,
  /** Opacidade independente (1 = full; intensidade continua no multiplier) */
  defaultOpacity: 1,
  opacityStorageKey: 'meridian-grain-opacity-v2',
  grainStorageKey: 'meridian-grain',
  grainSizeStorageKey: 'meridian-grain-size',
  defaultDust: false,
  defaultScratch: false,
  defaultDouble: false,
  defaultDustLevel: 0,
  defaultScratchLevel: 0,
  dustStorageKey: 'meridian-grain-dust',
  scratchStorageKey: 'meridian-grain-scratch',
  dustLevelStorageKey: 'meridian-grain-dust-level',
  scratchLevelStorageKey: 'meridian-grain-scratch-level',
  doubleStorageKey: 'meridian-grain-double',
  resizeDebounceMs: 280,
} as const;

/**
 * Scrollbar hairline — track transparente, canvas visível.
 * Em Chromium NÃO usar `scrollbar-color`/`scrollbar-width` junto com
 * `::-webkit-scrollbar` — isso reativa a barra nativa do Windows.
 */
export const SCROLLBAR = {
  widthPx: 2,
  thumbOpacity: 0.28,
  thumbHoverOpacity: 0.42,
  track: 'transparent' as const,
  chromiumUsesWebkitOnly: true,
} as const;

/** Hamburger: 3 linhas iguais → X (`aria-expanded`) */
export const BURGER = {
  lineCount: 3,
  lineThicknessPx: 1.5,
  widthPx: 18,
  heightPx: 12,
  buttonSizePx: 40,
  morphMs: 280,
} as const;

/**
 * HalfTone Dots (Paper Shaders) — malha fina; size ≥ 0.4 derrete a imagem.
 * `u_size` = fração da caixa (0–1).
 */
export const HALFTONE = {
  size: 0.12,
  radius: 0.92,
  contrast: 0.68,
  grainMixer: 0.06,
  grainOverlay: 0.05,
  grainSize: 0.28,
  grid: 'hex' as const,
  type: 'classic' as const,
  fit: 'cover' as const,
} as const;

/** Overlay de rail/drawer — só escurece, sem backdrop-filter blur */
export const OVERLAY_DIM = {
  backdrop: 'rgba(20, 16, 12, 0.34)',
  blur: false,
} as const;

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
    '--ds-paper-blend': t.paperBlend,
    '--ds-paper-opacity': String(t.paperOpacity),
    '--ds-image-blend': t.imageBlend,
  };
}
