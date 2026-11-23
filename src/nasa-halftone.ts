/**
 * NASA Earth Archive — Interactive @paper-design/shaders Halftone Dots controller
 * Includes full color/texture/intensity controls + Anti-Moiré controls:
 * GPU trilinear mipmaps, Nyquist pre-filter blur, screen angle rotation (u_rotation),
 * resample scale (u_scale), DPI supersampling (minPixelRatio), and one-click Anti-Moiré preset.
 */
import {
  ShaderMount,
  halftoneDotsFragmentShader,
  HalftoneDotsTypes,
  HalftoneDotsGrids,
  ShaderFitOptions,
  getShaderColorFromString,
  type HalftoneDotsType,
  type HalftoneDotsGrid,
  type ShaderMountUniforms,
} from '@paper-design/shaders';
import { SURFACES, SURFACE_SPECTRUM } from './tokens';

export interface NasaHalftoneState {
  enabled: boolean;
  originalColors: boolean;
  dotColor: string;
  type: HalftoneDotsType;
  grid: HalftoneDotsGrid;
  size: number;
  radius: number;
  contrast: number;
  rotation: number;
  scale: number;
  grainMixer: number;
  grainOverlay: number;
  grainSize: number;
  opacity: number;
  inverted: boolean;
  mipmaps: boolean;
  antiMoireBlur: number;
  pixelRatio: 1 | 2;
}

interface MountedPlate {
  host: HTMLElement;
  frame: HTMLElement;
  src: string;
  rawImg: HTMLImageElement;
  mount: ShaderMount;
}

const HALFTONE_STATE: NasaHalftoneState = {
  enabled: false,
  originalColors: true,
  dotColor: 'surface',
  type: 'classic',
  grid: 'hex',
  size: 0.16,
  radius: 1.05,
  contrast: 0.72,
  rotation: 15,
  scale: 1.0,
  grainMixer: 0.08,
  grainOverlay: 0,
  grainSize: 0.28,
  opacity: 0.92,
  inverted: false,
  mipmaps: true,
  antiMoireBlur: 0.4,
  pixelRatio: 2,
};

let mountedPlates: MountedPlate[] = [];
const rawImageCache = new Map<string, HTMLImageElement>();
const filteredImageCache = new Map<string, HTMLImageElement>();
let colorCanvasCtx: CanvasRenderingContext2D | null = null;

function notifyHalftoneChange(): void {
  if (typeof window === 'undefined') return;
  (window as unknown as Record<string, unknown>).__MERIDIAN_HALFTONE__ = { ...HALFTONE_STATE };
  window.dispatchEvent(new CustomEvent('meridian:halftone', { detail: { ...HALFTONE_STATE } }));
}

