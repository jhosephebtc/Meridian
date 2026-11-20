/**
 * MERIDIAN STUDIO — preview-app.ts
 * Aplicação de Prévia Real construída 100% em TypeScript estrito importando
 * diretamente os módulos nativos do Meridian Design System (sem frameworks pesados).
 */

import {
  SURFACES,
  type SurfaceId,
  type GrainPreset,
} from './tokens.ts';
import { mountPaperGrain } from './paper-grain.ts';
import {
  renderPlottedGlobeSvg,
  type PlotterRole,
} from './plotter-svg.ts';
import {
  MeridianAtelier,
  createCanvasBackend,
  runMeridianSketch,
  createBotanicalWatercolorSketch,
  createEconWatercolorSketch,
  createCelestialPencilSketch,
  createCrayonCollageSketch,
  type BrushMedium,
  type SketchController,
} from './atelier-engine.ts';

type WorkspaceView = 'today' | 'dossier' | 'observatory';
type ObsPreset = 'econ' | 'celestial' | 'crayon';
type PigmentKey = 'coral' | 'sky' | 'olive' | 'ochre' | 'ink';

const SURFACE_ORDER: readonly SurfaceId[] = ['ivory', 'paper', 'aqua', 'terracotta', 'obsidian'];

const appState = {
  view: 'today' as WorkspaceView,
  surface: 'ivory' as SurfaceId,
  grain: 'editorial' as GrainPreset,
  envHour: 10,
  globeLon: -46,
  globeTilt: 15,
  globeIso: 'all' as PlotterRole | 'all',
  globeDragging: false,
  globeLastX: 0,
  globeLastY: 0,
  obsPreset: 'econ' as ObsPreset,
  obsBrush: 'watercolor' as BrushMedium,
  obsPigment: 'coral' as PigmentKey,
};

let heroSketchCtrl: SketchController | null = null;
let obsSketchCtrl: SketchController | null = null;
let freehandAtelier: MeridianAtelier | null = null;

/* ==========================================================================
   1. PAPER GRAIN 512×512 & TOASTS SONNER (CSS TRANSITIONS INTERRUPTÍVEIS)
   ========================================================================== */
mountPaperGrain();

const toastRegion = document.getElementById('app-toasts')!;

function showToast(message: string): void {
  const item = document.createElement('div');
  item.className = 'ds-toast';
  item.dataset.state = 'entering';
  item.innerHTML = `<span>${message}</span><button type="button" style="background:none;border:0;color:inherit;opacity:.65;cursor:pointer;" aria-label="Fechar">✕</button>`;
  toastRegion.appendChild(item);
  requestAnimationFrame(() => requestAnimationFrame(() => { item.dataset.state = 'open'; }));

  const close = () => {
    if (item.dataset.state === 'closing') return;
    item.dataset.state = 'closing';
    window.setTimeout(() => item.remove(), 240);
  };
  item.querySelector('button')?.addEventListener('click', close);
  let timer = window.setTimeout(close, 3000);
  item.addEventListener('pointerenter', () => clearTimeout(timer));
  item.addEventListener('pointerleave', () => { timer = window.setTimeout(close, 1200); });
  while (toastRegion.children.length > 3) toastRegion.firstElementChild?.remove();
}

/* ==========================================================================
   2. CLIP-PATH SEAMLESS TABS (Emil Kowalski)
   ========================================================================== */
function syncClipTabs(container: HTMLElement | null, activeBtn: HTMLElement | null): void {
  if (!container || !activeBtn) return;
  const track = container.querySelector<HTMLElement>('.ds-cliptabs-track');
  const overlay = container.querySelector<HTMLElement>('.ds-cliptabs-overlay');
  if (!track || !overlay) return;

  container.querySelectorAll<HTMLElement>('.ds-cliptabs-btn').forEach((b) => {
    b.dataset.active = b === activeBtn ? 'true' : 'false';
  });
  const tw = track.offsetWidth || 1;
  const leftPct = (activeBtn.offsetLeft / tw) * 100;
  const rightPct = 100 - ((activeBtn.offsetLeft + activeBtn.offsetWidth) / tw) * 100;
  overlay.style.clipPath = `inset(0 ${Math.max(0, rightPct).toFixed(2)}% 0 ${Math.max(0, leftPct).toFixed(2)}% round 9999px)`;
}

