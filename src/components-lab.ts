import './site-chrome';
import { mountPaperGrain, bootPaperGrainExtras } from './paper-grain.ts';
import { markPageReady } from './page-enter.ts';
import { createTimeline } from './timeline.ts';
import { mountHairlineFigure, type HairlinePreset } from './hairline-figure.ts';
import {
  CATEGORY_LABELS,
  COMPONENT_CATALOG,
  type CatalogItem,
  type ComponentCategory,
  type DemoKind,
  buildInstallPrompt,
  buildSystemInstallPrompt,
  installCommand,
  resolveComponentTarget,
} from './component-catalog.ts';
import { getLang, initI18n, type Lang } from './i18n';
import './i18n.css';

const REGISTRY_BASE = `${location.origin}${location.pathname.replace(/[^/]*$/, '')}r`;

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function qs<T extends Element>(root: ParentNode, sel: string): T {
  const el = root.querySelector(sel);
  if (!el) throw new Error(`Missing ${sel}`);
  return el as T;
}

/* ---------- Demo builders ---------- */

function inkPress(btn: HTMLElement, e: PointerEvent): void {
  const r = btn.getBoundingClientRect();
  btn.style.setProperty('--ml-press-x', `${e.clientX - r.left}px`);
  btn.style.setProperty('--ml-press-y', `${e.clientY - r.top}px`);
  btn.dataset.pressed = 'true';
  btn.dataset.ink = 'true';
  window.setTimeout(() => {
    delete btn.dataset.ink;
  }, 420);
}

function bindLabPressInk(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('.ml-btn').forEach((btn) => {
    if (btn.dataset.inkBound === 'true') return;
    btn.dataset.inkBound = 'true';
    btn.addEventListener('pointerdown', (e) => {
      if (btn.hasAttribute('disabled')) return;
      inkPress(btn, e);
    });
    btn.addEventListener('pointerup', () => delete btn.dataset.pressed);
    btn.addEventListener('pointercancel', () => delete btn.dataset.pressed);
    btn.addEventListener('pointerleave', () => delete btn.dataset.pressed);
  });
}

function demoButton(): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'ml-btn-row';
  for (const [label, cls] of [
    ['Primary', 'ml-btn ml-btn-primary'],
    ['Secondary', 'ml-btn'],
    ['Ghost', 'ml-btn ml-btn-ghost'],
  ] as const) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = cls;
    btn.textContent = label;
    wrap.append(btn);
  }
  bindLabPressInk(wrap);
  return wrap;
}

function bindSlider(root: HTMLElement, initial = 42): void {
  const track = qs<HTMLElement>(root, '.ml-slider-track');
  const input = qs<HTMLInputElement>(root, 'input');
  const readout = qs<HTMLElement>(root, '.ml-slider-readout');
  let dragging = false;

  const paint = (v: number) => {
    const pct = ((v - Number(input.min)) / (Number(input.max) - Number(input.min))) * 100;
    root.style.setProperty('--ml-slider-pct', `${pct}%`);
    readout.textContent = `${Math.round(v)}%`;
    input.value = String(v);
  };

  const fromPointer = (clientX: number) => {
    const r = track.getBoundingClientRect();
    const t = clamp((clientX - r.left) / r.width, 0, 1);
    paint(Number(input.min) + t * (Number(input.max) - Number(input.min)));
  };

  paint(initial);
  input.addEventListener('input', () => paint(input.valueAsNumber));

  const onDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    dragging = true;
    root.dataset.dragging = 'true';
    track.setPointerCapture(e.pointerId);
    fromPointer(e.clientX);
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    fromPointer(e.clientX);
  };
  const onUp = () => {
    dragging = false;
    delete root.dataset.dragging;
  };
  track.addEventListener('pointerdown', onDown);
  track.addEventListener('pointermove', onMove);
  track.addEventListener('pointerup', onUp);
  track.addEventListener('pointercancel', onUp);
}

function demoSlider(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ml-slider';
  el.innerHTML = `
    <div class="ml-slider-track">
      <div class="ml-slider-range"></div>
      <div class="ml-slider-thumb"></div>
      <input type="range" min="0" max="100" step="1" aria-label="Slider" />
    </div>
    <div class="ml-slider-readout"></div>`;
  bindSlider(el);
  return el;
}

function demoSwitch(): HTMLElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'ml-switch';
  btn.setAttribute('role', 'switch');
  btn.setAttribute('aria-checked', 'false');
  btn.innerHTML = '<span class="ml-switch-thumb" aria-hidden="true"></span>';
  btn.addEventListener('click', () => {
    const next = btn.getAttribute('aria-checked') !== 'true';
    btn.setAttribute('aria-checked', String(next));
  });
  return btn;
}

function bindDial(root: HTMLElement, opts: { detent?: boolean } = {}): void {
  const input = qs<HTMLInputElement>(root, 'input');
  const min = 0;
  const max = 100;
  let dragId: number | null = null;

  const paint = (v: number) => {
    const f = (v - min) / (max - min);
    root.style.setProperty('--ml-dial-turn', `${-135 + f * 270}deg`);
    input.value = String(v);
    const out = root.querySelector('.ml-dial-out');
    if (out) out.textContent = `${Math.round(v)}`;
  };

  const fromPointer = (e: PointerEvent) => {
    const b = root.getBoundingClientRect();
    const dx = e.clientX - (b.left + b.width / 2);
    const dy = e.clientY - (b.top + b.height / 2);
    if (Math.hypot(dx, dy) < 8) return;
    const pointerAngle = (((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360);
    const turn =
      pointerAngle > 135 && pointerAngle < 225
        ? pointerAngle < 180
          ? 135
          : -135
        : pointerAngle >= 225
          ? pointerAngle - 360
          : pointerAngle;
    let raw = min + ((turn + 135) / 270) * (max - min);
    if (opts.detent) raw = Math.round(raw / 10) * 10;
    paint(clamp(raw, min, max));
  };

  paint(35);
  input.addEventListener('input', () => paint(input.valueAsNumber));
  input.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    input.focus();
    input.setPointerCapture(e.pointerId);
    dragId = e.pointerId;
    root.dataset.dragging = 'true';
    fromPointer(e);
  });
  input.addEventListener('pointermove', (e) => {
    if (dragId !== e.pointerId) return;
    fromPointer(e);
  });
  const release = () => {
    dragId = null;
    delete root.dataset.dragging;
  };
  input.addEventListener('pointerup', release);
  input.addEventListener('pointercancel', release);
  input.addEventListener('lostpointercapture', release);
}

function demoDial(kind = 'dial'): HTMLElement {
  const detent = kind === 'detent-dial' || kind === 'camera-dial';
  const knurlCount = kind === 'camera-wheel' ? 19 : 11;
  const tickCount = kind === 'camera-dial' ? 13 : 21;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const deg = -135 + (i / (tickCount - 1)) * 270;
    const a = ((deg - 90) * Math.PI) / 180;
    const r0 = i % 2 === 0 ? 43 : 45.5;
    const r1 = 49;
    return `<line data-plotter-role="${i % 2 === 0 ? 'secondary' : 'guide'}" x1="${(60 + Math.cos(a) * r0).toFixed(1)}" y1="${(57 + Math.sin(a) * r0).toFixed(1)}" x2="${(60 + Math.cos(a) * r1).toFixed(1)}" y2="${(57 + Math.sin(a) * r1).toFixed(1)}" stroke="currentColor"/>`;
  }).join('');
  const knurls = Array.from({ length: knurlCount }, (_, i) => {
    const a = (Math.PI * (i + 1)) / (knurlCount + 1);
    const x = 60 - Math.cos(a) * 31;
    const yTop = 57 + Math.sin(a) * 31;
    const yBot = 63 + Math.sin(a) * 31;
    return `<line data-plotter-role="secondary" x1="${x.toFixed(1)}" y1="${yTop.toFixed(1)}" x2="${x.toFixed(1)}" y2="${yBot.toFixed(1)}" stroke="currentColor" opacity="0.28"/>`;
  }).join('');

  const el = document.createElement('div');
  el.className = 'ml-dial';
  el.innerHTML = `
    <svg class="ml-svg" data-plotter data-hairline viewBox="0 0 120 120" aria-hidden="true">
      <circle data-plotter-role="guide" cx="60" cy="60" r="54" fill="none" stroke="currentColor"/>
      ${ticks}
      <!-- 3D Cylindrical Skirt + Side Wall -->
      <path data-plotter-role="primary" d="M 29 57 L 29 63 A 31 31 0 0 0 91 63 L 91 57 Z" fill="var(--ds-bg)" stroke="currentColor"/>
      ${knurls}
      <!-- 3D Top Circular Platter -->
      <circle data-plotter-role="primary" cx="60" cy="57" r="31" fill="var(--ds-bg)" stroke="currentColor"/>
      <!-- Open Front-Facing Chamfer Crease -->
      <path data-plotter-role="secondary" d="M 34.5 57 A 25.5 25.5 0 0 0 85.5 57" fill="none" stroke="currentColor" opacity="0.32"/>
      ${kind === 'camera-dial' ? '<circle data-plotter-role="secondary" cx="60" cy="57" r="16" fill="none" stroke="currentColor" opacity="0.26"/>' : ''}
      <g class="ml-dial-knob">
        <line data-plotter-role="primary" x1="60" y1="45" x2="60" y2="30" stroke="currentColor"/>
        <circle data-plotter-role="primary" cx="60" cy="34" r="1.3" fill="currentColor" stroke="none"/>
      </g>
    </svg>
    <input type="range" min="0" max="100" step="${detent ? 10 : 1}" aria-label="Dial" />
    <div class="ml-slider-readout ml-dial-out" style="position:absolute;inset:auto 0 2px;pointer-events:none"></div>`;
  bindDial(el, { detent });
  return el;
}

function demoBarSlider(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ml-bar';
  el.setAttribute('role', 'slider');
  el.setAttribute('aria-valuemin', '0');
  el.setAttribute('aria-valuemax', '11');
  el.setAttribute('aria-label', 'Bar slider');
  el.tabIndex = 0;
  let value = 5;
  let dragging = false;
  const cells: HTMLButtonElement[] = [];
  const paint = (animate = true) => {
    cells.forEach((c, i) => {
      const on = i <= value;
      c.dataset.on = String(on);
      c.dataset.edge = String(i === value);
      if (animate) c.style.setProperty('--ml-bar-delay', `${Math.abs(i - value) * 12}ms`);
    });
    el.setAttribute('aria-valuenow', String(value));
  };
  const valueFromClientX = (clientX: number) => {
    const r = el.getBoundingClientRect();
    const t = clamp((clientX - r.left) / r.width, 0, 1);
    return Math.round(t * (cells.length - 1));
  };
  const setFromPointer = (clientX: number) => {
    const next = valueFromClientX(clientX);
    if (next === value) return;
    value = next;
    paint(true);
  };
  for (let i = 0; i < 12; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ml-bar-cell';
    b.tabIndex = -1;
    b.setAttribute('aria-label', `Level ${i}`);
    cells.push(b);
    el.append(b);
  }
  el.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    dragging = true;
    el.dataset.dragging = 'true';
    el.setPointerCapture(e.pointerId);
    setFromPointer(e.clientX);
  });
  el.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    setFromPointer(e.clientX);
  });
  const release = () => {
    if (!dragging) return;
    dragging = false;
    delete el.dataset.dragging;
  };
  el.addEventListener('pointerup', release);
  el.addEventListener('pointercancel', release);
  el.addEventListener('lostpointercapture', release);
  el.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      value = clamp(value + 1, 0, 11);
      paint(true);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      value = clamp(value - 1, 0, 11);
      paint(true);
    }
  });
  paint(false);
  return el;
}

function demoRadio(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ml-radio-group';
  el.setAttribute('role', 'radiogroup');
  el.setAttribute('aria-label', 'Atmosphere');
  for (const [val, label] of [
    ['ivory', 'Ivory editorial'],
    ['aqua', 'Aqua climate'],
    ['terra', 'Terracotta warm'],
  ] as const) {
    const lab = document.createElement('label');
    lab.className = 'ml-radio';
    lab.innerHTML = `<input type="radio" name="ml-radio-demo" value="${val}" ${val === 'ivory' ? 'checked' : ''}/><span class="ml-radio-ring" aria-hidden="true"></span>${label}`;
    el.append(lab);
  }
  return el;
}

function demoSegmented(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ds-cliptabs';
  el.innerHTML = `
    <div class="ds-cliptabs-track">
      <button type="button" class="ds-cliptabs-btn" data-active="true">Day</button>
      <button type="button" class="ds-cliptabs-btn">Week</button>
      <button type="button" class="ds-cliptabs-btn">Season</button>
    </div>`;
  el.querySelectorAll<HTMLButtonElement>('.ds-cliptabs-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      el.querySelectorAll('.ds-cliptabs-btn').forEach((b) => b.removeAttribute('data-active'));
      btn.dataset.active = 'true';
    });
  });
  return el;
}

function demoKey(): HTMLElement {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:12px;';
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'ml-key';
  b.setAttribute('aria-pressed', 'false');
  b.textContent = '⌘';
  const out = document.createElement('div');
  out.className = 'ds-mono';
  out.style.cssText = 'font-size:10.5px;color:var(--ds-fg-muted);font-variant-numeric:tabular-nums;';
  out.textContent = 'READY · Z 0.0mm';
  b.addEventListener('click', () => {
    const on = b.dataset.latched !== 'true';
    b.dataset.latched = String(on);
    b.setAttribute('aria-pressed', String(on));
    out.textContent = on ? 'LATCHED · Z −2.5mm' : 'READY · Z 0.0mm';
  });
  wrap.append(b, out);
  return wrap;
}

