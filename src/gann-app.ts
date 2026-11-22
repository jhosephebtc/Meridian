/**
 * MERIDIAN — WD Gann History Page
 * HalfTone (Paper Shaders) · Plotter D2 animations · Dual layout chrome
 */
import './site-chrome';
import { mountHairlineFigure } from './hairline-figure';
import {
  ShaderMount,
  halftoneDotsFragmentShader,
  HalftoneDotsTypes,
  HalftoneDotsGrids,
  ShaderFitOptions,
  getShaderColorFromString,
} from '@paper-design/shaders';
import { HALFTONE, PAPER_SHADER } from './tokens';
import { mountPaperGrain, bootPaperGrainExtras } from './paper-grain';
import { markPageReady } from './page-enter';
import { initI18n } from './i18n';
import './i18n.css';

type LayoutMode = 'masthead' | 'rail';

const NAV = [
  { id: 'origem', label: 'Origem' },
  { id: 'wall-street', label: 'Wall Street' },
  { id: 'geometria', label: 'Geometria' },
  { id: 'obras', label: 'Obras' },
  { id: 'legado', label: 'Legado' },
] as const;

function cssVar(name: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
    img.src = src;
  });
}

async function mountHalftone(
  el: HTMLElement,
  imageSrc: string,
  opts: {
    type?: keyof typeof HalftoneDotsTypes;
    size?: number;
    radius?: number;
    contrast?: number;
    grainMixer?: number;
    grainOverlay?: number;
  } = {},
): Promise<ShaderMount | null> {
  try {
    const img = await loadImage(imageSrc);
    const colorBack = getShaderColorFromString(cssVar('--ds-bg', '#EDBB99'));
    const colorFront = getShaderColorFromString(cssVar('--ds-fg', '#171614'));

    // Malha fina: u_size é fração da caixa — 0.4+ deixa 2–3 células e “derrete” a imagem.
    el.replaceChildren();
    const mount = new ShaderMount(
      el,
      halftoneDotsFragmentShader,
      {
        u_image: img,
        u_imageAspectRatio: img.naturalWidth / Math.max(1, img.naturalHeight),
        u_colorBack: colorBack,
        u_colorFront: colorFront,
        u_originalColors: false,
        u_type: HalftoneDotsTypes[opts.type ?? HALFTONE.type],
        u_inverted: false,
        u_grid: HalftoneDotsGrids[HALFTONE.grid],
        u_size: opts.size ?? HALFTONE.size,
        u_radius: opts.radius ?? HALFTONE.radius,
        u_contrast: opts.contrast ?? HALFTONE.contrast,
        u_grainMixer: opts.grainMixer ?? HALFTONE.grainMixer,
        u_grainOverlay: opts.grainOverlay ?? HALFTONE.grainOverlay,
        u_grainSize: HALFTONE.grainSize,
        u_fit: ShaderFitOptions[HALFTONE.fit],
        u_scale: 1,
        u_rotation: 0,
        u_originX: 0.5,
        u_originY: 0.5,
        u_offsetX: 0,
        u_offsetY: 0,
        u_worldWidth: 0,
        u_worldHeight: 0,
      },
      undefined,
      0,
    );
    return mount;
  } catch (err) {
    console.warn(err);
    el.innerHTML = `<img src="${imageSrc}" alt="" style="width:100%;height:100%;object-fit:cover;opacity:.85;filter:grayscale(.35) contrast(1.05);" />`;
    return null;
  }
}

