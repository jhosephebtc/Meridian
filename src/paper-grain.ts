/**
 * MERIDIAN DESIGN SYSTEM — paper-grain.ts (v1.4.1)
 * Textura de papel algodão em overlay <canvas> (sem data-URL em CSS).
 *
 * Intensidade → CSS `--ds-grain-multiplier` / `data-grain`
 * Opacidade   → CSS `--ds-grain-opacity` (independente)
 * Tamanho     → `data-grain-size` (repinta: fine…chunky)
 * Dust / Scratch / Duplo → `data-grain-dust` / `scratch` / `double` (repinta)
 */

import {
  GRAIN_SIZES,
  PAPER_SHADER,
  type GrainSizeId,
} from './tokens.ts';

export interface PaperGrainOptions {
  seed?: number;
  speckleStrength?: number;
  fiberDensity?: number;
  size?: GrainSizeId;
  dust?: boolean;
  scratch?: boolean;
  double?: boolean;
}

export interface PaperGrainHandle {
  dispose: () => void;
  repaint: () => void;
  setSize: (size: GrainSizeId) => void;
  setOptions: (partial: Partial<PaperGrainOptions>) => void;
  getSize: () => GrainSizeId;
}

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

function isOn(flag: string | undefined, fallback = false): boolean {
  if (flag == null || flag === '') return fallback;
  return flag === 'on' || flag === 'true' || flag === '1';
}