function demoKeypad(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ml-keypad';
  const out = document.createElement('div');
  out.className = 'ml-keypad-out';
  out.textContent = '—';
  let buf = '';
  for (const n of ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓']) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ml-key';
    b.textContent = n;
    b.addEventListener('click', () => {
      if (n === '⌫') buf = buf.slice(0, -1);
      else if (n === '✓') buf = buf;
      else if (buf.length < 6) buf += n;
      out.textContent = buf || '—';
    });
    el.append(b);
  }
  el.append(out);
  return el;
}

function demoLever(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ml-lever';
  el.innerHTML = '<div class="ml-lever-handle"></div>';
  const handle = qs<HTMLElement>(el, '.ml-lever-handle');
  let dragId: number | null = null;
  const setFromY = (clientY: number) => {
    const r = el.getBoundingClientRect();
    const t = clamp((clientY - r.top) / r.height, 0.12, 0.88);
    el.style.setProperty('--ml-lever-top', `${t * 100}%`);
  };
  handle.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragId = e.pointerId;
    handle.setPointerCapture(e.pointerId);
    el.dataset.dragging = 'true';
    setFromY(e.clientY);
  });
  handle.addEventListener('pointermove', (e) => {
    if (dragId !== e.pointerId) return;
    setFromY(e.clientY);
  });
  const up = () => {
    dragId = null;
    delete el.dataset.dragging;
  };
  handle.addEventListener('pointerup', up);
  handle.addEventListener('pointercancel', up);
  return el;
}

function demoProgress(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ml-progress';
  el.innerHTML = `<div class="ml-progress-track"><div class="ml-progress-fill"></div></div>
    <div class="ml-slider-readout" style="margin-top:10px">45%</div>`;
  let v = 45;
  const fill = qs<HTMLElement>(el, '.ml-progress-fill');
  const out = qs<HTMLElement>(el, '.ml-slider-readout');
  const tick = () => {
    v = (v + 0.35) % 100;
    fill.style.setProperty('--ml-progress', `${v}%`);
    fill.style.width = `${v}%`;
    out.textContent = `${Math.round(v)}%`;
    el.dataset.raf = String(requestAnimationFrame(tick));
  };
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (en.isIntersecting) tick();
      else if (el.dataset.raf) cancelAnimationFrame(Number(el.dataset.raf));
    }
  });
  io.observe(el);
  return el;
}

function demoMetric(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ml-metric';
  el.innerHTML = `<div class="ml-metric-value tabular">84.2°</div><div class="ml-metric-label">Confluence index</div>`;
  return el;
}

function demoTabs(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ml-tabs';
  const panels = ['Editorial calm for daily decisions.', 'Audit trail with Tier A sources.', 'Plotter SVG locked 1:1.'];
  el.innerHTML = `
    <div class="ml-tabs-list" role="tablist">
      <button type="button" class="ml-tabs-btn" role="tab" aria-selected="true">Calm</button>
      <button type="button" class="ml-tabs-btn" role="tab" aria-selected="false">Audit</button>
      <button type="button" class="ml-tabs-btn" role="tab" aria-selected="false">Plot</button>
    </div>
    <div class="ml-tabs-panel" role="tabpanel">${panels[0]}</div>`;
  const panel = qs<HTMLElement>(el, '.ml-tabs-panel');
  el.querySelectorAll<HTMLButtonElement>('.ml-tabs-btn').forEach((btn, i) => {
    btn.addEventListener('click', () => {
      el.querySelectorAll('.ml-tabs-btn').forEach((b) => b.setAttribute('aria-selected', 'false'));
      btn.setAttribute('aria-selected', 'true');
      panel.textContent = panels[i] ?? '';
    });
  });
  return el;
}

function demoAccordion(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ml-acc';
  const items = [
    ['Paper grain', 'Canvas overlay with size + intensity controls — open/close uses grid-template-rows 0fr→1fr.'],
    ['Hairline scroll', '2px thumb, transparent track — Chromium + Firefox.'],
    ['Frequency Gate', '⌘K and root tabs animate at 0ms; accordion keeps 280ms ease-out.'],
  ] as const;
  const setOpen = (target: HTMLElement | null) => {
    el.querySelectorAll<HTMLElement>('.ml-acc-item').forEach((n) => {
      const open = n === target;
      n.dataset.open = String(open);
      n.querySelector('button')?.setAttribute('aria-expanded', String(open));
    });
  };
  items.forEach(([t, b], i) => {
    const item = document.createElement('div');
    item.className = 'ml-acc-item';
    const panelId = `ml-acc-panel-${i}-${Math.random().toString(36).slice(2, 7)}`;
    item.innerHTML = `<button type="button" class="ml-acc-trigger" aria-expanded="${i === 0}" aria-controls="${panelId}">
        <span>${t}</span><span class="ml-acc-icon" aria-hidden="true">+</span>
      </button>
      <div class="ml-acc-panel" id="${panelId}" role="region">
        <div class="ml-acc-panel-inner"><p>${b}</p></div>
      </div>`;
    if (i === 0) item.dataset.open = 'true';
    item.querySelector('button')!.addEventListener('click', () => {
      const open = item.dataset.open === 'true';
      setOpen(open ? null : item);
    });
    el.append(item);
  });
  return el;
}

function demoColorPicker(): HTMLElement {
  const swatches = [
    { name: 'Olive', hex: '#5E6E47', l: 0.48, c: 0.06, h: 125 },
    { name: 'Sky', hex: '#477085', l: 0.5, c: 0.06, h: 230 },
    { name: 'Coral', hex: '#B55A42', l: 0.55, c: 0.1, h: 35 },
    { name: 'Ochre', hex: '#9A7134', l: 0.55, c: 0.09, h: 75 },
    { name: 'Slate', hex: '#56606E', l: 0.45, c: 0.02, h: 250 },
    { name: 'Ink', hex: '#141413', l: 0.18, c: 0.005, h: 90 },
    { name: 'Ivory', hex: '#FAF9F5', l: 0.97, c: 0.008, h: 95 },
    { name: 'Aqua', hex: '#A4CED0', l: 0.8, c: 0.04, h: 200 },
    { name: 'Terra', hex: '#EDBB99', l: 0.82, c: 0.06, h: 55 },
    { name: 'Blush', hex: '#E8C4C0', l: 0.84, c: 0.04, h: 20 },
    { name: 'Mist', hex: '#C5D4CE', l: 0.84, c: 0.02, h: 160 },
    { name: 'Lilac', hex: '#C9C0D8', l: 0.82, c: 0.04, h: 300 },
  ];
  let L = 0.55;
  let C = 0.08;
  let H = 55;
  const el = document.createElement('div');
  el.className = 'ml-color';
  el.innerHTML = `
    <div class="ml-color-preview" style="--ml-swatch:${swatches[8]!.hex}"></div>
    <div class="ml-color-meta"><span class="ml-color-name">Terra</span><span class="ml-color-oklch">oklch(0.82 0.06 55)</span></div>
    <div class="ml-color-grid">${swatches
      .map(
        (s, i) =>
          `<button type="button" class="ml-color-swatch" data-i="${i}" data-active="${i === 8}" style="--swatch:${s.hex}" title="${s.name}" aria-label="${s.name}"></button>`,
      )
      .join('')}</div>
    <div class="ml-color-sliders">
      <label class="ml-color-row">L<input type="range" min="0" max="100" value="82" data-axis="l"/><span data-read="l">0.82</span></label>
      <label class="ml-color-row">C<input type="range" min="0" max="20" value="6" data-axis="c"/><span data-read="c">0.06</span></label>
      <label class="ml-color-row">H<input type="range" min="0" max="360" value="55" data-axis="h"/><span data-read="h">55</span></label>
    </div>`;
  const preview = qs<HTMLElement>(el, '.ml-color-preview');
  const nameEl = qs<HTMLElement>(el, '.ml-color-name');
  const oklchEl = qs<HTMLElement>(el, '.ml-color-oklch');
  const paint = (label?: string) => {
    const css = `oklch(${L.toFixed(2)} ${C.toFixed(2)} ${Math.round(H)})`;
    preview.style.setProperty('--ml-swatch', css);
    preview.style.background = css;
    oklchEl.textContent = css;
    if (label) nameEl.textContent = label;
    qs<HTMLElement>(el, '[data-read="l"]').textContent = L.toFixed(2);
    qs<HTMLElement>(el, '[data-read="c"]').textContent = C.toFixed(2);
    qs<HTMLElement>(el, '[data-read="h"]').textContent = String(Math.round(H));
  };
  el.querySelectorAll<HTMLButtonElement>('.ml-color-swatch').forEach((btn) => {
    btn.addEventListener('click', () => {
      const s = swatches[Number(btn.dataset.i)]!;
      L = s.l;
      C = s.c;
      H = s.h;
      el.querySelectorAll('.ml-color-swatch').forEach((b) => delete (b as HTMLElement).dataset.active);
      btn.dataset.active = 'true';
      qs<HTMLInputElement>(el, '[data-axis="l"]').value = String(Math.round(L * 100));
      qs<HTMLInputElement>(el, '[data-axis="c"]').value = String(Math.round(C * 100));
      qs<HTMLInputElement>(el, '[data-axis="h"]').value = String(Math.round(H));
      paint(s.name);
    });
  });
  el.querySelectorAll<HTMLInputElement>('.ml-color-sliders input').forEach((input) => {
    input.addEventListener('input', () => {
      if (input.dataset.axis === 'l') L = Number(input.value) / 100;
      if (input.dataset.axis === 'c') C = Number(input.value) / 100;
      if (input.dataset.axis === 'h') H = Number(input.value);
      el.querySelectorAll('.ml-color-swatch').forEach((b) => delete (b as HTMLElement).dataset.active);
      paint('Custom');
    });
  });
  paint('Terra');
  return el;
}

function demoInput(search = false): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ml-field';
  el.innerHTML = `<label>${search ? 'Search' : 'Address'}</label>
    <input type="${search ? 'search' : 'text'}" placeholder="${search ? 'Filter components…' : 'Av. Paulista, 1000'}" />`;
  return el;
}

function demoToast(): HTMLElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'ml-btn';
  btn.textContent = 'Show toast';
  btn.addEventListener('click', () => pushToast('Synced · Tier A source verified'));
  return btn;
}

function demoDialog(): HTMLElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'ml-btn ml-btn-primary';
  btn.textContent = 'Open dialog';
  btn.addEventListener('click', () => setDialog(true));
  return btn;
}

function demoCommand(): HTMLElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'ml-btn';
  btn.innerHTML = 'Open ⌘K';
  btn.addEventListener('click', () => setCmdk(true));
  return btn;
}

function demoScroll(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ml-scroll';
  el.innerHTML = Array.from({ length: 12 }, (_, i) => `<div>Ledger line ${String(i + 1).padStart(2, '0')} · PM2.5 sample</div>`).join('');
  return el;
}

function demoCalendar(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ml-cal';
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const days = new Date(y, m + 1, 0).getDate();
  const start = new Date(y, m, 1).getDay();
  let selected = now.getDate();
  el.innerHTML = `<div class="ml-cal-head"><span>${now.toLocaleString('en-US', { month: 'short', year: 'numeric' })}</span></div>
    <div class="ml-cal-grid"></div>`;
  const grid = qs<HTMLElement>(el, '.ml-cal-grid');
  for (const d of ['S', 'M', 'T', 'W', 'T', 'F', 'S']) {
    const s = document.createElement('div');
    s.className = 'ml-cal-dow';
    s.textContent = d;
    grid.append(s);
  }
  for (let i = 0; i < start; i++) grid.append(document.createElement('div'));
  for (let d = 1; d <= days; d++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = String(d);
    if (d === selected) b.dataset.selected = 'true';
    b.addEventListener('click', () => {
      selected = d;
      grid.querySelectorAll('button').forEach((x) => delete (x as HTMLElement).dataset.selected);
      b.dataset.selected = 'true';
    });
    grid.append(b);
  }
  return el;
}

