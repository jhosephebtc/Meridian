/**
 * NASA Earth Archive — Interactive @paper-design/shaders Halftone Dots controller
 * Full controls: toggle shader, Original Colors vs any of the 26 Surface Colors (or custom hex),
 * dot texture (classic / gooey / holes / soft), grid (hex / square), size, radius, contrast,
 * grain mixer, grain overlay, grain size, overall intensity/opacity, and inverted luminance.
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
} from '@paper-design/shaders';
import { SURFACES, SURFACE_SPECTRUM } from './tokens';

interface NasaHalftoneState {
  enabled: boolean;
  originalColors: boolean;
  dotColor: string;
  type: HalftoneDotsType;
  grid: HalftoneDotsGrid;
  size: number;
  radius: number;
  contrast: number;
  grainMixer: number;
  grainOverlay: number;
  grainSize: number;
  opacity: number;
  inverted: boolean;
}

interface MountedPlate {
  host: HTMLElement;
  frame: HTMLElement;
  img: HTMLImageElement;
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
  grainMixer: 0.08,
  grainOverlay: 0,
  grainSize: 0.28,
  opacity: 0.92,
  inverted: false,
};

let mountedPlates: MountedPlate[] = [];
const imageCache = new Map<string, HTMLImageElement>();
let colorCanvasCtx: CanvasRenderingContext2D | null = null;

function readCssVar(name: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function loadLocalImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
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
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
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

function resolveFrontColor(): [number, number, number, number] {
  const raw = HALFTONE_STATE.dotColor === 'surface'
    ? readCssVar('--ds-type-primary', readCssVar('--ds-fg', '#141413'))
    : HALFTONE_STATE.dotColor;
  return getShaderColorFromString(resolveToRgbString(raw || '#141413'));
}

function resolveBackColor(): [number, number, number, number] {
  return [0, 0, 0, 0];
}

function currentUniforms(img: HTMLImageElement) {
  return {
    u_image: img,
    u_imageAspectRatio: img.naturalWidth / Math.max(1, img.naturalHeight),
    u_colorBack: resolveBackColor(),
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
  return sec.dataset.tabHidden !== 'true' && sec.offsetParent !== null;
}

async function mountAllShaders(): Promise<void> {
  if (!HALFTONE_STATE.enabled || !isNasaSectionVisible()) return;
  const frames = Array.from(document.querySelectorAll<HTMLElement>('#nasa-orbital .nasa-frame'));
  if (!frames.length) return;

  if (mountedPlates.length) {
    mountedPlates.forEach((p) => {
      p.host.style.opacity = HALFTONE_STATE.opacity.toFixed(2);
      p.mount.setUniforms(currentUniforms(p.img));
    });
    return;
  }

  for (const frame of frames) {
    const imgEl = frame.querySelector<HTMLImageElement>('img');
    const host = frame.querySelector<HTMLElement>('.nasa-shader-host');
    if (!imgEl || !host) continue;
    const src = imgEl.getAttribute('src') || '';
    if (!src) continue;
    try {
      const loaded = await loadLocalImage(src);
      if (!HALFTONE_STATE.enabled || !isNasaSectionVisible()) return;
      host.replaceChildren();
      host.style.opacity = HALFTONE_STATE.opacity.toFixed(2);
      const mount = new ShaderMount(
        host,
        halftoneDotsFragmentShader,
        currentUniforms(loaded),
        undefined,
        0,
      );
      frame.dataset.shaderActive = 'true';
      mountedPlates.push({ host, frame, img: loaded, mount });
    } catch (err) {
      console.warn('[nasa-halftone]', err);
    }
  }
}

function updateUniformsLive(): void {
  mountedPlates.forEach((p) => {
    p.host.style.opacity = HALFTONE_STATE.opacity.toFixed(2);
    p.mount.setUniforms({
      u_colorBack: resolveBackColor(),
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
    });
  });
}

function syncSlider(id: string, outId: string, val: number, decimals = 2): void {
  const el = document.getElementById(id) as HTMLInputElement | null;
  const out = document.getElementById(outId);
  if (el) {
    el.value = val.toFixed(decimals);
    syncRangePctLocal(el);
  }
  if (out) out.textContent = decimals === 0 ? `${Math.round(val * 100)}%` : val.toFixed(decimals);
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

  syncSlider('nasa-ht-size', 'nasa-ht-size-out', HALFTONE_STATE.size, 2);
  syncSlider('nasa-ht-radius', 'nasa-ht-radius-out', HALFTONE_STATE.radius, 2);
  syncSlider('nasa-ht-contrast', 'nasa-ht-contrast-out', HALFTONE_STATE.contrast, 2);
  syncSlider('nasa-ht-mixer', 'nasa-ht-mixer-out', HALFTONE_STATE.grainMixer, 2);
  syncSlider('nasa-ht-overlay', 'nasa-ht-overlay-out', HALFTONE_STATE.grainOverlay, 2);
  syncSlider('nasa-ht-gsize', 'nasa-ht-gsize-out', HALFTONE_STATE.grainSize, 2);
  syncSlider('nasa-ht-opacity', 'nasa-ht-opacity-out', HALFTONE_STATE.opacity, 0);

  section.querySelectorAll<HTMLElement>('[data-nasa-ht-invert]').forEach((btn) => {
    const wantInv = btn.dataset.nasaHtInvert === 'true';
    const on = HALFTONE_STATE.inverted === wantInv;
    btn.classList.toggle('btn-primary', on);
    btn.classList.toggle('btn-tertiary', !on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}

function applyHalftoneChange(autoEnable = true): void {
  if (autoEnable && !HALFTONE_STATE.enabled) {
    HALFTONE_STATE.enabled = true;
  }
  syncControlsUi();
  if (!HALFTONE_STATE.enabled) {
    disposeAllMounts();
    return;
  }
  if (mountedPlates.length) {
    updateUniformsLive();
  } else {
    void mountAllShaders();
  }
}

export function initNasaHalftone(): void {
  const section = document.getElementById('nasa-orbital');
  if (!section || section.dataset.halftoneBound === 'true') return;
  section.dataset.halftoneBound = 'true';

  populateDotColorSwatches();
  syncControlsUi();

  section.addEventListener('click', (e) => {
    const target = e.target as Element | null;
    if (!target) return;

    if (target.closest('#nasa-ht-toggle')) {
      HALFTONE_STATE.enabled = !HALFTONE_STATE.enabled;
      applyHalftoneChange(false);
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

  const bindRange = (id: string, apply: (v: number) => void) => {
    const input = document.getElementById(id) as HTMLInputElement | null;
    input?.addEventListener('input', () => {
      syncRangePctLocal(input);
      apply(Number(input.value));
      applyHalftoneChange(true);
    });
  };

  bindRange('nasa-ht-size', (v) => { HALFTONE_STATE.size = Math.max(0.04, Math.min(0.42, v || 0.16)); });
  bindRange('nasa-ht-radius', (v) => { HALFTONE_STATE.radius = Math.max(0.25, Math.min(2.0, v || 1.05)); });
  bindRange('nasa-ht-contrast', (v) => { HALFTONE_STATE.contrast = Math.max(0, Math.min(1, v)); });
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

  const observer = new MutationObserver(() => {
    if (!HALFTONE_STATE.enabled) return;
    if (isNasaSectionVisible()) {
      if (!mountedPlates.length) void mountAllShaders();
      else updateUniformsLive();
    } else if (mountedPlates.length) {
      disposeAllMounts();
    }
  });

  observer.observe(section, { attributes: true, attributeFilter: ['data-tab-hidden'] });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-surface', 'style'] });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNasaHalftone, { once: true });
  } else {
    initNasaHalftone();
  }
}