function readCssVar(name: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function loadRawImage(src: string): Promise<HTMLImageElement> {
  const cached = rawImageCache.get(src);
  if (cached && cached.complete && cached.naturalWidth > 0) {
    return Promise.resolve(cached);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      if (!img.naturalWidth) {
        reject(new Error(`Invalid image dimensions: ${src}`));
        return;
      }
      rawImageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

function getPreFilteredImage(src: string, raw: HTMLImageElement, blurPx: number): Promise<HTMLImageElement> {
  if (blurPx <= 0.05) return Promise.resolve(raw);
  const rounded = blurPx.toFixed(1);
  const cacheKey = `${src}|blur=${rounded}`;
  const hit = filteredImageCache.get(cacheKey);
  if (hit && hit.complete && hit.naturalWidth > 0) return Promise.resolve(hit);

  return new Promise((resolve) => {
    const cv = document.createElement('canvas');
    cv.width = raw.naturalWidth;
    cv.height = raw.naturalHeight;
    const ctx = cv.getContext('2d');
    if (!ctx) {
      resolve(raw);
      return;
    }
    ctx.filter = `blur(${rounded}px)`;
    // Slight draw-bleed prevents edge darkening from Gaussian blur kernel
    const pad = Math.ceil(blurPx * 2);
    ctx.drawImage(raw, -pad, -pad, cv.width + pad * 2, cv.height + pad * 2);
    ctx.filter = 'none';

    const out = new Image();
    out.onload = () => {
      filteredImageCache.set(cacheKey, out);
      resolve(out);
    };
    out.onerror = () => resolve(raw);
    out.src = cv.toDataURL('image/jpeg', 0.92);
  });
}

function resolveToRgbString(colorExpr: string): string {
  const probe = document.createElement('span');
  probe.style.color = colorExpr;
  probe.style.display = 'none';
  document.body.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  probe.remove();

  if (!computed) return '#141413';
  if (/^#|^rgb/i.test(computed)) return computed;

  if (!colorCanvasCtx) {
    const cv = document.createElement('canvas');
    cv.width = 1;
    cv.height = 1;
    colorCanvasCtx = cv.getContext('2d', { willReadFrequently: true });
  }
  if (colorCanvasCtx) {
    colorCanvasCtx.clearRect(0, 0, 1, 1);
    colorCanvasCtx.fillStyle = computed;
    colorCanvasCtx.fillRect(0, 0, 1, 1);
    const d = colorCanvasCtx.getImageData(0, 0, 1, 1).data;
    return `rgba(${d[0]}, ${d[1]}, ${d[2]}, ${(d[3] / 255).toFixed(3)})`;
  }
  return '#141413';
}

function buildMeridianHalftoneShader(): string {
  const src = halftoneDotsFragmentShader;
  const withUniforms = src.replace(
    'uniform float u_type;',
    'uniform float u_type;\nuniform float u_screenAngle;\nuniform float u_freqScale;',
  );
  const withRotatedSample = withUniforms.replace(
    [
      '  p += inCellOffset;',
      '  vec2 uv_i = floor(p);',
      '  vec2 uv_f = fract(p);',
      '  vec2 samplingUV = (uv_i + .5 - inCellOffset) * pad + vec2(.5);',
      '  float outOfFrame = getUvFrame(samplingUV, pad * stepSize);',
    ].join('\n'),
    [
      '  p += inCellOffset;',
      '  vec2 uv_i = floor(p);',
      '  vec2 uv_f = fract(p);',
      '  vec2 cellUnrot = rotate(uv_i + .5 - inCellOffset, -radians(u_screenAngle));',
      '  vec2 samplingUV = clamp(cellUnrot * pad + vec2(.5), vec2(0.0), vec2(1.0));',
      '  float outOfFrame = getUvFrame(v_imageUV, vec2(0.0));',
    ].join('\n'),
  );
  return withRotatedSample.replace(
    [
      '  float cellsPerSide = mix(300., 7., pow(u_size, .7));',
      '  cellsPerSide /= stepMultiplier;',
      '  float cellSizeY = 1. / cellsPerSide;',
      '  vec2 pad = cellSizeY * vec2(1. / u_imageAspectRatio, 1.);',
      '  if (u_type == 1. && u_grid == 1.) {',
      '    // gooey diagonal grid works differently',
      '    pad *= .7;',
      '  }',
      '',
      '  vec2 uv = v_imageUV;',
      '  uv -= vec2(.5);',
      '  uv /= pad;',
    ].join('\n'),
    [
      '  float cellsPerSide = mix(300., 7., pow(u_size, .7)) * max(0.25, u_freqScale);',
      '  cellsPerSide /= stepMultiplier;',
      '  float cellSizeY = 1. / cellsPerSide;',
      '  vec2 pad = cellSizeY * vec2(1. / u_imageAspectRatio, 1.);',
      '  if (u_type == 1. && u_grid == 1.) {',
      '    // gooey diagonal grid works differently',
      '    pad *= .7;',
      '  }',
      '',
      '  vec2 uv = rotate((v_imageUV - vec2(.5)) / pad, radians(u_screenAngle));',
    ].join('\n'),
  );
}

const MERIDIAN_HALFTONE_SHADER = buildMeridianHalftoneShader();

function resolveFrontColor(): [number, number, number, number] {
  const raw = HALFTONE_STATE.dotColor === 'surface'
    ? readCssVar('--ds-type-primary', readCssVar('--ds-fg', '#141413'))
    : HALFTONE_STATE.dotColor;
  return getShaderColorFromString(resolveToRgbString(raw || '#141413'));
}

function currentUniforms(img: HTMLImageElement) {
  return {
    u_image: img,
    u_imageAspectRatio: img.naturalWidth / Math.max(1, img.naturalHeight),
    u_colorBack: [0, 0, 0, 0] as [number, number, number, number],
    u_colorFront: resolveFrontColor(),
    u_originalColors: HALFTONE_STATE.originalColors,
    u_type: HalftoneDotsTypes[HALFTONE_STATE.type],
    u_inverted: HALFTONE_STATE.inverted,
    u_grid: HalftoneDotsGrids[HALFTONE_STATE.grid],
    u_size: HALFTONE_STATE.size,
    u_radius: HALFTONE_STATE.radius,
    u_contrast: HALFTONE_STATE.contrast,
    u_grainMixer: HALFTONE_STATE.grainMixer,
    u_grainOverlay: HALFTONE_STATE.grainOverlay,
    u_grainSize: HALFTONE_STATE.grainSize,
    u_fit: ShaderFitOptions.cover,
    u_scale: 1,
    u_rotation: 0,
    u_screenAngle: HALFTONE_STATE.rotation,
    u_freqScale: HALFTONE_STATE.scale,
    u_originX: 0.5,
    u_originY: 0.5,
    u_offsetX: 0,
    u_offsetY: 0,
    u_worldWidth: 0,
    u_worldHeight: 0,
  };
}

function populateDotColorSwatches(): void {
  const host = document.getElementById('nasa-ht-swatches');
  if (!host || host.dataset.built === 'true') return;
  host.dataset.built = 'true';

  const swatches: { val: string; title: string; style: string }[] = [
    { val: 'surface', title: 'Ink (--ds-fg)', style: 'background:var(--ds-type-primary, var(--ds-fg))' },
    ...SURFACE_SPECTRUM.map((id) => {
      const s = SURFACES[id];
      return { val: s.bg, title: `${s.label} (${s.bg})`, style: `background:${s.bg}` };
    }),
  ];

  host.innerHTML = swatches.map((sw) => `
    <button type="button" class="nasa-ht-swatch" data-nasa-ht-swatch="${sw.val}" aria-pressed="false" title="${sw.title}" style="${sw.style};"></button>
  `).join('');
}

function syncRangePctLocal(input: HTMLInputElement | null): void {
  if (!input) return;
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const val = Number(input.value || 0);
  const pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
  input.style.setProperty('--range-pct', `${Math.max(0, Math.min(100, pct)).toFixed(1)}%`);
}

function disposeAllMounts(): void {
  mountedPlates.forEach(({ mount, host, frame }) => {
    try {
      mount.dispose();
    } catch { /* ignore */ }
    host.replaceChildren();
    delete frame.dataset.shaderActive;
  });
  mountedPlates = [];
}

function isNasaSectionVisible(): boolean {
  const sec = document.getElementById('nasa-orbital');
  if (!sec) return false;
  return sec.offsetParent !== null;
}

async function mountAllShaders(forceRebuild = false): Promise<void> {
  if (!HALFTONE_STATE.enabled || !isNasaSectionVisible()) return;
  if (forceRebuild) disposeAllMounts();

  const frames = Array.from(document.querySelectorAll<HTMLElement>('#nasa-orbital .nasa-frame'));
  if (!frames.length) return;

  if (mountedPlates.length) {
    await updateUniformsLive(true);
    return;
  }

  for (const frame of frames) {
    const imgEl = frame.querySelector<HTMLImageElement>('img');
    const host = frame.querySelector<HTMLElement>('.nasa-shader-host');
    if (!imgEl || !host) continue;
    const src = imgEl.getAttribute('src') || '';
    if (!src) continue;
    try {
      const raw = await loadRawImage(src);
      const texImg = await getPreFilteredImage(src, raw, HALFTONE_STATE.antiMoireBlur);
      if (!HALFTONE_STATE.enabled || !isNasaSectionVisible()) return;
      host.replaceChildren();
      host.style.opacity = HALFTONE_STATE.opacity.toFixed(2);
      const mount = new ShaderMount(
        host,
        MERIDIAN_HALFTONE_SHADER,
        currentUniforms(texImg),
        undefined,
        0,
        0,
        HALFTONE_STATE.pixelRatio,
        undefined,
        HALFTONE_STATE.mipmaps ? ['u_image'] : [],
      );
      frame.dataset.shaderActive = 'true';
      mountedPlates.push({ host, frame, src, rawImg: raw, mount });
    } catch (err) {
      console.warn('[nasa-halftone]', err);
    }
  }
}

async function updateUniformsLive(refreshTexture = false): Promise<void> {
  for (const p of mountedPlates) {
    p.host.style.opacity = HALFTONE_STATE.opacity.toFixed(2);
    p.mount.setMinPixelRatio(HALFTONE_STATE.pixelRatio);
    const patch: ShaderMountUniforms = {
      u_colorBack: [0, 0, 0, 0],
      u_colorFront: resolveFrontColor(),
      u_originalColors: HALFTONE_STATE.originalColors,
      u_type: HalftoneDotsTypes[HALFTONE_STATE.type],
      u_inverted: HALFTONE_STATE.inverted,
      u_grid: HalftoneDotsGrids[HALFTONE_STATE.grid],
      u_size: HALFTONE_STATE.size,
      u_radius: HALFTONE_STATE.radius,
      u_contrast: HALFTONE_STATE.contrast,
      u_rotation: 0,
      u_scale: 1,
      u_screenAngle: HALFTONE_STATE.rotation,
      u_freqScale: HALFTONE_STATE.scale,
      u_grainMixer: HALFTONE_STATE.grainMixer,
      u_grainOverlay: HALFTONE_STATE.grainOverlay,
      u_grainSize: HALFTONE_STATE.grainSize,
    };
    if (refreshTexture) {
      const texImg = await getPreFilteredImage(p.src, p.rawImg, HALFTONE_STATE.antiMoireBlur);
      patch.u_image = texImg;
      patch.u_imageAspectRatio = texImg.naturalWidth / Math.max(1, texImg.naturalHeight);
    }
    p.mount.setUniforms(patch);
  }
}

function syncSlider(id: string, outId: string, val: number, format: (v: number) => string, decimals = 2): void {
  const el = document.getElementById(id) as HTMLInputElement | null;
  const out = document.getElementById(outId);
  if (el) {
    el.value = decimals === 0 ? String(Math.round(val)) : val.toFixed(decimals);
    syncRangePctLocal(el);
  }
  if (out) out.textContent = format(val);
}

function syncControlsUi(): void {
  const section = document.getElementById('nasa-orbital');
  if (!section) return;
  section.dataset.halftone = HALFTONE_STATE.enabled ? 'on' : 'off';

  const toggleBtn = document.getElementById('nasa-ht-toggle');
  if (toggleBtn) {
    toggleBtn.setAttribute('aria-pressed', HALFTONE_STATE.enabled ? 'true' : 'false');
    toggleBtn.classList.toggle('btn-primary', HALFTONE_STATE.enabled);
    toggleBtn.classList.toggle('btn-secondary', !HALFTONE_STATE.enabled);
    const badge = toggleBtn.querySelector<HTMLElement>('[data-nasa-ht-badge]');
    if (badge) badge.textContent = HALFTONE_STATE.enabled ? 'ON' : 'OFF';
  }

  const mipBtn = document.getElementById('nasa-ht-mipmaps');
  if (mipBtn) {
    mipBtn.setAttribute('aria-pressed', HALFTONE_STATE.mipmaps ? 'true' : 'false');
    mipBtn.classList.toggle('btn-primary', HALFTONE_STATE.mipmaps);
    mipBtn.classList.toggle('btn-tertiary', !HALFTONE_STATE.mipmaps);
  }

  const dprBtn = document.getElementById('nasa-ht-dpr');
  if (dprBtn) {
    dprBtn.setAttribute('aria-pressed', HALFTONE_STATE.pixelRatio === 2 ? 'true' : 'false');
    dprBtn.classList.toggle('btn-primary', HALFTONE_STATE.pixelRatio === 2);
    dprBtn.classList.toggle('btn-tertiary', HALFTONE_STATE.pixelRatio !== 2);
    const dprBadge = dprBtn.querySelector<HTMLElement>('[data-nasa-ht-dpr-badge]');
    if (dprBadge) dprBadge.textContent = `${HALFTONE_STATE.pixelRatio}×`;
  }

  section.querySelectorAll<HTMLElement>('[data-nasa-ht-color-mode]').forEach((btn) => {
    const wantOrig = btn.dataset.nasaHtColorMode === 'original';
    const on = HALFTONE_STATE.originalColors === wantOrig;
    btn.classList.toggle('btn-primary', on);
    btn.classList.toggle('btn-tertiary', !on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });

  section.querySelectorAll<HTMLElement>('[data-nasa-ht-swatch]').forEach((btn) => {
    const active = !HALFTONE_STATE.originalColors && btn.dataset.nasaHtSwatch === HALFTONE_STATE.dotColor;
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  const colorPicker = document.getElementById('nasa-ht-color') as HTMLInputElement | null;
  if (colorPicker && HALFTONE_STATE.dotColor.startsWith('#')) {
    colorPicker.value = HALFTONE_STATE.dotColor;
  }

  section.querySelectorAll<HTMLElement>('[data-nasa-ht-type]').forEach((btn) => {
    const on = btn.dataset.nasaHtType === HALFTONE_STATE.type;
    btn.classList.toggle('btn-primary', on);
    btn.classList.toggle('btn-tertiary', !on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });

  section.querySelectorAll<HTMLElement>('[data-nasa-ht-grid]').forEach((btn) => {
    const on = btn.dataset.nasaHtGrid === HALFTONE_STATE.grid;
    btn.classList.toggle('btn-primary', on);
    btn.classList.toggle('btn-tertiary', !on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });

  section.querySelectorAll<HTMLElement>('[data-nasa-ht-rot]').forEach((btn) => {
    const on = Math.abs(Number(btn.dataset.nasaHtRot) - HALFTONE_STATE.rotation) < 0.1;
    btn.classList.toggle('btn-primary', on);
    btn.classList.toggle('btn-tertiary', !on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });

  syncSlider('nasa-ht-size', 'nasa-ht-size-out', HALFTONE_STATE.size, (v) => v.toFixed(2), 2);
  syncSlider('nasa-ht-radius', 'nasa-ht-radius-out', HALFTONE_STATE.radius, (v) => v.toFixed(2), 2);
  syncSlider('nasa-ht-contrast', 'nasa-ht-contrast-out', HALFTONE_STATE.contrast, (v) => v.toFixed(2), 2);
  syncSlider('nasa-ht-rotation', 'nasa-ht-rotation-out', HALFTONE_STATE.rotation, (v) => `${v.toFixed(1).replace(/\.0$/, '')}°`, 1);
  syncSlider('nasa-ht-scale', 'nasa-ht-scale-out', HALFTONE_STATE.scale, (v) => `${v.toFixed(2)}×`, 2);
  syncSlider('nasa-ht-blur', 'nasa-ht-blur-out', HALFTONE_STATE.antiMoireBlur, (v) => `${v.toFixed(1)}px`, 1);
  syncSlider('nasa-ht-mixer', 'nasa-ht-mixer-out', HALFTONE_STATE.grainMixer, (v) => v.toFixed(2), 2);
  syncSlider('nasa-ht-overlay', 'nasa-ht-overlay-out', HALFTONE_STATE.grainOverlay, (v) => v.toFixed(2), 2);
  syncSlider('nasa-ht-gsize', 'nasa-ht-gsize-out', HALFTONE_STATE.grainSize, (v) => v.toFixed(2), 2);
  syncSlider('nasa-ht-opacity', 'nasa-ht-opacity-out', HALFTONE_STATE.opacity, (v) => `${Math.round(v * 100)}%`, 2);

  section.querySelectorAll<HTMLElement>('[data-nasa-ht-invert]').forEach((btn) => {
    const wantInv = btn.dataset.nasaHtInvert === 'true';
    const on = HALFTONE_STATE.inverted === wantInv;
    btn.classList.toggle('btn-primary', on);
    btn.classList.toggle('btn-tertiary', !on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}

function applyHalftoneChange(
  autoEnable = true,
  opts: { rebuild?: boolean; refreshTexture?: boolean } = {},
): void {
  if (autoEnable && !HALFTONE_STATE.enabled) {
    HALFTONE_STATE.enabled = true;
  }
  syncControlsUi();
  notifyHalftoneChange();
  if (!HALFTONE_STATE.enabled) {
    disposeAllMounts();
    return;
  }
  if (mountedPlates.length && !opts.rebuild) {
    void updateUniformsLive(Boolean(opts.refreshTexture));
  } else {
    void mountAllShaders(Boolean(opts.rebuild));
  }
}

export function initNasaHalftone(): void {
  const section = document.getElementById('nasa-orbital');
  if (!section || section.dataset.halftoneBound === 'true') return;
  section.dataset.halftoneBound = 'true';

  populateDotColorSwatches();
  syncControlsUi();
  notifyHalftoneChange();

  section.addEventListener('click', (e) => {
    const target = e.target as Element | null;
    if (!target) return;

    if (target.closest('#nasa-ht-toggle')) {
      HALFTONE_STATE.enabled = !HALFTONE_STATE.enabled;
      applyHalftoneChange(false);
      return;
    }

    if (target.closest('#nasa-ht-antimoire')) {
      HALFTONE_STATE.mipmaps = true;
      HALFTONE_STATE.antiMoireBlur = 0.9;
      HALFTONE_STATE.rotation = 22.5;
      HALFTONE_STATE.grid = 'hex';
      HALFTONE_STATE.grainMixer = Math.max(HALFTONE_STATE.grainMixer, 0.16);
      HALFTONE_STATE.pixelRatio = 2;
      applyHalftoneChange(true, { rebuild: true, refreshTexture: true });
      return;
    }

    if (target.closest('#nasa-ht-mipmaps')) {
      HALFTONE_STATE.mipmaps = !HALFTONE_STATE.mipmaps;
      applyHalftoneChange(true, { rebuild: true });
      return;
    }

    if (target.closest('#nasa-ht-dpr')) {
      HALFTONE_STATE.pixelRatio = HALFTONE_STATE.pixelRatio === 2 ? 1 : 2;
      applyHalftoneChange(true);
      return;
    }

    const rotBtn = target.closest<HTMLElement>('[data-nasa-ht-rot]');
    if (rotBtn?.dataset.nasaHtRot != null) {
      HALFTONE_STATE.rotation = Number(rotBtn.dataset.nasaHtRot) || 0;
      applyHalftoneChange(true);
      return;
    }

    const cmBtn = target.closest<HTMLElement>('[data-nasa-ht-color-mode]');
    if (cmBtn?.dataset.nasaHtColorMode) {
      HALFTONE_STATE.originalColors = cmBtn.dataset.nasaHtColorMode === 'original';
      applyHalftoneChange(true);
      return;
    }

    const swBtn = target.closest<HTMLElement>('[data-nasa-ht-swatch]');
    if (swBtn?.dataset.nasaHtSwatch) {
      HALFTONE_STATE.originalColors = false;
      HALFTONE_STATE.dotColor = swBtn.dataset.nasaHtSwatch;
      applyHalftoneChange(true);
      return;
    }

    const typeBtn = target.closest<HTMLElement>('[data-nasa-ht-type]');
    if (typeBtn?.dataset.nasaHtType) {
      HALFTONE_STATE.type = typeBtn.dataset.nasaHtType as HalftoneDotsType;
      applyHalftoneChange(true);
      return;
    }

    const gridBtn = target.closest<HTMLElement>('[data-nasa-ht-grid]');
    if (gridBtn?.dataset.nasaHtGrid) {
      HALFTONE_STATE.grid = gridBtn.dataset.nasaHtGrid as HalftoneDotsGrid;
      applyHalftoneChange(true);
      return;
    }

    const invBtn = target.closest<HTMLElement>('[data-nasa-ht-invert]');
    if (invBtn?.dataset.nasaHtInvert) {
      HALFTONE_STATE.inverted = invBtn.dataset.nasaHtInvert === 'true';
      applyHalftoneChange(true);
      return;
    }
  });

  const bindRange = (id: string, apply: (v: number) => void, refreshTexture = false) => {
    const input = document.getElementById(id) as HTMLInputElement | null;
    input?.addEventListener('input', () => {
      syncRangePctLocal(input);
      apply(Number(input.value));
      applyHalftoneChange(true, { refreshTexture });
    });
  };

  bindRange('nasa-ht-size', (v) => { HALFTONE_STATE.size = Math.max(0.04, Math.min(0.42, v || 0.16)); });
  bindRange('nasa-ht-radius', (v) => { HALFTONE_STATE.radius = Math.max(0.25, Math.min(2.0, v || 1.05)); });
  bindRange('nasa-ht-contrast', (v) => { HALFTONE_STATE.contrast = Math.max(0, Math.min(1, v)); });
  bindRange('nasa-ht-rotation', (v) => { HALFTONE_STATE.rotation = Math.max(0, Math.min(180, v)); });
  bindRange('nasa-ht-scale', (v) => { HALFTONE_STATE.scale = Math.max(0.5, Math.min(2.0, v || 1)); });
  bindRange('nasa-ht-blur', (v) => { HALFTONE_STATE.antiMoireBlur = Math.max(0, Math.min(3.0, v)); }, true);
  bindRange('nasa-ht-mixer', (v) => { HALFTONE_STATE.grainMixer = Math.max(0, Math.min(1, v)); });
  bindRange('nasa-ht-overlay', (v) => { HALFTONE_STATE.grainOverlay = Math.max(0, Math.min(1, v)); });
  bindRange('nasa-ht-gsize', (v) => { HALFTONE_STATE.grainSize = Math.max(0.05, Math.min(1, v || 0.28)); });
  bindRange('nasa-ht-opacity', (v) => { HALFTONE_STATE.opacity = Math.max(0.25, Math.min(1, v || 0.92)); });

  const colorInput = document.getElementById('nasa-ht-color') as HTMLInputElement | null;
  colorInput?.addEventListener('input', () => {
    HALFTONE_STATE.originalColors = false;
    HALFTONE_STATE.dotColor = colorInput.value;
    applyHalftoneChange(true);
  });

  const recheckVisibility = () => {
    if (!HALFTONE_STATE.enabled) return;
    if (isNasaSectionVisible()) {
      if (!mountedPlates.length) void mountAllShaders();
      else void updateUniformsLive();
    } else if (mountedPlates.length) {
      disposeAllMounts();
    }
  };

  const observer = new MutationObserver(recheckVisibility);
  observer.observe(section, { attributes: true, attributeFilter: ['data-tab-hidden', 'data-ds-hidden'] });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-surface', 'style', 'data-topbar-nav'] });
  window.addEventListener('resize', recheckVisibility, { passive: true });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNasaHalftone, { once: true });
  } else {
    initNasaHalftone();
  }
}