function demoCompass(kind = 'compass'): HTMLElement {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;width:100%;max-width:210px;';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'ml-svg');
  svg.setAttribute('data-plotter', '');
  svg.setAttribute('data-hairline', '');
  svg.setAttribute('viewBox', '0 0 160 164');
  svg.style.cssText = 'width:100%;max-width:176px;height:auto;touch-action:none;color:var(--ds-fg);';
  const readout = document.createElement('div');
  readout.className = 'ds-mono';
  readout.style.cssText = 'font-size:10px;color:var(--ds-fg-muted);font-variant-numeric:tabular-nums;';

  const ticks36 = Array.from({ length: 36 }, (_, i) => {
    const a = (i / 36) * Math.PI * 2;
    const inner = i % 3 === 0 ? 55 : 58.5;
    const role = i % 3 === 0 ? 'secondary' : 'guide';
    return `<line data-plotter-role="${role}" x1="${(80 + Math.cos(a) * inner).toFixed(1)}" y1="${(78 + Math.sin(a) * inner).toFixed(1)}" x2="${(80 + Math.cos(a) * 62).toFixed(1)}" y2="${(78 + Math.sin(a) * 62).toFixed(1)}" stroke="currentColor"/>`;
  }).join('');

  // 3D Bezel base rim (cy=83 vs top plate cy=78)
  const bezel3d = `
    <path data-plotter-role="primary" d="M 14 78 L 14 83 A 66 66 0 0 0 146 83 L 146 78 Z" fill="var(--ds-bg)" stroke="currentColor"/>
    <circle data-plotter-role="primary" cx="80" cy="78" r="66" fill="var(--ds-bg)" stroke="currentColor"/>
    <path data-plotter-role="secondary" d="M 19 78 A 61 61 0 0 0 141 78" fill="none" stroke="currentColor" opacity="0.28"/>
  `;

  if (kind === 'weather-instrument') {
    // 3D Barometric & Hygro Annular Dial (980..1040 hPa + inner %RH sub-dial)
    const scaleTicks = Array.from({ length: 25 }, (_, i) => {
      const deg = -135 + (i / 24) * 270;
      const a = ((deg - 90) * Math.PI) / 180;
      const r0 = i % 4 === 0 ? 48 : 52;
      return `<line data-plotter-role="${i % 4 === 0 ? 'secondary' : 'guide'}" x1="${(80 + Math.cos(a) * r0).toFixed(1)}" y1="${(78 + Math.sin(a) * r0).toFixed(1)}" x2="${(80 + Math.cos(a) * 56).toFixed(1)}" y2="${(78 + Math.sin(a) * 56).toFixed(1)}" stroke="currentColor"/>`;
    }).join('');
    let hpa = 1018;
    const renderWeather = (val: number) => {
      const norm = clamp((val - 980) / 60, 0, 1);
      const deg = -135 + norm * 270;
      const rh = Math.round(42 + (1 - norm) * 36);
      svg.innerHTML = `
        ${bezel3d}
        ${scaleTicks}
        <path data-plotter-role="guide" d="M 38 112 A 54 54 0 1 1 122 112" fill="none" stroke="currentColor"/>
        <!-- Inner 3D Hygro Sub-Dial -->
        <circle data-plotter-role="secondary" cx="80" cy="101" r="15" fill="var(--ds-bg)" stroke="currentColor" opacity="0.5"/>
        <line data-plotter-role="secondary" x1="80" y1="101" x2="${(80 + Math.cos(((rh / 100) * Math.PI * 1.5 - Math.PI * 1.25)) * 11).toFixed(1)}" y2="${(101 + Math.sin(((rh / 100) * Math.PI * 1.5 - Math.PI * 1.25)) * 11).toFixed(1)}" stroke="currentColor"/>
        <!-- Reference Set Hand (dashed) -->
        <line data-plotter-role="guide" x1="80" y1="78" x2="98" y2="36" stroke="currentColor"/>
        <!-- Main Barometer Needle + 3D Hub Cap -->
        <g transform="rotate(${deg.toFixed(1)} 80 78)">
          <path data-plotter-role="primary" d="M 80 26 L 82.2 78 L 80 90 L 77.8 78 Z" fill="var(--ds-bg)" stroke="currentColor"/>
        </g>
        <circle data-plotter-role="primary" cx="80" cy="79.5" r="5.5" fill="var(--ds-bg)" stroke="currentColor"/>
        <circle data-plotter-role="primary" cx="80" cy="78" r="5.5" fill="var(--ds-bg)" stroke="currentColor"/>
        <circle data-plotter-role="primary" cx="80" cy="78" r="1.3" fill="currentColor" stroke="none"/>
      `;
      readout.textContent = `${Math.round(val)} hPa · ${rh}% RH`;
    };
    renderWeather(hpa);
    svg.addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect();
      const t = clamp((e.clientX - r.left) / r.width, 0, 1);
      hpa = 985 + t * 50;
      renderWeather(hpa);
    });
    wrap.append(svg, readout);
    return wrap;
  }

  if (kind === 'wind-instrument') {
    // 3D Anemometer & Wind Vector Rose
    let angleDeg = 285;
    let speedKt = 18.4;
    const renderWind = (deg: number, kt: number) => {
      const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const dir = dirs[Math.round((((deg % 360) + 360) % 360) / 45) % 8];
      svg.innerHTML = `
        ${bezel3d}
        ${ticks36}
        <circle data-plotter-role="guide" cx="80" cy="78" r="42" fill="none" stroke="currentColor"/>
        <circle data-plotter-role="guide" cx="80" cy="78" r="24" fill="none" stroke="currentColor"/>
        <line data-plotter-role="guide" x1="80" y1="18" x2="80" y2="138" stroke="currentColor"/>
        <line data-plotter-role="guide" x1="20" y1="78" x2="140" y2="78" stroke="currentColor"/>
        <g transform="rotate(${deg.toFixed(1)} 80 78)">
          <!-- Aerodynamic Wind Vane with 3D Tail Fin -->
          <path data-plotter-role="primary" d="M 80 24 L 83 40 L 80 37 L 77 40 Z" fill="var(--ds-bg)" stroke="currentColor"/>
          <line data-plotter-role="primary" x1="80" y1="37" x2="80" y2="116" stroke="currentColor"/>
          <path data-plotter-role="primary" d="M 80 104 L 87 122 L 80 117 L 73 122 Z" fill="var(--ds-bg)" stroke="currentColor"/>
        </g>
        <!-- 3D Central Spindle Cylinder -->
        <circle data-plotter-role="primary" cx="80" cy="80" r="7" fill="var(--ds-bg)" stroke="currentColor"/>
        <circle data-plotter-role="primary" cx="80" cy="78" r="7" fill="var(--ds-bg)" stroke="currentColor"/>
        <circle data-plotter-role="primary" cx="80" cy="78" r="1.4" fill="currentColor" stroke="none"/>
      `;
      readout.textContent = `${String(Math.round(deg)).padStart(3, '0')}° ${dir} · ${kt.toFixed(1)} kt`;
    };
    renderWind(angleDeg, speedKt);
    svg.addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      angleDeg = ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;
      speedKt = clamp((Math.hypot(dx, dy) / (r.width * 0.45)) * 28, 4.2, 32.8);
      renderWind(angleDeg, speedKt);
    });
    wrap.append(svg, readout);
    return wrap;
  }

  if (kind === 'navigation-instrument') {
    // 3D HSI Course Deviation Indicator (CDI + Rotating Azimuth Card)
    let crs = 38;
    let dev = 0.4;
    const renderNav = (cDeg: number, dVal: number) => {
      const cdiOffset = clamp(dVal * 14, -22, 22);
      svg.innerHTML = `
        ${bezel3d}
        ${ticks36}
        <!-- Top Lubber Triangle -->
        <path data-plotter-role="primary" d="M 80 15 L 76.5 9.5 L 83.5 9.5 Z" fill="var(--ds-bg)" stroke="currentColor"/>
        <circle data-plotter-role="secondary" cx="80" cy="78" r="46" fill="none" stroke="currentColor" opacity="0.38"/>
        <!-- Lateral Deviation Scale Dots -->
        ${[-2, -1, 1, 2].map((d) => `<circle data-plotter-role="secondary" cx="${80 + d * 11}" cy="78" r="1.4" fill="none" stroke="currentColor"/>`).join('')}
        <!-- Rotating Course Pointer & CDI Bar -->
        <g transform="rotate(${cDeg.toFixed(1)} 80 78)">
          <path data-plotter-role="primary" d="M 80 22 L 83.5 34 L 76.5 34 Z" fill="var(--ds-bg)" stroke="currentColor"/>
          <line data-plotter-role="primary" x1="80" y1="34" x2="80" y2="56" stroke="currentColor"/>
          <line data-plotter-role="primary" x1="80" y1="100" x2="80" y2="132" stroke="currentColor"/>
          <line data-plotter-role="primary" x1="${(80 + cdiOffset).toFixed(1)}" y1="58" x2="${(80 + cdiOffset).toFixed(1)}" y2="98" stroke="currentColor"/>
        </g>
        <!-- Fixed Central Aircraft Reference -->
        <path data-plotter-role="secondary" d="M 80 71 L 80 86 M 71 77 L 89 77 M 75 84 L 85 84" fill="none" stroke="currentColor"/>
      `;
      readout.textContent = `CRS ${String(Math.round(cDeg)).padStart(3, '0')}° · DEV ${dVal >= 0 ? '+' : ''}${dVal.toFixed(1)}°`;
    };
    renderNav(crs, dev);
    svg.addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      crs = ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;
      dev = clamp((dx / (r.width * 0.4)) * 1.6, -1.6, 1.6);
      renderNav(crs, dev);
    });
    wrap.append(svg, readout);
    return wrap;
  }

  if (kind === 'astrology-wheel') {
    // 3D 12-House Astrolabe Wheel with Concentric Rings & Planetary Aspect Chords
    let activeHouse = 8;
    const houses = ['ARI', 'TAU', 'GEM', 'CAN', 'LEO', 'VIR', 'LIB', 'SCO', 'SAG', 'CAP', 'AQU', 'PIS'];
    const renderAstro = (hIdx: number) => {
      const spokes = Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const isHi = i === hIdx;
        return `<line data-plotter-role="${isHi ? 'primary' : 'secondary'}" x1="${(80 + Math.cos(a) * 26).toFixed(1)}" y1="${(78 + Math.sin(a) * 26).toFixed(1)}" x2="${(80 + Math.cos(a) * 56).toFixed(1)}" y2="${(78 + Math.sin(a) * 56).toFixed(1)}" stroke="currentColor" opacity="${isHi ? '0.95' : '0.32'}"/>`;
      }).join('');
      const planetIdx = [0, 3, 5, 8, 10].map((p) => (p + hIdx) % 12);
      const planetPts = planetIdx.map((idx) => {
        const a = ((idx + 0.5) / 12) * Math.PI * 2 - Math.PI / 2;
        return [80 + Math.cos(a) * 38, 78 + Math.sin(a) * 38] as const;
      });
      svg.innerHTML = `
        ${bezel3d}
        ${ticks36}
        <circle data-plotter-role="secondary" cx="80" cy="78" r="56" fill="none" stroke="currentColor" opacity="0.45"/>
        <!-- Stepped Inner 3D Ring -->
        <circle data-plotter-role="primary" cx="80" cy="80" r="26" fill="var(--ds-bg)" stroke="currentColor" opacity="0.35"/>
        <circle data-plotter-role="primary" cx="80" cy="78" r="26" fill="var(--ds-bg)" stroke="currentColor"/>
        ${spokes}
        <!-- Aspect Chords -->
        <path data-plotter-role="guide" d="M ${planetPts[0][0].toFixed(1)} ${planetPts[0][1].toFixed(1)} L ${planetPts[2][0].toFixed(1)} ${planetPts[2][1].toFixed(1)} L ${planetPts[4][0].toFixed(1)} ${planetPts[4][1].toFixed(1)} Z" fill="none" stroke="currentColor"/>
        <line data-plotter-role="secondary" x1="${planetPts[1][0].toFixed(1)}" y1="${planetPts[1][1].toFixed(1)}" x2="${planetPts[3][0].toFixed(1)}" y2="${planetPts[3][1].toFixed(1)}" stroke="currentColor" opacity="0.45"/>
        <!-- 3D Planetary Nodes -->
        ${planetPts
          .map(
            ([x, y], i) =>
              `<circle data-plotter-role="primary" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i === 3 ? '3.4' : '2.4'}" fill="var(--ds-bg)" stroke="currentColor"/>` +
              (i === 3 ? `<circle data-plotter-role="primary" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.1" fill="currentColor" stroke="none"/>` : ''),
          )
          .join('')}
        <circle data-plotter-role="primary" cx="80" cy="78" r="3" fill="var(--ds-bg)" stroke="currentColor"/>
      `;
      readout.textContent = `CASA ${String(hIdx + 1).padStart(2, '0')} · ${houses[hIdx]} · ${hIdx * 30 + 15}°`;
    };
    renderAstro(activeHouse);
    svg.addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const ang = ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;
      activeHouse = Math.floor(ang / 30) % 12;
      renderAstro(activeHouse);
    });
    wrap.append(svg, readout);
    return wrap;
  }

  // Default: 'compass' — 3D Marine Compass Rose
  let brg = 18;
  const renderCompass = (deg: number) => {
    svg.innerHTML = `
      ${bezel3d}
      ${ticks36}
      <circle data-plotter-role="secondary" cx="80" cy="78" r="48" fill="none" stroke="currentColor" opacity="0.38"/>
      <line data-plotter-role="guide" x1="80" y1="22" x2="80" y2="134" stroke="currentColor"/>
      <line data-plotter-role="guide" x1="24" y1="78" x2="136" y2="78" stroke="currentColor"/>
      <g transform="rotate(${deg.toFixed(1)} 80 78)">
        <path data-plotter-role="primary" d="M 80 24 L 84 78 L 80 128 L 76 78 Z" fill="var(--ds-bg)" stroke="currentColor"/>
        <circle data-plotter-role="primary" cx="80" cy="34" r="1.3" fill="currentColor" stroke="none"/>
      </g>
      <circle data-plotter-role="primary" cx="80" cy="80" r="6" fill="var(--ds-bg)" stroke="currentColor"/>
      <circle data-plotter-role="primary" cx="80" cy="78" r="6" fill="var(--ds-bg)" stroke="currentColor"/>
      <circle data-plotter-role="primary" cx="80" cy="78" r="1.3" fill="currentColor" stroke="none"/>
    `;
    readout.textContent = `BRG ${String(Math.round(deg)).padStart(3, '0')}°`;
  };
  renderCompass(brg);
  svg.addEventListener('pointermove', (e) => {
    const r = svg.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    brg = ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;
    renderCompass(brg);
  });
  wrap.append(svg, readout);
  return wrap;
}

function demoAudioMeter(): HTMLElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'ml-svg');
  svg.setAttribute('viewBox', '0 0 160 80');
  svg.setAttribute('aria-label', 'Audio meter');
  const bars: SVGRectElement[] = [];
  for (let i = 0; i < 16; i++) {
    const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    r.setAttribute('x', String(8 + i * 9));
    r.setAttribute('y', '40');
    r.setAttribute('width', '5');
    r.setAttribute('height', '20');
    r.setAttribute('fill', 'currentColor');
    r.setAttribute('fill-opacity', i < 10 ? '0.85' : '0.25');
    svg.append(r);
    bars.push(r);
  }
  let raf = 0;
  const tick = () => {
    bars.forEach((r, i) => {
      const h = 12 + Math.abs(Math.sin(Date.now() / 240 + i * 0.45)) * 48;
      r.setAttribute('height', h.toFixed(1));
      r.setAttribute('y', (72 - h).toFixed(1));
    });
    raf = requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) tick();
      else cancelAnimationFrame(raf);
    }
  });
  io.observe(svg);
  return svg as unknown as HTMLElement;
}

function demoHairlineIso(preset: HairlinePreset = 'wave'): HTMLElement {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;width:100%;max-width:264px;';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 400 320');
  svg.setAttribute('data-plotter', '');
  svg.setAttribute('data-hairline', '');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.style.cssText = 'width:100%;height:auto;aspect-ratio:400/320;touch-action:none;color:var(--ds-fg);';
  const readout = document.createElement('div');
  readout.className = 'ds-mono';
  readout.style.cssText = 'font-size:10px;color:var(--ds-fg-muted);font-variant-numeric:tabular-nums;';
  mountHairlineFigure(svg, readout, preset);
  wrap.append(svg, readout);
  return wrap;
}

function demoSvgInstrument(kind: string): HTMLElement {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;width:100%;max-width:240px;';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'ml-svg');
  svg.setAttribute('data-plotter', '');
  svg.setAttribute('data-hairline', '');
  svg.setAttribute('viewBox', '0 0 220 144');
  svg.style.cssText = 'width:100%;max-width:220px;height:auto;touch-action:none;color:var(--ds-fg);';
  const readout = document.createElement('div');
  readout.className = 'ds-mono';
  readout.style.cssText = 'font-size:10px;color:var(--ds-fg-muted);font-variant-numeric:tabular-nums;';

  if (kind === 'attitude-indicator') {
    // 3D Gyroscopic Artificial Horizon (Bezel + Bank Scale + Tilting Pitch Ladder + Fixed Gull-Wing)
    let roll = 11;
    let pitch = 4;
    const bankTicks = [-60, -45, -30, -15, 0, 15, 30, 45, 60]
      .map((deg) => {
        const a = ((deg - 90) * Math.PI) / 180;
        const r0 = deg % 30 === 0 ? 48 : 50.5;
        return `<line data-plotter-role="secondary" x1="${(110 + Math.cos(a) * r0).toFixed(1)}" y1="${(70 + Math.sin(a) * r0).toFixed(1)}" x2="${(110 + Math.cos(a) * 54).toFixed(1)}" y2="${(70 + Math.sin(a) * 54).toFixed(1)}" stroke="currentColor"/>`;
      })
      .join('');
    const renderAttitude = (rDeg: number, pDeg: number) => {
      const py = clamp(pDeg * 1.1, -16, 16);
      svg.innerHTML = `
        <defs>
          <clipPath id="att-clip"><circle cx="110" cy="70" r="46"/></clipPath>
        </defs>
        <!-- 3D Cylindrical Instrument Casing -->
        <path data-plotter-role="primary" d="M 52 70 L 52 75 A 58 58 0 0 0 168 75 L 168 70 Z" fill="var(--ds-bg)" stroke="currentColor"/>
        <circle data-plotter-role="primary" cx="110" cy="70" r="58" fill="var(--ds-bg)" stroke="currentColor"/>
        <circle data-plotter-role="secondary" cx="110" cy="70" r="46" fill="none" stroke="currentColor" opacity="0.4"/>
        ${bankTicks}
        <!-- Gimbal Horizon & Pitch Ladder -->
        <g clip-path="url(#att-clip)">
          <g transform="rotate(${rDeg.toFixed(1)} 110 70) translate(0 ${py.toFixed(1)})">
            <line data-plotter-role="primary" x1="56" y1="70" x2="164" y2="70" stroke="currentColor"/>
            <line data-plotter-role="secondary" x1="94" y1="56" x2="126" y2="56" stroke="currentColor"/>
            <line data-plotter-role="secondary" x1="100" y1="44" x2="120" y2="44" stroke="currentColor"/>
            <line data-plotter-role="secondary" x1="94" y1="84" x2="126" y2="84" stroke="currentColor"/>
            <line data-plotter-role="secondary" x1="100" y1="96" x2="120" y2="96" stroke="currentColor"/>
          </g>
        </g>
        <!-- Fixed 3D Aircraft Reference Gull-Wing -->
        <path data-plotter-role="primary" d="M 80 70 L 98 70 L 103 75 M 140 70 L 122 70 L 117 75" fill="none" stroke="currentColor"/>
        <circle data-plotter-role="primary" cx="110" cy="70" r="2.2" fill="var(--ds-bg)" stroke="currentColor"/>
      `;
      readout.textContent = `ROLL ${rDeg >= 0 ? '+' : ''}${Math.round(rDeg)}° · PITCH ${pDeg >= 0 ? '+' : ''}${Math.round(pDeg)}°`;
    };
    renderAttitude(roll, pitch);
    svg.addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const ny = (0.5 - (e.clientY - r.top) / r.height) * 2;
      roll = clamp(nx * 28, -28, 28);
      pitch = clamp(ny * 15, -15, 15);
      renderAttitude(roll, pitch);
    });
    wrap.append(svg, readout);
    return wrap;
  }

  if (kind === 'astronomy-instrument') {
    // 3D Solar Horizon Dome & Ecliptic Arc
    let tNorm = 0.62;
    const renderSolar = (t: number) => {
      const ang = Math.PI * (1 - t);
      const sx = 110 - Math.cos(ang) * 72;
      const sy = 96 - Math.sin(ang) * 58;
      const gy = 96 + Math.sin(ang) * 10;
      const hour = 6 + Math.round(t * 12);
      const alt = Math.round(Math.sin(ang) * 68);
      const az = Math.round(90 + t * 180);
      svg.innerHTML = `
        <!-- 3D Horizon Disc with Extruded Front Rim -->
        <path data-plotter-role="primary" d="M 26 96 L 26 101 A 84 22 0 0 0 194 101 L 194 96 Z" fill="var(--ds-bg)" stroke="currentColor"/>
        <ellipse data-plotter-role="primary" cx="110" cy="96" rx="84" ry="22" fill="var(--ds-bg)" stroke="currentColor"/>
        <line data-plotter-role="guide" x1="26" y1="96" x2="194" y2="96" stroke="currentColor"/>
        <line data-plotter-role="guide" x1="110" y1="74" x2="110" y2="118" stroke="currentColor"/>
        <!-- Winter / Summer Solstice Reference Arcs -->
        <path data-plotter-role="guide" d="M 48 96 A 62 40 0 0 1 172 96" fill="none" stroke="currentColor"/>
        <!-- Main Solar Ecliptic Arc -->
        <path data-plotter-role="secondary" d="M 38 96 A 72 58 0 0 1 182 96" fill="none" stroke="currentColor"/>
        <!-- Solar Altitude Plumb Line & Ground Projection -->
        <line data-plotter-role="guide" x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${sx.toFixed(1)}" y2="${gy.toFixed(1)}" stroke="currentColor"/>
        <ellipse data-plotter-role="secondary" cx="${sx.toFixed(1)}" cy="${gy.toFixed(1)}" rx="3.2" ry="1.4" fill="none" stroke="currentColor"/>
        <!-- 3D Solar Orb + Corona Ring -->
        <circle data-plotter-role="secondary" cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="10.5" fill="none" stroke="currentColor" opacity="0.34"/>
        <circle data-plotter-role="primary" cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="6" fill="var(--ds-bg)" stroke="currentColor"/>
        <circle data-plotter-role="primary" cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="1.4" fill="currentColor" stroke="none"/>
      `;
      readout.textContent = `${String(hour).padStart(2, '0')}:00 · ALT +${alt}° · AZ ${az}°`;
    };
    renderSolar(tNorm);
    svg.addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect();
      tNorm = clamp((e.clientX - r.left) / r.width, 0.08, 0.92);
      renderSolar(tNorm);
    });
    wrap.append(svg, readout);
    return wrap;
  }

  if (kind === 'lunar-ephemeris') {
    // 3D Lunar Phase Disc & 8-Phase Orbital Ring
    let phase = 0.64;
    const names = ['NOVA', 'CRESCENTE', 'QUARTO CRESC.', 'GIBOSA CRESC.', 'CHEIA', 'GIBOSA MING.', 'QUARTO MING.', 'MINGUANTE'];
    const renderLunar = (p: number) => {
      const idx = Math.round(p * 7) % 8;
      const kx = Math.cos(p * Math.PI * 2) * 26;
      const orbitNodes = Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const ox = 110 + Math.cos(a) * 52;
        const oy = 70 + Math.sin(a) * 44;
        const isSel = i === idx;
        return (
          `<circle data-plotter-role="${isSel ? 'primary' : 'secondary'}" cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" r="${isSel ? '6.5' : '4.5'}" fill="var(--ds-bg)" stroke="currentColor" opacity="${isSel ? '1' : '0.42'}"/>` +
          (isSel ? `<circle data-plotter-role="primary" cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" r="1.3" fill="currentColor" stroke="none"/>` : '')
        );
      }).join('');
      svg.innerHTML = `
        <ellipse data-plotter-role="guide" cx="110" cy="70" rx="52" ry="44" fill="none" stroke="currentColor"/>
        ${orbitNodes}
        <!-- Central 3D Moon Globe with Extruded Lower Rim -->
        <circle data-plotter-role="primary" cx="110" cy="73" r="26" fill="var(--ds-bg)" stroke="currentColor" opacity="0.38"/>
        <circle data-plotter-role="primary" cx="110" cy="70" r="26" fill="var(--ds-bg)" stroke="currentColor"/>
        <!-- Dynamic Terminator Curve -->
        <path data-plotter-role="primary" d="M 110 44 A ${Math.abs(kx).toFixed(1)} 26 0 0 ${kx >= 0 ? 1 : 0} 110 96" fill="none" stroke="currentColor"/>
        <path data-plotter-role="secondary" d="M 88 70 A 22 22 0 0 0 132 70" fill="none" stroke="currentColor" opacity="0.28"/>
      `;
      readout.textContent = `${names[idx]} · ELONG ${Math.round(p * 360)}°`;
    };
    renderLunar(phase);
    svg.addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect();
      phase = clamp((e.clientX - r.left) / r.width, 0.02, 0.98);
      renderLunar(phase);
    });
    wrap.append(svg, readout);
    return wrap;
  }

  // Default: 'instrument' (Instrument Bars) — Front-Facing 3D 8-Column Harmonic Level Gauge
  const levels = [0.42, 0.64, 0.54, 0.86, 0.72, 0.48, 0.68, 0.58];
  let focusCol = 3;
  const renderBars = (activeCol: number) => {
    const cols = levels
      .map((lv, i) => {
        const x = 26 + i * 22;
        const h = Math.round(24 + lv * 78);
        const yTop = 116 - h;
        const isHi = i === activeCol;
        const role = isHi ? 'primary' : 'secondary';
        return `
          <!-- Recessed 3D Slot -->
          <rect data-plotter-role="guide" x="${x}" y="20" width="12" height="100" rx="6" fill="none" stroke="currentColor"/>
          <!-- 3D Extruded Column Base Skirt -->
          <rect data-plotter-role="${role}" x="${x}" y="${yTop + 4}" width="12" height="${h}" rx="6" fill="var(--ds-bg)" stroke="currentColor" opacity="${isHi ? '0.95' : '0.45'}"/>
          <!-- 3D Raised Column Top Face -->
          <rect data-plotter-role="${role}" x="${x}" y="${yTop}" width="12" height="${h}" rx="6" fill="var(--ds-bg)" stroke="currentColor" opacity="${isHi ? '1' : '0.58'}"/>
          <!-- Inner Chamfer Crease -->
          <line data-plotter-role="secondary" x1="${x + 3}" y1="${yTop + 5}" x2="${x + 9}" y2="${yTop + 5}" stroke="currentColor" opacity="0.35"/>
          ${isHi ? `<circle data-plotter-role="primary" cx="${x + 6}" cy="${yTop + 10}" r="1.3" fill="currentColor" stroke="none"/>` : ''}
        `;
      })
      .join('');
    svg.innerHTML = `
      <line data-plotter-role="guide" x1="16" y1="120" x2="204" y2="120" stroke="currentColor"/>
      ${cols}
    `;
    readout.textContent = `CH 0${activeCol + 1} · ${Math.round(levels[activeCol] * 100)} dB`;
  };
  renderBars(focusCol);
  svg.addEventListener('pointermove', (e) => {
    const r = svg.getBoundingClientRect();
    const t = clamp((e.clientX - r.left) / r.width, 0, 0.99);
    focusCol = Math.floor(t * levels.length);
    const ny = clamp(1 - (e.clientY - r.top) / r.height, 0.18, 0.96);
    levels[focusCol] = ny;
    renderBars(focusCol);
  });
  wrap.append(svg, readout);
  return wrap;
}