/* ==========================================================================
   3. WORKSPACE NAVIGATION & 5-SURFACE SINGLE-INK ENGINE
   ========================================================================== */
function setView(view: WorkspaceView): void {
  appState.view = view;
  const mode = view === 'observatory' ? 'technical' : 'invisible';
  document.documentElement.setAttribute('data-mode', mode);

  (['today', 'dossier', 'observatory'] as const).forEach((v) => {
    const el = document.getElementById(`view-${v}`);
    if (el) el.hidden = v !== view;
  });

  const navContainer = document.querySelector<HTMLElement>('[data-cliptabs="workspace-nav"]');
  const activeNavBtn = navContainer?.querySelector<HTMLElement>(`[data-view="${view}"]`) ?? null;
  syncClipTabs(navContainer, activeNavBtn);

  document.querySelectorAll<HTMLButtonElement>('[data-view-mobile]').forEach((b) => {
    const active = b.dataset.viewMobile === view;
    b.classList.toggle('ds-btn-primary', active);
    b.classList.toggle('ds-btn-tertiary', !active);
  });

  if (view === 'today') mountHeroWatercolor();
  if (view === 'observatory') {
    renderGlobe();
    mountObservatorySketch();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setSurface(surface: SurfaceId, announce = true): void {
  appState.surface = surface;
  document.documentElement.setAttribute('data-surface', surface);
  document.getElementById('meta-theme-color')?.setAttribute('content', SURFACES[surface].bg);
  document.querySelectorAll<HTMLButtonElement>('[data-surface-pick]').forEach((b) => {
    b.setAttribute('aria-pressed', b.dataset.surfacePick === surface ? 'true' : 'false');
  });

  renderEnvCompass();
  renderGlobe();
  if (appState.view === 'today') mountHeroWatercolor();
  if (appState.view === 'observatory') mountObservatorySketch();
  if (announce) showToast(`Atmosfera: ${SURFACES[surface].label}`);
}

function setGrain(grain: GrainPreset): void {
  appState.grain = grain;
  document.documentElement.setAttribute('data-grain', grain);
  document.querySelectorAll<HTMLButtonElement>('[data-grain-pick]').forEach((b) => {
    const active = b.dataset.grainPick === grain;
    b.classList.toggle('ds-btn-primary', active);
    b.classList.toggle('ds-btn-tertiary', !active);
  });
  showToast(`Ruído PaperGrain: ${grain}`);
}

/* ==========================================================================
   4. ATELIER GENERATIVO 100% TYPESCRIPT (Hero + Observatório Freehand)
   ========================================================================== */
function mountHeroWatercolor(seed = 20261120): void {
  const canvas = document.getElementById('hero-watercolor-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;
  heroSketchCtrl?.destroy();
  heroSketchCtrl = runMeridianSketch(canvas, createBotanicalWatercolorSketch(), {
    surface: appState.surface,
    seed,
    maxFrames: 28,
    respectReducedMotion: true,
  });
}

function getObsSketch() {
  if (appState.obsPreset === 'celestial') return createCelestialPencilSketch();
  if (appState.obsPreset === 'crayon') return createCrayonCollageSketch();
  return createEconWatercolorSketch();
}

function mountObservatorySketch(seed = 20261120): void {
  const canvas = document.getElementById('obs-atelier-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;
  obsSketchCtrl?.destroy();
  const maxFrames = appState.obsPreset === 'econ' ? 92 : 30;
  obsSketchCtrl = runMeridianSketch(canvas, getObsSketch(), {
    surface: appState.surface,
    seed,
    maxFrames,
    respectReducedMotion: true,
  });
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  freehandAtelier = new MeridianAtelier(createCanvasBackend(canvas, dpr), {
    surface: appState.surface,
    seed: seed + 7,
  });
}

/* ==========================================================================
   5. BÚSSOLA AMBIENTAL SVG 1:1 & LIFELINE 24H ARRASTÁVEL 1:1
   ========================================================================== */
const ENV_HOURS = Array.from({ length: 24 }, (_, h) => {
  const aqi = Math.round(22 + Math.sin(((h - 5) / 24) * Math.PI * 2) * 14 + (h >= 17 && h <= 20 ? 16 : 0));
  const temp = Math.round(19 + Math.sin(((h - 8) / 24) * Math.PI * 2) * 7 + 3);
  let status = 'Favorável';
  let note = 'Ar limpo e temperatura confortável — excelente janela para parque ou caminhada.';
  if (h >= 12 && h <= 15) {
    status = 'Sol Forte';
    note = 'Radiação UV elevada; priorize sombra, hidratação e geração fotovoltaica no máximo.';
  } else if (aqi >= 42) {
    status = 'Moderado';
    note = 'Pico de tráfego eleva PM2.5 — prefira vias arborizadas ou ambientes ventilados.';
  }
  return { h, aqi, temp, status, note };
});

function renderEnvCompass(): void {
  const svg = document.getElementById('preview-env-svg');
  if (!svg) return;
  const t = SURFACES[appState.surface];
  const cur = ENV_HOURS[appState.envHour];
  const cx = 200, cy = 200, R = 146;

  let out = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${t.ruleStrong}" stroke-width="1"/>`;
  out += `<circle cx="${cx}" cy="${cy}" r="${R - 36}" fill="none" stroke="${t.rule}" stroke-width="0.9"/>`;
  out += `<circle cx="${cx}" cy="${cy}" r="54" fill="${t.bgTintSubtle}" stroke="${t.ruleStrong}" stroke-width="1"/>`;

  for (const d of ENV_HOURS) {
    const rad = ((d.h * 15 - 90) * Math.PI) / 180;
    const len = 12 + (d.aqi / 55) * 28;
    const r1 = R - 34;
    const r2 = r1 + len;
    const col = d.h === cur.h ? t.fg : d.aqi >= 42 ? t.organic.coral : d.h >= 12 && d.h <= 15 ? t.organic.sky : t.organic.olive;
    out += `<line x1="${(cx + Math.cos(rad) * r1).toFixed(1)}" y1="${(cy + Math.sin(rad) * r1).toFixed(1)}" x2="${(cx + Math.cos(rad) * r2).toFixed(1)}" y2="${(cy + Math.sin(rad) * r2).toFixed(1)}" stroke="${col}" stroke-width="${d.h === cur.h ? 3.5 : 1.8}" stroke-linecap="round" opacity="${d.h === cur.h ? 1 : 0.65}"/>`;
    if (d.h % 6 === 0) {
      out += `<text x="${(cx + Math.cos(rad) * (R + 18)).toFixed(1)}" y="${(cy + Math.sin(rad) * (R + 18) + 4).toFixed(1)}" text-anchor="middle" fill="${t.fgMuted}" font-family="monospace" font-size="10">${String(d.h).padStart(2, '0')}h</text>`;
    }
  }

  const aRad = ((cur.h * 15 - 90) * Math.PI) / 180;
  const nx = cx + Math.cos(aRad) * (R - 42);
  const ny = cy + Math.sin(aRad) * (R - 42);
  out += `<line x1="${cx}" y1="${cy}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="${t.fg}" stroke-width="1.5" stroke-dasharray="3 3"/>`;
  out += `<circle cx="${nx.toFixed(1)}" cy="${ny.toFixed(1)}" r="4.5" fill="${t.fg}"/>`;
  out += `<text x="${cx}" y="${cy - 8}" text-anchor="middle" fill="${t.fgMuted}" font-family="monospace" font-size="10">AQI</text>`;
  out += `<text x="${cx}" y="${cy + 20}" text-anchor="middle" fill="${t.fg}" font-family="Georgia, serif" font-size="34">${cur.aqi}</text>`;
  out += `<text x="${cx}" y="${cy + 36}" text-anchor="middle" fill="${t.fgMuted}" font-family="monospace" font-size="10">${cur.temp}°C · ${String(cur.h).padStart(2, '0')}:00</text>`;

  svg.innerHTML = out;
  document.getElementById('preview-hour-readout')!.textContent = `${String(cur.h).padStart(2, '0')}:00 · AQI ${cur.aqi} · ${cur.temp}°C`;
  document.getElementById('preview-env-badge')!.textContent = cur.status;
  document.getElementById('preview-hour-note')!.textContent = cur.note;
}

const LIFELINE_EVENTS = [
  { t: '06:30', title: 'Brisa Limpa · AQI 21', text: 'Melhor ar do dia para corrida leve e abrir janelas.' },
  { t: '10:00', title: 'Janela Segura · 23°C', text: 'Asfalto fresco e pólen baixo para passeio em família.' },
  { t: '13:00', title: 'Pico Solar · 28°C', text: 'Geração fotovoltaica máxima (+4.6 kWh); evitar sol direto.' },
  { t: '16:45', title: 'Chuva Isolada (62%)', text: 'Frente úmida local prevista pela Google Weather API.' },
  { t: '20:00', title: 'Noite Estável · 21°C', text: 'Conforto térmico elevado e queda rápida de PM2.5.' },
];

function initLifeline(): void {
  const track = document.getElementById('preview-ll-track');
  const viewport = document.getElementById('preview-ll-viewport');
  if (!track || !viewport) return;

  track.innerHTML = '<div class="ll-rail"></div>' + LIFELINE_EVENTS.map((ev, i) => `
    <button class="ll-node" data-ll="${i}" aria-pressed="${i === 1 ? 'true' : 'false'}">
      <span class="ll-time">${ev.t}</span>
      <span class="ll-dot"></span>
      <div style="font-family:var(--ds-font-display); font-size:18px; line-height:1.15; margin-bottom:4px;">${ev.title}</div>
      <div style="font-size:12px; color:var(--ds-fg-muted);">${ev.text}</div>
    </button>
  `).join('');

  let dragging = false, startX = 0, startScroll = 0, lastX = 0, lastT = 0, vx = 0, raf = 0;

  viewport.addEventListener('pointerdown', (e) => {
    cancelAnimationFrame(raf);
    dragging = true;
    startX = lastX = e.clientX;
    startScroll = viewport.scrollLeft;
    lastT = performance.now();
    vx = 0;
    viewport.dataset.dragging = 'true';
    viewport.setPointerCapture(e.pointerId);
  });
  viewport.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const now = performance.now();
    const dt = Math.max(1, now - lastT);
    vx = (lastX - e.clientX) / dt;
    lastX = e.clientX;
    lastT = now;
    viewport.scrollLeft = startScroll - (e.clientX - startX);
  });
  const stop = () => {
    if (!dragging) return;
    dragging = false;
    viewport.dataset.dragging = 'false';
    let v = vx * 16;
    const step = () => {
      if (Math.abs(v) < 0.25) return;
      viewport.scrollLeft += v;
      v *= 0.92;
      raf = requestAnimationFrame(step);
    };
    if (Math.abs(v) > 0.6) raf = requestAnimationFrame(step);
  };
  viewport.addEventListener('pointerup', stop);
  viewport.addEventListener('pointercancel', stop);

  track.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.ll-node');
    if (!btn) return;
    track.querySelectorAll('.ll-node').forEach((n) => n.setAttribute('aria-pressed', n === btn ? 'true' : 'false'));
  });

  document.getElementById('ll-left')?.addEventListener('click', () => viewport.scrollBy({ left: -220, behavior: 'smooth' }));
  document.getElementById('ll-right')?.addEventListener('click', () => viewport.scrollBy({ left: 220, behavior: 'smooth' }));
}

