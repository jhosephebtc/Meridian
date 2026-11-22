/**
 * MERIDIAN PAINTERLY STUDIO CONTROLLER — painterly-studio.ts
 * 1) Upgrades Section 07 (#atelier) with live GPU Anisotropic Kuwahara post-processing
 * 2) Mounts Section 08 (#painterly-studio) for uploading any image and sculpting painterly shaders in real time
 */

import {
  createPainterlyRenderer,
  createPainterlySampleCanvas,
  PAINTERLY_PRESETS,
  type PainterlyDebugMode,
  type PainterlyParams,
  type PainterlyPresetId,
  type PainterlyRenderer,
} from './painterly-shader.ts';

function readSurfaceHex(): { bg: string; fg: string } {
  const cs = getComputedStyle(document.documentElement);
  return {
    bg: cs.getPropertyValue('--ds-bg').trim() || '#FAF9F5',
    fg: cs.getPropertyValue('--ds-fg').trim() || '#141413',
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function syncClipTabsLocal(container: HTMLElement | null, activeBtn: HTMLElement | null): void {
  if (!container || !activeBtn) return;
  const track = container.querySelector<HTMLElement>('.cliptabs-track');
  const overlay = container.querySelector<HTMLElement>('.cliptabs-overlay');
  if (!track || !overlay) return;
  const peers = [...track.querySelectorAll<HTMLElement>('.cliptabs-btn')];
  peers.forEach((b) => {
    b.dataset.active = b === activeBtn ? 'true' : 'false';
  });
  const labels = [...overlay.children] as HTMLElement[];
  peers.forEach((btn, i) => {
    const lbl = labels[i];
    if (!lbl) return;
    const txt = (btn.textContent || '').replace(/\s+/g, ' ').trim();
    if (lbl.textContent?.trim() !== txt) lbl.textContent = txt;
    const w = Math.ceil(btn.getBoundingClientRect().width);
    lbl.style.flex = `0 0 ${w}px`;
    lbl.style.width = `${w}px`;
  });
  const tw = track.scrollWidth || track.offsetWidth || 1;
  const left = activeBtn.offsetLeft;
  const width = activeBtn.offsetWidth;
  const leftPct = (left / tw) * 100;
  const rightPct = 100 - ((left + width) / tw) * 100;
  overlay.style.clipPath = `inset(0 ${Math.max(0, rightPct).toFixed(2)}% 0 ${Math.max(0, leftPct).toFixed(2)}% round 9999px)`;
}

/* ==========================================================================
   PART 1: LIVE PAINTERLY POST-PROCESS UPGRADE ON SECTION 07 (#atelier)
   ========================================================================== */
function bootAtelierPainterlyBridge(): void {
  const srcCanvas = document.getElementById('atelier-canvas') as HTMLCanvasElement | null;
  const outCanvas = document.getElementById('atelier-shader-canvas') as HTMLCanvasElement | null;
  const stage = document.getElementById('atelier-stage');
  if (!srcCanvas || !outCanvas || !stage) return;

  let renderer: PainterlyRenderer | null = null;
  let activeMode: 'off' | PainterlyPresetId = 'off';
  let rafId = 0;
  let inView = false;
  let lastSync = 0;

  const ensureRenderer = () => {
    if (renderer) return renderer;
    renderer = createPainterlyRenderer(outCanvas, {
      ...PAINTERLY_PRESETS.gouache,
      split: 0,
      debug: 'final',
    });
    const { bg, fg } = readSurfaceHex();
    renderer.setSurfaceColors(bg, fg);
    renderer.setSource(srcCanvas);
    return renderer;
  };

  const syncOnce = () => {
    if (activeMode === 'off') return;
    const r = ensureRenderer();
    r.setSource(srcCanvas);
  };

  const tick = (now: number) => {
    rafId = 0;
    if (activeMode === 'off' || !inView) return;
    // Update GPU shader smoothly at ~15fps while user draws or preset animates
    if (now - lastSync >= 66) {
      lastSync = now;
      syncOnce();
    }
    rafId = requestAnimationFrame(tick);
  };

  const startLoop = () => {
    if (activeMode === 'off' || !inView || rafId) return;
    lastSync = 0;
    rafId = requestAnimationFrame(tick);
  };

  const stopLoop = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };

  const setMode = (next: 'off' | PainterlyPresetId) => {
    activeMode = next;
    document.querySelectorAll<HTMLButtonElement>('[data-atelier-shader]').forEach((btn) => {
      const on = btn.dataset.atelierShader === next;
      btn.classList.toggle('btn-primary', on);
      btn.classList.toggle('btn-tertiary', !on);
      btn.setAttribute('aria-pressed', String(on));
    });
    if (next === 'off') {
      outCanvas.hidden = true;
      stage.dataset.painterly = 'off';
      stopLoop();
      return;
    }
    const r = ensureRenderer();
    const preset = PAINTERLY_PRESETS[next];
    r.setParams({
      ...preset,
      split: 0,
      debug: 'final',
    });
    outCanvas.hidden = false;
    stage.dataset.painterly = next;
    syncOnce();
    startLoop();
  };

  document.querySelectorAll<HTMLButtonElement>('[data-atelier-shader]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const m = (btn.dataset.atelierShader as 'off' | PainterlyPresetId) || 'off';
      setMode(m);
    });
  });

  // Sync immediately on freehand drawing strokes and surface changes
  srcCanvas.addEventListener('pointerup', () => syncOnce());
  window.addEventListener('meridian:surface', () => {
    if (!renderer) return;
    const { bg, fg } = readSurfaceHex();
    renderer.setSurfaceColors(bg, fg);
    setTimeout(syncOnce, 60);
  });

  new IntersectionObserver(
    (entries) => {
      inView = entries[0]?.isIntersecting ?? false;
      if (inView) startLoop();
      else stopLoop();
    },
    { threshold: 0.05 },
  ).observe(stage);
}