function seriesPoints(values: number[], w: number, h: number, pad = 8): Array<readonly [number, number]> {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  return values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return [x, y] as const;
  });
}

function smoothPath(values: number[], w: number, h: number, pad = 8): string {
  const pts = seriesPoints(values, w, h, pad);
  if (!pts.length) return '';
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

function demoChartLine(area = false): HTMLElement {
  const values = [22, 28, 25, 40, 36, 48, 44, 58, 52, 66, 61, 74];
  const d = smoothPath(values, 220, 110);
  const areaD = `${d} L${220 - 8} ${110 - 8} L8 ${110 - 8} Z`;
  const marks = seriesPoints(values, 220, 110).filter((_, i) => i % 3 === 0);
  const el = document.createElement('div');
  el.className = 'ml-chart';
  el.innerHTML = `
    <svg class="ml-svg ml-chart-svg" viewBox="0 0 220 110" aria-label="Line chart">
      <line class="ml-guide" x1="8" y1="102" x2="212" y2="102" stroke="currentColor" stroke-opacity="0.7"/>
      <line class="ml-guide" x1="8" y1="28" x2="212" y2="28" stroke="currentColor" stroke-opacity="0.35"/>
      <line class="ml-guide" x1="8" y1="64" x2="212" y2="64" stroke="currentColor" stroke-opacity="0.35"/>
      ${area ? `<path d="${areaD}" fill="currentColor" fill-opacity="0.06" stroke="none"/>` : ''}
      <path class="ml-primary ml-draw" pathLength="1" d="${d}" fill="none" stroke="currentColor"/>
      ${marks.map(([x, y]) => `<circle class="ml-mark ml-fade-mark" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2" fill="currentColor"/>`).join('')}
      <text x="12" y="16">SÉRIE · AQI</text>
    </svg>
    <div class="ml-chart-legend ds-mono">12 pts · hover scrub</div>`;
  const svg = el.querySelector('svg')!;
  svg.addEventListener('pointermove', (e) => {
    const r = svg.getBoundingClientRect();
    const t = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    const i = Math.round(t * (values.length - 1));
    qs<HTMLElement>(el, '.ml-chart-legend').textContent = `t=${String(i).padStart(2, '0')} · ${values[i]}`;
  });
  return el;
}

function demoChartBar(horizontal = false): HTMLElement {
  const vals = [42, 68, 35, 80, 55, 72];
  const el = document.createElement('div');
  el.className = 'ml-chart';
  if (horizontal) {
    el.innerHTML = `<div class="ml-hbar">${vals
      .map(
        (v, i) =>
          `<div class="ml-hbar-row"><span class="ds-mono">${['A', 'B', 'C', 'D', 'E', 'F'][i]}</span><div class="ml-hbar-track"><div style="width:${v}%"></div></div><span class="ds-mono">${v}</span></div>`,
      )
      .join('')}</div>`;
  } else {
    el.innerHTML = `<svg class="ml-svg ml-chart-svg" viewBox="0 0 220 110" aria-label="Bar chart">
      ${vals
        .map((v, i) => {
          const h = (v / 100) * 80;
          const x = 20 + i * 32;
          return `<rect class="ml-grow" x="${x}" y="${100 - h}" width="14" height="${h}" fill="none" stroke="currentColor" stroke-width="1.15"/>`;
        })
        .join('')}
      <line class="ml-guide" x1="12" y1="100" x2="208" y2="100" stroke="currentColor" stroke-opacity="0.7"/>
    </svg>`;
  }
  return el;
}

function demoChartCandles(): HTMLElement {
  const candles = [
    [40, 70, 35, 60],
    [60, 78, 55, 72],
    [72, 80, 50, 54],
    [54, 68, 48, 66],
    [66, 84, 62, 78],
    [78, 90, 70, 74],
    [74, 82, 60, 64],
  ];
  const el = document.createElement('div');
  el.className = 'ml-chart';
  el.innerHTML = `<svg class="ml-svg ml-chart-svg" viewBox="0 0 220 110" aria-label="Candlestick">
    ${candles
      .map(([o, h, l, c], i) => {
        const x = 22 + i * 28;
        const yO = 100 - o;
        const yC = 100 - c;
        const top = Math.min(yO, yC);
        const body = Math.abs(yO - yC) || 2;
        const up = c >= o;
        return `<line class="ml-secondary" x1="${x}" y1="${100 - h}" x2="${x}" y2="${100 - l}" stroke="currentColor"/>
          <rect x="${x - 5}" y="${top}" width="10" height="${body}" fill="${up ? 'currentColor' : 'none'}" fill-opacity="0.12" stroke="currentColor" stroke-width="1.15"/>`;
      })
      .join('')}
    <text x="12" y="16">OHLC · 1.15</text>
  </svg>`;
  return el;
}

function demoChartDonut(): HTMLElement {
  const parts = [0.35, 0.25, 0.2, 0.2];
  let a0 = -Math.PI / 2;
  const arcs = parts.map((p, i) => {
    const a1 = a0 + p * Math.PI * 2;
    const x0 = 60 + Math.cos(a0) * 42;
    const y0 = 60 + Math.sin(a0) * 42;
    const x1 = 60 + Math.cos(a1) * 42;
    const y1 = 60 + Math.sin(a1) * 42;
    const large = p > 0.5 ? 1 : 0;
    const d = `M ${x0} ${y0} A 42 42 0 ${large} 1 ${x1} ${y1}`;
    a0 = a1;
    return `<path class="ml-donut" d="${d}" stroke="currentColor" stroke-opacity="${0.28 + i * 0.18}"/>`;
  });
  const el = document.createElement('div');
  el.className = 'ml-chart';
  el.innerHTML = `<svg class="ml-svg" viewBox="0 0 120 120" aria-label="Donut">
    ${arcs.join('')}
    <text class="ml-readout" x="60" y="64" text-anchor="middle">100</text>
    <text x="60" y="74" text-anchor="middle">TOTAL</text>
  </svg>`;
  return el;
}

function demoChartSpark(): HTMLElement {
  const values = [12, 18, 14, 22, 19, 28, 24, 31, 27, 36];
  const d = smoothPath(values, 160, 40, 4);
  const el = document.createElement('div');
  el.className = 'ml-metric';
  el.innerHTML = `<div class="ml-metric-value" style="font-size:1.6rem">+12.4%</div>
    <svg class="ml-svg" width="160" height="40" viewBox="0 0 160 40" aria-hidden="true"><path class="ml-primary" d="${d}" fill="none" stroke="currentColor"/></svg>
    <div class="ml-metric-label">Sparkline · 7d</div>`;
  return el;
}

function demoChartScatter(): HTMLElement {
  const pts = [
    [20, 70],
    [35, 55],
    [48, 62],
    [60, 40],
    [75, 48],
    [90, 30],
    [110, 36],
    [130, 22],
    [150, 28],
    [170, 18],
  ];
  const el = document.createElement('div');
  el.innerHTML = `<svg class="ml-svg ml-chart-svg" viewBox="0 0 200 100" aria-label="Scatter">
    <line class="ml-guide" x1="12" y1="88" x2="188" y2="88" stroke="currentColor" stroke-opacity="0.7"/>
    <line class="ml-guide" x1="12" y1="12" x2="12" y2="88" stroke="currentColor" stroke-opacity="0.7"/>
    ${pts.map(([x, y]) => `<circle class="ml-mark" cx="${x}" cy="${y}" r="2" fill="currentColor"/>`).join('')}
  </svg>`;
  return el.firstElementChild as HTMLElement;
}

function demoChartRadar(): HTMLElement {
  const vals = [0.8, 0.55, 0.7, 0.4, 0.9, 0.6];
  const n = vals.length;
  const poly = vals
    .map((v, i) => {
      const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
      return `${60 + Math.cos(a) * 42 * v},${60 + Math.sin(a) * 42 * v}`;
    })
    .join(' ');
  const rings = [0.33, 0.66, 1]
    .map(
      (s) =>
        `<polygon points="${Array.from({ length: n }, (_, i) => {
          const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
          return `${60 + Math.cos(a) * 42 * s},${60 + Math.sin(a) * 42 * s}`;
        }).join(' ')}" class="ml-guide" fill="none" stroke="currentColor" stroke-opacity="0.55"/>`,
    )
    .join('');
  const el = document.createElement('div');
  el.innerHTML = `<svg class="ml-svg" viewBox="0 0 120 120" aria-label="Radar">${rings}
    <polygon class="ml-primary" points="${poly}" fill="currentColor" fill-opacity="0.06" stroke="currentColor"/>
  </svg>`;
  return el.firstElementChild as HTMLElement;
}