/* ==========================================================================
   6. GLOBO PLOTTER 81K INTERATIVO (`renderPlottedGlobeSvg`)
   ========================================================================== */
function renderGlobe(): void {
  const stage = document.getElementById('preview-globe-stage');
  if (!stage) return;
  stage.innerHTML = renderPlottedGlobeSvg({
    rotLonDeg: appState.globeLon,
    tiltLatDeg: appState.globeTilt,
    isolateRole: appState.globeIso,
  });
}

function initGlobeControls(): void {
  const stage = document.getElementById('preview-globe-stage');
  if (!stage) return;

  stage.addEventListener('pointerdown', (e) => {
    appState.globeDragging = true;
    appState.globeLastX = e.clientX;
    appState.globeLastY = e.clientY;
    stage.dataset.dragging = 'true';
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', (e) => {
    if (!appState.globeDragging) return;
    appState.globeLon -= (e.clientX - appState.globeLastX) * 0.45;
    appState.globeTilt = Math.max(-45, Math.min(45, appState.globeTilt + (e.clientY - appState.globeLastY) * 0.35));
    appState.globeLastX = e.clientX;
    appState.globeLastY = e.clientY;
    renderGlobe();
  });
  const end = () => { appState.globeDragging = false; stage.dataset.dragging = 'false'; };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);

  document.getElementById('btn-export-globe')?.addEventListener('click', () => {
    const raw = renderPlottedGlobeSvg({ rotLonDeg: appState.globeLon, tiltLatDeg: appState.globeTilt });
    const blob = new Blob([raw], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meridian-globe-81k.svg';
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('SVG Plotter exportado (meridian-globe-81k.svg)');
  });
}