/** Fan de ângulos Gann (1×1, 1×2, 1×3, 1×4, 1×8) — plotter D2 animado */
function renderGannFan(host: HTMLElement): void {
  const W = 560;
  const H = 360;
  const ox = 48;
  const oy = H - 40;
  const span = 440;
  const angles = [
    { n: '1×1', deg: 45, role: 'primary' },
    { n: '1×2', deg: 26.25, role: 'secondary' },
    { n: '1×3', deg: 18.75, role: 'secondary' },
    { n: '1×4', deg: 15, role: 'guide' },
    { n: '1×8', deg: 7.5, role: 'guide' },
    { n: '2×1', deg: 63.75, role: 'secondary' },
    { n: '3×1', deg: 71.25, role: 'guide' },
    { n: '4×1', deg: 75, role: 'guide' },
  ] as const;

  const rays = angles
    .map((a, i) => {
      const rad = (a.deg * Math.PI) / 180;
      const x2 = ox + Math.cos(rad) * span;
      const y2 = oy - Math.sin(rad) * span;
      const lx = ox + Math.cos(rad) * (span * 0.78);
      const ly = oy - Math.sin(rad) * (span * 0.78);
      return `
        <line class="gann-plot-draw" style="animation-delay:${i * 90}ms"
          x1="${ox}" y1="${oy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"
          data-plotter-role="${a.role}" fill="none"/>
        <text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" stroke="none" fill="currentColor"
          fill-opacity="0.55" font-size="10" font-family="Geist Mono, ui-monospace, monospace"
          data-plotter-role="leader">${a.n}</text>`;
    })
    .join('');

  host.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" data-plotter="true" fill="none"
      aria-label="Fan de ângulos Gann plotado em 2D">
      <rect x="24" y="24" width="${W - 48}" height="${H - 48}" data-plotter-role="guide" rx="0"/>
      <line x1="${ox}" y1="${oy}" x2="${ox + span}" y2="${oy}" data-plotter-role="centerline"/>
      <line x1="${ox}" y1="${oy}" x2="${ox}" y2="${oy - span * 0.85}" data-plotter-role="centerline"/>
      ${rays}
      <circle cx="${ox}" cy="${oy}" r="4" fill="currentColor" stroke="none" data-plotter-role="primary"/>
      <text x="36" y="44" stroke="none" fill="currentColor" fill-opacity="0.7" font-size="12"
        font-family="Geist Serif, Georgia, serif" data-plotter-role="leader">Gann Fan · ângulos de tempo × preço</text>
    </svg>
    <div class="gann-plot-badge">plotter D2 · stroke 1u</div>`;
}

/** Square of Nine — espiral numérica animada */
function renderSquareOfNine(host: HTMLElement): void {
  const W = 560;
  const H = 420;
  const cx = W / 2;
  const cy = H / 2 + 8;
  const cell = 28;
  const maxRing = 5;

  // Coordenadas estilo Square of 9 (espiral a partir do centro = 1)
  const cells: { n: number; x: number; y: number }[] = [{ n: 1, x: 0, y: 0 }];
  let n = 2;
  for (let ring = 1; ring <= maxRing; ring++) {
    let x = ring;
    let y = 1 - ring;
    // right side down
    for (let i = 0; i < ring * 2; i++) {
      cells.push({ n: n++, x, y });
      y++;
    }
    // bottom left
    for (let i = 0; i < ring * 2; i++) {
      x--;
      cells.push({ n: n++, x, y });
    }
    // left up
    for (let i = 0; i < ring * 2; i++) {
      y--;
      cells.push({ n: n++, x, y });
    }
    // top right
    for (let i = 0; i < ring * 2; i++) {
      x++;
      cells.push({ n: n++, x, y });
    }
  }

  const squares = cells
    .map((c, i) => {
      const px = cx + c.x * cell - cell / 2;
      const py = cy + c.y * cell - cell / 2;
      const highlight = [1, 9, 25, 49, 81].includes(c.n);
      return `
        <rect class="gann-plot-draw" style="animation-delay:${Math.min(i, 40) * 28}ms"
          x="${px}" y="${py}" width="${cell - 2}" height="${cell - 2}"
          data-plotter-role="${highlight ? 'primary' : 'secondary'}" fill="none"/>
        <text x="${px + cell / 2 - 1}" y="${py + cell / 2 + 3.5}" text-anchor="middle"
          stroke="none" fill="currentColor" fill-opacity="${highlight ? 0.85 : 0.45}"
          font-size="9" font-family="Geist Mono, ui-monospace, monospace" data-plotter-role="leader">${c.n}</text>`;
    })
    .join('');

  const cardinals = [0, 90, 180, 270]
    .map(
      (deg) => `
      <line x1="${cx}" y1="${cy}" 
        x2="${(cx + Math.cos((deg * Math.PI) / 180) * cell * (maxRing + 0.8)).toFixed(1)}"
        y2="${(cy + Math.sin((deg * Math.PI) / 180) * cell * (maxRing + 0.8)).toFixed(1)}"
        data-plotter-role="centerline"/>`,
    )
    .join('');

  host.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" data-plotter="true" fill="none"
      aria-label="Square of Nine de W.D. Gann">
      <g class="gann-rotate-slow" style="transform-origin:${cx}px ${cy}px">
        <circle cx="${cx}" cy="${cy}" r="${cell * (maxRing + 0.65)}" data-plotter-role="proposed"
          stroke-dasharray="3 5" fill="none"/>
      </g>
      ${cardinals}
      ${squares}
      <text x="28" y="36" stroke="none" fill="currentColor" fill-opacity="0.7" font-size="12"
        font-family="Geist Serif, Georgia, serif" data-plotter-role="leader">Square of Nine · quadrados cardinais</text>
    </svg>
    <div class="gann-plot-badge">plotter D2 · espiral 1→121</div>`;
}

function setLayout(mode: LayoutMode): void {
  document.documentElement.dataset.layout = mode;
  localStorage.setItem('meridian-gann-layout', mode);
  document.querySelectorAll<HTMLButtonElement>('[data-layout-pick]').forEach((btn) => {
    btn.dataset.active = btn.dataset.layoutPick === mode ? 'true' : 'false';
  });
  if (mode === 'masthead') setRail(false);
}