function demoChartHisto(): HTMLElement {
  const bins = [8, 14, 22, 30, 26, 18, 12, 7, 4];
  const max = Math.max(...bins);
  const el = document.createElement('div');
  el.innerHTML = `<svg class="ml-svg ml-chart-svg" viewBox="0 0 220 100" aria-label="Histogram">
    ${bins
      .map((b, i) => {
        const h = (b / max) * 72;
        return `<rect class="ml-grow" x="${18 + i * 22}" y="${88 - h}" width="12" height="${h}" fill="none" stroke="currentColor" stroke-width="1.15"/>`;
      })
      .join('')}
    <line class="ml-guide" x1="12" y1="88" x2="208" y2="88" stroke="currentColor" stroke-opacity="0.7"/>
  </svg>`;
  return el.firstElementChild as HTMLElement;
}

function demoMenu(): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'ml-menu-wrap';
  wrap.innerHTML = `
    <button type="button" class="ml-btn" data-menu-trigger>Actions ▾</button>
    <div class="ml-menu" data-open="false" role="menu">
      <button type="button" role="menuitem">Export SVG <span>⇧E</span></button>
      <button type="button" role="menuitem">Duplicate <span>⌘D</span></button>
      <button type="button" role="menuitem">Move to…</button>
      <hr/>
      <button type="button" role="menuitem" data-danger>Delete <span>⌫</span></button>
    </div>`;
  const trigger = qs<HTMLButtonElement>(wrap, '[data-menu-trigger]');
  const menu = qs<HTMLElement>(wrap, '.ml-menu');
  const close = () => {
    menu.dataset.open = 'false';
  };
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.dataset.open = menu.dataset.open === 'true' ? 'false' : 'true';
  });
  menu.querySelectorAll('button').forEach((b) =>
    b.addEventListener('click', () => {
      pushToast(`Menu · ${b.textContent?.split('\n')[0]?.trim()}`);
      close();
    }),
  );
  document.addEventListener('click', close);
  return wrap;
}

function demoContextMenu(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ml-ctx-stage';
  el.textContent = 'Right-click or long-press this plate';
  const menu = document.createElement('div');
  menu.className = 'ml-menu ml-ctx-menu';
  menu.dataset.open = 'false';
  menu.innerHTML = `<button type="button">Inspect</button><button type="button">Copy path</button><button type="button">Pin</button>`;
  el.append(menu);
  const openAt = (x: number, y: number) => {
    const r = el.getBoundingClientRect();
    menu.style.left = `${x - r.left}px`;
    menu.style.top = `${y - r.top}px`;
    menu.dataset.open = 'true';
  };
  el.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    openAt(e.clientX, e.clientY);
  });
  let timer = 0;
  el.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') {
      timer = window.setTimeout(() => openAt(e.clientX, e.clientY), 480);
    }
  });
  el.addEventListener('pointerup', () => clearTimeout(timer));
  el.addEventListener('pointerleave', () => clearTimeout(timer));
  document.addEventListener('click', () => {
    menu.dataset.open = 'false';
  });
  return el;
}

function demoSelect(): HTMLElement {
  const options = ['Ivory editorial', 'Aqua climate', 'Terracotta warm', 'Obsidian terminal'];
  let value = options[0]!;
  const el = document.createElement('div');
  el.className = 'ml-field ml-select-field';
  el.innerHTML = `<label id="ml-select-label">Atmosphere</label>
    <div class="ml-select-wrap">
      <button type="button" class="ml-select-trigger" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="ml-select-label">
        <span class="ml-select-value">${value}</span>
        <span class="ml-select-chevron" aria-hidden="true">▾</span>
      </button>
      <div class="ml-select-list" role="listbox" data-open="false" hidden>
        ${options
          .map(
            (o, i) =>
              `<button type="button" class="ml-select-option" role="option" data-value="${o}" aria-selected="${i === 0}">${o}</button>`,
          )
          .join('')}
      </div>
    </div>`;
  const trigger = qs<HTMLButtonElement>(el, '.ml-select-trigger');
  const list = qs<HTMLElement>(el, '.ml-select-list');
  const valueEl = qs<HTMLElement>(el, '.ml-select-value');
  const setOpen = (open: boolean) => {
    list.dataset.open = String(open);
    list.hidden = !open;
    trigger.setAttribute('aria-expanded', String(open));
  };
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(list.dataset.open !== 'true');
  });
  list.querySelectorAll<HTMLButtonElement>('.ml-select-option').forEach((opt) => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      value = opt.dataset.value!;
      valueEl.textContent = value;
      list.querySelectorAll('.ml-select-option').forEach((o) => o.setAttribute('aria-selected', 'false'));
      opt.setAttribute('aria-selected', 'true');
      setOpen(false);
    });
  });
  document.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
  return el;
}