/* ==========================================================================
   7. PINTURA LIVRE NO ATELIER DO OBSERVATÓRIO + ⌘K INSTANTÂNEO (0ms)
   ========================================================================== */
function initObservatoryFreehand(): void {
  const canvas = document.getElementById('obs-atelier-canvas') as HTMLCanvasElement | null;
  if (!canvas) return;

  let painting = false;
  let lastPt = { x: 0, y: 0 };

  const toPt = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    return {
      x: ((e.clientX - rect.left) / rect.width) * (canvas.width / dpr),
      y: ((e.clientY - rect.top) / rect.height) * (canvas.height / dpr),
    };
  };

  const pigmentHex = () => {
    const t = SURFACES[appState.surface];
    return appState.obsPigment === 'ink' ? t.fg : t.organic[appState.obsPigment];
  };

  canvas.addEventListener('pointerdown', (e) => {
    if (!freehandAtelier) return;
    painting = true;
    canvas.setPointerCapture(e.pointerId);
    lastPt = toPt(e);
    if (appState.obsBrush === 'watercolor') {
      freehandAtelier.watercolorWash(freehandAtelier.organicBlob(lastPt.x, lastPt.y, 18, 15, 9), pigmentHex(), { layers: 8, bleed: 0.34 });
    }
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!painting || !freehandAtelier) return;
    const pt = toPt(e);
    if (Math.hypot(pt.x - lastPt.x, pt.y - lastPt.y) < 3) return;
    const seg = [lastPt, pt] as const;
    const hex = pigmentHex();
    if (appState.obsBrush === 'watercolor') {
      freehandAtelier.watercolorWash(freehandAtelier.organicBlob(pt.x, pt.y, 15, 13, 8), hex, { layers: 5, bleed: 0.32, wetEdgeRing: false });
    } else if (appState.obsBrush === 'pencil') {
      freehandAtelier.graphitePencil(seg, hex, { grade: '4B', pressure: 1 });
    } else if (appState.obsBrush === 'crayon') {
      freehandAtelier.waxCrayon(seg, hex, { thickness: 12, tooth: 0.52 });
    } else {
      freehandAtelier.inkBrush(seg, hex, { width: 8, bristles: 7, dryness: 0.34 });
    }
    lastPt = pt;
  });
  const end = () => { painting = false; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
}