function setRail(open: boolean): void {
  const rail = document.getElementById('gann-rail');
  const backdrop = document.getElementById('gann-rail-backdrop');
  const burger = document.getElementById('gann-burger');
  if (!rail || !backdrop || !burger) return;
  rail.dataset.open = open ? 'true' : 'false';
  backdrop.dataset.open = open ? 'true' : 'false';
  burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  document.body.style.overflow = open ? 'hidden' : '';
}

function syncCurrentNav(): void {
  const sections = NAV.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
  const y = window.scrollY + 96;
  let current: (typeof NAV)[number]['id'] = NAV[0].id;
  for (const sec of sections) {
    const match = NAV.find((n) => n.id === sec.id);
    if (match && sec.offsetTop <= y) current = match.id;
  }
  document.querySelectorAll<HTMLAnchorElement>('[data-nav]').forEach((a) => {
    if (a.getAttribute('href') === `#${current}`) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
}

type ChromaId =
  | 'terracotta'
  | 'blush'
  | 'butter'
  | 'mist'
  | 'aqua'
  | 'lilac'
  | 'ivory'
  | 'obsidian';

const HALFTONE_MOUNTS: {
  id: string;
  src: string;
  opts: {
    type?: keyof typeof HalftoneDotsTypes;
    size?: number;
    radius?: number;
    contrast?: number;
    grainMixer?: number;
    grainOverlay?: number;
  };
}[] = [
  {
    id: 'ht-tunnel',
    src: './gann/tunnel-cover.jpg',
    opts: { type: 'soft', size: 0.11, radius: 0.88, contrast: 0.72, grainMixer: 0.05, grainOverlay: 0.04 },
  },
  {
    id: 'ht-hexagon',
    src: './gann/hexagon-chart.jpg',
    opts: { type: 'classic', size: 0.13, radius: 0.9, contrast: 0.7, grainMixer: 0.04, grainOverlay: 0.04 },
  },
]

const shaderMounts = new Map<string, ShaderMount>();

async function remountHalftones(): Promise<void> {
  for (const spec of HALFTONE_MOUNTS) {
    const el = document.getElementById(spec.id);
    if (!el) continue;
    const prev = shaderMounts.get(spec.id);
    prev?.dispose?.();
    shaderMounts.delete(spec.id);
    const mount = await mountHalftone(el, spec.src, spec.opts);
    if (mount) shaderMounts.set(spec.id, mount);
  }
}

function setChroma(id: ChromaId): void {
  document.documentElement.dataset.surface = id;
  localStorage.setItem('meridian-gann-chroma', id);
  document.querySelectorAll<HTMLButtonElement>('[data-chroma]').forEach((btn) => {
    btn.setAttribute('aria-pressed', btn.dataset.chroma === id ? 'true' : 'false');
  });
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', cssVar('--ds-bg', '#EDBB99'));
  void remountHalftones();
}

function init(): void {
  initI18n();
  mountPaperGrain({
    seed: 18780606,
    speckleStrength: PAPER_SHADER.defaultSpeckle,
    fiberDensity: PAPER_SHADER.defaultFiber,
    size: PAPER_SHADER.defaultSize,
  });
  bootPaperGrainExtras();
  const saved = (localStorage.getItem('meridian-gann-layout') as LayoutMode | null) ?? 'masthead';
  setLayout(saved === 'rail' ? 'rail' : 'masthead');

  const savedChroma = (localStorage.getItem('meridian-gann-chroma') as ChromaId | null) ?? 'terracotta';
  document.documentElement.dataset.surface = savedChroma;
  document.querySelectorAll<HTMLButtonElement>('[data-chroma]').forEach((btn) => {
    btn.setAttribute('aria-pressed', btn.dataset.chroma === savedChroma ? 'true' : 'false');
    btn.addEventListener('click', () => setChroma(btn.dataset.chroma as ChromaId));
  });

  document.querySelectorAll<HTMLButtonElement>('[data-layout-pick]').forEach((btn) => {
    btn.addEventListener('click', () => setLayout(btn.dataset.layoutPick as LayoutMode));
  });

  document.getElementById('gann-burger')?.addEventListener('click', () => {
    const rail = document.getElementById('gann-rail');
    setRail(rail?.dataset.open !== 'true');
  });
  document.getElementById('gann-rail-close')?.addEventListener('click', () => setRail(false));
  document.getElementById('gann-rail-backdrop')?.addEventListener('click', () => setRail(false));

  document.querySelectorAll<HTMLAnchorElement>('[data-nav]').forEach((a) => {
    a.addEventListener('click', () => setRail(false));
  });

  window.addEventListener('scroll', syncCurrentNav, { passive: true });
  syncCurrentNav();

  const fan = document.getElementById('gann-fan-stage');
  const square = document.getElementById('gann-square-stage');
  if (fan) renderGannFan(fan);
  if (square) renderSquareOfNine(square);
  mountHairlineFigure(
    document.getElementById('aside-hairline-octaves') as SVGSVGElement | null,
    document.getElementById('aside-hairline-readout'),
    'octaves',
  );

  void remountHalftones();
  markPageReady();
}

init();