function demoPicker(kind: string): HTMLElement {
  const items =
    kind.includes('currency')
      ? ['USD', 'BRL', 'EUR', 'JPY', 'GBP']
      : kind.includes('ephemeris') || kind.includes('oklch')
        ? ['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte']
        : ['PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'WEGE3'];
  const el = document.createElement('div');
  el.className = 'ml-picker';
  el.innerHTML = `<input type="search" placeholder="Filter…" class="ml-picker-input" />
    <div class="ml-picker-list"></div>`;
  const list = qs<HTMLElement>(el, '.ml-picker-list');
  const input = qs<HTMLInputElement>(el, 'input');
  const paint = () => {
    const q = input.value.toLowerCase();
    list.innerHTML = items
      .filter((x) => x.toLowerCase().includes(q))
      .map((x) => `<button type="button" class="ml-picker-item"><span>${x}</span><span class="ds-mono">select</span></button>`)
      .join('');
    list.querySelectorAll('button').forEach((b) =>
      b.addEventListener('click', () => {
        pushToast(`Picked · ${b.querySelector('span')?.textContent}`);
        list.querySelectorAll('button').forEach((x) => x.removeAttribute('data-active'));
        b.dataset.active = 'true';
      }),
    );
  };
  input.addEventListener('input', paint);
  paint();
  return el;
}

function demoCombobox(): HTMLElement {
  return demoPicker('market');
}

function demoDatePicker(): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'ml-datepicker';
  const field = demoInput(false);
  qs<HTMLInputElement>(field, 'input').placeholder = '2026-11-20';
  const cal = demoCalendar();
  cal.hidden = true;
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'ml-btn';
  btn.textContent = 'Pick date';
  btn.addEventListener('click', () => {
    cal.hidden = !cal.hidden;
  });
  wrap.append(field, btn, cal);
  return wrap;
}

function demoTimePicker(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ml-time';
  let h = 14;
  let m = 30;
  const paint = () => {
    qs<HTMLElement>(el, '.ml-time-read').textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };
  el.innerHTML = `
    <div class="ml-time-read ds-mono">14:30</div>
    <div class="ml-time-cols">
      <div><button type="button" data-h="1">▲</button><button type="button" data-h="-1">▼</button></div>
      <div><button type="button" data-m="5">▲</button><button type="button" data-m="-5">▼</button></div>
    </div>`;
  el.querySelectorAll('button').forEach((b) => {
    b.addEventListener('click', () => {
      const dh = Number((b as HTMLElement).dataset.h || 0);
      const dm = Number((b as HTMLElement).dataset.m || 0);
      h = (h + dh + 24) % 24;
      m = (m + dm + 60) % 60;
      paint();
    });
  });
  paint();
  return el;
}

function demoFileDrop(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ml-drop';
  el.innerHTML = `<div class="ds-mono">Drop files here</div><div style="font-size:12px;color:var(--ds-fg-muted)">SVG · CSV · PDF</div>`;
  el.addEventListener('dragover', (e) => {
    e.preventDefault();
    el.dataset.active = 'true';
  });
  el.addEventListener('dragleave', () => delete el.dataset.active);
  el.addEventListener('drop', (e) => {
    e.preventDefault();
    delete el.dataset.active;
    const n = e.dataTransfer?.files?.length ?? 0;
    pushToast(`Received ${n} file(s)`);
  });
  el.addEventListener('click', () => pushToast('Choose files…'));
  return el;
}

function demoSheet(): HTMLElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'ml-btn ml-btn-primary';
  btn.textContent = 'Open sheet';
  btn.addEventListener('click', () => setSheet(true));
  return btn;
}

function demoDrawer(): HTMLElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'ml-btn';
  btn.textContent = 'Open drawer';
  btn.addEventListener('click', () => setDrawerLab(true));
  return btn;
}

function demoSteps(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ml-steps';
  let cur = 1;
  const paint = () => {
    el.querySelectorAll('.ml-step').forEach((s, i) => {
      (s as HTMLElement).dataset.state = i < cur ? 'done' : i === cur ? 'current' : 'todo';
    });
  };
  el.innerHTML = [0, 1, 2, 3]
    .map((i) => `<button type="button" class="ml-step" data-i="${i}"><span>${i + 1}</span><em>${['Brief', 'Draft', 'Review', 'Ship'][i]}</em></button>`)
    .join('<span class="ml-step-rule"></span>');
  el.querySelectorAll('.ml-step').forEach((b) =>
    b.addEventListener('click', () => {
      cur = Number((b as HTMLElement).dataset.i);
      paint();
    }),
  );
  paint();
  return el;
}

function plateArt(seed: number): string {
  const y1 = 20 + (seed % 5) * 8;
  const y2 = 50 + ((seed * 3) % 7) * 4;
  return `<svg class="ml-gallery-art" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <rect width="160" height="100" fill="var(--ds-surface-2)"/>
    <path d="M0 ${y1} Q40 ${y2} 80 ${y1 + 10} T160 ${y2}" fill="none" stroke="currentColor" stroke-opacity="0.35" stroke-width="0.7" vector-effect="non-scaling-stroke"/>
    <path d="M0 ${y2} Q50 ${y1} 100 ${y2 + 8} T160 ${y1}" fill="none" stroke="currentColor" stroke-opacity="0.7" stroke-width="1.5" vector-effect="non-scaling-stroke"/>
    <circle cx="${40 + (seed % 8) * 12}" cy="${36 + (seed % 5) * 6}" r="1.6" fill="currentColor" fill-opacity="0.7"/>
  </svg>`;
}

function demoGallery(): HTMLElement {
  const slides = ['Plate I', 'Plate II', 'Plate III', 'Plate IV'];
  const ratios: Array<[string, string]> = [
    ['1:1', '1 / 1'],
    ['4:5', '4 / 5'],
    ['16:9', '16 / 9'],
    ['3:4', '3 / 4'],
  ];
  let i = 0;
  let aspect = ratios[2]![1];
  const el = document.createElement('div');
  el.className = 'ml-gallery';
  el.innerHTML = `
    <div class="ml-gallery-ratios">${ratios
      .map(([label, val], ri) => `<button type="button" data-aspect="${val}" data-active="${ri === 2}">${label}</button>`)
      .join('')}</div>
    <div class="ml-gallery-frame" style="--ml-aspect:${aspect}">${plateArt(0)}<span>${slides[0]}</span></div>
    <div class="ml-gallery-nav"><button type="button" data-d="-1">←</button><div class="ml-gallery-dots"></div><button type="button" data-d="1">→</button></div>`;
  const frame = qs<HTMLElement>(el, '.ml-gallery-frame');
  const label = qs<HTMLElement>(frame, 'span');
  const dots = qs<HTMLElement>(el, '.ml-gallery-dots');
  const paint = () => {
    frame.style.setProperty('--ml-aspect', aspect);
    frame.innerHTML = `${plateArt(i)}<span>${slides[i]}</span>`;
    dots.innerHTML = slides.map((_, di) => `<button type="button" data-i="${di}" data-on="${di === i}"></button>`).join('');
    dots.querySelectorAll('button').forEach((b) =>
      b.addEventListener('click', () => {
        i = Number((b as HTMLElement).dataset.i);
        paint();
      }),
    );
  };
  el.querySelectorAll<HTMLButtonElement>('.ml-gallery-ratios button').forEach((b) => {
    b.addEventListener('click', () => {
      aspect = b.dataset.aspect!;
      el.querySelectorAll('.ml-gallery-ratios button').forEach((x) => delete (x as HTMLElement).dataset.active);
      b.dataset.active = 'true';
      paint();
    });
  });
  el.querySelectorAll('[data-d]').forEach((b) =>
    b.addEventListener('click', () => {
      i = (i + Number((b as HTMLElement).dataset.d) + slides.length) % slides.length;
      paint();
    }),
  );
  paint();
  return el;
}

function demoFilmstrip(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ml-filmstrip';
  el.innerHTML = Array.from({ length: 8 }, (_, i) => {
    return `<button type="button" class="ml-film-cell" data-active="${i === 0}">
      ${plateArt(i + 2)}
      <span class="ds-mono">${String(i + 1).padStart(2, '0')}</span>
    </button>`;
  }).join('');
  el.querySelectorAll<HTMLButtonElement>('.ml-film-cell').forEach((cell) => {
    cell.addEventListener('click', () => {
      el.querySelectorAll('.ml-film-cell').forEach((c) => delete (c as HTMLElement).dataset.active);
      cell.dataset.active = 'true';
    });
  });
  return el;
}

function demoTimeline(): HTMLElement {
  const host = document.createElement('div');
  host.className = 'lab-timeline-host';
  createTimeline(host, {
    activeIndex: 1,
    animate: false,
    items: [
      { label: '06:30', title: 'Ivory · Paper', description: 'Single-Ink ground' },
      { label: '10:00', title: 'Plotter 1:1', description: '13 semantic roles' },
      { label: '14:30', title: 'Atelier TS', description: '< 0.7ms/frame' },
      { label: '20:00', title: 'Obsidian', description: '4-layer audit' },
    ],
  });
  return host;
}

function demoImageFrame(inspect = false): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ml-frame';
  el.innerHTML = `
    <div class="ml-frame-plate" ${inspect ? 'data-inspect="true"' : ''}>
      ${plateArt(5)}
      <div class="ml-frame-cross" aria-hidden="true"></div>
    </div>
    <div class="ml-frame-caption">
      <span>PLATE · 4px · gutter 12</span>
      <span class="ml-frame-xy">—</span>
    </div>
    ${inspect ? '<div class="ml-frame-tools"><button type="button" class="ml-btn" data-inspect-toggle>Toggle crosshair</button></div>' : ''}`;
  const plate = qs<HTMLElement>(el, '.ml-frame-plate');
  const xy = qs<HTMLElement>(el, '.ml-frame-xy');
  const update = (clientX: number, clientY: number) => {
    const r = plate.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    const y = Math.max(0, Math.min(1, (clientY - r.top) / r.height));
    plate.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    plate.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
    xy.textContent = `${Math.round(x * 100)},${Math.round(y * 100)}`;
  };
  plate.addEventListener('pointermove', (e) => {
    if (plate.dataset.inspect === 'true') update(e.clientX, e.clientY);
  });
  plate.addEventListener('pointerdown', (e) => {
    plate.dataset.inspect = 'true';
    update(e.clientX, e.clientY);
  });
  el.querySelector('[data-inspect-toggle]')?.addEventListener('click', () => {
    const on = plate.dataset.inspect === 'true';
    if (on) delete plate.dataset.inspect;
    else plate.dataset.inspect = 'true';
  });
  return el;
}

function demoDataTable(): HTMLElement {
  const rows = [
    ['PETR4', '38.42', '+1.2%', 'A'],
    ['VALE3', '62.10', '−0.4%', 'A'],
    ['ITUB4', '28.55', '+0.8%', 'B'],
    ['BBDC4', '14.02', '−1.1%', 'B'],
    ['WEGE3', '48.90', '+2.3%', 'A'],
  ];
  const el = document.createElement('div');
  el.className = 'ml-table-wrap';
  el.innerHTML = `<table class="ml-table">
    <thead><tr><th data-sort>Ticker</th><th data-sort>Price</th><th data-sort>Δ</th><th>Tier</th></tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>`;
  el.querySelectorAll('tbody tr').forEach((tr) => {
    tr.addEventListener('click', () => {
      el.querySelectorAll('tr').forEach((x) => x.removeAttribute('data-active'));
      tr.setAttribute('data-active', 'true');
    });
  });
  return el;
}

function demoInfoTable(): HTMLElement {
  const pairs = [
    ['Address', 'Av. Paulista, 1000'],
    ['AQI', '28 · Good'],
    ['Source', 'Tier A · MCP'],
    ['Updated', '20 Nov 14:10'],
  ];
  const el = document.createElement('div');
  el.className = 'ml-info-table';
  el.innerHTML = pairs
    .map(([k, v]) => `<div><span class="ds-mono">${k}</span><strong>${v}</strong></div>`)
    .join('');
  return el;
}

function demoLedgerTable(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ml-table-wrap';
  el.innerHTML = `<table class="ml-table ml-ledger">
    <thead><tr><th>Date</th><th>Memo</th><th>Debit</th><th>Credit</th></tr></thead>
    <tbody>
      <tr><td class="ds-mono">11-18</td><td>Solar credit</td><td></td><td class="ds-mono">1.240</td></tr>
      <tr><td class="ds-mono">11-19</td><td>Grid fee</td><td class="ds-mono">180</td><td></td></tr>
      <tr><td class="ds-mono">11-20</td><td>Offset</td><td></td><td class="ds-mono">420</td></tr>
    </tbody>
  </table>`;
  return el;
}

function demoKpiStrip(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ml-kpi-strip';
  el.innerHTML = [
    ['AQI', '28', '−6%'],
    ['Temp', '23°', '+1'],
    ['UV', '4', 'ok'],
    ['Pollen', '1/5', 'low'],
  ]
    .map(
      ([k, v, d]) =>
        `<div class="ml-kpi"><span class="ds-mono">${k}</span><strong>${v}</strong><em class="ds-mono">${d}</em></div>`,
    )
    .join('');
  return el;
}

function demoConsole(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ml-console';
  const readout = document.createElement('div');
  readout.className = 'ml-console-readout';
  const updateReadout = () => {
    const active = Array.from(el.querySelectorAll<HTMLButtonElement>('.ml-console-key'))
      .map((b, i) => (b.dataset.on === 'true' ? `CH${i + 1}` : null))
      .filter(Boolean);
    readout.textContent = active.length ? `ACTIVE · ${active.join(' · ')}` : 'ALL CHANNELS STANDBY';
  };
  for (let i = 0; i < 6; i++) {
    const on = i === 0 || i === 2 || i === 4;
    const cell = document.createElement('div');
    cell.className = 'ml-console-cell';
    cell.innerHTML = `
      <button type="button" class="ml-console-key" data-on="${on}" aria-pressed="${on}" aria-label="Channel ${i + 1}">
        <span class="ml-console-led"></span>
        <span class="ds-mono" style="font-size:10px">0${i + 1}</span>
      </button>`;
    const btn = qs<HTMLButtonElement>(cell, 'button');
    btn.addEventListener('click', () => {
      const next = btn.dataset.on !== 'true';
      btn.dataset.on = String(next);
      btn.setAttribute('aria-pressed', String(next));
      updateReadout();
    });
    el.append(cell);
  }
  el.append(readout);
  updateReadout();
  return el;
}