/* ==========================================================================
   8. WIRING GLOBAL, ⌘K (0ms) & HOLD-TO-CONFIRM ASSIMÉTRICO
   ========================================================================== */
function bootstrap(): void {
  initLifeline();
  initGlobeControls();
  initObservatoryFreehand();

  const paperBtn = document.getElementById('btn-paper-pop')!;
  const paperPop = document.getElementById('paper-pop')!;
  const setPaperPop = (open: boolean) => {
    paperPop.dataset.open = open ? 'true' : 'false';
    paperBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  paperBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setPaperPop(paperPop.dataset.open !== 'true');
  });

  // Instant ⌘K Palette (0ms — Emil Kowalski Frequency Gate)
  const cmdkBackdrop = document.getElementById('app-cmdk-backdrop')!;
  const cmdkInput = document.getElementById('app-cmdk-input') as HTMLInputElement;
  const cmdkList = document.getElementById('app-cmdk-list')!;
  const cmdkActions = [
    { label: 'Tela: Edição de Hoje (B2C Invisível)', hint: 'V1', run: () => setView('today') },
    { label: 'Tela: Dossiê Endereço (#11 Deimos 3-Col)', hint: 'V2', run: () => setView('dossier') },
    { label: 'Tela: Observatório Pro (Globo 81k + Aquarela)', hint: 'V3', run: () => setView('observatory') },
    ...SURFACE_ORDER.map((s, idx) => ({
      label: `Atmosfera: ${SURFACES[s].label} (${SURFACES[s].bg})`,
      hint: String(idx + 1),
      run: () => setSurface(s),
    })),
    { label: 'Ir para Showcase completo do Design System', hint: '↗', run: () => { window.location.href = './index.html'; } },
  ];

  let cmdkFiltered = cmdkActions.slice();
  let cmdkIdx = 0;

  const renderCmdk = () => {
    const q = cmdkInput.value.trim().toLowerCase();
    cmdkFiltered = cmdkActions.filter((a) => a.label.toLowerCase().includes(q));
    cmdkIdx = Math.min(cmdkIdx, Math.max(0, cmdkFiltered.length - 1));
    cmdkList.innerHTML = cmdkFiltered.map((a, i) => `
      <button type="button" class="cmdk-item-btn" data-cmd-idx="${i}" data-selected="${i === cmdkIdx ? 'true' : 'false'}">
        <span>${a.label}</span><span class="kbd-chip">${a.hint}</span>
      </button>
    `).join('') || `<div class="ds-mono" style="padding:14px; font-size:12px; color:var(--ds-fg-muted);">Nenhum comando encontrado.</div>`;
    cmdkList.querySelectorAll<HTMLButtonElement>('[data-cmd-idx]').forEach((btn, i) => {
      btn.addEventListener('click', () => { setCmdk(false); cmdkFiltered[i]?.run(); });
    });
  };

  const setCmdk = (open: boolean) => {
    cmdkBackdrop.dataset.open = open ? 'true' : 'false';
    if (open) { cmdkInput.value = ''; cmdkIdx = 0; renderCmdk(); cmdkInput.focus(); }
  };

  cmdkInput.addEventListener('input', () => { cmdkIdx = 0; renderCmdk(); });
  cmdkBackdrop.addEventListener('click', (e) => { if (e.target === cmdkBackdrop) setCmdk(false); });
  document.getElementById('btn-cmdk')?.addEventListener('click', () => setCmdk(true));

  // Hold-to-Confirm Assimétrico (1.4s linear / 180ms ease-out)
  const holdBtn = document.getElementById('btn-hold-backtest')!;
  let holdTimer = 0;
  const startHold = () => {
    holdBtn.dataset.holding = 'true';
    clearTimeout(holdTimer);
    holdTimer = window.setTimeout(() => {
      holdBtn.dataset.holding = 'false';
      showToast('Backtest BigQuery concluído: Score 84.2% (Tier A)');
    }, 1400);
  };
  const stopHold = () => { clearTimeout(holdTimer); holdBtn.dataset.holding = 'false'; };
  holdBtn.addEventListener('pointerdown', startHold);
  holdBtn.addEventListener('pointerup', stopHold);
  holdBtn.addEventListener('pointerleave', stopHold);
  holdBtn.addEventListener('pointercancel', stopHold);

  // Event delegation
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (paperPop.dataset.open === 'true' && !target.closest('.popover-wrap')) setPaperPop(false);

    const viewBtn = target.closest<HTMLElement>('[data-view], [data-view-mobile], [data-jump-view]');
    if (viewBtn) {
      const next = (viewBtn.dataset.view || viewBtn.dataset.viewMobile || viewBtn.dataset.jumpView) as WorkspaceView;
      setView(next);
      return;
    }

    const surf = target.closest<HTMLElement>('[data-surface-pick]');
    if (surf?.dataset.surfacePick) { setSurface(surf.dataset.surfacePick as SurfaceId); return; }

    const gr = target.closest<HTMLElement>('[data-grain-pick]');
    if (gr?.dataset.grainPick) { setGrain(gr.dataset.grainPick as GrainPreset); return; }

    const cite = target.closest<HTMLElement>('[data-cite-id]');
    if (cite?.dataset.citeId) {
      const id = cite.dataset.citeId;
      document.querySelectorAll<HTMLElement>('.ds-claim').forEach((c) => { c.dataset.highlighted = c.dataset.citeId === id ? 'true' : 'false'; });
      document.querySelectorAll<HTMLElement>('.source-item').forEach((s) => { s.dataset.flash = 'false'; });
      const row = document.getElementById(`dos-src-${id}`);
      if (row) { row.dataset.flash = 'true'; row.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
      showToast(`Fonte 0${id} destacada no Dossiê`);
      return;
    }

    const vol = target.closest<HTMLElement>('.ds-volume');
    if (vol) {
      const open = vol.dataset.open === 'true';
      document.querySelectorAll<HTMLElement>('.ds-volume').forEach((v) => { v.dataset.open = 'false'; });
      vol.dataset.open = open ? 'false' : 'true';
      return;
    }

    const iso = target.closest<HTMLButtonElement>('[data-iso]');
    if (iso?.dataset.iso) {
      appState.globeIso = iso.dataset.iso as PlotterRole | 'all';
      document.querySelectorAll<HTMLButtonElement>('[data-iso]').forEach((b) => {
        b.classList.toggle('ds-btn-primary', b === iso);
        b.classList.toggle('ds-btn-tertiary', b !== iso);
      });
      renderGlobe();
      return;
    }

    const br = target.closest<HTMLButtonElement>('[data-obs-brush]');
    if (br?.dataset.obsBrush) {
      appState.obsBrush = br.dataset.obsBrush as BrushMedium;
      document.querySelectorAll<HTMLButtonElement>('[data-obs-brush]').forEach((b) => {
        b.classList.toggle('ds-btn-primary', b === br);
        b.classList.toggle('ds-btn-tertiary', b !== br);
      });
      return;
    }

    const pig = target.closest<HTMLButtonElement>('[data-obs-pigment]');
    if (pig?.dataset.obsPigment) {
      appState.obsPigment = pig.dataset.obsPigment as PigmentKey;
      document.querySelectorAll<HTMLButtonElement>('[data-obs-pigment]').forEach((b) => {
        b.setAttribute('aria-pressed', b === pig ? 'true' : 'false');
      });
    }
  });

  document.getElementById('preview-hour-range')?.addEventListener('input', (e) => {
    appState.envHour = Number((e.target as HTMLInputElement).value);
    renderEnvCompass();
  });
  document.getElementById('btn-replay-hero-art')?.addEventListener('click', () => {
    mountHeroWatercolor(Math.floor(Math.random() * 999999));
    showToast('Nova composição em aquarela gerada (atelier-engine.ts)');
  });
  document.getElementById('btn-obs-replay')?.addEventListener('click', () => mountObservatorySketch(Math.floor(Math.random() * 999999)));
  document.getElementById('btn-obs-preset')?.addEventListener('click', () => {
    const order: ObsPreset[] = ['econ', 'celestial', 'crayon'];
    appState.obsPreset = order[(order.indexOf(appState.obsPreset) + 1) % order.length];
    mountObservatorySketch();
    showToast(`Preset Atelier: ${appState.obsPreset}`);
  });

  // Scroll hairline
  const topbar = document.getElementById('app-topbar')!;
  const progress = document.getElementById('app-scroll-progress')!;
  window.addEventListener('scroll', () => {
    topbar.dataset.scrolled = window.scrollY > 10 ? 'true' : 'false';
    const maxS = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progress.style.transform = `scaleX(${Math.min(1, window.scrollY / maxS).toFixed(4)})`;
  }, { passive: true });

  // Keyboard shortcuts & accessibility
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      setCmdk(cmdkBackdrop.dataset.open !== 'true');
      return;
    }
    if (cmdkBackdrop.dataset.open === 'true') {
      if (e.key === 'Escape') { setCmdk(false); return; }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        cmdkIdx = (cmdkIdx + 1) % Math.max(1, cmdkFiltered.length);
        renderCmdk();
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        cmdkIdx = (cmdkIdx - 1 + Math.max(1, cmdkFiltered.length)) % Math.max(1, cmdkFiltered.length);
        renderCmdk();
        return;
      }
      if (e.key === 'Enter' && cmdkFiltered[cmdkIdx]) {
        e.preventDefault();
        const chosen = cmdkFiltered[cmdkIdx];
        setCmdk(false);
        chosen.run();
        return;
      }
      return;
    }
    if (e.key === 'Escape') { setPaperPop(false); return; }
    const activeEl = document.activeElement as HTMLElement | null;
    if ((e.key === 'Enter' || e.key === ' ') && activeEl?.classList.contains('ds-volume')) {
      e.preventDefault();
      activeEl.click();
      return;
    }
    if ((e.target as HTMLElement).matches('input, textarea, select')) return;
    if (e.key === '/') { e.preventDefault(); setCmdk(true); }
    else if (['1', '2', '3', '4', '5'].includes(e.key)) setSurface(SURFACE_ORDER[Number(e.key) - 1]);
  });

  // Initial render
  setSurface('ivory', false);
  setView('today');
  window.addEventListener('resize', () => {
    const nav = document.querySelector<HTMLElement>('[data-cliptabs="workspace-nav"]');
    syncClipTabs(nav, nav?.querySelector<HTMLElement>(`[data-view="${appState.view}"]`) ?? null);
  });
}

bootstrap();
