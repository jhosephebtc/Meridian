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
  | 'lilac';
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
    rule: 'rgba(20, 20, 19, 0.10)',
    ruleStrong: 'rgba(20, 20, 19, 0.16)',
    border: 'rgba(20, 20, 19, 0.10)',
    borderStrong: 'rgba(20, 20, 19, 0.18)',
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
    rule: 'rgba(10, 10, 10, 0.10)',
    ruleStrong: 'rgba(10, 10, 10, 0.16)',
    border: 'rgba(10, 10, 10, 0.10)',
    borderStrong: 'rgba(10, 10, 10, 0.18)',
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
    rule: 'rgba(23, 22, 20, 0.10)',
    ruleStrong: 'rgba(23, 22, 20, 0.16)',
    border: 'rgba(23, 22, 20, 0.10)',
    borderStrong: 'rgba(23, 22, 20, 0.18)',
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
    rule: 'rgba(23, 22, 20, 0.10)',
    ruleStrong: 'rgba(23, 22, 20, 0.16)',
    border: 'rgba(23, 22, 20, 0.10)',
    borderStrong: 'rgba(23, 22, 20, 0.18)',
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
    rule: 'rgba(250, 249, 245, 0.10)',
    ruleStrong: 'rgba(250, 249, 245, 0.16)',
    border: 'rgba(250, 249, 245, 0.10)',
    borderStrong: 'rgba(250, 249, 245, 0.18)',
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
    rule: 'rgba(26, 20, 20, 0.10)',
    ruleStrong: 'rgba(26, 20, 20, 0.16)',
    border: 'rgba(26, 20, 20, 0.10)',
    borderStrong: 'rgba(26, 20, 20, 0.18)',
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
    rule: 'rgba(26, 24, 16, 0.10)',
    ruleStrong: 'rgba(26, 24, 16, 0.16)',
    border: 'rgba(26, 24, 16, 0.10)',
    borderStrong: 'rgba(26, 24, 16, 0.18)',
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
    rule: 'rgba(20, 24, 22, 0.10)',
    ruleStrong: 'rgba(20, 24, 22, 0.16)',
    border: 'rgba(20, 24, 22, 0.10)',
    borderStrong: 'rgba(20, 24, 22, 0.18)',
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
    rule: 'rgba(22, 20, 26, 0.10)',
    ruleStrong: 'rgba(22, 20, 26, 0.16)',
    border: 'rgba(22, 20, 26, 0.10)',
    borderStrong: 'rgba(22, 20, 26, 0.18)',
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
    rule: 'rgba(26, 22, 18, 0.10)',
    ruleStrong: 'rgba(26, 22, 18, 0.16)',
    border: 'rgba(26, 22, 18, 0.10)',
    borderStrong: 'rgba(26, 22, 18, 0.18)',
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
    rule: 'rgba(20, 24, 18, 0.10)',
    ruleStrong: 'rgba(20, 24, 18, 0.16)',
    border: 'rgba(20, 24, 18, 0.10)',
    borderStrong: 'rgba(20, 24, 18, 0.18)',
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
    rule: 'rgba(18, 22, 26, 0.10)',
    ruleStrong: 'rgba(18, 22, 26, 0.16)',
    border: 'rgba(18, 22, 26, 0.10)',
    borderStrong: 'rgba(18, 22, 26, 0.18)',
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
    rule: 'rgba(20, 22, 24, 0.10)',
    ruleStrong: 'rgba(20, 22, 24, 0.16)',
    border: 'rgba(20, 22, 24, 0.10)',
    borderStrong: 'rgba(20, 22, 24, 0.18)',
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
  /** Leading unitless — espelha `--ds-lh-*` (calibração Geist). */
  leading: {
    mega: 0.96,
    display: 1.08,
    heading: 1.2,
    lead: 1.34,
    metric: 1,
    bodyLg: 1.58,
    body: 1.5,
    ui: 1.35,
    mono: 1.45,
  },
  /** Tracking em em — espelha `--ds-tracking-*`. */
  tracking: {
    mega: -0.03,
    display: -0.022,
    heading: -0.014,
    lead: -0.011,
    metric: -0.028,
    body: -0.006,
    ui: -0.01,
    normal: 0,
    mono: 0.01,
    eyebrow: 0.06,
  },
  scale: {
    mega: { fontSize: 72, lineHeight: 69, letterSpacing: -2.16, fontWeight: '400' as const, voice: 'display' as const },
    h1: { fontSize: 44, lineHeight: 47.5, letterSpacing: -0.97, fontWeight: '400' as const, voice: 'display' as const },
    h2: { fontSize: 32, lineHeight: 38.4, letterSpacing: -0.45, fontWeight: '400' as const, voice: 'display' as const },
    h3: { fontSize: 24, lineHeight: 28.8, letterSpacing: -0.34, fontWeight: '400' as const, voice: 'display' as const },
    h4: { fontSize: 20, lineHeight: 24, letterSpacing: -0.28, fontWeight: '400' as const, voice: 'display' as const },
    lead: { fontSize: 22, lineHeight: 29.5, letterSpacing: -0.24, fontWeight: '400' as const, voice: 'display' as const },
    metric: { fontSize: 52, lineHeight: 52, letterSpacing: -1.46, fontWeight: '400' as const, voice: 'display' as const, tabularNums: true },
    bodyLg: { fontSize: 17, lineHeight: 26.9, letterSpacing: -0.1, fontWeight: '400' as const, voice: 'sans' as const },
    bodyMd: { fontSize: 15, lineHeight: 22.5, letterSpacing: -0.09, fontWeight: '400' as const, voice: 'sans' as const },
    bodySm: { fontSize: 13.5, lineHeight: 20.25, letterSpacing: -0.08, fontWeight: '400' as const, voice: 'sans' as const },
    uiMd: { fontSize: 13, lineHeight: 17.6, letterSpacing: -0.13, fontWeight: '500' as const, voice: 'sans' as const },
    monoMd: { fontSize: 13, lineHeight: 18.85, letterSpacing: 0.13, fontWeight: '400' as const, voice: 'mono' as const, tabularNums: true },
    monoSm: { fontSize: 12, lineHeight: 17.4, letterSpacing: 0.12, fontWeight: '400' as const, voice: 'mono' as const, tabularNums: true },
    monoXs: { fontSize: 11, lineHeight: 16, letterSpacing: 0.66, fontWeight: '500' as const, voice: 'mono' as const, tabularNums: true },
    monoMicro: { fontSize: 10, lineHeight: 14.5, letterSpacing: 0.1, fontWeight: '400' as const, voice: 'mono' as const, tabularNums: true },
  },
} as const;