function demoPlate(item: CatalogItem): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ml-plate-empty';
  el.innerHTML = `<div class="ds-mono" style="margin-bottom:6px">${item.category.toUpperCase()}</div>
    <div>Line plate · <code>${item.install}</code></div>
    <div style="margin-top:8px;font-size:12px;color:var(--ds-fg-muted)">${item.blurb}</div>`;
  return el;
}

function buildDemo(item: CatalogItem): HTMLElement {
  const kind: DemoKind = item.demo;
  switch (kind) {
    case 'button':
      return demoButton();
    case 'slider':
      return demoSlider();
    case 'switch':
      return demoSwitch();
    case 'dial':
      return demoDial(item.id);
    case 'bar-slider':
      return demoBarSlider();
    case 'radio':
      return demoRadio();
    case 'segmented':
      return demoSegmented();
    case 'tactile-key':
      return demoKey();
    case 'tactile-keypad':
      return demoKeypad();
    case 'tactile-lever':
      return demoLever();
    case 'tactile-console':
      return demoConsole();
    case 'progress':
      return demoProgress();
    case 'metric':
      return demoMetric();
    case 'tabs':
      return demoTabs();
    case 'accordion':
      return demoAccordion();
    case 'input':
      return demoInput(false);
    case 'search':
      return demoInput(true);
    case 'toast':
      return demoToast();
    case 'dialog':
      return demoDialog();
    case 'sheet':
      return demoSheet();
    case 'drawer':
      return demoDrawer();
    case 'menu':
      return demoMenu();
    case 'context-menu':
      return demoContextMenu();
    case 'select':
      return demoSelect();
    case 'picker':
      return demoPicker(item.id);
    case 'color-picker':
      return demoColorPicker();
    case 'combobox':
      return demoCombobox();
    case 'date-picker':
      return demoDatePicker();
    case 'time-picker':
      return demoTimePicker();
    case 'file-drop':
      return demoFileDrop();
    case 'command':
      return demoCommand();
    case 'scroll':
      return demoScroll();
    case 'calendar':
      return demoCalendar();
    case 'compass':
      return demoCompass(item.id);
    case 'audio-meter':
      return demoAudioMeter();
    case 'steps':
      return demoSteps();
    case 'gallery':
      return demoGallery();
    case 'filmstrip':
      return demoFilmstrip();
    case 'timeline':
      return demoTimeline();
    case 'image-frame':
      return demoImageFrame(false);
    case 'image-inspector':
      return demoImageFrame(true);
    case 'data-table':
      return demoDataTable();
    case 'info-table':
      return demoInfoTable();
    case 'ledger-table':
      return demoLedgerTable();
    case 'kpi-strip':
      return demoKpiStrip();
    case 'chart-line':
      return demoChartLine(false);
    case 'chart-area':
      return demoChartLine(true);
    case 'chart-bar':
      return demoChartBar(false);
    case 'chart-hbar':
      return demoChartBar(true);
    case 'chart-candles':
      return demoChartCandles();
    case 'chart-donut':
      return demoChartDonut();
    case 'chart-spark':
      return demoChartSpark();
    case 'chart-scatter':
      return demoChartScatter();
    case 'chart-radar':
      return demoChartRadar();
    case 'chart-histo':
      return demoChartHisto();
    case 'svg-instrument':
      return demoSvgInstrument(item.id);
    case 'hairline-iso':
      return demoHairlineIso();
    default:
      return demoPlate(item);
  }
}

/* ---------- Toast / Dialog / Cmdk hosts ---------- */

function ensureHosts(): void {
  if (!document.querySelector('.lab-toast-region')) {
    const r = document.createElement('div');
    r.className = 'lab-toast-region';
    r.setAttribute('aria-live', 'polite');
    document.body.append(r);
  }
  if (!document.querySelector('.lab-dialog-backdrop')) {
    const back = document.createElement('div');
    back.className = 'lab-dialog-backdrop';
    const dlg = document.createElement('div');
    dlg.className = 'lab-dialog';
    dlg.setAttribute('role', 'dialog');
    dlg.setAttribute('aria-modal', 'true');
    dlg.setAttribute('aria-labelledby', 'lab-dialog-title');
    dlg.innerHTML = `
      <h2 id="lab-dialog-title">Confirm order</h2>
      <p>Meridian line dialog — dim without heavy blur. Esc or backdrop closes.</p>
      <div class="ml-btn-row" style="justify-content:flex-end">
        <button type="button" class="ml-btn" data-dialog-close>Cancel</button>
        <button type="button" class="ml-btn ml-btn-primary" data-dialog-close>Confirm</button>
      </div>`;
    document.body.append(back, dlg);
    back.addEventListener('click', () => setDialog(false));
    dlg.querySelectorAll('[data-dialog-close]').forEach((b) => b.addEventListener('click', () => setDialog(false)));
  }
  if (!document.querySelector('.lab-cmdk-backdrop')) {
    const back = document.createElement('div');
    back.className = 'lab-cmdk-backdrop';
    const panel = document.createElement('div');
    panel.className = 'lab-cmdk';
    panel.innerHTML = `
      <input type="search" placeholder="Jump to component…" aria-label="Command palette" />
      <div class="lab-cmdk-list" role="listbox"></div>`;
    document.body.append(back, panel);
    back.addEventListener('click', () => setCmdk(false));
    const input = qs<HTMLInputElement>(panel, 'input');
    input.addEventListener('input', () => renderCmdkList(input.value));
  }
  if (!document.querySelector('.lab-sheet-backdrop')) {
    const back = document.createElement('div');
    back.className = 'lab-sheet-backdrop';
    const sheet = document.createElement('div');
    sheet.className = 'lab-sheet';
    sheet.innerHTML = `<div class="lab-sheet-handle"></div>
      <h2 class="serif" style="font-family:var(--ds-font-display);font-weight:400;margin:8px 0">Bottom sheet</h2>
      <p style="color:var(--ds-fg-muted);font-size:14px;line-height:1.5;margin:0 0 16px">Bottom sheet · drag handle · Esc closes.</p>
      <button type="button" class="ml-btn ml-btn-primary" data-sheet-close>Done</button>`;
    document.body.append(back, sheet);
    back.addEventListener('click', () => setSheet(false));
    sheet.querySelector('[data-sheet-close]')!.addEventListener('click', () => setSheet(false));
  }
  if (!document.querySelector('.lab-drawer-backdrop')) {
    const back = document.createElement('div');
    back.className = 'lab-drawer-backdrop';
    const drawer = document.createElement('div');
    drawer.className = 'lab-drawer';
    drawer.innerHTML = `<div class="ds-eyebrow">Drawer</div>
      <h2 style="font-family:var(--ds-font-display);font-weight:400;margin:8px 0 12px">Tokens & filters</h2>
      <p style="color:var(--ds-fg-muted);font-size:13.5px;line-height:1.5">Lateral panel with dim backdrop — Meridian rail grammar.</p>
      <button type="button" class="ml-btn" data-drawer-close style="margin-top:16px">Close</button>`;
    document.body.append(back, drawer);
    back.addEventListener('click', () => setDrawerLab(false));
    drawer.querySelector('[data-drawer-close]')!.addEventListener('click', () => setDrawerLab(false));
  }
}

function setSheet(open: boolean): void {
  ensureHosts();
  qs<HTMLElement>(document, '.lab-sheet-backdrop').dataset.open = String(open);
  qs<HTMLElement>(document, '.lab-sheet').dataset.open = String(open);
}

function setDrawerLab(open: boolean): void {
  ensureHosts();
  qs<HTMLElement>(document, '.lab-drawer-backdrop').dataset.open = String(open);
  qs<HTMLElement>(document, '.lab-drawer').dataset.open = String(open);
}

function pushToast(message: string): void {
  ensureHosts();
  const region = qs<HTMLElement>(document, '.lab-toast-region');
  const t = document.createElement('div');
  t.className = 'lab-toast';
  t.textContent = message;
  region.append(t);
  requestAnimationFrame(() => {
    t.dataset.state = 'open';
  });
  setTimeout(() => {
    delete t.dataset.state;
    setTimeout(() => t.remove(), 420);
  }, 2600);
}

function setDialog(open: boolean): void {
  ensureHosts();
  qs<HTMLElement>(document, '.lab-dialog-backdrop').dataset.open = String(open);
  qs<HTMLElement>(document, '.lab-dialog').dataset.open = String(open);
}

function renderCmdkList(query: string): void {
  const list = qs<HTMLElement>(document, '.lab-cmdk-list');
  const q = query.trim().toLowerCase();
  const items = COMPONENT_CATALOG.filter(
    (c) => !q || c.name.toLowerCase().includes(q) || c.id.includes(q) || c.category.includes(q),
  ).slice(0, 12);
  list.innerHTML = items
    .map(
      (c, i) =>
        `<div class="lab-cmdk-item" data-active="${i === 0}" data-id="${c.id}" role="option"><span>${c.name}</span><span>${c.category}</span></div>`,
    )
    .join('');
  list.querySelectorAll<HTMLElement>('.lab-cmdk-item').forEach((row) => {
    row.addEventListener('click', () => {
      setCmdk(false);
      openComponentPage(row.dataset.id ?? null);
    });
  });
}

function setCmdk(open: boolean): void {
  ensureHosts();
  qs<HTMLElement>(document, '.lab-cmdk-backdrop').dataset.open = String(open);
  const panel = qs<HTMLElement>(document, '.lab-cmdk');
  panel.dataset.open = String(open);
  if (open) {
    const input = qs<HTMLInputElement>(panel, 'input');
    input.value = '';
    renderCmdkList('');
    requestAnimationFrame(() => input.focus());
  }
}

/* ---------- Page render ---------- */

let activeCategory: ComponentCategory | 'all' = 'all';
let searchQuery = '';

function findComponent(id: string | null): CatalogItem | undefined {
  if (!id) return undefined;
  return COMPONENT_CATALOG.find((c) => c.id === id);
}

function readComponentFromUrl(): string | null {
  const id = new URLSearchParams(window.location.search).get('component');
  return findComponent(id) ? id : null;
}

let selectedComponentId: string | null = readComponentFromUrl();