function paintDust(
  ctx: CanvasRenderingContext2D,
  rng: () => number,
  w: number,
  h: number,
  sizeScale: number,
): void {
  const count = Math.round((28 + (w * h) / 22000) * sizeScale);
  for (let i = 0; i < count; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const r = (0.6 + rng() * 2.4) * sizeScale;
    const alpha = 0.045 + rng() * 0.09;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(22, 20, 16, ${alpha.toFixed(4)})`);
    g.addColorStop(1, 'rgba(22, 20, 16, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function paintScratches(
  ctx: CanvasRenderingContext2D,
  rng: () => number,
  w: number,
  h: number,
  sizeScale: number,
): void {
  const count = Math.round(6 + (w * h) / 70000);
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const len = (18 + rng() * 90) * sizeScale;
    // Prefer near-vertical / near-horizontal film scratches
    const base = rng() > 0.55 ? Math.PI / 2 : 0;
    const ang = base + (rng() - 0.5) * 0.35;
    const ex = x + Math.cos(ang) * len;
    const ey = y + Math.sin(ang) * len;
    ctx.strokeStyle = `rgba(18, 16, 12, ${(0.04 + rng() * 0.08).toFixed(4)})`;
    ctx.lineWidth = (0.35 + rng() * 0.7) * Math.max(0.7, sizeScale * 0.85);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    // Occasional twin hairline
    if (rng() > 0.72) {
      const ox = (rng() - 0.5) * 2.2;
      const oy = (rng() - 0.5) * 2.2;
      ctx.strokeStyle = `rgba(18, 16, 12, ${(0.02 + rng() * 0.04).toFixed(4)})`;
      ctx.lineWidth = 0.3 * sizeScale;
      ctx.beginPath();
      ctx.moveTo(x + ox, y + oy);
      ctx.lineTo(ex + ox, ey + oy);
      ctx.stroke();
    }
  }
}

/** Segunda frequência de grão — micro-speckle + blocos suaves sobrepostos. */
function paintDoubleGrain(
  ctx: CanvasRenderingContext2D,
  rng: () => number,
  w: number,
  h: number,
  strength: number,
  sizeScale: number,
): void {
  // Camada grossa (baixa frequência)
  const coarse = Math.round((w * h) / 14000);
  for (let i = 0; i < coarse; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const r = (1.8 + rng() * 4.5) * sizeScale;
    const alpha = (0.03 + rng() * 0.055) * strength;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(26, 23, 18, ${alpha.toFixed(4)})`);
    g.addColorStop(1, 'rgba(26, 23, 18, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Camada fina (alta frequência) — pontilhados curtos
  const fine = Math.round((w * h) / 900);
  ctx.fillStyle = 'rgba(24, 22, 18, 1)';
  for (let i = 0; i < fine; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const a = Math.round((10 + rng() * 22) * strength);
    ctx.globalAlpha = Math.min(0.28, a / 255);
    ctx.fillRect(x, y, 1, 1);
  }
  ctx.globalAlpha = 1;
}

function paintGrain(
  canvas: HTMLCanvasElement,
  seed: number,
  speckleStrength: number,
  fiberDensity: number,
  sizeId: GrainSizeId,
  dust: boolean,
  scratch: boolean,
  double: boolean,
): void {
  const size = GRAIN_SIZES[sizeId];
  const cssW = Math.max(1, window.innerWidth || 1280);
  const cssH = Math.max(1, window.innerHeight || 800);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
  ctx.imageSmoothingEnabled = true;

  const rng = createRng(seed + size.seedSalt);
  const img = ctx.createImageData(w, h);
  const data = img.data;

  const inkR = 28;
  const inkG = 24;
  const inkB = 18;
  const strength = Math.max(0.22, Math.min(1.05, speckleStrength));
  const speckChance = 0.983 - size.speckleHotspot * 0.006;
  const hotChance = 0.994 - size.speckleHotspot * 0.004;

  for (let i = 0; i < data.length; i += 4) {
    const tri = (rng() + rng() + rng()) / 3;
    let a = tri * 46 * strength;
    if (rng() > speckChance) a += 22 * strength;
    if (rng() > hotChance) a += 12;
    a = Math.min(68, Math.round(a));
    data[i] = inkR;
    data[i + 1] = inkG;
    data[i + 2] = inkB;
    data[i + 3] = a;
  }
  ctx.putImageData(img, 0, 0);

  ctx.lineCap = 'round';
  const fiberCount = Math.round(((w * h) / 3800) * fiberDensity * size.fiberDensity);
  for (let i = 0; i < fiberCount; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const len = (1.8 + rng() * 6) * size.fiberScale;
    const angle = rng() * Math.PI * 2;
    const bend = (rng() - 0.5) * 1.25 * size.fiberScale;
    const ex = x + Math.cos(angle) * len;
    const ey = y + Math.sin(angle) * len;
    const cx = (x + ex) * 0.5 - Math.sin(angle) * bend;
    const cy = (y + ey) * 0.5 + Math.cos(angle) * bend;
    ctx.strokeStyle = `rgba(23, 22, 20, ${(0.035 + rng() * 0.05).toFixed(4)})`;
    ctx.lineWidth = (0.24 + rng() * 0.32) * Math.max(0.6, size.fiberScale * 0.65);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(cx, cy, ex, ey);
    ctx.stroke();
  }

  const sizeScale = Math.max(0.75, 1.15 - size.canvasScale * 0.35);
  if (double) paintDoubleGrain(ctx, rng, w, h, strength, sizeScale);
  if (dust) paintDust(ctx, rng, w, h, sizeScale);
  if (scratch) paintScratches(ctx, rng, w, h, sizeScale);
}

let activeHandle: PaperGrainHandle | null = null;

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

  const root = document.documentElement;
  const state = {
    seed: options.seed ?? PAPER_SHADER.defaultSeed,
    speckleStrength: options.speckleStrength ?? PAPER_SHADER.defaultSpeckle,
    fiberDensity: options.fiberDensity ?? PAPER_SHADER.defaultFiber,
    size: options.size ?? resolveSize(root.dataset.grainSize),
    dust: options.dust ?? isOn(root.dataset.grainDust, PAPER_SHADER.defaultDust),
    scratch: options.scratch ?? isOn(root.dataset.grainScratch, PAPER_SHADER.defaultScratch),
    double: options.double ?? isOn(root.dataset.grainDouble, PAPER_SHADER.defaultDouble),
  };

  root.dataset.paperShader = 'canvas';
  root.dataset.grainSize = state.size;
  root.dataset.grainDust = state.dust ? 'on' : 'off';
  root.dataset.grainScratch = state.scratch ? 'on' : 'off';
  root.dataset.grainDouble = state.double ? 'on' : 'off';
  root.style.setProperty('--ds-paper-texture', 'none');
  document.getElementById('ds-paper-shader-root')?.remove();

  const canvas = ensureLayer();

  const apply = () => {
    const size = resolveSize(root.dataset.grainSize || state.size);
    state.size = size;
    state.dust = isOn(root.dataset.grainDust, state.dust);
    state.scratch = isOn(root.dataset.grainScratch, state.scratch);
    state.double = isOn(root.dataset.grainDouble, state.double);
    root.dataset.grainSize = size;
    root.dataset.grainDust = state.dust ? 'on' : 'off';
    root.dataset.grainScratch = state.scratch ? 'on' : 'off';
    root.dataset.grainDouble = state.double ? 'on' : 'off';
    paintGrain(
      canvas,
      state.seed,
      state.speckleStrength,
      state.fiberDensity,
      size,
      state.dust,
      state.scratch,
      state.double,
    );
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
      if (partial.dust != null) {
        state.dust = partial.dust;
        root.dataset.grainDust = partial.dust ? 'on' : 'off';
      }
      if (partial.scratch != null) {
        state.scratch = partial.scratch;
        root.dataset.grainScratch = partial.scratch ? 'on' : 'off';
      }
      if (partial.double != null) {
        state.double = partial.double;
        root.dataset.grainDouble = partial.double ? 'on' : 'off';
      }
      apply();
    },
    getSize: () => state.size,
  };

  activeHandle = handle;
  return handle;
}

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