export const SPACING = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64, 20: 80, 24: 96,
  /** Ritmo de blocos — espelha `--ds-stack-*` / `--ds-section-y`. */
  stackTight: 6,
  stackSnug: 10,
  stackMd: 16,
  stackLoose: 28,
  stackXl: 40,
  sectionYMin: 56,
  sectionYMax: 96,
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
  'obsidian',
] as const;

/**
 * Escalas espaciais do PaperGrain.
 * `canvasScale` menor → menos pixels esticados → grão visualmente maior.
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
    canvasScale: 0.78,
    blotScale: 0.55,
    blotDensity: 1.15,
    blotAlpha: 0.85,
    fiberScale: 0.65,
    fiberDensity: 1.2,
    speckleHotspot: 0.6,
    seedSalt: 11,
  },
  medium: {
    id: 'medium',
    label: 'Médio',
    canvasScale: 0.55,
    blotScale: 1,
    blotDensity: 1,
    blotAlpha: 1,
    fiberScale: 1,
    fiberDensity: 1,
    speckleHotspot: 1,
    seedSalt: 0,
  },
  coarse: {
    id: 'coarse',
    label: 'Grosso',
    canvasScale: 0.34,
    blotScale: 1.85,
    blotDensity: 0.85,
    blotAlpha: 1.1,
    fiberScale: 1.45,
    fiberDensity: 0.9,
    speckleHotspot: 1.35,
    seedSalt: 29,
  },
  chunky: {
    id: 'chunky',
    label: 'Grumoso',
    canvasScale: 0.22,
    blotScale: 3.1,
    blotDensity: 0.7,
    blotAlpha: 1.2,
    fiberScale: 2.1,
    fiberDensity: 0.75,
    speckleHotspot: 1.7,
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
 * Intensidade: `data-grain` → opacity. Tamanho: `data-grain-size` → repaint.
 */
export const PAPER_SHADER = {
  mode: 'canvas' as const,
  layerId: 'ds-paper-grain',
  layerClass: 'ds-paper-grain-layer',
  defaultSeed: 20261120,
  defaultSpeckle: 0.58,
  defaultFiber: 1.05,
  defaultSize: 'medium' as GrainSizeId,
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