function openComponentPage(id: string | null, push = true): void {
  selectedComponentId = id && findComponent(id) ? id : null;
  if (push) {
    const nextUrl = selectedComponentId
      ? `${window.location.pathname}?component=${encodeURIComponent(selectedComponentId)}`
      : window.location.pathname;
    window.history.pushState({ component: selectedComponentId }, '', nextUrl);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  renderPageView();
}

function filtered(): CatalogItem[] {
  return COMPONENT_CATALOG.filter((c) => {
    if (activeCategory !== 'all' && c.category !== activeCategory) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.id.includes(q) || c.blurb.toLowerCase().includes(q);
  });
}

const LAB_TEXT: Record<
  Lang,
  {
    allCats: string;
    promptTitle: string;
    copyPrompt: string;
    copied: string;
    expand: string;
    collapse: string;
    copyCli: string;
    openDetail: string;
    backAll: string;
    prevLabel: string;
    nextLabel: string;
    targetLabel: string;
    registryLabel: string;
    heroPrompt: string;
    heroEyebrow: string;
    heroTitle: string;
    heroDesc: string;
    searchPlaceholder: string;
  }
> = {
  pt: {
    allCats: 'Todos os componentes',
    promptTitle: 'Prompt de instalação',
    copyPrompt: 'Copiar prompt',
    copied: 'Copiado ✓',
    expand: 'Ver completo',
    collapse: 'Recolher',
    copyCli: 'Copiar CLI',
    openDetail: 'Abrir componente →',
    backAll: '← Todos os componentes',
    prevLabel: 'Anterior',
    nextLabel: 'Próximo',
    targetLabel: 'Arquivo & Export',
    registryLabel: 'Registry CLI',
    heroPrompt: 'Copiar prompt do sistema',
    heroEyebrow: 'Components Lab · v1.5 · 90 componentes',
    heroTitle: 'Componentes em linha tátil para sentir — e instalar',
    heroDesc:
      'Catálogo expandido do Meridian: 90 controles, menus, modais, sheets, drawers, pickers, tabelas, gráficos e instrumentos em traço único Hairline × Plotter. Abra qualquer componente para ver a demonstração isolada e o prompt de instalação.',
    searchPlaceholder: 'Buscar componentes…',
  },
  en: {
    allCats: 'All components',
    promptTitle: 'Install prompt',
    copyPrompt: 'Copy prompt',
    copied: 'Copied ✓',
    expand: 'Full prompt',
    collapse: 'Collapse',
    copyCli: 'Copy CLI',
    openDetail: 'Open component →',
    backAll: '← All components',
    prevLabel: 'Previous',
    nextLabel: 'Next',
    targetLabel: 'Target & Export',
    registryLabel: 'Registry CLI',
    heroPrompt: 'Copy system prompt',
    heroEyebrow: 'Components Lab · v1.5 · 90 components',
    heroTitle: 'Line components you can feel — and install',
    heroDesc:
      'Expanded Meridian catalog: 90 tactile controls, menus, modals, sheets, drawers, pickers, tables, charts, and instruments in single-ink Hairline × Plotter grammar. Open any component for its dedicated page and install prompt.',
    searchPlaceholder: 'Search components…',
  },
  es: {
    allCats: 'Todos los componentes',
    promptTitle: 'Prompt de instalación',
    copyPrompt: 'Copiar prompt',
    copied: 'Copiado ✓',
    expand: 'Ver completo',
    collapse: 'Contraer',
    copyCli: 'Copiar CLI',
    openDetail: 'Abrir componente →',
    backAll: '← Todos los componentes',
    prevLabel: 'Anterior',
    nextLabel: 'Siguiente',
    targetLabel: 'Archivo y Export',
    registryLabel: 'Registry CLI',
    heroPrompt: 'Copiar prompt del sistema',
    heroEyebrow: 'Components Lab · v1.5 · 90 componentes',
    heroTitle: 'Componentes en línea táctil para sentir — e instalar',
    heroDesc:
      'Catálogo expandido de Meridian: 90 controles, menús, modales, sheets, drawers, pickers, tablas, gráficos e instrumentos en trazo único Hairline × Plotter. Abre cualquier componente para ver su página y su prompt de instalación.',
    searchPlaceholder: 'Buscar componentes…',
  },
  fr: {
    allCats: 'Tous les composants',
    promptTitle: 'Prompt d’installation',
    copyPrompt: 'Copier le prompt',
    copied: 'Copié ✓',
    expand: 'Tout voir',
    collapse: 'Réduire',
    copyCli: 'Copier CLI',
    openDetail: 'Ouvrir →',
    backAll: '← Tous les composants',
    prevLabel: 'Précédent',
    nextLabel: 'Suivant',
    targetLabel: 'Cible & Export',
    registryLabel: 'Registry CLI',
    heroPrompt: 'Copier le prompt système',
    heroEyebrow: 'Components Lab · v1.5 · 90 composants',
    heroTitle: 'Des composants ligne tactiles — à ressentir et installer',
    heroDesc:
      'Catalogue Meridian étendu : 90 contrôles, menus, modales, sheets, tiroirs, sélecteurs, tableaux, graphiques et instruments en encre unique Hairline × Plotter. Ouvrez un composant pour voir sa page et son prompt d’installation.',
    searchPlaceholder: 'Rechercher un composant…',
  },
};

function syncLabHeroCopy(lang: Lang): void {
  const copy = LAB_TEXT[lang];
  const eyebrow = document.getElementById('lab-hero-eyebrow');
  const title = document.getElementById('lab-hero-title');
  const desc = document.getElementById('lab-hero-desc');
  const search = document.getElementById('lab-search-input') as HTMLInputElement | null;
  const sysBtn = document.getElementById('lab-copy-system-prompt');
  if (eyebrow) eyebrow.textContent = copy.heroEyebrow;
  if (title) title.textContent = copy.heroTitle;
  if (desc) desc.textContent = copy.heroDesc;
  if (search) search.placeholder = copy.searchPlaceholder;
  if (sysBtn) sysBtn.textContent = copy.heroPrompt;
}

function renderGrid(): void {
  const grid = qs<HTMLElement>(document, '#lab-grid');
  const count = qs<HTMLElement>(document, '#lab-count');
  const lang = getLang();
  const copy = LAB_TEXT[lang];
  const items = filtered();
  count.textContent = `${items.length} / ${COMPONENT_CATALOG.length}`;
  grid.innerHTML = '';
  for (const item of items) {
    const card = document.createElement('article');
    card.className = 'lab-card';
    card.id = `card-${item.id}`;
    card.dataset.category = item.category;
    const stage = document.createElement('div');
    stage.className = 'lab-card-stage';
    stage.append(buildDemo(item));
    const meta = document.createElement('div');
    meta.className = 'lab-card-meta';
    const cmd = installCommand(item.install, REGISTRY_BASE);
    const detailHref = `?component=${encodeURIComponent(item.id)}`;
    meta.innerHTML = `
      <div class="ds-eyebrow">${CATEGORY_LABELS[item.category]}${item.interactive ? ' · live' : ''}</div>
      <h3><a class="lab-card-title-link" href="${detailHref}" data-open-component="${item.id}">${item.name}</a></h3>
      <p>${item.blurb}</p>
      <div class="lab-card-actions">
        <a class="ml-btn" href="${detailHref}" data-open-component="${item.id}">${copy.openDetail}</a>
        <button type="button" class="ml-btn" data-copy-cli>${copy.copyCli}</button>
        <code title="${cmd}">${cmd}</code>
      </div>`;

    meta.querySelectorAll<HTMLAnchorElement>('[data-open-component]').forEach((link) => {
      link.addEventListener('click', (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        openComponentPage(item.id);
      });
    });

    meta.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('[data-copy-cli], [data-open-component], code, button, a')) return;
      openComponentPage(item.id);
    });

    meta.querySelector('[data-copy-cli]')!.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(cmd);
        pushToast(`Copied CLI · ${item.install}`);
      } catch {
        pushToast('Clipboard unavailable');
      }
    });
    card.append(stage, meta);
    grid.append(card);
  }
}

function renderDetail(item: CatalogItem): void {
  const detail = qs<HTMLElement>(document, '#lab-detail');
  const lang = getLang();
  const copy = LAB_TEXT[lang];
  const cmd = installCommand(item.install, REGISTRY_BASE);
  const prompt = buildInstallPrompt(item, REGISTRY_BASE, lang);
  const target = resolveComponentTarget(item.id);
  const idx = COMPONENT_CATALOG.findIndex((c) => c.id === item.id);
  const prev = idx > 0 ? COMPONENT_CATALOG[idx - 1] : null;
  const next = idx >= 0 && idx < COMPONENT_CATALOG.length - 1 ? COMPONENT_CATALOG[idx + 1] : null;

  detail.innerHTML = `
    <div class="lab-detail-top">
      <a href="./components.html" class="ml-btn" id="lab-detail-back">${copy.backAll}</a>
      <span class="ds-eyebrow">${CATEGORY_LABELS[item.category]} · ${item.id}${item.interactive ? ' · live' : ''}</span>
    </div>
    <header class="lab-detail-header">
      <h1>${item.name}</h1>
      <p>${item.blurb}</p>
    </header>
    <div class="lab-detail-stage" id="lab-detail-stage"></div>
    <div class="lab-prompt-section" data-expanded="true">
      <div class="lab-prompt-head">
        <span class="ds-eyebrow">${copy.promptTitle}</span>
        <div class="lab-prompt-btns">
          <button type="button" class="lab-prompt-copy-btn">${copy.copyPrompt}</button>
        </div>
      </div>
      <pre class="lab-prompt-pre" aria-label="${item.name} — ${copy.promptTitle}"></pre>
    </div>
    <div class="lab-detail-meta-grid">
      <div class="lab-detail-meta-cell">
        <span class="ds-eyebrow">${copy.registryLabel}</span>
        <div class="lab-detail-cli-row">
          <code>${cmd}</code>
          <button type="button" class="ml-btn" id="lab-detail-copy-cli" style="min-height:30px;padding:0 10px;font-size:11.5px;">${copy.copyCli}</button>
        </div>
      </div>
      <div class="lab-detail-meta-cell">
        <span class="ds-eyebrow">${copy.targetLabel}</span>
        <code>${target.file} · export ${target.symbol}</code>
        <a href="${REGISTRY_BASE}/${item.install}.json" target="_blank" rel="noopener noreferrer">${REGISTRY_BASE}/${item.install}.json ↗</a>
      </div>
    </div>
    <nav class="lab-detail-pager" aria-label="Component pagination">
      ${prev ? `<a class="ml-btn" href="?component=${encodeURIComponent(prev.id)}" data-pager="${prev.id}">← ${copy.prevLabel}: ${prev.name}</a>` : '<span></span>'}
      ${next ? `<a class="ml-btn" href="?component=${encodeURIComponent(next.id)}" data-pager="${next.id}">${copy.nextLabel}: ${next.name} →</a>` : '<span></span>'}
    </nav>`;

  qs<HTMLElement>(detail, '#lab-detail-stage').append(buildDemo(item));
  qs<HTMLElement>(detail, '.lab-prompt-pre').textContent = prompt;

  qs<HTMLButtonElement>(detail, '.lab-prompt-copy-btn').addEventListener('click', async (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    try {
      await navigator.clipboard.writeText(prompt);
      btn.textContent = copy.copied;
      pushToast(`${copy.copied} · ${item.name}`);
      window.setTimeout(() => {
        btn.textContent = copy.copyPrompt;
      }, 1400);
    } catch {
      pushToast('Clipboard unavailable');
    }
  });

  qs<HTMLButtonElement>(detail, '#lab-detail-copy-cli').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(cmd);
      pushToast(`Copied CLI · ${item.install}`);
    } catch {
      pushToast('Clipboard unavailable');
    }
  });

  qs<HTMLAnchorElement>(detail, '#lab-detail-back').addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    openComponentPage(null);
  });

  detail.querySelectorAll<HTMLAnchorElement>('[data-pager]').forEach((a) => {
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      openComponentPage(a.dataset.pager ?? null);
    });
  });
}

function renderPageView(): void {
  const hero = document.querySelector<HTMLElement>('.lab-hero');
  const toolbar = document.querySelector<HTMLElement>('.lab-toolbar');
  const grid = qs<HTMLElement>(document, '#lab-grid');
  const detail = qs<HTMLElement>(document, '#lab-detail');
  const item = findComponent(selectedComponentId);

  if (item) {
    document.title = `${item.name} — Meridian Components Lab`;
    if (hero) {
      hero.hidden = true;
      hero.style.display = 'none';
    }
    if (toolbar) {
      toolbar.hidden = true;
      toolbar.style.display = 'none';
    }
    grid.hidden = true;
    grid.style.display = 'none';
    detail.hidden = false;
    detail.style.display = 'flex';
    renderDetail(item);
  } else {
    document.title = 'Meridian — Components Lab';
    if (hero) {
      hero.hidden = false;
      hero.style.display = '';
    }
    if (toolbar) {
      toolbar.hidden = false;
      toolbar.style.display = '';
    }
    grid.hidden = false;
    grid.style.display = '';
    detail.hidden = true;
    detail.style.display = 'none';
    detail.innerHTML = '';
    renderGrid();
  }
}

function renderSidebar(): void {
  const nav = qs<HTMLElement>(document, '#lab-cats');
  const copy = LAB_TEXT[getLang()];
  const cats: Array<ComponentCategory | 'all'> = [
    'all',
    'controls',
    'inputs',
    'overlays',
    'tables',
    'charts',
    'surfaces',
    'navigation',
    'feedback',
    'instruments',
    'astronomy',
    'weather',
  ];
  nav.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'lab-cat';
  for (const c of cats) {
    const n = c === 'all' ? COMPONENT_CATALOG.length : COMPONENT_CATALOG.filter((i) => i.category === c).length;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'lab-cat-btn';
    b.dataset.active = String(c === activeCategory);
    b.innerHTML = `<span>${c === 'all' ? copy.allCats : CATEGORY_LABELS[c]}</span><span class="lab-cat-count">${n}</span>`;
    b.addEventListener('click', () => {
      activeCategory = c;
      renderSidebar();
      openComponentPage(null);
    });
    wrap.append(b);
  }
  nav.append(wrap);
}

function initChrome(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-surface-pick]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.documentElement.dataset.surface = btn.dataset.surfacePick!;
    });
  });

  const burger = document.getElementById('lab-burger');
  const rail = document.getElementById('lab-rail');
  const backdrop = document.getElementById('lab-rail-backdrop');
  const setRail = (open: boolean) => {
    burger?.setAttribute('aria-expanded', String(open));
    rail?.toggleAttribute('data-open', open);
    backdrop?.toggleAttribute('data-open', open);
  };
  burger?.addEventListener('click', () => setRail(burger.getAttribute('aria-expanded') !== 'true'));
  backdrop?.addEventListener('click', () => setRail(false));

  document.getElementById('lab-open-cmdk')?.addEventListener('click', () => setCmdk(true));

  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      setCmdk(true);
    }
    if (e.key === 'Escape') {
      setCmdk(false);
      setDialog(false);
      setSheet(false);
      setDrawerLab(false);
      setRail(false);
    }
  });
}

function init(): void {
  const lang = initI18n();
  mountPaperGrain({ seed: 20261120 });
  bootPaperGrainExtras();
  markPageReady();
  ensureHosts();
  initChrome();
  syncLabHeroCopy(lang);
  renderSidebar();
  renderPageView();

  window.addEventListener('popstate', () => {
    selectedComponentId = readComponentFromUrl();
    renderPageView();
  });

  const search = document.getElementById('lab-search-input') as HTMLInputElement | null;
  search?.addEventListener('input', () => {
    searchQuery = search.value;
    renderGrid();
  });

  const banner = document.getElementById('lab-registry-cmd');
  if (banner) banner.textContent = `npx shadcn@latest add ${REGISTRY_BASE}/registry.json`;

  document.getElementById('lab-copy-system-prompt')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    const currentLang = getLang();
    const copy = LAB_TEXT[currentLang];
    try {
      await navigator.clipboard.writeText(buildSystemInstallPrompt(REGISTRY_BASE, currentLang));
      btn.textContent = copy.copied;
      pushToast(`${copy.copied} · Meridian v1.5`);
      window.setTimeout(() => {
        btn.textContent = copy.heroPrompt;
      }, 1400);
    } catch {
      pushToast('Clipboard unavailable');
    }
  });

  window.addEventListener('meridian:lang', ((ev: CustomEvent<{ lang: Lang }>) => {
    syncLabHeroCopy(ev.detail.lang);
    renderSidebar();
    renderPageView();
  }) as EventListener);
}

init();
