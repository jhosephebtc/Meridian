/**
 * MERIDIAN DESIGN SYSTEM — paper-grain.ts (v1.4.1)
 * Textura de papel algodão em overlay <canvas> (sem data-URL em CSS).
 *
 * Intensidade → CSS `--ds-grain-multiplier` / `data-grain`
 * Tamanho     → `data-grain-size` (repinta o canvas: fine…chunky)
 */

import {
  GRAIN_SIZES,
  PAPER_SHADER,
  type GrainSizeId,
} from './tokens.ts';

export interface PaperGrainOptions {
  /** Semente determinística */
  seed?: number;
  /** Intensidade do micro-grão (0..1, padrão: PAPER_SHADER.defaultSpeckle) */
  speckleStrength?: number;
  /** Densidade relativa de microfibras (padrão: PAPER_SHADER.defaultFiber) */
  fiberDensity?: number;
  /** Escala espacial do grão (fine | medium | coarse | chunky) */
  size?: GrainSizeId;
}

export interface PaperGrainHandle {
  dispose: () => void;
  repaint: () => void;
  setSize: (size: GrainSizeId) => void;
  setOptions: (partial: Partial<PaperGrainOptions>) => void;
  getSize: () => GrainSizeId;
}

/** PRNG determinístico rápido (Mulberry32) */
function createRng(seed: number) {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ensureLayer(): HTMLCanvasElement {
  let canvas = document.getElementById('ds-paper-grain') as HTMLCanvasElement | null;
  if (canvas) return canvas;

  canvas = document.createElement('canvas');
  canvas.id = 'ds-paper-grain';
  canvas.className = 'ds-paper-grain-layer';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  return canvas;
}

function resolveSize(id: string | undefined): GrainSizeId {
  if (id && id in GRAIN_SIZES) return id as GrainSizeId;
  return PAPER_SHADER.defaultSize;
}

function paintGrain(
  canvas: HTMLCanvasElement,
  seed: number,
  speckleStrength: number,
  fiberDensity: number,
  sizeId: GrainSizeId,
): void {
  const size = GRAIN_SIZES[sizeId];
  const cssW = Math.max(1, window.innerWidth || 1280);
  const cssH = Math.max(1, window.innerHeight || 800);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  // canvasScale menor → menos pixels esticados → grão visualmente maior
  const scale = size.canvasScale * dpr;
  const w = Math.max(240, Math.round(cssW * scale));
  const h = Math.max(240, Math.round(cssH * scale));

  canvas.width = w;
  canvas.height = h;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.dataset.grainSize = sizeId;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  ctx.clearRect(0, 0, w, h);
  // imageSmoothingEnabled false reforça o “pixel grain” em sizes grossos
  ctx.imageSmoothingEnabled = sizeId === 'fine' || sizeId === 'medium';

  const rng = createRng(seed + size.seedSalt);
  const img = ctx.createImageData(w, h);
  const data = img.data;

  const inkR = 28;
  const inkG = 24;
  const inkB = 18;
  const strength = Math.max(0.15, Math.min(1.2, speckleStrength));
  const speckChance = 0.984 - size.speckleHotspot * 0.008;
  const hotChance = 0.996 - size.speckleHotspot * 0.004;

  for (let i = 0; i < data.length; i += 4) {
    const tri = (rng() + rng()) * 0.5;
    let a = tri * 42 * strength;
    if (rng() > speckChance) a += 28 * strength;
    if (rng() > hotChance) a += 18;
    a = Math.min(72, Math.round(a));
    data[i] = inkR;
    data[i + 1] = inkG;
    data[i + 2] = inkB;
    data[i + 3] = a;
  }
  ctx.putImageData(img, 0, 0);

  const blotCount = Math.round((70 + (w * h) / 32000) * size.blotDensity);
  for (let i = 0; i < blotCount; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const r = (3 + rng() * 12) * size.blotScale;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    const alpha = (0.02 + rng() * 0.035) * size.blotAlpha;
    grad.addColorStop(0, `rgba(24, 22, 18, ${alpha.toFixed(4)})`);
    grad.addColorStop(1, 'rgba(24, 22, 18, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.lineCap = 'round';
  const fiberCount = Math.round(((w * h) / 2800) * fiberDensity * size.fiberDensity);
  for (let i = 0; i < fiberCount; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const len = (3 + rng() * 11) * size.fiberScale;
    const angle = rng() * Math.PI * 2;
    const bend = (rng() - 0.5) * 2.5 * size.fiberScale;
    const ex = x + Math.cos(angle) * len;
    const ey = y + Math.sin(angle) * len;
    const cx = (x + ex) * 0.5 - Math.sin(angle) * bend;
    const cy = (y + ey) * 0.5 + Math.cos(angle) * bend;
    ctx.strokeStyle = `rgba(23, 22, 20, ${(0.04 + rng() * 0.07).toFixed(4)})`;
    ctx.lineWidth = (0.4 + rng() * 0.55) * Math.max(0.7, size.fiberScale * 0.85);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(cx, cy, ex, ey);
    ctx.stroke();
  }
}

let activeHandle: PaperGrainHandle | null = null;

/**
 * Monta (ou remonta) a textura de papel. Repaints ao mudar `data-grain-size`.
 */
export function mountPaperGrain(options: PaperGrainOptions = {}): PaperGrainHandle {
  if (typeof document === 'undefined') {
    return {
      dispose: () => {},
      repaint: () => {},
      setSize: () => {},
      setOptions: () => {},
      getSize: () => PAPER_SHADER.defaultSize,
    };
  }

  activeHandle?.dispose();

  const state: Required<Pick<PaperGrainOptions, 'seed' | 'speckleStrength' | 'fiberDensity' | 'size'>> = {
    seed: options.seed ?? PAPER_SHADER.defaultSeed,
    speckleStrength: options.speckleStrength ?? PAPER_SHADER.defaultSpeckle,
    fiberDensity: options.fiberDensity ?? PAPER_SHADER.defaultFiber,
    size: options.size ?? resolveSize(document.documentElement.dataset.grainSize),
  };

  const root = document.documentElement;
  root.dataset.paperShader = 'canvas';
  root.dataset.grainSize = state.size;
  root.style.setProperty('--ds-paper-texture', 'none');
  document.getElementById('ds-paper-shader-root')?.remove();

  const canvas = ensureLayer();

  const apply = () => {
    const size = resolveSize(root.dataset.grainSize || state.size);
    state.size = size;
    root.dataset.grainSize = size;
    paintGrain(canvas, state.seed, state.speckleStrength, state.fiberDensity, size);
  };

  apply();

  let resizeTimer = 0;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(apply, PAPER_SHADER.resizeDebounceMs);
  };
  window.addEventListener('resize', onResize, { passive: true });

  const handle: PaperGrainHandle = {
    dispose: () => {
      window.removeEventListener('resize', onResize);
      window.clearTimeout(resizeTimer);
      canvas.remove();
      delete root.dataset.paperShader;
      root.style.removeProperty('--ds-paper-texture');
      if (activeHandle === handle) activeHandle = null;
    },
    repaint: apply,
    setSize: (size: GrainSizeId) => {
      state.size = size;
      root.dataset.grainSize = size;
      apply();
    },
    setOptions: (partial) => {
      if (partial.seed != null) state.seed = partial.seed;
      if (partial.speckleStrength != null) state.speckleStrength = partial.speckleStrength;
      if (partial.fiberDensity != null) state.fiberDensity = partial.fiberDensity;
      if (partial.size != null) {
        state.size = partial.size;
        root.dataset.grainSize = partial.size;
      }
      apply();
    },
    getSize: () => state.size,
  };

  activeHandle = handle;
  return handle;
}

/** Repinta o overlay ativo (ex.: após mudar data-grain-size na UI). */
export function repaintPaperGrain(): void {
  activeHandle?.repaint();
}

export function setPaperGrainSize(size: GrainSizeId): void {
  if (activeHandle) activeHandle.setSize(size);
  else {
    document.documentElement.dataset.grainSize = size;
    mountPaperGrain({ size });
  }
}

export function getPaperGrainHandle(): PaperGrainHandle | null {
  return activeHandle;
}