/** Opacidade do overlay (0–1). Independente da intensidade. Default 1. */
export function setPaperGrainOpacity(opacity: number): number {
  const clamped = Math.max(0.15, Math.min(1, opacity));
  const root = document.documentElement;
  root.style.setProperty('--ds-grain-opacity', String(clamped));
  root.dataset.grainOpacity = String(Math.round(clamped * 100));
  try {
    localStorage.setItem(PAPER_SHADER.opacityStorageKey, String(clamped));
  } catch {
    /* ignore */
  }
  return clamped;
}

export function getPaperGrainOpacity(): number {
  const inline = document.documentElement.style.getPropertyValue('--ds-grain-opacity').trim();
  if (inline) {
    const n = Number(inline);
    if (Number.isFinite(n)) return Math.max(0.15, Math.min(1, n));
  }
  try {
    const saved = localStorage.getItem(PAPER_SHADER.opacityStorageKey);
    if (saved != null) {
      const n = Number(saved);
      if (Number.isFinite(n)) return Math.max(0.15, Math.min(1, n));
    }
  } catch {
    /* ignore */
  }
  return PAPER_SHADER.defaultOpacity;
}

export function setPaperGrainDust(on: boolean): void {
  const root = document.documentElement;
  root.dataset.grainDust = on ? 'on' : 'off';
  try {
    localStorage.setItem(PAPER_SHADER.dustStorageKey, on ? 'on' : 'off');
  } catch {
    /* ignore */
  }
  if (activeHandle) activeHandle.setOptions({ dust: on });
  else mountPaperGrain({ dust: on });
}

export function setPaperGrainScratch(on: boolean): void {
  const root = document.documentElement;
  root.dataset.grainScratch = on ? 'on' : 'off';
  try {
    localStorage.setItem(PAPER_SHADER.scratchStorageKey, on ? 'on' : 'off');
  } catch {
    /* ignore */
  }
  if (activeHandle) activeHandle.setOptions({ scratch: on });
  else mountPaperGrain({ scratch: on });
}

export function setPaperGrainDouble(on: boolean): void {
  const root = document.documentElement;
  root.dataset.grainDouble = on ? 'on' : 'off';
  try {
    localStorage.setItem(PAPER_SHADER.doubleStorageKey, on ? 'on' : 'off');
  } catch {
    /* ignore */
  }
  if (activeHandle) activeHandle.setOptions({ double: on });
  else mountPaperGrain({ double: on });
}

/** Restaura opacidade + dust/scratch/duplo do localStorage. */
export function bootPaperGrainExtras(): void {
  setPaperGrainOpacity(getPaperGrainOpacity());

  let dust = PAPER_SHADER.defaultDust;
  let scratch = PAPER_SHADER.defaultScratch;
  let double = PAPER_SHADER.defaultDouble;
  try {
    const d = localStorage.getItem(PAPER_SHADER.dustStorageKey);
    if (d === 'on' || d === 'off') dust = d === 'on';
    const s = localStorage.getItem(PAPER_SHADER.scratchStorageKey);
    if (s === 'on' || s === 'off') scratch = s === 'on';
    const dbl = localStorage.getItem(PAPER_SHADER.doubleStorageKey);
    if (dbl === 'on' || dbl === 'off') double = dbl === 'on';
  } catch {
    /* ignore */
  }

  const root = document.documentElement;
  root.dataset.grainDust = dust ? 'on' : 'off';
  root.dataset.grainScratch = scratch ? 'on' : 'off';
  root.dataset.grainDouble = double ? 'on' : 'off';
  if (activeHandle) activeHandle.setOptions({ dust, scratch, double });
}
