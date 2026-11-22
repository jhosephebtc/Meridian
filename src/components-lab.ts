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
    const db = ((pct - 75) * 0.36).toFixed(1);
    readout.textContent = `${Math.round(v)}% · ${Number(db) >= 0 ? `+${db}` : db} dB`;
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
    if (dragging || e.pointerType === 'mouse') {
      fromPointer(e.clientX);
    }
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

function bindDial(
  root: HTMLElement,
  opts: { detent?: boolean; onUpdate?: (val: number, deg: number) => void } = {},
): void {
  const input = qs<HTMLInputElement>(root, 'input');
  const min = 0;
  const max = 100;
  let dragId: number | null = null;

  const paint = (v: number) => {
    const f = (v - min) / (max - min);
    const deg = -135 + f * 270;
    root.style.setProperty('--ml-dial-turn', `${deg}deg`);
    input.value = String(v);
    const out = root.querySelector('.ml-dial-out');
    if (out) out.textContent = `${Math.round(v)}`;
    opts.onUpdate?.(v, deg);
  };

  const fromPointer = (e: PointerEvent) => {
    const b = root.getBoundingClientRect();
    const dx = e.clientX - (b.left + b.width / 2);
    const dy = e.clientY - (b.top + b.height / 2);
    if (Math.hypot(dx, dy) < 8) return;
    const pointerAngle = ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;
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

  paint(42);
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
    if (dragId === e.pointerId || e.pointerType === 'mouse') {
      fromPointer(e);
    }
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
  const tickCount = 40;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const deg = -135 + (i / (tickCount - 1)) * 270;
    const a = ((deg - 90) * Math.PI) / 180;
    const major = i % 4 === 0;
    const r0 = major ? 42.5 : 45.5;
    const r1 = 48.5;
    return `<line data-plotter-role="${major ? 'secondary' : 'guide'}" x1="${(60 + Math.cos(a) * r0).toFixed(1)}" y1="${(58 + Math.sin(a) * r0).toFixed(1)}" x2="${(60 + Math.cos(a) * r1).toFixed(1)}" y2="${(58 + Math.sin(a) * r1).toFixed(1)}" stroke="currentColor"/>`;
  }).join('');

  const eyebrow =
    kind === 'camera-dial'
      ? 'VERNIER SHUTTER · ISO'
      : kind === 'camera-wheel'
        ? 'OPTICAL THUMB WHEEL'
        : detent
          ? 'STEPPED DETENT · 10'
          : 'ROTARY ENCODER · 270°';

  const wrap = document.createElement('div');
  wrap.className = 'ml-inst-panel';
  wrap.style.setProperty('--ml-cols', '3');
  wrap.innerHTML = `
    <div class="ml-inst-head">
      <span class="ml-inst-eyebrow">${eyebrow}</span>
      <span class="ml-inst-pill"><i class="ml-inst-pill-dot"></i><output data-dial-pill>42%</output></span>
    </div>
    <div class="ml-inst-stage">
      <div class="ml-dial">
        <svg class="ml-svg" data-plotter data-hairline viewBox="0 0 120 120" aria-hidden="true">
          <circle data-plotter-role="guide" cx="60" cy="58" r="53" fill="none" stroke="currentColor"/>
          ${ticks}
          <!-- 3D Cylindrical Platter Skirt + Knurled Vertical Ribs -->
          <path data-plotter-role="secondary" d="M 29.5 56 L 29.5 61 A 30.5 30.5 0 0 0 90.5 61 L 90.5 56 Z" fill="var(--ds-bg)" stroke="currentColor" opacity="0.65"/>
          ${Array.from({ length: 13 }, (_, i) => {
            const a = (Math.PI * (i + 1)) / 14;
            const x = 60 - Math.cos(a) * 30.5;
            const yTop = 56 + Math.sin(a) * 30.5;
            const yBot = 61 + Math.sin(a) * 30.5;
            return `<line data-plotter-role="secondary" x1="${x.toFixed(1)}" y1="${yTop.toFixed(1)}" x2="${x.toFixed(1)}" y2="${yBot.toFixed(1)}" stroke="currentColor" opacity="0.28"/>`;
          }).join('')}
          <!-- Main 3D Circular Platter -->
          <circle data-plotter-role="primary" cx="60" cy="56" r="30.5" fill="var(--ds-bg)" stroke="currentColor"/>
          <!-- Open Front Chamfer Crease -->
          <path data-plotter-role="secondary" d="M 34 56 A 26 26 0 0 0 86 56" fill="none" stroke="currentColor" opacity="0.32"/>
          ${kind === 'camera-dial' || kind === 'camera-wheel' ? '<circle data-plotter-role="guide" cx="60" cy="58" r="17" fill="none" stroke="currentColor"/>' : ''}
          <g class="ml-dial-knob">
            <line data-plotter-role="primary" x1="60" y1="45" x2="60" y2="31" stroke="currentColor"/>
            <circle data-plotter-role="primary" cx="60" cy="35" r="1.2" fill="currentColor" stroke="none"/>
          </g>
        </svg>
        <input type="range" min="0" max="100" step="${detent ? 10 : 1}" aria-label="Dial" />
      </div>
    </div>
    <div class="ml-inst-legend">
      <div class="ml-inst-cell"><span>Angle</span><strong data-dial-deg>-22°</strong></div>
      <div class="ml-inst-cell"><span>Level</span><strong data-dial-val>42%</strong></div>
      <div class="ml-inst-cell"><span>${detent ? 'Detent' : 'Sweep'}</span><strong data-dial-step>${detent ? '04 / 10' : '270°'}</strong></div>
    </div>`;

  const dialEl = qs<HTMLElement>(wrap, '.ml-dial');
  const pillEl = qs<HTMLElement>(wrap, '[data-dial-pill]');
  const degEl = qs<HTMLElement>(wrap, '[data-dial-deg]');
  const valEl = qs<HTMLElement>(wrap, '[data-dial-val]');
  const stepEl = qs<HTMLElement>(wrap, '[data-dial-step]');

  bindDial(dialEl, {
    detent,
    onUpdate: (v, deg) => {
      const rv = Math.round(v);
      const rdeg = Math.round(deg);
      pillEl.textContent = kind === 'camera-dial' ? `1/${Math.round(60 + rv * 9.4)}s` : `${rv}%`;
      degEl.textContent = `${rdeg > 0 ? '+' : ''}${rdeg}°`;
      valEl.textContent = `${rv}%`;
      stepEl.textContent = detent ? `${String(Math.round(rv / 10)).padStart(2, '0')} / 10` : `${Math.round(((deg + 135) / 270) * 40)} / 40`;
    },
  });
  return wrap;
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
    if (dragging || e.pointerType === 'mouse') {
      setFromPointer(e.clientX);
    }
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
  el.addEventListener('pointermove', (e) => {
    if (dragId === e.pointerId || e.pointerType === 'mouse') {
      setFromY(e.clientY);
    }
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

function hslToHexHelper(h: number, s: number, l: number): string {
  const sn = clamp(s, 0, 100) / 100;
  const ln = clamp(l, 0, 100) / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => Math.round((ln - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))) * 255);
  return `#${[f(0), f(8), f(4)].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

function demoColorPicker(kind = 'color-picker'): HTMLElement {
  const hues = [
    ['Red', 18],
    ['Coral', 36],
    ['Amber', 58],
    ['Ochre', 82],
    ['Lime', 118],
    ['Green', 148],
    ['Teal', 176],
    ['Cyan', 198],
    ['Blue', 228],
    ['Indigo', 258],
    ['Violet', 292],
    ['Rose', 338],
  ] as const;

  if (kind === 'oklch-palette') {
    const tones = [
      { label: 'Deep', l: 44, c: 0.16, hslL: 36, hslS: 68 },
      { label: 'Mid', l: 56, c: 0.18, hslL: 48, hslS: 74 },
      { label: 'Clear', l: 68, c: 0.15, hslL: 60, hslS: 72 },
      { label: 'Light', l: 78, c: 0.11, hslL: 74, hslS: 64 },
      { label: 'Pastel', l: 88, c: 0.06, hslL: 85, hslS: 54 },
    ] as const;
    const { panel, stage, setPill, setCells } = createInstrumentPanel(
      'OKLCH HONEYCOMB · 60 SWATCHES',
      'oklch(78% 0.11 198)',
      ['Tone', 'Lightness', 'Chroma', 'Hue'],
    );
    const comb = document.createElement('div');
    comb.className = 'ml-oklch-honeycomb';
    const allBtns: HTMLButtonElement[] = [];

    const selectSwatch = (tIdx: number, hIdx: number, btn: HTMLButtonElement) => {
      allBtns.forEach((b) => delete b.dataset.active);
      btn.dataset.active = 'true';
      const tone = tones[tIdx]!;
      const [hName, hDeg] = hues[hIdx]!;
      setPill(`oklch(${tone.l}% ${tone.c} ${hDeg})`);
      setCells([`${hName} ${tone.label}`, `${tone.l}%`, String(tone.c), `${hDeg}°`]);
    };

    tones.forEach((tone, tIdx) => {
      const row = document.createElement('div');
      row.className = 'ml-oklch-row';
      hues.forEach(([hName, hDeg], hIdx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ml-cp-swatch';
        const hex = hslToHexHelper(hDeg, tone.hslS, tone.hslL);
        btn.style.background = hex;
        btn.title = `${hName} · ${tone.label}`;
        btn.setAttribute('aria-label', `${hName} ${tone.label}`);
        if (tIdx === 3 && hIdx === 7) btn.dataset.active = 'true';
        btn.addEventListener('pointerenter', () => selectSwatch(tIdx, hIdx, btn));
        btn.addEventListener('click', () => selectSwatch(tIdx, hIdx, btn));
        allBtns.push(btn);
        row.append(btn);
      });
      comb.append(row);
    });
    stage.append(comb);
    setCells(['Cyan Light', '78%', '0.11', '198°']);
    return panel;
  }

  // Full Jhosephe Color Picker Studio (2D Saturation/Lightness Plane + 3D Hue Bar + 12 Swatches + OKLCH/RGB/HSL Modes)
  let H = 198;
  let S = 68;
  let L = 62;
  let mode: 'oklch' | 'rgb' | 'hsl' = 'oklch';

  const panel = document.createElement('div');
  panel.className = 'ml-inst-panel';
  panel.innerHTML = `
    <div class="ml-inst-head">
      <span class="ml-inst-pill"><i class="ml-inst-pill-dot" data-cp-dot></i><output data-cp-out>oklch(74% 0.12 198)</output></span>
      <div class="ml-cp-modes" role="tablist" aria-label="Color space">
        <button type="button" class="ml-cp-mode-btn" data-cp-mode="oklch" aria-selected="true">OKLCH</button>
        <button type="button" class="ml-cp-mode-btn" data-cp-mode="rgb" aria-selected="false">RGB</button>
        <button type="button" class="ml-cp-mode-btn" data-cp-mode="hsl" aria-selected="false">HSL</button>
      </div>
    </div>
    <div class="ml-cp-studio">
      <div class="ml-cp-pad" data-cp-pad style="--cp-hue:198">
        <span class="ml-cp-reticle" data-cp-reticle></span>
      </div>
      <div class="ml-cp-hue-bar" data-cp-hue>
        <span class="ml-cp-hue-thumb" data-cp-hue-thumb></span>
      </div>
      <div class="ml-cp-swatches" data-cp-swatches></div>
    </div>
    <div class="ml-inst-legend">
      <div class="ml-inst-cell"><span data-cp-l0>L%</span><strong data-cp-v0>74%</strong></div>
      <div class="ml-inst-cell"><span data-cp-l1>Chroma</span><strong data-cp-v1>0.120</strong></div>
      <div class="ml-inst-cell"><span data-cp-l2>Hue</span><strong data-cp-v2>198°</strong></div>
      <div class="ml-inst-cell"><span>Hex</span><strong data-cp-hex>#5CC2DF</strong></div>
    </div>`;

  const dotEl = qs<HTMLElement>(panel, '[data-cp-dot]');
  const outEl = qs<HTMLElement>(panel, '[data-cp-out]');
  const padEl = qs<HTMLElement>(panel, '[data-cp-pad]');
  const reticleEl = qs<HTMLElement>(panel, '[data-cp-reticle]');
  const hueBarEl = qs<HTMLElement>(panel, '[data-cp-hue]');
  const hueThumbEl = qs<HTMLElement>(panel, '[data-cp-hue-thumb]');
  const swatchesWrap = qs<HTMLElement>(panel, '[data-cp-swatches]');
  const l0 = qs<HTMLElement>(panel, '[data-cp-l0]');
  const l1 = qs<HTMLElement>(panel, '[data-cp-l1]');
  const l2 = qs<HTMLElement>(panel, '[data-cp-l2]');
  const v0 = qs<HTMLElement>(panel, '[data-cp-v0]');
  const v1 = qs<HTMLElement>(panel, '[data-cp-v1]');
  const v2 = qs<HTMLElement>(panel, '[data-cp-v2]');
  const hexEl = qs<HTMLElement>(panel, '[data-cp-hex]');

  const swatchBtns: HTMLButtonElement[] = [];
  hues.forEach(([hName, hDeg], idx) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ml-cp-swatch';
    b.style.background = hslToHexHelper(hDeg, 68, 62);
    b.title = hName;
    b.setAttribute('aria-label', hName);
    if (idx === 7) b.dataset.active = 'true';
    b.addEventListener('click', () => {
      H = hDeg;
      S = 68;
      L = 62;
      swatchBtns.forEach((x) => delete x.dataset.active);
      b.dataset.active = 'true';
      paint();
    });
    swatchBtns.push(b);
    swatchesWrap.append(b);
  });

  const paint = () => {
    const hex = hslToHexHelper(H, S, L);
    const okL = clamp(Math.round(L * 0.92 + 12), 12, 96);
    const okC = ((S / 100) * (1 - Math.abs(2 * (L / 100) - 1)) * 0.22).toFixed(3);
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    dotEl.style.background = hex;
    padEl.style.setProperty('--cp-hue', String(Math.round(H)));
    reticleEl.style.left = `${S}%`;
    reticleEl.style.top = `${100 - L}%`;
    reticleEl.style.background = hex;
    hueThumbEl.style.left = `${(H / 360) * 100}%`;
    hueThumbEl.style.background = `hsl(${Math.round(H)} 88% 56%)`;
    hexEl.textContent = hex;

    if (mode === 'oklch') {
      outEl.textContent = `oklch(${okL}% ${okC} ${Math.round(H)})`;
      l0.textContent = 'L%';
      l1.textContent = 'Chroma';
      l2.textContent = 'Hue';
      v0.textContent = `${okL}%`;
      v1.textContent = okC;
      v2.textContent = `${Math.round(H)}°`;
    } else if (mode === 'rgb') {
      outEl.textContent = `rgb(${r} ${g} ${b})`;
      l0.textContent = 'Red';
      l1.textContent = 'Green';
      l2.textContent = 'Blue';
      v0.textContent = String(r);
      v1.textContent = String(g);
      v2.textContent = String(b);
    } else {
      outEl.textContent = `hsl(${Math.round(H)} ${Math.round(S)}% ${Math.round(L)}%)`;
      l0.textContent = 'Hue';
      l1.textContent = 'Sat';
      l2.textContent = 'Light';
      v0.textContent = `${Math.round(H)}°`;
      v1.textContent = `${Math.round(S)}%`;
      v2.textContent = `${Math.round(L)}%`;
    }
  };

  panel.querySelectorAll<HTMLButtonElement>('[data-cp-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      mode = (btn.dataset.cpMode as 'oklch' | 'rgb' | 'hsl') || 'oklch';
      panel.querySelectorAll('[data-cp-mode]').forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
      paint();
    });
  });

  const updatePad = (clientX: number, clientY: number) => {
    const r = padEl.getBoundingClientRect();
    S = clamp(((clientX - r.left) / r.width) * 100, 4, 98);
    L = clamp((1 - (clientY - r.top) / r.height) * 84 + 10, 12, 92);
    paint();
  };
  padEl.addEventListener('pointerdown', (e) => {
    padEl.setPointerCapture(e.pointerId);
    updatePad(e.clientX, e.clientY);
  });
  padEl.addEventListener('pointermove', (e) => {
    if (e.buttons === 1 || e.pointerType === 'mouse') updatePad(e.clientX, e.clientY);
  });

  const updateHue = (clientX: number) => {
    const r = hueBarEl.getBoundingClientRect();
    H = clamp(((clientX - r.left) / r.width) * 360, 0, 360);
    paint();
  };
  hueBarEl.addEventListener('pointerdown', (e) => {
    hueBarEl.setPointerCapture(e.pointerId);
    updateHue(e.clientX);
  });
  hueBarEl.addEventListener('pointermove', (e) => {
    if (e.buttons === 1 || e.pointerType === 'mouse') updateHue(e.clientX);
  });

  paint();
  return panel;
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

function createInstrumentPanel(
  eyebrow: string,
  pillInit: string,
  labels: string[],
): {
  panel: HTMLElement;
  stage: HTMLElement;
  setPill: (text: string) => void;
  setCells: (values: string[]) => void;
} {
  const panel = document.createElement('div');
  panel.className = 'ml-inst-panel';
  panel.style.setProperty('--ml-cols', String(labels.length));
  panel.innerHTML = `
    <div class="ml-inst-head">
      <span class="ml-inst-eyebrow">${eyebrow}</span>
      <span class="ml-inst-pill"><i class="ml-inst-pill-dot"></i><output data-inst-pill>${pillInit}</output></span>
    </div>
    <div class="ml-inst-stage" data-inst-stage></div>
    <div class="ml-inst-legend">
      ${labels.map((l) => `<div class="ml-inst-cell"><span>${l}</span><strong data-inst-val>—</strong></div>`).join('')}
    </div>`;
  const stage = qs<HTMLElement>(panel, '[data-inst-stage]');
  const pillEl = qs<HTMLElement>(panel, '[data-inst-pill]');
  const cellEls = Array.from(panel.querySelectorAll<HTMLElement>('[data-inst-val]'));
  return {
    panel,
    stage,
    setPill: (text: string) => {
      pillEl.textContent = text;
    },
    setCells: (values: string[]) => {
      values.forEach((v, i) => {
        if (cellEls[i]) cellEls[i].textContent = v;
      });
    },
  };
}

function clockwiseArc(cx: number, cy: number, r: number, deg: number): string {
  const clamped = clamp(deg, 0.5, 359.5);
  const a = ((clamped - 90) * Math.PI) / 180;
  const x = cx + Math.cos(a) * r;
  const y = cy + Math.sin(a) * r;
  const large = clamped > 180 ? 1 : 0;
  return `M ${cx} ${(cy - r).toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x.toFixed(1)} ${y.toFixed(1)}`;
}

function demoCompass(kind = 'compass'): HTMLElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'ml-svg');
  svg.setAttribute('data-plotter', '');
  svg.setAttribute('data-hairline', '');
  svg.setAttribute('viewBox', '0 0 160 160');
  svg.style.cssText = 'width:100%;max-width:168px;height:auto;touch-action:none;color:var(--ds-fg);';

  const ticks36 = Array.from({ length: 36 }, (_, i) => {
    const a = (i / 36) * Math.PI * 2;
    const major = i % 3 === 0;
    const inner = major ? 54 : 58;
    const role = major ? 'secondary' : 'guide';
    return `<line data-plotter-role="${role}" x1="${(80 + Math.cos(a) * inner).toFixed(1)}" y1="${(80 + Math.sin(a) * inner).toFixed(1)}" x2="${(80 + Math.cos(a) * 61.5).toFixed(1)}" y2="${(80 + Math.sin(a) * 61.5).toFixed(1)}" stroke="currentColor"/>`;
  }).join('');

  // 3D Cylindrical Hairline Bezel (extruded lower cylinder wall + top plate + open front chamfer crease)
  const bezelHairline = `
    <circle data-plotter-role="guide" cx="80" cy="78" r="69" fill="none" stroke="currentColor"/>
    <path data-plotter-role="primary" d="M 14.5 78 L 14.5 83 A 65.5 65.5 0 0 0 145.5 83 L 145.5 78 Z" fill="var(--ds-bg)" stroke="currentColor" opacity="0.72"/>
    <circle data-plotter-role="primary" cx="80" cy="78" r="65.5" fill="var(--ds-bg)" stroke="currentColor"/>
    <path data-plotter-role="secondary" d="M 18.5 78 A 61.5 61.5 0 0 0 141.5 78" fill="none" stroke="currentColor" opacity="0.32"/>
    <circle data-plotter-role="secondary" cx="80" cy="78" r="61.5" fill="none" stroke="currentColor" opacity="0.26"/>
  `;

  if (kind === 'weather-instrument') {
    const { panel, stage, setPill, setCells } = createInstrumentPanel(
      'ATMOSPHERIC SENSOR · BARO',
      '22.4°C',
      ['Wind', 'Humidity', 'Pressure', 'Dew pt'],
    );
    stage.append(svg);
    const scaleTicks = Array.from({ length: 24 }, (_, i) => {
      const a = (i / 24) * Math.PI * 2;
      const r0 = i % 2 === 0 ? 52 : 55.5;
      return `<line data-plotter-role="${i % 2 === 0 ? 'secondary' : 'guide'}" x1="${(80 + Math.cos(a) * r0).toFixed(1)}" y1="${(80 + Math.sin(a) * r0).toFixed(1)}" x2="${(80 + Math.cos(a) * 59).toFixed(1)}" y2="${(80 + Math.sin(a) * 59).toFixed(1)}" stroke="currentColor"/>`;
    }).join('');
    let dirDeg = 238;
    let hpa = 1015;
    let rh = 56;
    let windKmh = 14.2;
    let tempC = 22.4;
    const renderWeather = () => {
      const dew = tempC - (100 - rh) / 5;
      svg.innerHTML = `
        ${bezelHairline}
        ${scaleTicks}
        <path data-plotter-role="secondary" d="${clockwiseArc(80, 80, 59, dirDeg)}" fill="none" stroke="currentColor" opacity="0.65"/>
        <circle data-plotter-role="guide" cx="80" cy="80" r="44" fill="none" stroke="currentColor"/>
        <text x="80" y="32" text-anchor="middle">N</text>
        <text x="128" y="83" text-anchor="middle">E</text>
        <text x="80" y="134" text-anchor="middle">S</text>
        <text x="32" y="83" text-anchor="middle">W</text>
        <g transform="rotate(${dirDeg.toFixed(1)} 80 80)">
          <path data-plotter-role="primary" d="M 80 34 L 84.5 76 L 80 71 L 75.5 76 Z" fill="var(--ds-bg)" stroke="currentColor"/>
          <line data-plotter-role="secondary" x1="80" y1="71" x2="80" y2="108" stroke="currentColor"/>
        </g>
        <circle data-plotter-role="primary" cx="80" cy="80" r="4.5" fill="var(--ds-bg)" stroke="currentColor"/>
        <circle data-plotter-role="primary" cx="80" cy="80" r="1.2" fill="currentColor" stroke="none"/>
      `;
      setPill(`${tempC.toFixed(1)}°C · ${Math.round(hpa)} hPa`);
      setCells([`${windKmh.toFixed(1)} km/h`, `${Math.round(rh)}%`, `${Math.round(hpa)} hPa`, `${dew.toFixed(1)}°C`]);
    };
    renderWeather();
    panel.addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = clamp(Math.hypot(dx, dy) / (r.width * 0.48), 0.1, 1);
      dirDeg = ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;
      hpa = 992 + dist * 42;
      rh = clamp(Math.round(78 - dist * 38), 28, 92);
      windKmh = 6 + dist * 24;
      tempC = 19.5 + (1 - dist) * 6.2;
      renderWeather();
    });
    return panel;
  }

  if (kind === 'wind-instrument') {
    const { panel, stage, setPill, setCells } = createInstrumentPanel(
      'WIND TELEMETRY · ANEMOMETER',
      '135° SE · BFT 4',
      ['Sustained', 'Peak gust', 'Bearing', 'Beaufort'],
    );
    stage.append(svg);
    let angleDeg = 135;
    let speedKmh = 22.4;
    const renderWind = () => {
      const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const dir = dirs[Math.round((((angleDeg % 360) + 360) % 360) / 45) % 8];
      const gustKmh = speedKmh * 1.42 + 2.2;
      const bft = clamp(Math.floor(speedKmh / 6), 1, 12);
      svg.innerHTML = `
        ${bezelHairline}
        ${ticks36}
        <circle data-plotter-role="guide" cx="80" cy="80" r="46" fill="none" stroke="currentColor"/>
        <path data-plotter-role="secondary" d="${clockwiseArc(80, 80, 46, (bft / 12) * 359)}" fill="none" stroke="currentColor" opacity="0.65"/>
        <text x="80" y="33" text-anchor="middle">N</text>
        <text x="127" y="83" text-anchor="middle">E</text>
        <text x="80" y="133" text-anchor="middle">S</text>
        <text x="33" y="83" text-anchor="middle">W</text>
        <g transform="rotate(${angleDeg.toFixed(1)} 80 80)">
          <path data-plotter-role="primary" d="M 80 30 L 84.5 48 L 80 44.5 L 75.5 48 Z" fill="var(--ds-bg)" stroke="currentColor"/>
          <line data-plotter-role="primary" x1="80" y1="44.5" x2="80" y2="116" stroke="currentColor"/>
          <circle data-plotter-role="primary" cx="80" cy="116" r="2.2" fill="var(--ds-bg)" stroke="currentColor"/>
        </g>
        <circle data-plotter-role="primary" cx="80" cy="80" r="19" fill="var(--ds-bg)" stroke="currentColor"/>
        <circle data-plotter-role="secondary" cx="80" cy="80" r="16" fill="none" stroke="currentColor" opacity="0.24"/>
        <text x="80" y="79" text-anchor="middle" style="font-size:10px;fill:currentColor">${Math.round(angleDeg)}°</text>
        <text x="80" y="89" text-anchor="middle" style="font-size:8.5px">${dir}</text>
      `;
      setPill(`${Math.round(angleDeg)}° ${dir} · BFT ${bft}`);
      setCells([`${speedKmh.toFixed(1)} km/h`, `${gustKmh.toFixed(1)} km/h`, `${Math.round(angleDeg)}° ${dir}`, `Force ${bft} / 12`]);
    };
    renderWind();
    panel.addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      angleDeg = ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;
      speedKmh = clamp((Math.hypot(dx, dy) / (r.width * 0.46)) * 54, 5.4, 68.0);
      renderWind();
    });
    return panel;
  }

  if (kind === 'navigation-instrument') {
    const { panel, stage, setPill, setCells } = createInstrumentPanel(
      'NAVIGATION TELEMETRY · HSI',
      'MARINE · 128°',
      ['Heading', 'Speed', 'Depth', 'Track'],
    );
    stage.append(svg);
    const ticks72 = Array.from({ length: 72 }, (_, i) => {
      const a = (i / 72) * Math.PI * 2;
      const major = i % 6 === 0;
      const med = !major && i % 2 === 0;
      const r0 = major ? 53.5 : med ? 56.5 : 58.5;
      return `<line data-plotter-role="${major ? 'secondary' : 'guide'}" x1="${(80 + Math.cos(a) * r0).toFixed(1)}" y1="${(80 + Math.sin(a) * r0).toFixed(1)}" x2="${(80 + Math.cos(a) * 61.5).toFixed(1)}" y2="${(80 + Math.sin(a) * 61.5).toFixed(1)}" stroke="currentColor"/>`;
    }).join('');
    let crs = 128;
    let dev = 0.4;
    let spd = 18.4;
    const renderNav = () => {
      const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const dir = dirs[Math.round((((crs % 360) + 360) % 360) / 45) % 8];
      const cdiOffset = clamp(dev * 12, -18, 18);
      const hdgText = String(Math.round(crs)).padStart(3, '0');
      svg.innerHTML = `
        ${bezelHairline}
        ${ticks72}
        <path data-plotter-role="primary" d="M 80 17 L 76.8 11.5 L 83.2 11.5 Z" fill="var(--ds-bg)" stroke="currentColor"/>
        <text x="80" y="33" text-anchor="middle">N</text>
        <text x="126" y="83" text-anchor="middle">E</text>
        <text x="80" y="133" text-anchor="middle">S</text>
        <text x="34" y="83" text-anchor="middle">W</text>
        ${[-16, -8, 8, 16].map((dx) => `<circle data-plotter-role="secondary" cx="${80 + dx}" cy="80" r="1.2" fill="none" stroke="currentColor"/>`).join('')}
        <g transform="rotate(${crs.toFixed(1)} 80 80)">
          <path data-plotter-role="primary" d="M 80 34 L 84.5 76 L 80 71 L 75.5 76 Z" fill="var(--ds-bg)" stroke="currentColor"/>
          <path data-plotter-role="secondary" d="M 80 122 L 76.2 92 L 80 96 L 83.8 92 Z" fill="none" stroke="currentColor"/>
          <line data-plotter-role="primary" x1="${(80 + cdiOffset).toFixed(1)}" y1="62" x2="${(80 + cdiOffset).toFixed(1)}" y2="98" stroke="currentColor"/>
        </g>
        <circle data-plotter-role="primary" cx="80" cy="80" r="3.6" fill="var(--ds-bg)" stroke="currentColor"/>
      `;
      setPill(`MARINE · ${hdgText}°`);
      setCells([`${hdgText}°`, `${spd.toFixed(1)} kn`, `${Math.round(380 + spd * 2.2)} m`, `${dir} · ${dev >= 0 ? '+' : ''}${dev.toFixed(1)}°`]);
    };
    renderNav();
    panel.addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      crs = ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;
      dev = clamp((dx / (r.width * 0.42)) * 1.5, -1.5, 1.5);
      spd = clamp(12 + (Math.hypot(dx, dy) / (r.width * 0.45)) * 14, 8.5, 28.4);
      renderNav();
    });
    return panel;
  }

  if (kind === 'astrology-wheel') {
    const { panel, stage, setPill, setCells } = createInstrumentPanel(
      'EPHEMERIS WHEEL · 12 HOUSES',
      'ASC 142°',
      ['Body', 'Longitude', 'House'],
    );
    panel.style.setProperty('--ml-cols', '3');
    stage.append(svg);
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const bodies = [
      { name: 'Sun', base: 248.4 },
      { name: 'Moon', base: 102.6 },
      { name: 'Mercury', base: 264.1 },
      { name: 'Venus', base: 212.8 },
      { name: 'Mars', base: 158.2 },
      { name: 'Jupiter', base: 34.5 },
      { name: 'Saturn', base: 318.0 },
    ];
    let selIdx = 0;
    let rotOffset = 0;
    const renderAstro = () => {
      const spokes = Array.from({ length: 12 }, (_, i) => {
        const a = ((i * 30 - 90 + rotOffset) * Math.PI) / 180;
        const ha = (((i * 30 + 15) - 90 + rotOffset) * Math.PI) / 180;
        return (
          `<line data-plotter-role="secondary" x1="${(80 + Math.cos(a) * 24).toFixed(1)}" y1="${(80 + Math.sin(a) * 24).toFixed(1)}" x2="${(80 + Math.cos(a) * 61.5).toFixed(1)}" y2="${(80 + Math.sin(a) * 61.5).toFixed(1)}" stroke="currentColor" opacity="0.32"/>` +
          `<text x="${(80 + Math.cos(ha) * 53).toFixed(1)}" y="${(82.5 + Math.sin(ha) * 53).toFixed(1)}" text-anchor="middle" style="font-size:7.5px">${String(i + 1).padStart(2, '0')}</text>`
        );
      }).join('');
      const pts = bodies.map((b, i) => {
        const lon = (b.base + rotOffset + 360) % 360;
        const a = ((lon - 90) * Math.PI) / 180;
        const rad = i % 2 === 0 ? 37 : 31;
        return { name: b.name, lon, x: 80 + Math.cos(a) * rad, y: 80 + Math.sin(a) * rad };
      });
      const sel = pts[selIdx];
      const signIdx = Math.floor(sel.lon / 30) % 12;
      svg.innerHTML = `
        ${bezelHairline}
        ${ticks36}
        <circle data-plotter-role="secondary" cx="80" cy="80" r="46" fill="none" stroke="currentColor" opacity="0.38"/>
        <circle data-plotter-role="secondary" cx="80" cy="80" r="24" fill="var(--ds-bg)" stroke="currentColor" opacity="0.5"/>
        <path data-plotter-role="primary" d="M 80 16 L 77 11 L 83 11 Z" fill="var(--ds-bg)" stroke="currentColor"/>
        ${spokes}
        <path data-plotter-role="guide" d="M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)} L ${pts[2].x.toFixed(1)} ${pts[2].y.toFixed(1)} L ${pts[4].x.toFixed(1)} ${pts[4].y.toFixed(1)} Z" fill="none" stroke="currentColor"/>
        <line data-plotter-role="secondary" x1="${pts[1].x.toFixed(1)}" y1="${pts[1].y.toFixed(1)}" x2="${pts[5].x.toFixed(1)}" y2="${pts[5].y.toFixed(1)}" stroke="currentColor" opacity="0.35"/>
        ${pts
          .map(
            (p, i) =>
              `<circle data-plotter-role="${i === selIdx ? 'primary' : 'secondary'}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${i === selIdx ? '4.2' : '2.6'}" fill="var(--ds-bg)" stroke="currentColor"/>` +
              (i === selIdx ? `<circle data-plotter-role="primary" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="1.3" fill="currentColor" stroke="none"/>` : ''),
          )
          .join('')}
        <circle data-plotter-role="primary" cx="80" cy="80" r="2.2" fill="var(--ds-bg)" stroke="currentColor"/>
      `;
      setPill(`ASC ${Math.round((142 + rotOffset) % 360)}°`);
      setCells([sel.name, `${sel.lon.toFixed(1)}° ${signs[signIdx].slice(0, 3).toUpperCase()}`, `Casa ${String(signIdx + 1).padStart(2, '0')} · ${(sel.lon % 30).toFixed(1)}°`]);
    };
    renderAstro();
    panel.addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const ang = ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;
      selIdx = Math.floor((ang / 360) * bodies.length) % bodies.length;
      rotOffset = ((e.clientX - r.left) / r.width - 0.5) * 36;
      renderAstro();
    });
    return panel;
  }

  // Default: 'compass' — Magnetic Bearing Rose
  const { panel, stage, setPill, setCells } = createInstrumentPanel(
    'MAGNETIC BEARING · COMPASS',
    'NE · 042°',
    ['Bearing', 'Octant', 'Declin'],
  );
  panel.style.setProperty('--ml-cols', '3');
  stage.append(svg);
  let brg = 42;
  const renderCompass = (deg: number) => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const dir = dirs[Math.round((((deg % 360) + 360) % 360) / 45) % 8];
    const hdg = String(Math.round(deg)).padStart(3, '0');
    svg.innerHTML = `
      ${bezelHairline}
      ${ticks36}
      <path data-plotter-role="secondary" d="${clockwiseArc(80, 80, 61.5, deg)}" fill="none" stroke="currentColor" opacity="0.65"/>
      <circle data-plotter-role="guide" cx="80" cy="80" r="46" fill="none" stroke="currentColor"/>
      <line data-plotter-role="guide" x1="80" y1="22" x2="80" y2="138" stroke="currentColor"/>
      <line data-plotter-role="guide" x1="22" y1="80" x2="138" y2="80" stroke="currentColor"/>
      <text x="80" y="33" text-anchor="middle">N</text>
      <text x="127" y="83" text-anchor="middle">E</text>
      <text x="80" y="133" text-anchor="middle">S</text>
      <text x="33" y="83" text-anchor="middle">W</text>
      <g transform="rotate(${deg.toFixed(1)} 80 80)">
        <path data-plotter-role="primary" d="M 80 26 L 84 80 L 80 128 L 76 80 Z" fill="var(--ds-bg)" stroke="currentColor"/>
        <circle data-plotter-role="primary" cx="80" cy="35" r="1.2" fill="currentColor" stroke="none"/>
      </g>
      <circle data-plotter-role="primary" cx="80" cy="80" r="5" fill="var(--ds-bg)" stroke="currentColor"/>
      <circle data-plotter-role="primary" cx="80" cy="80" r="1.2" fill="currentColor" stroke="none"/>
    `;
    setPill(`${dir} · ${hdg}°`);
    setCells([`${hdg}°`, dir, '−2.4° W']);
  };
  renderCompass(brg);
  panel.addEventListener('pointermove', (e) => {
    const r = svg.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    brg = ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;
    renderCompass(brg);
  });
  return panel;
}

function demoAudioMeter(): HTMLElement {
  const COLS = 20;
  const ROWS = 10;
  const { panel, stage, setPill, setCells } = createInstrumentPanel(
    'AUDIO LEVEL · MATRIX 20×10',
    '-11 dBFS',
    ['RMS', 'Peak', 'Band', 'Crest'],
  );
  const matrix = document.createElement('div');
  matrix.className = 'ml-audio-matrix';
  matrix.setAttribute('role', 'img');
  matrix.setAttribute('aria-label', 'Gridded 20 by 10 audio level matrix');

  // Create 200 squared grid cells (row 0 = top row, row ROWS-1 = bottom row)
  const gridCells: HTMLElement[][] = Array.from({ length: COLS }, () => []);
  for (let row = 0; row < ROWS; row++) {
    const levelFromBottom = ROWS - 1 - row;
    const zone = levelFromBottom >= 8 ? 'hot' : levelFromBottom >= 6 ? 'mid' : 'low';
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement('span');
      cell.className = 'ml-audio-cell';
      cell.dataset.zone = zone;
      matrix.append(cell);
      gridCells[col][levelFromBottom] = cell;
    }
  }
  stage.append(matrix);

  const levels = Array.from({ length: COLS }, (_, i) => 0.25 + 0.35 * Math.sin((i / COLS) * Math.PI));
  const peaks = levels.slice();
  let pointerBand = -1;
  let pointerGain = 0.72;
  let raf = 0;
  let lastUpdate = 0;

  const paintMatrix = (now: number) => {
    const phase = now / 250;
    const pulse = Math.pow(Math.max(0, Math.sin(phase)), 5);
    let sumSq = 0;
    let maxLv = 0;
    for (let c = 0; c < COLS; c++) {
      let target: number;
      if (pointerBand >= 0) {
        const dist = Math.abs(c - pointerBand);
        const bell = Math.exp(-(dist * dist) / 14);
        const ripple = 0.08 * Math.sin(phase * 1.4 + c * 0.55);
        target = clamp(0.12 + pointerGain * bell + ripple, 0.08, 1);
      } else {
        const ripple = Math.max(0, Math.sin(phase * 0.7 + c * 0.42));
        const arch = 0.42 + 0.58 * Math.sin((c / (COLS - 1)) * Math.PI);
        target = clamp(0.14 + arch * (0.16 + ripple * 0.28 + pulse * 0.52), 0.1, 0.98);
      }
      levels[c] = levels[c] * 0.55 + target * 0.45;
      if (levels[c] >= peaks[c]) peaks[c] = levels[c];
      else peaks[c] = Math.max(levels[c], peaks[c] - 0.025);

      sumSq += levels[c] * levels[c];
      if (peaks[c] > maxLv) maxLv = peaks[c];

      const activeCount = clamp(Math.round(levels[c] * ROWS), 1, ROWS);
      const peakRow = clamp(Math.round(peaks[c] * ROWS) - 1, 0, ROWS - 1);
      for (let r = 0; r < ROWS; r++) {
        const cell = gridCells[c][r];
        const isActive = r < activeCount;
        const isPeak = !isActive && r === peakRow && peakRow > 0;
        if (isActive) cell.dataset.active = 'true';
        else delete cell.dataset.active;
        if (isPeak) cell.dataset.peak = 'true';
        else delete cell.dataset.peak;
      }
    }
    const rms = Math.max(0.01, Math.sqrt(sumSq / COLS));
    const dbRms = clamp(Math.round(20 * Math.log10(rms)), -48, 0);
    const dbPeak = clamp(Math.round(20 * Math.log10(Math.max(0.01, maxLv))), -42, 0);
    const focusBand = pointerBand >= 0 ? pointerBand : 9;
    const hz = Math.round(60 * Math.pow(240, focusBand / (COLS - 1)));
    const freqStr = hz >= 1000 ? `${(hz / 1000).toFixed(1)} kHz` : `${hz} Hz`;
    setPill(`${dbRms} dBFS`);
    setCells([`${dbRms} dBFS`, `${dbPeak} dB`, freqStr, `${Math.max(1.5, dbPeak - dbRms).toFixed(1)} dB`]);
  };

  const tick = (now: number) => {
    if (now - lastUpdate > 45) {
      paintMatrix(now);
      lastUpdate = now;
    }
    raf = requestAnimationFrame(tick);
  };

  panel.addEventListener('pointermove', (e) => {
    const r = matrix.getBoundingClientRect();
    const tx = clamp((e.clientX - r.left) / r.width, 0, 0.999);
    const ty = clamp(1 - (e.clientY - r.top) / r.height, 0.15, 1);
    pointerBand = Math.floor(tx * COLS);
    pointerGain = ty;
    paintMatrix(performance.now());
  });
  panel.addEventListener('pointerleave', () => {
    pointerBand = -1;
  });

  paintMatrix(performance.now());
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (en.isIntersecting) {
        if (!raf) raf = requestAnimationFrame(tick);
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }
  });
  io.observe(panel);
  return panel;
}

function demoHairlineIso(preset: HairlinePreset = 'wave'): HTMLElement {
  const { panel, stage, setPill, setCells } = createInstrumentPanel(
    'ISOMETRIC FIELD · 2:1',
    'CREST 4×4',
    ['Pose', 'Grid', 'Spring', 'Stroke'],
  );
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 400 320');
  svg.setAttribute('data-plotter', '');
  svg.setAttribute('data-hairline', '');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.style.cssText = 'width:100%;height:auto;aspect-ratio:400/320;touch-action:none;color:var(--ds-fg);';
  const readout = document.createElement('div');
  mountHairlineFigure(svg, readout, preset);
  stage.append(svg);
  const syncIsoLegend = () => {
    const txt = readout.textContent || 'rest · crest 4×4 · z +0.85';
    const parts = txt.split(' · ');
    setPill(parts[0]?.toUpperCase() || 'REST');
    setCells([parts[0] || 'rest', parts[1] || '4×4', parts[2] || 'k100/c18', '0.65px']);
  };
  syncIsoLegend();
  svg.addEventListener('pointermove', syncIsoLegend);
  svg.addEventListener('pointerleave', syncIsoLegend);
  svg.addEventListener('click', syncIsoLegend);
  return panel;
}

function demoSvgInstrument(kind: string): HTMLElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'ml-svg');
  svg.setAttribute('data-plotter', '');
  svg.setAttribute('data-hairline', '');
  svg.setAttribute('viewBox', '0 0 220 136');
  svg.style.cssText = 'width:100%;max-width:236px;height:auto;touch-action:none;color:var(--ds-fg);';

  if (kind === 'attitude-indicator') {
    const { panel, stage, setPill, setCells } = createInstrumentPanel(
      'FLIGHT DYNAMICS · ADI',
      '+4° / +11°',
      ['Pitch', 'Roll', 'Slip', 'Director'],
    );
    stage.append(svg);
    let roll = 11;
    let pitch = 4;
    const bankTicks = [-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60]
      .map((deg) => {
        const a = ((deg - 90) * Math.PI) / 180;
        const major = deg === 0 || Math.abs(deg) === 30 || Math.abs(deg) === 60;
        const r0 = major ? 46.5 : 49.5;
        return `<line data-plotter-role="${major ? 'secondary' : 'guide'}" x1="${(110 + Math.cos(a) * r0).toFixed(1)}" y1="${(68 + Math.sin(a) * r0).toFixed(1)}" x2="${(110 + Math.cos(a) * 52.5).toFixed(1)}" y2="${(68 + Math.sin(a) * 52.5).toFixed(1)}" stroke="currentColor"/>`;
      })
      .join('');
    const renderAttitude = (rDeg: number, pDeg: number) => {
      const py = clamp(pDeg * 1.15, -18, 18);
      const rp = Math.round(pDeg);
      const rr = Math.round(rDeg);
      const slip = (rDeg / 45).toFixed(1);
      const dir = Math.abs(pDeg) < 1.5 ? 'LEVEL' : pDeg > 0 ? 'CLIMB' : 'DESC';
      svg.innerHTML = `
        <defs>
          <clipPath id="att-clip"><circle cx="110" cy="67" r="45"/></clipPath>
        </defs>
        <circle data-plotter-role="guide" cx="110" cy="67" r="59" fill="none" stroke="currentColor"/>
        <!-- 3D Cylindrical Bezel Wall -->
        <path data-plotter-role="primary" d="M 54.5 67 L 54.5 72 A 55.5 55.5 0 0 0 165.5 72 L 165.5 67 Z" fill="var(--ds-bg)" stroke="currentColor" opacity="0.72"/>
        <circle data-plotter-role="primary" cx="110" cy="67" r="55.5" fill="var(--ds-bg)" stroke="currentColor"/>
        <path data-plotter-role="secondary" d="M 59 67 A 51 51 0 0 0 161 67" fill="none" stroke="currentColor" opacity="0.3"/>
        <circle data-plotter-role="secondary" cx="110" cy="67" r="45" fill="none" stroke="currentColor" opacity="0.36"/>
        ${bankTicks}
        <g clip-path="url(#att-clip)">
          <g transform="rotate(${(-rDeg).toFixed(1)} 110 67) translate(0 ${py.toFixed(1)})">
            <line data-plotter-role="primary" x1="54" y1="67" x2="166" y2="67" stroke="currentColor"/>
            <line data-plotter-role="secondary" x1="94" y1="53" x2="126" y2="53" stroke="currentColor"/>
            <line data-plotter-role="secondary" x1="100" y1="41" x2="120" y2="41" stroke="currentColor"/>
            <line data-plotter-role="secondary" x1="94" y1="81" x2="126" y2="81" stroke="currentColor"/>
            <line data-plotter-role="secondary" x1="100" y1="93" x2="120" y2="93" stroke="currentColor"/>
            <text x="89" y="55.5" text-anchor="end" style="font-size:7px">10</text>
            <text x="131" y="55.5" text-anchor="start" style="font-size:7px">10</text>
            <text x="89" y="83.5" text-anchor="end" style="font-size:7px">10</text>
            <text x="131" y="83.5" text-anchor="start" style="font-size:7px">10</text>
          </g>
        </g>
        <g transform="rotate(${(-rDeg).toFixed(1)} 110 67)">
          <path data-plotter-role="primary" d="M 110 15 L 107 20.5 L 113 20.5 Z" fill="var(--ds-bg)" stroke="currentColor"/>
        </g>
        <path data-plotter-role="primary" d="M 80 67 L 98 67 L 103 72 M 140 67 L 122 67 L 117 72" fill="none" stroke="currentColor"/>
        <circle data-plotter-role="primary" cx="110" cy="68.5" r="2.4" fill="var(--ds-bg)" stroke="currentColor"/>
        <circle data-plotter-role="primary" cx="110" cy="67" r="2.4" fill="var(--ds-bg)" stroke="currentColor"/>
      `;
      setPill(`${rp > 0 ? `+${rp}` : rp}° / ${rr > 0 ? `+${rr}` : rr}°`);
      setCells([`${rp > 0 ? `+${rp}` : rp}°`, `${rr > 0 ? `+${rr}` : rr}°`, `${Number(slip) > 0 ? `+${slip}` : slip}°`, dir]);
    };
    renderAttitude(roll, pitch);
    panel.addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      const ny = (0.5 - (e.clientY - r.top) / r.height) * 2;
      roll = clamp(nx * 35, -35, 35);
      pitch = clamp(ny * 22, -22, 22);
      renderAttitude(roll, pitch);
    });
    return panel;
  }

  if (kind === 'astronomy-instrument') {
    const { panel, stage, setPill, setCells } = createInstrumentPanel(
      'SOLAR EPHEMERIS · 3D DOME',
      '14:20 · +54°',
      ['Sunrise', 'Noon', 'Sunset', 'Alt / Az'],
    );
    stage.append(svg);
    let progress = 0.62;
    const renderSolar = (p: number) => {
      const ang = Math.PI * (1 - p);
      const sx = 110 - Math.cos(ang) * 74;
      const sy = 94 - Math.sin(ang) * 58;
      const gy = 94 + Math.sin(ang) * 11;
      const totalMin = Math.round(338 + p * 734);
      const hh = String(Math.floor(totalMin / 60)).padStart(2, '0');
      const mm = String(totalMin % 60).padStart(2, '0');
      const alt = Math.round(Math.sin(ang) * 68);
      const az = Math.round(74 + p * 212);
      const rimTicks = Array.from({ length: 13 }, (_, i) => {
        const a = (Math.PI * i) / 12;
        const tx0 = 110 - Math.cos(a) * 80;
        const ty0 = 94 + Math.sin(a) * 18.5;
        const tx1 = 110 - Math.cos(a) * 86;
        const ty1 = 94 + Math.sin(a) * 21;
        return `<line data-plotter-role="secondary" x1="${tx0.toFixed(1)}" y1="${ty0.toFixed(1)}" x2="${tx1.toFixed(1)}" y2="${ty1.toFixed(1)}" stroke="currentColor" opacity="0.45"/>`;
      }).join('');
      svg.innerHTML = `
        <!-- 3D Horizon Disc with Extruded Front Cylinder Rim -->
        <path data-plotter-role="primary" d="M 24 94 L 24 99.5 A 86 21 0 0 0 196 99.5 L 196 94 Z" fill="var(--ds-bg)" stroke="currentColor"/>
        <ellipse data-plotter-role="primary" cx="110" cy="94" rx="86" ry="21" fill="var(--ds-bg)" stroke="currentColor"/>
        <path data-plotter-role="secondary" d="M 30 94 A 80 18 0 0 0 190 94" fill="none" stroke="currentColor" opacity="0.32"/>
        ${rimTicks}
        <line data-plotter-role="guide" x1="24" y1="94" x2="196" y2="94" stroke="currentColor"/>
        <line data-plotter-role="guide" x1="110" y1="73" x2="110" y2="115" stroke="currentColor"/>
        <!-- 3D Winter & Summer Solstice Dome Arcs -->
        <path data-plotter-role="guide" d="M 48 94 A 62 40 0 0 1 172 94" fill="none" stroke="currentColor"/>
        <path data-plotter-role="guide" d="M 28 94 A 82 66 0 0 1 192 94" fill="none" stroke="currentColor"/>
        <!-- Main 3D Solar Ecliptic Dome Arc -->
        <path data-plotter-role="secondary" d="M 36 94 A 74 58 0 0 1 184 94" fill="none" stroke="currentColor"/>
        <!-- 3D Altitude Plumb Line & Elliptical Ground Shadow Projection -->
        <line data-plotter-role="guide" x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${sx.toFixed(1)}" y2="${gy.toFixed(1)}" stroke="currentColor"/>
        <ellipse data-plotter-role="secondary" cx="${sx.toFixed(1)}" cy="${gy.toFixed(1)}" rx="4" ry="1.6" fill="var(--ds-bg)" stroke="currentColor"/>
        <circle data-plotter-role="primary" cx="${sx.toFixed(1)}" cy="${gy.toFixed(1)}" r="1" fill="currentColor" stroke="none"/>
        <!-- 3D Solar Orb + Corona Ring -->
        <circle data-plotter-role="secondary" cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="10.5" fill="none" stroke="currentColor" opacity="0.35"/>
        <circle data-plotter-role="primary" cx="${sx.toFixed(1)}" cy="${(sy + 1.2).toFixed(1)}" r="5.6" fill="var(--ds-bg)" stroke="currentColor" opacity="0.5"/>
        <circle data-plotter-role="primary" cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="5.6" fill="var(--ds-bg)" stroke="currentColor"/>
        <circle data-plotter-role="primary" cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="1.4" fill="currentColor" stroke="none"/>
        <text x="16" y="124">E</text>
        <text x="110" y="127" text-anchor="middle">SOUTH · 3D HORIZON</text>
        <text x="204" y="124" text-anchor="end">W</text>
      `;
      setPill(`${hh}:${mm} · +${alt}°`);
      setCells(['05:38', '11:54', '17:52', `+${alt}° · ${az}°`]);
    };
    renderSolar(progress);
    panel.addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect();
      progress = clamp((e.clientX - r.left) / r.width, 0.06, 0.94);
      renderSolar(progress);
    });
    return panel;
  }

  if (kind === 'lunar-ephemeris') {
    const { panel, stage, setPill, setCells } = createInstrumentPanel(
      'LUNAR EPHEMERIS · SYNODIC',
      '74% LIT',
      ['Illum', 'Phase', 'Age', 'Dist'],
    );
    stage.append(svg);
    const synodicTicks = 28;
    const names = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
    let phaseNorm = 0.36;
    const renderLunar = (p: number) => {
      const phaseAngle = p * 360;
      const ageDays = p * 29.53;
      const illum = 50 * (1 - Math.cos((phaseAngle * Math.PI) / 180));
      const activeTickCount = Math.round(p * synodicTicks);
      const idx = Math.round(p * 7) % 8;
      const r = 31;
      const cx = 110;
      const cy = 68;
      const rad = (phaseAngle * Math.PI) / 180;
      const rx = Math.abs(Math.cos(rad)) * r;
      const isWaxing = phaseAngle <= 180;
      const outerSweep = isWaxing ? 1 : 0;
      const isGibbous = phaseAngle > 90 && phaseAngle < 270;
      const termSweep = isWaxing ? (isGibbous ? 1 : 0) : isGibbous ? 0 : 1;
      const litPath = `M ${cx} ${cy - r} A ${r} ${r} 0 0 ${outerSweep} ${cx} ${cy + r} A ${rx.toFixed(2)} ${r} 0 0 ${termSweep} ${cx} ${cy - r} Z`;
      const ticks = Array.from({ length: synodicTicks }, (_, i) => {
        const a = (i / synodicTicks) * Math.PI * 2 - Math.PI / 2;
        const major = i % 7 === 0;
        const r0 = major ? 49 : 51.5;
        const r1 = 55;
        const active = i <= activeTickCount;
        return `<line data-plotter-role="${active ? 'primary' : 'guide'}" x1="${(cx + Math.cos(a) * r0).toFixed(1)}" y1="${(cy + Math.sin(a) * r0).toFixed(1)}" x2="${(cx + Math.cos(a) * r1).toFixed(1)}" y2="${(cy + Math.sin(a) * r1).toFixed(1)}" stroke="currentColor" opacity="${active ? '0.85' : '0.22'}"/>`;
      }).join('');
      const pipA = p * Math.PI * 2 - Math.PI / 2;
      svg.innerHTML = `
        <circle data-plotter-role="guide" cx="${cx}" cy="${cy}" r="58" fill="none" stroke="currentColor"/>
        ${ticks}
        <circle data-plotter-role="secondary" cx="${cx}" cy="${cy}" r="43" fill="none" stroke="currentColor" opacity="0.3"/>
        <circle data-plotter-role="primary" cx="${cx}" cy="${cy}" r="${r}" fill="var(--ds-bg)" stroke="currentColor"/>
        <path data-plotter-role="primary" d="${litPath}" fill="currentColor" fill-opacity="0.12" stroke="currentColor"/>
        <circle data-plotter-role="primary" cx="${(cx + Math.cos(pipA) * 43).toFixed(1)}" cy="${(cy + Math.sin(pipA) * 43).toFixed(1)}" r="2" fill="var(--ds-bg)" stroke="currentColor"/>
      `;
      setPill(`${Math.round(illum)}% LIT · D${ageDays.toFixed(1)}`);
      setCells([`${illum.toFixed(1)}%`, `${Math.round(phaseAngle)}° · ${names[idx].split(' ')[1] || names[idx]}`, `${ageDays.toFixed(1)} d`, `${Math.round(384400 - Math.cos(rad) * 14200).toLocaleString('en-US')} km`]);
    };
    renderLunar(phaseNorm);
    panel.addEventListener('pointermove', (e) => {
      const r = svg.getBoundingClientRect();
      phaseNorm = clamp((e.clientX - r.left) / r.width, 0.02, 0.98);
      renderLunar(phaseNorm);
    });
    return panel;
  }

  // Default: 'instrument' (Instrument Bars) — 3D Extruded Vertical Capsule Rack + Top Hairline Brackets
  const { panel, stage, setPill, setCells } = createInstrumentPanel(
    'HARMONIC RACK · 3D CAPSULES',
    '72% · CH 08',
    ['Level', 'Active', 'Anchor', 'Gain'],
  );
  svg.setAttribute('viewBox', '0 0 240 104');
  stage.append(svg);
  const baseLevels = [0.36, 0.52, 0.44, 0.68, 0.58, 0.78, 0.64, 0.88, 0.72, 0.56, 0.66, 0.48];
  let focusIdx = 7;
  const renderBars3D = (activeCol: number) => {
    const cols = baseLevels
      .map((lv, i) => {
        const x = 14 + i * 18;
        const h = Math.round(18 + lv * 58);
        const yTop = 86 - h;
        const isHi = i === activeCol;
        const isMajor = i % 3 === 0;
        const role = isHi ? 'primary' : 'secondary';
        return `
          <!-- Recessed 3D Slot -->
          <rect data-plotter-role="guide" x="${x}" y="18" width="10" height="72" rx="5" fill="none" stroke="currentColor"/>
          <!-- 3D Extruded Lower Cylinder Skirt -->
          <rect data-plotter-role="${role}" x="${x}" y="${yTop + 3.5}" width="10" height="${h}" rx="5" fill="var(--ds-bg)" stroke="currentColor" opacity="${isHi ? '0.9' : '0.45'}"/>
          <!-- 3D Raised Top Capsule Face -->
          <rect data-plotter-role="${role}" x="${x}" y="${yTop}" width="10" height="${h}" rx="5" fill="var(--ds-bg)" stroke="currentColor" opacity="${isHi ? '1' : isMajor ? '0.78' : '0.58'}"/>
          <!-- Front Chamfer Crease -->
          <line data-plotter-role="secondary" x1="${x + 2.5}" y1="${yTop + 4}" x2="${x + 7.5}" y2="${yTop + 4}" stroke="currentColor" opacity="0.35"/>
          ${isHi ? `<circle data-plotter-role="primary" cx="${x + 5}" cy="${yTop + 8.5}" r="1.3" fill="currentColor" stroke="none"/>` : ''}
        `;
      })
      .join('');
    svg.innerHTML = `
      <path data-plotter-role="secondary" d="M 12 10 H 64 M 176 10 H 228" fill="none" stroke="currentColor" opacity="0.45"/>
      <!-- 3D Base Plinth -->
      <path data-plotter-role="secondary" d="M 10 92 L 10 95.5 L 230 95.5 L 230 92 Z" fill="var(--ds-bg)" stroke="currentColor" opacity="0.5"/>
      ${cols}
    `;
    const pct = Math.round(baseLevels[activeCol]! * 100);
    const db = ((pct - 72) * 0.35).toFixed(1);
    setPill(`${pct}% · CH ${String(activeCol + 1).padStart(2, '0')}`);
    setCells([`${pct}%`, `CH ${String(activeCol + 1).padStart(2, '0')} / 12`, `Rack ${String(Math.floor(activeCol / 3) + 1).padStart(2, '0')}`, `${Number(db) >= 0 ? `+${db}` : db} dB`]);
  };
  renderBars3D(focusIdx);
  panel.addEventListener('pointermove', (e) => {
    const r = svg.getBoundingClientRect();
    const tx = clamp((e.clientX - r.left) / r.width, 0, 0.999);
    const ty = clamp(1 - (e.clientY - r.top) / r.height, 0.22, 0.96);
    focusIdx = Math.floor(tx * baseLevels.length);
    baseLevels[focusIdx] = ty;
    renderBars3D(focusIdx);
  });
  return panel;
}

function demoRaceTelemetry(): HTMLElement {
  const { panel, stage, setPill, setCells } = createInstrumentPanel(
    'RACE TELEMETRY · CAR 16',
    '286 km/h · G6',
    ['Speed', 'Gear', 'RPM', 'Sector'],
  );
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'ml-svg');
  svg.setAttribute('data-plotter', '');
  svg.setAttribute('data-hairline', '');
  svg.setAttribute('viewBox', '0 0 240 96');
  svg.style.cssText = 'width:100%;max-width:256px;height:auto;touch-action:none;color:var(--ds-fg);';
  stage.append(svg);

  const samples = Array.from({ length: 42 }, (_, i) => {
    const ph = (i / 41) * Math.PI * 3.6;
    return 44 + Math.sin(ph) * 22 + Math.cos(ph * 0.65) * 9;
  });
  const pts = samples.map((v, i) => [8 + (i / 41) * 224, 84 - v] as const);
  const pathD = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const areaD = `${pathD} L 232 84 L 8 84 Z`;
  let cursorIdx = 32;

  const renderRace = (idx: number) => {
    const [cx, cy] = pts[idx];
    const spd = Math.round(188 + samples[idx] * 2.1);
    const gear = clamp(Math.floor((spd - 110) / 30), 2, 8);
    const rpm = Math.round(spd * 38 + 3150);
    const sec = idx < 14 ? 'S1 24.8s' : idx < 28 ? 'S2 31.4s' : 'S3 28.1s';
    svg.innerHTML = `
      <line data-plotter-role="guide" x1="8" y1="24" x2="232" y2="24" stroke="currentColor"/>
      <line data-plotter-role="guide" x1="8" y1="54" x2="232" y2="54" stroke="currentColor"/>
      <line data-plotter-role="secondary" x1="8" y1="84" x2="232" y2="84" stroke="currentColor"/>
      <path d="${areaD}" fill="currentColor" fill-opacity="0.06" stroke="none"/>
      <path data-plotter-role="primary" d="${pathD}" fill="none" stroke="currentColor"/>
      <line data-plotter-role="guide" x1="${cx.toFixed(1)}" y1="12" x2="${cx.toFixed(1)}" y2="84" stroke="currentColor"/>
      <circle data-plotter-role="primary" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="2.8" fill="var(--ds-bg)" stroke="currentColor"/>
      <circle data-plotter-role="primary" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="1.1" fill="currentColor" stroke="none"/>
    `;
    setPill(`${spd} km/h · G${gear}`);
    setCells([`${spd} km/h`, `Gear ${gear}`, rpm.toLocaleString('en-US'), sec]);
  };
  renderRace(cursorIdx);
  panel.addEventListener('pointermove', (e) => {
    const r = svg.getBoundingClientRect();
    const t = clamp((e.clientX - r.left) / r.width, 0, 1);
    cursorIdx = Math.round(t * (samples.length - 1));
    renderRace(cursorIdx);
  });
  return panel;
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

function attachStagePointer(stage: HTMLElement, onPointer: (nx: number, ny: number) => void): void {
  const handle = (e: PointerEvent) => {
    const r = stage.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const nx = clamp((e.clientX - r.left) / r.width, 0, 1);
    const ny = clamp((e.clientY - r.top) / r.height, 0, 1);
    onPointer(nx, ny);
  };
  stage.addEventListener('pointerdown', (e) => {
    stage.setPointerCapture(e.pointerId);
    handle(e);
  });
  stage.addEventListener('pointermove', (e) => {
    if (e.buttons === 1 || e.pointerType === 'mouse') handle(e);
  });
}

function demoChartLine(area = false, kind = 'chart-line'): HTMLElement {
  const isTide = kind === 'tide-instrument';
  const values = isTide
    ? [30, 56, 76, 62, 26, 18, 44, 72, 82, 54, 24, 34]
    : [22, 31, 26, 44, 38, 54, 48, 64, 57, 72, 66, 80];
  const labels = ['00h', '02h', '04h', '06h', '08h', '10h', '12h', '14h', '16h', '18h', '20h', '22h'];
  const pts = seriesPoints(values, 214, 96, 12);
  const d = smoothPath(values, 214, 96, 12);
  // 3D rear offset curve shifted by (+4, -3.5) for isometric ribbon depth
  const dx = 4;
  const dy = -3.5;
  const ptsRear = pts.map(([x, y]) => [x + dx, y + dy] as [number, number]);
  let dRear = `M ${ptsRear[0][0].toFixed(2)} ${ptsRear[0][1].toFixed(2)}`;
  for (let i = 1; i < ptsRear.length; i++) {
    const [x0, y0] = ptsRear[i - 1];
    const [x1, y1] = ptsRear[i];
    const cx = (x0 + x1) / 2;
    dRear += ` C ${cx.toFixed(2)} ${y0.toFixed(2)}, ${cx.toFixed(2)} ${y1.toFixed(2)}, ${x1.toFixed(2)} ${y1.toFixed(2)}`;
  }
  const ribbonD = `${d} L ${ptsRear[ptsRear.length - 1][0].toFixed(2)} ${ptsRear[ptsRear.length - 1][1].toFixed(2)} ${ptsRear
    .slice()
    .reverse()
    .map(([x, y]) => `L ${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(' ')} Z`;
  const areaD = `${d} L ${pts[pts.length - 1][0].toFixed(2)} 88 L ${pts[0][0].toFixed(2)} 88 Z`;
  const depthRibs = pts
    .map(
      ([x, y], i) =>
        `<line class="ml-hl-inner" x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${ptsRear[i][0].toFixed(1)}" y2="${ptsRear[i][1].toFixed(1)}" opacity="0.45"/>
         <line class="ml-hl-guide" x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x.toFixed(1)}" y2="88" opacity="0.22"/>`,
    )
    .join('');

  const peakVal = `${Math.max(...values)}`;
  const { panel, stage, setCells, setPill } = createInstrumentPanel(
    isTide ? 'TIDE HARMONIC · M2/S2' : area ? '3D AREA RIBBON · AQI' : '3D SPLINE RIBBON · AQI',
    `${values[8]}${isTide ? ' cm' : ' pts'}`,
    [isTide ? 'Tide' : 'Value', 'Delta', 'Peak', 'Sample'],
  );
  setCells([`${values[8]}${isTide ? ' cm' : '.0'}`, `+${values[8] - values[0]}`, peakVal, labels[8]]);

  stage.innerHTML = `
    <svg class="ml-svg ml-chart-svg" data-hairline viewBox="0 0 224 106" aria-label="3D Hairline Line Chart">
      <!-- 3D Perspective Floor Plinth -->
      <polygon class="ml-hl-fill" points="10,88 16,83.5 214,83.5 208,88"/>
      <polygon class="ml-hl-secondary" points="10,88 16,83.5 214,83.5 208,88" opacity="0.5"/>
      <path class="ml-hl-fill" d="M 10 88 L 208 88 L 208 92 L 10 92 Z"/>
      <path class="ml-hl-secondary" d="M 10 88 L 208 88 L 208 92 L 10 92 Z" opacity="0.62"/>
      <!-- Backplane elevation guides -->
      <line class="ml-hl-guide" x1="16" y1="26" x2="214" y2="26"/>
      <line class="ml-hl-guide" x1="16" y1="54" x2="214" y2="54"/>
      <!-- 3D Extruded Ribbon Side Wall -->
      <path d="${ribbonD}" fill="currentColor" fill-opacity="${area ? '0.08' : '0.045'}" stroke="none"/>
      ${area ? `<path d="${areaD}" fill="currentColor" fill-opacity="0.045" stroke="none"/>` : ''}
      <path class="ml-hl-secondary" d="${dRear}" opacity="0.48"/>
      ${depthRibs}
      <!-- Primary Front Hairline Spline -->
      <path class="ml-hl-primary ml-draw" pathLength="1" d="${d}"/>
      <!-- 3D Cylindrical Data Nodes -->
      ${pts
        .map(
          ([x, y], i) =>
            `<circle class="ml-hl-fill" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i % 2 === 0 ? '2.4' : '1.7'}"/>
             <circle class="${i === 8 ? 'ml-hl-accent' : 'ml-hl-primary'}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i % 2 === 0 ? '2.4' : '1.7'}"/>`,
        )
        .join('')}
      <!-- Interactive 3D Scrubbing Slice Plane -->
      <g class="ml-chart-cursor">
        <polygon points="${pts[8][0].toFixed(1)},88 ${(pts[8][0] + dx).toFixed(1)},83.5 ${(pts[8][0] + dx).toFixed(1)},16 ${pts[8][0].toFixed(1)},20" fill="currentColor" fill-opacity="0.04" stroke="currentColor" stroke-width="0.4" stroke-dasharray="1.5 2"/>
        <circle class="ml-hl-fill" cx="${pts[8][0].toFixed(1)}" cy="${pts[8][1].toFixed(1)}" r="3.6"/>
        <circle class="ml-hl-accent" cx="${pts[8][0].toFixed(1)}" cy="${pts[8][1].toFixed(1)}" r="3.6"/>
        <circle class="ml-hl-accent-dot" cx="${pts[8][0].toFixed(1)}" cy="${pts[8][1].toFixed(1)}" r="1.4"/>
      </g>
    </svg>`;

  const cursorG = qs<SVGGElement>(stage, '.ml-chart-cursor');
  attachStagePointer(stage, (nx) => {
    const i = Math.max(0, Math.min(values.length - 1, Math.round(nx * (values.length - 1))));
    const [x, y] = pts[i];
    const delta = values[i] - values[0];
    cursorG.innerHTML = `
      <polygon points="${x.toFixed(1)},88 ${(x + dx).toFixed(1)},83.5 ${(x + dx).toFixed(1)},16 ${x.toFixed(1)},20" fill="currentColor" fill-opacity="0.045" stroke="currentColor" stroke-width="0.4" stroke-dasharray="1.5 2"/>
      <circle class="ml-hl-fill" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.6"/>
      <circle class="ml-hl-accent" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.6"/>
      <circle class="ml-hl-accent-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.4"/>`;
    setPill(`${values[i]}${isTide ? ' cm' : ' pts'}`);
    setCells([`${values[i]}${isTide ? ' cm' : '.0'}`, `${delta >= 0 ? '+' : ''}${delta}`, peakVal, labels[i]]);
  });
  return panel;
}

function demoChartBar(horizontal = false): HTMLElement {
  const vals = [46, 72, 38, 86, 58, 76];
  const labels = ['CH·01', 'CH·02', 'CH·03', 'CH·04', 'CH·05', 'CH·06'];
  const total = vals.reduce((a, b) => a + b, 0);
  const peakStr = `${Math.max(...vals)}%`;
  const { panel, stage, setCells, setPill } = createInstrumentPanel(
    horizontal ? '3D HORIZONTAL BARS' : '3D COLUMN MONOLITHS',
    `${labels[3]} · ${vals[3]}%`,
    ['Channel', 'Value', 'Share', 'Peak'],
  );
  setCells([labels[3], `${vals[3]}%`, `${((vals[3] / total) * 100).toFixed(1)}%`, peakStr]);

  const renderBars = (activeIdx: number) => {
    if (horizontal) {
      const rows = vals
        .map((v, i) => {
          const y = 13 + i * 14.5;
          const w = (v / 100) * 138;
          const active = i === activeIdx;
          return `<g>
            <text class="ml-hl-label" x="10" y="${y + 6.5}">${labels[i].slice(-2)}</text>
            <!-- 3D Recessed Track Slot -->
            <rect class="ml-hl-fill" x="26" y="${y}" width="144" height="8" rx="4"/>
            <rect class="ml-hl-secondary" x="26" y="${y}" width="144" height="8" rx="4" opacity="0.45"/>
            <!-- 3D Extruded Capsule Bottom Rim -->
            <rect class="ml-hl-fill" x="26" y="${y + 1.6}" width="${w.toFixed(1)}" height="7.5" rx="3.75"/>
            <rect class="ml-hl-secondary" x="26" y="${y + 1.6}" width="${w.toFixed(1)}" height="7.5" rx="3.75" opacity="0.62"/>
            <!-- 3D Capsule Top Face -->
            <rect class="ml-hl-fill" x="26" y="${y}" width="${w.toFixed(1)}" height="7.2" rx="3.6"/>
            <rect class="${active ? 'ml-hl-accent' : 'ml-hl-primary'}" x="26" y="${y}" width="${w.toFixed(1)}" height="7.2" rx="3.6"/>
            <line class="ml-hl-inner" x1="30" y1="${y + 2}" x2="${(26 + w - 4).toFixed(1)}" y2="${y + 2}"/>
            <text class="ml-hl-label" x="176" y="${y + 6.5}">${v}%</text>
          </g>`;
        })
        .join('');
      stage.innerHTML = `<svg class="ml-svg ml-chart-svg" data-hairline viewBox="0 0 210 104" aria-label="3D Horizontal Bar Chart">${rows}</svg>`;
    } else {
      const cols = vals
        .map((v, i) => {
          const h = (v / 100) * 66;
          const x = 24 + i * 30;
          const y = 88 - h;
          const active = i === activeIdx;
          const dx = 4;
          const dy = -3.2;
          return `<g>
            <!-- 3D Floor Shadow Ellipse -->
            <ellipse cx="${x + 8}" cy="90" rx="8" ry="2.1" fill="none" stroke="currentColor" stroke-width="0.4" opacity="0.3"/>
            <!-- 3D Isometric Right Side Extrusion Face -->
            <polygon class="ml-hl-fill" points="${x + 15},${y + 2} ${x + 15 + dx},${y + 2 + dy} ${x + 15 + dx},${88 + dy} ${x + 15},88"/>
            <polygon class="ml-hl-secondary" points="${x + 15},${y + 2} ${x + 15 + dx},${y + 2 + dy} ${x + 15 + dx},${88 + dy} ${x + 15},88" opacity="0.58"/>
            <!-- 3D Isometric Top Cap Extrusion Face -->
            <polygon class="ml-hl-fill" points="${x},${y + 2} ${x + dx},${y + 2 + dy} ${x + 15 + dx},${y + 2 + dy} ${x + 15},${y + 2}"/>
            <polygon class="ml-hl-secondary" points="${x},${y + 2} ${x + dx},${y + 2 + dy} ${x + 15 + dx},${y + 2 + dy} ${x + 15},${y + 2}" opacity="0.58"/>
            <!-- Front Monolith Face -->
            <rect class="ml-hl-fill" x="${x}" y="${y + 2}" width="15" height="${h - 2}" rx="1.5"/>
            <rect class="${active ? 'ml-hl-accent' : 'ml-hl-primary'}" x="${x}" y="${y + 2}" width="15" height="${h - 2}" rx="1.5"/>
            <line class="ml-hl-inner" x1="${x + 2.5}" y1="${y + 4.5}" x2="${x + 12.5}" y2="${y + 4.5}"/>
            <line class="ml-hl-inner" x1="${x + 3}" y1="${y + 7}" x2="${x + 3}" y2="85" opacity="0.45"/>
            ${active ? `<circle class="ml-hl-accent-dot" cx="${x + 7.5}" cy="${y - 4}" r="1.5"/>` : ''}
          </g>`;
        })
        .join('');
      stage.innerHTML = `
        <svg class="ml-svg ml-chart-svg" data-hairline viewBox="0 0 220 104" aria-label="3D Column Bar Chart">
          <!-- 3D Base Plinth -->
          <polygon class="ml-hl-fill" points="12,88 18,83.5 208,83.5 202,88"/>
          <polygon class="ml-hl-secondary" points="12,88 18,83.5 208,83.5 202,88" opacity="0.48"/>
          <rect class="ml-hl-fill" x="12" y="88" width="190" height="3.8" rx="1"/>
          <rect class="ml-hl-secondary" x="12" y="88" width="190" height="3.8" rx="1" opacity="0.62"/>
          <line class="ml-hl-guide" x1="16" y1="32" x2="206" y2="32"/>
          <line class="ml-hl-guide" x1="16" y1="60" x2="206" y2="60"/>
          ${cols}
        </svg>`;
    }
  };

  renderBars(3);
  attachStagePointer(stage, (nx, ny) => {
    const idx = horizontal
      ? Math.max(0, Math.min(vals.length - 1, Math.floor(ny * vals.length)))
      : Math.max(0, Math.min(vals.length - 1, Math.floor(nx * vals.length)));
    renderBars(idx);
    setPill(`${labels[idx]} · ${vals[idx]}%`);
    setCells([labels[idx], `${vals[idx]}%`, `${((vals[idx] / total) * 100).toFixed(1)}%`, peakStr]);
  });
  return panel;
}

function demoChartCandles(kind = 'chart-candles'): HTMLElement {
  const candles = [
    [42, 70, 34, 60, 38],
    [60, 78, 52, 72, 54],
    [72, 82, 48, 54, 62],
    [54, 69, 46, 66, 44],
    [66, 86, 60, 79, 76],
    [79, 92, 68, 73, 58],
    [73, 84, 58, 81, 68],
    [81, 94, 72, 88, 84],
  ];
  const { panel, stage, setCells, setPill } = createInstrumentPanel(
    kind === 'financial-chart' ? '3D OHLC TERMINAL · M15' : '3D CANDLESTICK · OHLC',
    'C 81.0 · +11.0%',
    ['Open', 'High', 'Low', 'Close'],
  );
  setCells(['73.0', '84.0', '58.0', '81.0']);

  const renderCandles = (activeIdx: number) => {
    const dx = 3;
    const dy = -2.4;
    const items = candles
      .map(([o, h, l, c, vol], i) => {
        const x = 22 + i * 24;
        const yO = 90 - o * 0.78;
        const yC = 90 - c * 0.78;
        const yH = 90 - h * 0.78;
        const yL = 90 - l * 0.78;
        const top = Math.min(yO, yC);
        const body = Math.max(3, Math.abs(yO - yC));
        const up = c >= o;
        const active = i === activeIdx;
        const vH = (vol / 100) * 14;
        return `<g>
          <!-- 3D Floor Volume Prism -->
          <rect x="${x - 4}" y="${95 - vH}" width="8" height="${vH}" fill="currentColor" fill-opacity="${active ? '0.18' : '0.07'}" stroke="currentColor" stroke-width="0.4" opacity="0.5"/>
          <!-- Upper & Lower Wicks -->
          <line class="${active ? 'ml-hl-accent' : 'ml-hl-secondary'}" x1="${x}" y1="${yH.toFixed(1)}" x2="${x}" y2="${top.toFixed(1)}"/>
          <line class="${active ? 'ml-hl-accent' : 'ml-hl-secondary'}" x1="${x}" y1="${(top + body).toFixed(1)}" x2="${x}" y2="${yL.toFixed(1)}"/>
          <!-- 3D Extruded Candle Side & Top Faces -->
          <polygon class="ml-hl-fill" points="${x + 5},${top.toFixed(1)} ${x + 5 + dx},${(top + dy).toFixed(1)} ${x + 5 + dx},${(top + body + dy).toFixed(1)} ${x + 5},${(top + body).toFixed(1)}"/>
          <polygon class="ml-hl-secondary" points="${x + 5},${top.toFixed(1)} ${x + 5 + dx},${(top + dy).toFixed(1)} ${x + 5 + dx},${(top + body + dy).toFixed(1)} ${x + 5},${(top + body).toFixed(1)}" opacity="0.55"/>
          <polygon class="ml-hl-fill" points="${x - 5},${top.toFixed(1)} ${x - 5 + dx},${(top + dy).toFixed(1)} ${x + 5 + dx},${(top + dy).toFixed(1)} ${x + 5},${top.toFixed(1)}"/>
          <polygon class="ml-hl-secondary" points="${x - 5},${top.toFixed(1)} ${x - 5 + dx},${(top + dy).toFixed(1)} ${x + 5 + dx},${(top + dy).toFixed(1)} ${x + 5},${top.toFixed(1)}" opacity="0.55"/>
          <!-- Front Candle Body -->
          <rect class="ml-hl-fill" x="${x - 5}" y="${top.toFixed(1)}" width="10" height="${body.toFixed(1)}" rx="1"/>
          ${!up ? `<rect x="${x - 5}" y="${top.toFixed(1)}" width="10" height="${body.toFixed(1)}" rx="1" fill="currentColor" fill-opacity="0.12"/>` : ''}
          <rect class="${active ? 'ml-hl-accent' : 'ml-hl-primary'}" x="${x - 5}" y="${top.toFixed(1)}" width="10" height="${body.toFixed(1)}" rx="1"/>
          <line class="ml-hl-inner" x1="${x - 3}" y1="${(top + 1.8).toFixed(1)}" x2="${x + 3}" y2="${(top + 1.8).toFixed(1)}"/>
        </g>`;
      })
      .join('');

    const ax = 22 + activeIdx * 24;
    const ay = 90 - candles[activeIdx][3] * 0.78;
    stage.innerHTML = `
      <svg class="ml-svg ml-chart-svg" data-hairline viewBox="0 0 220 104" aria-label="3D Candlestick Chart">
        <polygon class="ml-hl-fill" points="10,95 15,91.5 212,91.5 207,95"/>
        <polygon class="ml-hl-secondary" points="10,95 15,91.5 212,91.5 207,95" opacity="0.45"/>
        <line class="ml-hl-guide" x1="12" y1="28" x2="210" y2="28"/>
        <line class="ml-hl-guide" x1="12" y1="56" x2="210" y2="56"/>
        <line class="ml-hl-guide" x1="${ax}" y1="12" x2="${ax}" y2="95" opacity="0.55"/>
        <line class="ml-hl-guide" x1="12" y1="${ay.toFixed(1)}" x2="210" y2="${ay.toFixed(1)}" opacity="0.48"/>
        ${items}
      </svg>`;
  };

  renderCandles(6);
  attachStagePointer(stage, (nx) => {
    const idx = Math.max(0, Math.min(candles.length - 1, Math.floor(nx * candles.length)));
    const [o, h, l, c] = candles[idx];
    const pct = (((c - o) / o) * 100).toFixed(1);
    renderCandles(idx);
    setPill(`C ${c}.0 · ${c >= o ? '+' : ''}${pct}%`);
    setCells([`${o}.0`, `${h}.0`, `${l}.0`, `${c}.0`]);
  });
  return panel;
}

function demoChartDonut(): HTMLElement {
  const segments = [
    { name: 'COMPUTE', share: 0.36, val: '36.0%' },
    { name: 'STORAGE', share: 0.26, val: '26.0%' },
    { name: 'NETWORK', share: 0.21, val: '21.0%' },
    { name: 'CACHE', share: 0.17, val: '17.0%' },
  ];
  const { panel, stage, setCells, setPill } = createInstrumentPanel(
    '3D STEPPED TORUS · RING',
    'COMPUTE · 36%',
    ['Segment', 'Share', 'Angle', 'Total'],
  );
  setCells(['COMPUTE', '36.0%', '130°', '100%']);

  const sectorPath = (cx: number, cy: number, rOut: number, rIn: number, a0: number, a1: number) => {
    const gap = 0.045;
    const s = a0 + gap;
    const e = a1 - gap;
    const x0o = cx + Math.cos(s) * rOut;
    const y0o = cy + Math.sin(s) * rOut;
    const x1o = cx + Math.cos(e) * rOut;
    const y1o = cy + Math.sin(e) * rOut;
    const x1i = cx + Math.cos(e) * rIn;
    const y1i = cy + Math.sin(e) * rIn;
    const x0i = cx + Math.cos(s) * rIn;
    const y0i = cy + Math.sin(s) * rIn;
    const large = e - s > Math.PI ? 1 : 0;
    return `M ${x0o.toFixed(2)} ${y0o.toFixed(2)} A ${rOut} ${rOut} 0 ${large} 1 ${x1o.toFixed(2)} ${y1o.toFixed(2)} L ${x1i.toFixed(2)} ${y1i.toFixed(2)} A ${rIn} ${rIn} 0 ${large} 0 ${x0i.toFixed(2)} ${y0i.toFixed(2)} Z`;
  };

  const renderDonut = (activeIdx: number) => {
    let a0 = -Math.PI / 2;
    const lowerRings: string[] = [];
    const upperRings: string[] = [];
    segments.forEach((seg, i) => {
      const a1 = a0 + seg.share * Math.PI * 2;
      const active = i === activeIdx;
      const rOut = active ? 42.5 : 40.5;
      const rIn = 23.5;
      // 3D extruded lower torus plate shifted down by +4.5px
      const dLow = sectorPath(110, 56.5, rOut, rIn, a0, a1);
      const dTop = sectorPath(110, 52, rOut, rIn, a0, a1);
      lowerRings.push(`<path class="ml-hl-fill" d="${dLow}"/><path class="ml-hl-secondary" d="${dLow}" opacity="0.58"/>`);
      upperRings.push(
        `<path class="ml-hl-fill" d="${dTop}"/>
         <path d="${dTop}" fill="currentColor" fill-opacity="${0.03 + i * 0.035}" stroke="none"/>
         <path class="${active ? 'ml-hl-accent' : 'ml-hl-primary'}" d="${dTop}"/>`,
      );
      a0 = a1;
    });

    stage.innerHTML = `
      <svg class="ml-svg ml-chart-svg" data-hairline viewBox="0 0 220 108" aria-label="3D Stepped Donut Chart">
        <!-- Outer 3D Bezel Plinth -->
        <ellipse cx="110" cy="56.5" rx="46" ry="46" fill="none" stroke="currentColor" stroke-width="0.4" opacity="0.25"/>
        ${lowerRings.join('')}
        ${upperRings.join('')}
        <!-- Inner 3D Recessed Hub -->
        <circle class="ml-hl-fill" cx="110" cy="52" r="18"/>
        <circle class="ml-hl-secondary" cx="110" cy="52" r="18" opacity="0.55"/>
        <text class="ml-hl-readout" x="110" y="51" text-anchor="middle">${Math.round(segments[activeIdx].share * 100)}%</text>
        <text class="ml-hl-label" x="110" y="60" text-anchor="middle">${segments[activeIdx].name}</text>
      </svg>`;
  };

  renderDonut(0);
  attachStagePointer(stage, (nx, ny) => {
    const ang = Math.atan2(ny - 0.5, nx - 0.5);
    const norm = ((ang + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2);
    let acc = 0;
    let idx = 0;
    for (let i = 0; i < segments.length; i++) {
      acc += segments[i].share;
      if (norm <= acc) {
        idx = i;
        break;
      }
    }
    const seg = segments[idx];
    renderDonut(idx);
    setPill(`${seg.name} · ${Math.round(seg.share * 100)}%`);
    setCells([seg.name, seg.val, `${Math.round(seg.share * 360)}°`, '100%']);
  });
  return panel;
}

function demoChartSpark(): HTMLElement {
  const values = [14, 21, 17, 26, 22, 33, 29, 39, 34, 46];
  const pts = seriesPoints(values, 210, 68, 12);
  const d = smoothPath(values, 210, 68, 12);
  const ptsRear = pts.map(([x, y]) => [x + 3.5, y - 3] as [number, number]);
  let dRear = `M ${ptsRear[0][0].toFixed(1)} ${ptsRear[0][1].toFixed(1)}`;
  for (let i = 1; i < ptsRear.length; i++) {
    const [x0, y0] = ptsRear[i - 1];
    const [x1, y1] = ptsRear[i];
    const cx = (x0 + x1) / 2;
    dRear += ` C ${cx.toFixed(1)} ${y0.toFixed(1)}, ${cx.toFixed(1)} ${y1.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }

  const { panel, stage, setCells, setPill } = createInstrumentPanel(
    '3D MICRO-RIBBON · 7D',
    '+12.4%',
    ['Current', '7d Low', '7d High'],
  );
  panel.style.setProperty('--ml-cols', '3');
  setCells(['46.0', '14.0', '46.0']);

  stage.innerHTML = `
    <svg class="ml-svg ml-chart-svg" data-hairline viewBox="0 0 220 76" aria-label="3D Sparkline">
      <polygon class="ml-hl-fill" points="10,62 14,58.5 208,58.5 204,62"/>
      <polygon class="ml-hl-secondary" points="10,62 14,58.5 208,58.5 204,62" opacity="0.45"/>
      <path class="ml-hl-secondary" d="${dRear}" opacity="0.45"/>
      ${pts.map(([x, y], i) => `<line class="ml-hl-inner" x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${ptsRear[i][0].toFixed(1)}" y2="${ptsRear[i][1].toFixed(1)}" opacity="0.42"/>`).join('')}
      <path class="ml-hl-primary" d="${d}"/>
      <g class="ml-spark-node">
        <circle class="ml-hl-fill" cx="${pts[9][0].toFixed(1)}" cy="${pts[9][1].toFixed(1)}" r="3.4"/>
        <circle class="ml-hl-accent" cx="${pts[9][0].toFixed(1)}" cy="${pts[9][1].toFixed(1)}" r="3.4"/>
        <circle class="ml-hl-accent-dot" cx="${pts[9][0].toFixed(1)}" cy="${pts[9][1].toFixed(1)}" r="1.3"/>
      </g>
    </svg>`;

  const nodeG = qs<SVGGElement>(stage, '.ml-spark-node');
  attachStagePointer(stage, (nx) => {
    const i = Math.max(0, Math.min(values.length - 1, Math.round(nx * (values.length - 1))));
    const [x, y] = pts[i];
    const pct = (((values[i] - values[0]) / values[0]) * 100).toFixed(1);
    nodeG.innerHTML = `
      <line class="ml-hl-guide" x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x.toFixed(1)}" y2="62"/>
      <circle class="ml-hl-fill" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4"/>
      <circle class="ml-hl-accent" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4"/>
      <circle class="ml-hl-accent-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.3"/>`;
    setPill(`${values[i] >= values[0] ? '+' : ''}${pct}%`);
    setCells([`${values[i]}.0`, '14.0', '46.0']);
  });
  return panel;
}

function demoChartScatter(): HTMLElement {
  const pts: [number, number][] = [
    [28, 74],
    [42, 60],
    [56, 66],
    [72, 46],
    [88, 52],
    [104, 36],
    [124, 42],
    [144, 28],
    [164, 33],
    [186, 22],
  ];
  const { panel, stage, setCells, setPill } = createInstrumentPanel(
    '3D SPATIAL SCATTER · R²',
    'R² 0.91 · N=10',
    ['Node', 'X · Y', 'Residual', 'Fit R²'],
  );
  setCells(['P·08', '144 · 72', '+1.0σ', '0.914']);

  const renderScatter = (activeIdx: number) => {
    const nodes = pts
      .map(([x, y], i) => {
        const active = i === activeIdx;
        const r = active ? 4.2 : 2.9;
        return `<g>
          <!-- Vertical Plumb Line to 3D Floor Shadow -->
          <line class="ml-hl-guide" x1="${x}" y1="${y}" x2="${x}" y2="86" opacity="${active ? '0.65' : '0.32'}"/>
          <ellipse cx="${x}" cy="86" rx="${active ? '4.5' : '2.8'}" ry="1.1" fill="none" stroke="currentColor" stroke-width="0.4" opacity="0.38"/>
          <!-- 3D Orb Lower Rim & Primary Sphere -->
          <circle class="ml-hl-fill" cx="${x}" cy="${y + 1.1}" r="${r}"/>
          <circle class="ml-hl-secondary" cx="${x}" cy="${y + 1.1}" r="${r}" opacity="0.6"/>
          <circle class="ml-hl-fill" cx="${x}" cy="${y}" r="${r}"/>
          <circle class="${active ? 'ml-hl-accent' : 'ml-hl-primary'}" cx="${x}" cy="${y}" r="${r}"/>
          ${active ? `<circle class="ml-hl-accent-dot" cx="${x}" cy="${y}" r="1.4"/>` : ''}
        </g>`;
      })
      .join('');

    stage.innerHTML = `
      <svg class="ml-svg ml-chart-svg" data-hairline viewBox="0 0 220 102" aria-label="3D Scatter Plot">
        <!-- 3D Isometric Coordinate Floor Plane -->
        <polygon class="ml-hl-fill" points="16,88 26,80 206,80 196,88"/>
        <polygon class="ml-hl-secondary" points="16,88 26,80 206,80 196,88" opacity="0.48"/>
        <line class="ml-hl-secondary" x1="16" y1="14" x2="16" y2="88" opacity="0.55"/>
        <!-- Linear Regression Corridor -->
        <line class="ml-hl-guide" x1="22" y1="74" x2="194" y2="18"/>
        <line class="ml-hl-secondary" x1="22" y1="78" x2="194" y2="22" opacity="0.38"/>
        ${nodes}
      </svg>`;
  };

  renderScatter(7);
  attachStagePointer(stage, (nx) => {
    const idx = Math.max(0, Math.min(pts.length - 1, Math.round(nx * (pts.length - 1))));
    const [x, y] = pts[idx];
    const res = ((idx % 3) - 1) * 0.6 + 0.4;
    renderScatter(idx);
    setPill(`P·0${idx + 1} · (${x}, ${100 - y})`);
    setCells([`P·0${idx + 1}`, `${x} · ${100 - y}`, `${res >= 0 ? '+' : ''}${res.toFixed(1)}σ`, '0.914']);
  });
  return panel;
}

function demoChartRadar(): HTMLElement {
  const axes = ['GAIN', 'Q-FAC', 'PHASE', 'DEPTH', 'DRIFT', 'SN-R'];
  const vals = [0.84, 0.62, 0.76, 0.54, 0.9, 0.68];
  const n = vals.length;
  const cx = 110;
  const cy = 53;
  const R = 41;

  const { panel, stage, setCells, setPill } = createInstrumentPanel(
    '3D HEXAGONAL POLYHEDRON',
    'DRIFT · 90%',
    ['Axis', 'Score', 'Mean'],
  );
  panel.style.setProperty('--ml-cols', '3');
  setCells(['DRIFT', '90.0%', '72.3%']);

  const hexPts = (cyOff: number, scale: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
      return `${(cx + Math.cos(a) * R * scale).toFixed(1)},${(cy + cyOff + Math.sin(a) * R * scale).toFixed(1)}`;
    }).join(' ');

  const renderRadar = (activeIdx: number) => {
    const polyLow = vals
      .map((v, i) => {
        const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
        return `${(cx + Math.cos(a) * R * v).toFixed(1)},${(cy + 4 + Math.sin(a) * R * v).toFixed(1)}`;
      })
      .join(' ');
    const polyTop = vals
      .map((v, i) => {
        const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
        return `${(cx + Math.cos(a) * R * v).toFixed(1)},${(cy + Math.sin(a) * R * v).toFixed(1)}`;
      })
      .join(' ');

    const spokes = axes
      .map((label, i) => {
        const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
        const x1 = cx + Math.cos(a) * R;
        const y1 = cy + Math.sin(a) * R;
        const vx = cx + Math.cos(a) * R * vals[i];
        const vy = cy + Math.sin(a) * R * vals[i];
        const lx = cx + Math.cos(a) * (R + 13);
        const ly = cy + Math.sin(a) * (R + 10) + 2;
        const active = i === activeIdx;
        return `<g>
          <line class="ml-hl-guide" x1="${cx}" y1="${cy}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}"/>
          <line class="ml-hl-inner" x1="${vx.toFixed(1)}" y1="${vy.toFixed(1)}" x2="${vx.toFixed(1)}" y2="${(vy + 4).toFixed(1)}"/>
          <circle class="ml-hl-fill" cx="${vx.toFixed(1)}" cy="${vy.toFixed(1)}" r="${active ? '3.2' : '2.2'}"/>
          <circle class="${active ? 'ml-hl-accent' : 'ml-hl-primary'}" cx="${vx.toFixed(1)}" cy="${vy.toFixed(1)}" r="${active ? '3.2' : '2.2'}"/>
          <text class="ml-hl-label" x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle">${label}</text>
        </g>`;
      })
      .join('');

    stage.innerHTML = `
      <svg class="ml-svg ml-chart-svg" data-hairline viewBox="0 0 220 112" aria-label="3D Radar Polyhedron">
        <!-- 3D Lower Extruded Hexagonal Plate -->
        <polygon class="ml-hl-fill" points="${hexPts(4.5, 1)}"/>
        <polygon class="ml-hl-secondary" points="${hexPts(4.5, 1)}" opacity="0.52"/>
        <!-- Upper Hexagonal Web Rings -->
        <polygon class="ml-hl-fill" points="${hexPts(0, 1)}"/>
        <polygon class="ml-hl-secondary" points="${hexPts(0, 1)}" opacity="0.62"/>
        <polygon class="ml-hl-guide" points="${hexPts(0, 0.66)}"/>
        <polygon class="ml-hl-guide" points="${hexPts(0, 0.33)}"/>
        <!-- 3D Extruded Lower Data Polygon -->
        <polygon class="ml-hl-secondary" points="${polyLow}" opacity="0.45"/>
        <!-- 3D Primary Data Polygon -->
        <polygon points="${polyTop}" fill="currentColor" fill-opacity="0.065" stroke="none"/>
        <polygon class="ml-hl-primary" points="${polyTop}"/>
        ${spokes}
      </svg>`;
  };

  renderRadar(4);
  attachStagePointer(stage, (nx, ny) => {
    const ang = Math.atan2(ny - 0.5, nx - 0.5);
    const norm = ((ang + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2);
    const idx = Math.round(norm * n) % n;
    renderRadar(idx);
    setPill(`${axes[idx]} · ${Math.round(vals[idx] * 100)}%`);
    setCells([axes[idx], `${(vals[idx] * 100).toFixed(1)}%`, '72.3%']);
  });
  return panel;
}

function demoChartHisto(): HTMLElement {
  const bins = [7, 13, 22, 31, 27, 19, 12, 7, 4];
  const zScores = ['-2.0σ', '-1.5σ', '-1.0σ', '-0.5σ', '0.0σ', '+0.5σ', '+1.0σ', '+1.5σ', '+2.0σ'];
  const max = Math.max(...bins);
  const total = bins.reduce((a, b) => a + b, 0);

  const { panel, stage, setCells, setPill } = createInstrumentPanel(
    '3D GAUSSIAN HISTOGRAM · σ',
    'BIN 04 · 31',
    ['Bin Z', 'Count', 'Density', 'Total N'],
  );
  setCells(['-0.5σ', '31', '21.8%', `${total}`]);

  const renderHisto = (activeIdx: number) => {
    const dx = 3.2;
    const dy = -2.6;
    const bars = bins
      .map((b, i) => {
        const h = (b / max) * 62;
        const x = 18 + i * 20;
        const y = 88 - h;
        const active = i === activeIdx;
        return `<g>
          <!-- 3D Isometric Top & Right Extrusion Faces -->
          <polygon class="ml-hl-fill" points="${x + 17},${y} ${x + 17 + dx},${y + dy} ${x + 17 + dx},${88 + dy} ${x + 17},88"/>
          <polygon class="ml-hl-secondary" points="${x + 17},${y} ${x + 17 + dx},${y + dy} ${x + 17 + dx},${88 + dy} ${x + 17},88" opacity="0.55"/>
          <polygon class="ml-hl-fill" points="${x},${y} ${x + dx},${y + dy} ${x + 17 + dx},${y + dy} ${x + 17},${y}"/>
          <polygon class="ml-hl-secondary" points="${x},${y} ${x + dx},${y + dy} ${x + 17 + dx},${y + dy} ${x + 17},${y}" opacity="0.55"/>
          <!-- Front Bin Column -->
          <rect class="ml-hl-fill" x="${x}" y="${y}" width="17" height="${h}" rx="1"/>
          ${active ? `<rect x="${x}" y="${y}" width="17" height="${h}" rx="1" fill="currentColor" fill-opacity="0.09"/>` : ''}
          <rect class="${active ? 'ml-hl-accent' : 'ml-hl-primary'}" x="${x}" y="${y}" width="17" height="${h}" rx="1"/>
          <line class="ml-hl-inner" x1="${x + 2.5}" y1="${y + 2.2}" x2="${x + 14.5}" y2="${y + 2.2}"/>
        </g>`;
      })
      .join('');

    const bellPts = bins.map((b, i) => [26.5 + i * 20, 88 - (b / max) * 62] as [number, number]);
    let bellD = `M ${bellPts[0][0].toFixed(1)} ${bellPts[0][1].toFixed(1)}`;
    for (let i = 1; i < bellPts.length; i++) {
      const [x0, y0] = bellPts[i - 1];
      const [x1, y1] = bellPts[i];
      const cx = (x0 + x1) / 2;
      bellD += ` C ${cx.toFixed(1)} ${y0.toFixed(1)}, ${cx.toFixed(1)} ${y1.toFixed(1)}, ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }

    stage.innerHTML = `
      <svg class="ml-svg ml-chart-svg" data-hairline viewBox="0 0 220 102" aria-label="3D Gaussian Histogram">
        <polygon class="ml-hl-fill" points="12,88 17,84 206,84 201,88"/>
        <polygon class="ml-hl-secondary" points="12,88 17,84 206,84 201,88" opacity="0.48"/>
        <line class="ml-hl-guide" x1="14" y1="36" x2="204" y2="36"/>
        <line class="ml-hl-guide" x1="14" y1="62" x2="204" y2="62"/>
        ${bars}
        <!-- Smooth Gaussian Kernel Overlay -->
        <path class="ml-hl-accent" d="${bellD}" opacity="0.72"/>
      </svg>`;
  };

  renderHisto(3);
  attachStagePointer(stage, (nx) => {
    const idx = Math.max(0, Math.min(bins.length - 1, Math.floor(nx * bins.length)));
    renderHisto(idx);
    setPill(`BIN 0${idx + 1} · ${bins[idx]}`);
    setCells([zScores[idx], `${bins[idx]}`, `${((bins[idx] / total) * 100).toFixed(1)}%`, `${total}`]);
  });
  return panel;
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
      return demoColorPicker(item.id);
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
      return demoChartLine(false, item.id);
    case 'chart-area':
      return demoChartLine(true, item.id);
    case 'chart-bar':
      return demoChartBar(false);
    case 'chart-hbar':
      return demoChartBar(true);
    case 'chart-candles':
      return demoChartCandles(item.id);
    case 'chart-donut':
      return demoChartDonut();
    case 'chart-spark':
      if (item.id === 'race-telemetry') return demoRaceTelemetry();
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