/* ==========================================================================
   PART 2: SECTION 08 (#painterly-studio) — IMAGE UPLOAD & LIVE SHADER LAB
   ========================================================================== */
function bootPainterlyStudio(): void {
  const section = document.getElementById('painterly-studio');
  const canvas = document.getElementById('painterly-canvas') as HTMLCanvasElement | null;
  const stage = document.getElementById('painterly-stage');
  if (!section || !canvas || !stage) return;

  const renderer = createPainterlyRenderer(canvas, {
    ...PAINTERLY_PRESETS.gouache,
    split: 0.42,
    debug: 'final',
  });
  const initialColors = readSurfaceHex();
  renderer.setSurfaceColors(initialColors.bg, initialColors.fg);

  const fileInput = document.getElementById('painterly-file-input') as HTMLInputElement | null;
  const splitLine = document.getElementById('painterly-split-line') as HTMLElement | null;
  const splitToggleBtn = document.getElementById('btn-painterly-split') as HTMLButtonElement | null;
  const exportBtn = document.getElementById('btn-painterly-export') as HTMLButtonElement | null;
  const resetBtn = document.getElementById('btn-painterly-reset') as HTMLButtonElement | null;
  const readoutEl = document.getElementById('painterly-telemetry');
  const srcNameEl = document.getElementById('painterly-source-name');

  let activePreset: PainterlyPresetId = 'gouache';
  let splitEnabled = true;
  let splitPos = 0.42;
  let lastRenderMs = 0;
  let sourceLabel = 'Lighthouse Dusk (Procedural)';

  const sampleCanvas = createPainterlySampleCanvas(960, 600);
  const imageCache = new Map<string, HTMLImageElement>();

  function updateTelemetry(): void {
    const p = renderer.getParams();
    if (readoutEl) {
      readoutEl.textContent =
        `${canvas!.width}×${canvas!.height} · r=${p.radius.toFixed(0)} · A=${p.anisotropy.toFixed(2)} · q=${p.sharpness.toFixed(1)} · ${lastRenderMs.toFixed(1)}ms`;
    }
    if (srcNameEl) {
      srcNameEl.textContent = sourceLabel;
    }
  }

  function syncSplitUi(): void {
    const effective = splitEnabled ? splitPos : 0;
    renderer.setParams({ split: effective });
    if (splitLine) {
      splitLine.hidden = !splitEnabled;
      splitLine.style.left = `${(splitPos * 100).toFixed(2)}%`;
    }
    if (splitToggleBtn) {
      splitToggleBtn.setAttribute('aria-pressed', String(splitEnabled));
      splitToggleBtn.classList.toggle('btn-primary', splitEnabled);
      splitToggleBtn.classList.toggle('btn-tertiary', !splitEnabled);
    }
  }

  function syncSlidersToParams(): void {
    const p = renderer.getParams();
    const map: Record<string, [number, (v: number) => string]> = {
      radius: [p.radius, (v) => `${v.toFixed(0)} px`],
      anisotropy: [p.anisotropy, (v) => v.toFixed(2)],
      sharpness: [p.sharpness, (v) => v.toFixed(1)],
      tensorSigma: [p.tensorSigma, (v) => `${v.toFixed(1)} σ`],
      paper: [p.paper, (v) => `${Math.round(v * 100)}%`],
      saturation: [p.saturation, (v) => `${Math.round(v * 100)}%`],
      edge: [p.edge, (v) => `${Math.round(v * 100)}%`],
    };
    Object.entries(map).forEach(([key, [val, fmt]]) => {
      const input = section!.querySelector<HTMLInputElement>(`[data-painterly-param="${key}"]`);
      const out = section!.querySelector<HTMLElement>(`[data-painterly-out="${key}"]`);
      if (input) input.value = String(val);
      if (out) out.textContent = fmt(val);
    });
  }

  function applyPreset(id: PainterlyPresetId, tabBtn?: HTMLElement | null): void {
    activePreset = id;
    const next = PAINTERLY_PRESETS[id];
    renderer.setParams({ ...next, debug: 'final' });
    lastRenderMs = renderer.render();
    syncSlidersToParams();
    updateTelemetry();

    // Reset debug tab to Final
    section!.querySelectorAll<HTMLButtonElement>('[data-painterly-debug]').forEach((b) => {
      const on = b.dataset.painterlyDebug === 'final';
      b.classList.toggle('btn-primary', on);
      b.classList.toggle('btn-tertiary', !on);
      b.setAttribute('aria-pressed', String(on));
    });

    const container = section!.querySelector<HTMLElement>('[data-cliptabs="painterly-preset"]');
    const btn = tabBtn || container?.querySelector<HTMLElement>(`[data-painterly-preset="${id}"]`) || null;
    syncClipTabsLocal(container, btn);
  }

  function loadPlateUrl(url: string, label: string): void {
    sourceLabel = label;
    const cached = imageCache.get(url);
    if (cached && cached.complete && cached.naturalWidth > 0) {
      renderer.setSource(cached);
      lastRenderMs = renderer.render();
      updateTelemetry();
      return;
    }
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      imageCache.set(url, img);
      renderer.setSource(img);
      lastRenderMs = renderer.render();
      updateTelemetry();
    };
    img.src = url;
  }

  function loadUploadedFile(file: File): void {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      sourceLabel = file.name.length > 28 ? `${file.name.slice(0, 25)}…` : file.name;
      renderer.setSource(img);
      lastRenderMs = renderer.render();
      updateTelemetry();
      URL.revokeObjectURL(url);
      section!.querySelectorAll<HTMLButtonElement>('[data-painterly-plate]').forEach((b) => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-tertiary');
        b.setAttribute('aria-pressed', 'false');
      });
    };
    img.src = url;
  }

  // Preset clip-tabs
  section.querySelectorAll<HTMLButtonElement>('[data-painterly-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = (btn.dataset.painterlyPreset as PainterlyPresetId) || 'gouache';
      applyPreset(id, btn);
    });
  });

  // Debug pass buttons
  section.querySelectorAll<HTMLButtonElement>('[data-painterly-debug]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = (btn.dataset.painterlyDebug as PainterlyDebugMode) || 'final';
      section.querySelectorAll<HTMLButtonElement>('[data-painterly-debug]').forEach((b) => {
        const on = b === btn;
        b.classList.toggle('btn-primary', on);
        b.classList.toggle('btn-tertiary', !on);
        b.setAttribute('aria-pressed', String(on));
      });
      renderer.setParams({ debug: mode });
      lastRenderMs = renderer.render();
      updateTelemetry();
    });
  });

  // Sample plate buttons
  section.querySelectorAll<HTMLButtonElement>('[data-painterly-plate]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const plate = btn.dataset.painterlyPlate || 'sample';
      section.querySelectorAll<HTMLButtonElement>('[data-painterly-plate]').forEach((b) => {
        const on = b === btn;
        b.classList.toggle('btn-primary', on);
        b.classList.toggle('btn-tertiary', !on);
        b.setAttribute('aria-pressed', String(on));
      });
      if (plate === 'sample') {
        sourceLabel = 'Lighthouse Dusk (Procedural)';
        renderer.setSource(sampleCanvas);
        lastRenderMs = renderer.render();
        updateTelemetry();
      } else if (plate === 'lighthouse') {
        loadPlateUrl('./plates/lighthouse.jpg', 'plates/lighthouse.jpg');
      } else if (plate === 'sextant') {
        loadPlateUrl('./plates/sextant.jpg', 'plates/sextant.jpg');
      } else if (plate === 'hurricane') {
        loadPlateUrl('./plates/hurricane.jpg', 'plates/hurricane.jpg');
      }
    });
  });

  // Live GPU parameter sliders
  section.querySelectorAll<HTMLInputElement>('[data-painterly-param]').forEach((input) => {
    input.addEventListener('input', () => {
      const key = input.dataset.painterlyParam as keyof PainterlyParams;
      const val = Number(input.value);
      renderer.setParams({ [key]: val } as Partial<PainterlyParams>);
      lastRenderMs = renderer.render();
      syncSlidersToParams();
      updateTelemetry();
    });
  });

  // Upload file input + drag-and-drop onto the stage
  document.getElementById('btn-painterly-upload')?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) loadUploadedFile(file);
    fileInput.value = '';
  });

  stage.addEventListener('dragover', (e) => {
    e.preventDefault();
    stage.dataset.dropOver = 'true';
  });
  stage.addEventListener('dragleave', () => {
    delete stage.dataset.dropOver;
  });
  stage.addEventListener('drop', (e) => {
    e.preventDefault();
    delete stage.dataset.dropOver;
    const file = e.dataTransfer?.files?.[0];
    if (file) loadUploadedFile(file);
  });

  // Interactive 1:1 split curtain pointer drag
  let draggingSplit = false;
  const moveSplit = (clientX: number) => {
    const r = canvas.getBoundingClientRect();
    if (!r.width) return;
    splitPos = clamp((clientX - r.left) / r.width, 0.04, 0.96);
    if (!splitEnabled) splitEnabled = true;
    syncSplitUi();
  };
  stage.addEventListener('pointerdown', (e) => {
    if (!splitEnabled || e.button !== 0) return;
    draggingSplit = true;
    stage.setPointerCapture(e.pointerId);
    moveSplit(e.clientX);
  });
  stage.addEventListener('pointermove', (e) => {
    if (!draggingSplit) return;
    moveSplit(e.clientX);
  });
  const endSplit = () => {
    draggingSplit = false;
  };
  stage.addEventListener('pointerup', endSplit);
  stage.addEventListener('pointercancel', endSplit);

  splitToggleBtn?.addEventListener('click', () => {
    splitEnabled = !splitEnabled;
    syncSplitUi();
  });

  resetBtn?.addEventListener('click', () => {
    splitEnabled = true;
    splitPos = 0.42;
    applyPreset(activePreset);
    syncSplitUi();
  });

  exportBtn?.addEventListener('click', () => {
    renderer.exportPng(`meridian-painterly-${activePreset}.png`);
  });

  // Sync with Meridian 13 surfaces & i18n language switches
  window.addEventListener('meridian:surface', () => {
    const { bg, fg } = readSurfaceHex();
    renderer.setSurfaceColors(bg, fg);
  });
  window.addEventListener('meridian:lang', () => {
    requestAnimationFrame(() => {
      const container = section.querySelector<HTMLElement>('[data-cliptabs="painterly-preset"]');
      const active = container?.querySelector<HTMLElement>('[data-active="true"]') || null;
      syncClipTabsLocal(container, active);
    });
  });

  // Initial mount with vibrant coastal lighthouse sample
  renderer.setSource(sampleCanvas);
  syncSplitUi();
  syncSlidersToParams();
  lastRenderMs = renderer.render();
  updateTelemetry();
  requestAnimationFrame(() => {
    const container = section.querySelector<HTMLElement>('[data-cliptabs="painterly-preset"]');
    const active = container?.querySelector<HTMLElement>('[data-active="true"]') || null;
    syncClipTabsLocal(container, active);
  });
}

bootAtelierPainterlyBridge();
bootPainterlyStudio();
