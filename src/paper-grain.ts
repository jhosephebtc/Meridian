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
  type GrainPreset,
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
  dustLevel?: number;
  scratchLevel?: number;
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

function clampLevel(val: number): number {
  return Math.max(0, Math.min(100, Math.round(Number.isFinite(val) ? val : 0)));
}

function paintDust(
  ctx: CanvasRenderingContext2D,
  rng: () => number,
  w: number,
  h: number,
  sizeScale: number,
  levelPct: number,
): void {
  const level = Math.max(0, Math.min(1, levelPct / 100));
  if (level <= 0) return;

  const count = Math.round((20 + (w * h) / 14000) * sizeScale * (0.28 + level * 1.65));
  for (let i = 0; i < count; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const r = (0.55 + rng() * 2.5) * sizeScale * (0.85 + level * 0.45);
    const alpha = (0.032 + rng() * 0.082) * (0.38 + level * 0.92);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(22, 20, 16, ${Math.min(0.38, alpha).toFixed(4)})`);
    g.addColorStop(1, 'rgba(22, 20, 16, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fibras orgânicas de poeira (dust hairs)
  const hairCount = Math.round((4 + (w * h) / 55000) * (0.25 + level * 1.4));
  ctx.lineCap = 'round';
  for (let i = 0; i < hairCount; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const len = (5 + rng() * 14) * sizeScale;
    const ang = rng() * Math.PI * 2;
    const cx = x + Math.cos(ang + 0.45) * len * 0.5;
    const cy = y + Math.sin(ang + 0.45) * len * 0.5;
    ctx.strokeStyle = `rgba(22, 20, 16, ${(0.03 + rng() * 0.055 * (0.4 + level)).toFixed(4)})`;
    ctx.lineWidth = (0.35 + rng() * 0.45) * Math.max(0.7, sizeScale * 0.8);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(cx, cy, x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    ctx.stroke();
  }
}

function paintScratches(
  ctx: CanvasRenderingContext2D,
  rng: () => number,
  w: number,
  h: number,
  sizeScale: number,
  levelPct: number,
): void {
  const level = Math.max(0, Math.min(1, levelPct / 100));
  if (level <= 0) return;

  const count = Math.round((5 + (w * h) / 48000) * (0.25 + level * 1.85));
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const len = (18 + rng() * 115) * sizeScale * (0.85 + level * 0.4);
    // Prefer near-vertical / near-horizontal film scratches
    const base = rng() > 0.35 ? Math.PI / 2 : 0;
    const ang = base + (rng() - 0.5) * 0.32;
    const ex = x + Math.cos(ang) * len;
    const ey = y + Math.sin(ang) * len;
    ctx.strokeStyle = `rgba(18, 16, 12, ${(0.035 + rng() * 0.08 * (0.38 + level)).toFixed(4)})`;
    ctx.lineWidth = (0.35 + rng() * 0.65) * Math.max(0.7, sizeScale * 0.85);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(ex, ey);
    ctx.stroke();

    // Occasional twin hairline
    if (rng() > 0.68) {
      const ox = (rng() - 0.5) * 2.2;
      const oy = (rng() - 0.5) * 2.2;
      ctx.strokeStyle = `rgba(18, 16, 12, ${(0.02 + rng() * 0.04 * (0.4 + level)).toFixed(4)})`;
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
  dustLevel: number,
  scratchLevel: number,
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
  const effectiveDust = dust ? (dustLevel > 0 ? dustLevel : 50) : 0;
  const effectiveScratch = scratch ? (scratchLevel > 0 ? scratchLevel : 45) : 0;
  if (effectiveDust > 0) paintDust(ctx, rng, w, h, sizeScale, effectiveDust);
  if (effectiveScratch > 0) paintScratches(ctx, rng, w, h, sizeScale, effectiveScratch);
}

let activeHandle: PaperGrainHandle | null = null;

function dispatchGrainEvent(): void {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  window.dispatchEvent(new CustomEvent('meridian:grain', {
    detail: {
      intensity: root.getAttribute('data-grain') || 'editorial',
      size: root.dataset.grainSize || PAPER_SHADER.defaultSize,
      opacity: getPaperGrainOpacity(),
      dust: root.dataset.grainDust === 'on',
      scratch: root.dataset.grainScratch === 'on',
      double: root.dataset.grainDouble === 'on',
      dustLevel: getPaperGrainDustLevel(),
      scratchLevel: getPaperGrainScratchLevel(),
    },
  }));
}

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
    dustLevel: clampLevel(options.dustLevel ?? Number(root.dataset.grainDustLevel || PAPER_SHADER.defaultDustLevel)),
    scratchLevel: clampLevel(options.scratchLevel ?? Number(root.dataset.grainScratchLevel || PAPER_SHADER.defaultScratchLevel)),
  };

  root.dataset.paperShader = 'canvas';
  root.dataset.grainSize = state.size;
  root.dataset.grainDust = state.dust ? 'on' : 'off';
  root.dataset.grainScratch = state.scratch ? 'on' : 'off';
  root.dataset.grainDouble = state.double ? 'on' : 'off';
  root.dataset.grainDustLevel = String(state.dustLevel);
  root.dataset.grainScratchLevel = String(state.scratchLevel);
  root.style.setProperty('--ds-paper-texture', 'none');
  document.getElementById('ds-paper-shader-root')?.remove();

  const canvas = ensureLayer();

  const apply = () => {
    const size = resolveSize(root.dataset.grainSize || state.size);
    state.size = size;
    state.dust = isOn(root.dataset.grainDust, state.dust);
    state.scratch = isOn(root.dataset.grainScratch, state.scratch);
    state.double = isOn(root.dataset.grainDouble, state.double);
    if (root.dataset.grainDustLevel != null && root.dataset.grainDustLevel !== '') {
      state.dustLevel = clampLevel(Number(root.dataset.grainDustLevel));
    }
    if (root.dataset.grainScratchLevel != null && root.dataset.grainScratchLevel !== '') {
      state.scratchLevel = clampLevel(Number(root.dataset.grainScratchLevel));
    }
    root.dataset.grainSize = size;
    root.dataset.grainDust = state.dust ? 'on' : 'off';
    root.dataset.grainScratch = state.scratch ? 'on' : 'off';
    root.dataset.grainDouble = state.double ? 'on' : 'off';
    root.dataset.grainDustLevel = String(state.dustLevel);
    root.dataset.grainScratchLevel = String(state.scratchLevel);
    paintGrain(
      canvas,
      state.seed,
      state.speckleStrength,
      state.fiberDensity,
      size,
      state.dust,
      state.scratch,
      state.double,
      state.dustLevel,
      state.scratchLevel,
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
      try { localStorage.setItem(PAPER_SHADER.grainSizeStorageKey, size); } catch { /* ignore */ }
      apply();
      dispatchGrainEvent();
    },
    setOptions: (partial) => {
      if (partial.seed != null) state.seed = partial.seed;
      if (partial.speckleStrength != null) state.speckleStrength = partial.speckleStrength;
      if (partial.fiberDensity != null) state.fiberDensity = partial.fiberDensity;
      if (partial.size != null) {
        state.size = partial.size;
        root.dataset.grainSize = partial.size;
      }
      if (partial.dustLevel != null) {
        state.dustLevel = clampLevel(partial.dustLevel);
        root.dataset.grainDustLevel = String(state.dustLevel);
        if (partial.dust == null) {
          state.dust = state.dustLevel > 0;
          root.dataset.grainDust = state.dust ? 'on' : 'off';
        }
      }
      if (partial.scratchLevel != null) {
        state.scratchLevel = clampLevel(partial.scratchLevel);
        root.dataset.grainScratchLevel = String(state.scratchLevel);
        if (partial.scratch == null) {
          state.scratch = state.scratchLevel > 0;
          root.dataset.grainScratch = state.scratch ? 'on' : 'off';
        }
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
      dispatchGrainEvent();
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

export function setPaperGrainIntensity(preset: GrainPreset): GrainPreset {
  const root = document.documentElement;
  root.setAttribute('data-grain', preset);
  try {
    localStorage.setItem(PAPER_SHADER.grainStorageKey, preset);
  } catch { /* ignore */ }
  dispatchGrainEvent();
  return preset;
}

export function getPaperGrainIntensity(): GrainPreset {
  const attr = document.documentElement.getAttribute('data-grain');
  if (attr === 'off' || attr === 'subtle' || attr === 'editorial' || attr === 'tactile') return attr;
  try {
    const saved = localStorage.getItem(PAPER_SHADER.grainStorageKey);
    if (saved === 'off' || saved === 'subtle' || saved === 'editorial' || saved === 'tactile') return saved;
  } catch { /* ignore */ }
  return 'editorial';
}

export function setPaperGrainDustLevel(level: number): number {
  const clamped = clampLevel(level);
  const root = document.documentElement;
  const on = clamped > 0;
  root.dataset.grainDustLevel = String(clamped);
  root.dataset.grainDust = on ? 'on' : 'off';
  try {
    localStorage.setItem(PAPER_SHADER.dustLevelStorageKey, String(clamped));
    localStorage.setItem(PAPER_SHADER.dustStorageKey, on ? 'on' : 'off');
  } catch {
    /* ignore */
  }
  if (activeHandle) activeHandle.setOptions({ dust: on, dustLevel: clamped });
  else mountPaperGrain({ dust: on, dustLevel: clamped });
  return clamped;
}

export function getPaperGrainDustLevel(): number {
  const ds = document.documentElement.dataset.grainDustLevel;
  if (ds != null && ds !== '' && Number.isFinite(Number(ds))) {
    return clampLevel(Number(ds));
  }
  try {
    const saved = localStorage.getItem(PAPER_SHADER.dustLevelStorageKey);
    if (saved != null && Number.isFinite(Number(saved))) return clampLevel(Number(saved));
    const flag = localStorage.getItem(PAPER_SHADER.dustStorageKey);
    if (flag === 'on') return 55;
  } catch { /* ignore */ }
  return document.documentElement.dataset.grainDust === 'on' ? 55 : PAPER_SHADER.defaultDustLevel;
}

export function setPaperGrainScratchLevel(level: number): number {
  const clamped = clampLevel(level);
  const root = document.documentElement;
  const on = clamped > 0;
  root.dataset.grainScratchLevel = String(clamped);
  root.dataset.grainScratch = on ? 'on' : 'off';
  try {
    localStorage.setItem(PAPER_SHADER.scratchLevelStorageKey, String(clamped));
    localStorage.setItem(PAPER_SHADER.scratchStorageKey, on ? 'on' : 'off');
  } catch {
    /* ignore */
  }
  if (activeHandle) activeHandle.setOptions({ scratch: on, scratchLevel: clamped });
  else mountPaperGrain({ scratch: on, scratchLevel: clamped });
  return clamped;
}

export function getPaperGrainScratchLevel(): number {
  const ds = document.documentElement.dataset.grainScratchLevel;
  if (ds != null && ds !== '' && Number.isFinite(Number(ds))) {
    return clampLevel(Number(ds));
  }
  try {
    const saved = localStorage.getItem(PAPER_SHADER.scratchLevelStorageKey);
    if (saved != null && Number.isFinite(Number(saved))) return clampLevel(Number(saved));
    const flag = localStorage.getItem(PAPER_SHADER.scratchStorageKey);
    if (flag === 'on') return 45;
  } catch { /* ignore */ }
  return document.documentElement.dataset.grainScratch === 'on' ? 45 : PAPER_SHADER.defaultScratchLevel;
}

export function setPaperGrainDust(on: boolean): void {
  const cur = getPaperGrainDustLevel();
  const nextLevel = on ? (cur > 0 ? cur : 55) : 0;
  setPaperGrainDustLevel(nextLevel);
}

export function setPaperGrainScratch(on: boolean): void {
  const cur = getPaperGrainScratchLevel();
  const nextLevel = on ? (cur > 0 ? cur : 45) : 0;
  setPaperGrainScratchLevel(nextLevel);
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

/** Restaura intensidade + opacidade + tamanho + dust/scratch/duplo do localStorage. */
export function bootPaperGrainExtras(): void {
  setPaperGrainOpacity(getPaperGrainOpacity());

  let grain: GrainPreset | null = null;
  let size: GrainSizeId | null = null;
  let dust: boolean = PAPER_SHADER.defaultDust;
  let scratch: boolean = PAPER_SHADER.defaultScratch;
  let double: boolean = PAPER_SHADER.defaultDouble;
  let dustLevel: number = PAPER_SHADER.defaultDustLevel;
  let scratchLevel: number = PAPER_SHADER.defaultScratchLevel;
  try {
    const g = localStorage.getItem(PAPER_SHADER.grainStorageKey);
    if (g === 'off' || g === 'subtle' || g === 'editorial' || g === 'tactile') grain = g;
    const sz = localStorage.getItem(PAPER_SHADER.grainSizeStorageKey);
    if (sz && sz in GRAIN_SIZES) size = sz as GrainSizeId;
    const d = localStorage.getItem(PAPER_SHADER.dustStorageKey);
    if (d === 'on' || d === 'off') dust = d === 'on';
    const dl = localStorage.getItem(PAPER_SHADER.dustLevelStorageKey);
    if (dl != null && Number.isFinite(Number(dl))) dustLevel = clampLevel(Number(dl));
    else if (dust) dustLevel = 55;
    if (d == null && dl != null) dust = dustLevel > 0;
    const s = localStorage.getItem(PAPER_SHADER.scratchStorageKey);
    if (s === 'on' || s === 'off') scratch = s === 'on';
    const sl = localStorage.getItem(PAPER_SHADER.scratchLevelStorageKey);
    if (sl != null && Number.isFinite(Number(sl))) scratchLevel = clampLevel(Number(sl));
    else if (scratch) scratchLevel = 45;
    if (s == null && sl != null) scratch = scratchLevel > 0;
    const dbl = localStorage.getItem(PAPER_SHADER.doubleStorageKey);
    if (dbl === 'on' || dbl === 'off') double = dbl === 'on';
  } catch {
    /* ignore */
  }

  const root = document.documentElement;
  if (grain) root.setAttribute('data-grain', grain);
  if (size) root.dataset.grainSize = size;
  root.dataset.grainDust = dust ? 'on' : 'off';
  root.dataset.grainScratch = scratch ? 'on' : 'off';
  root.dataset.grainDouble = double ? 'on' : 'off';
  root.dataset.grainDustLevel = String(dustLevel);
  root.dataset.grainScratchLevel = String(scratchLevel);
  if (activeHandle) {
    activeHandle.setOptions({
      size: size ?? undefined,
      dust,
      scratch,
      double,
      dustLevel,
      scratchLevel,
    });
  }
}
