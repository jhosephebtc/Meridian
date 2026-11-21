import './site-chrome';
import { mountPaperGrain, bootPaperGrainExtras } from './paper-grain.ts';
import { markPageReady } from './page-enter.ts';
import {
  CATEGORY_LABELS,
  COMPONENT_CATALOG,
  type CatalogItem,
  type ComponentCategory,
  type DemoKind,
  installCommand,
} from './component-catalog.ts';
import { initI18n } from './i18n';
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

function demoDial(detent = false): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ml-dial';
  el.innerHTML = `
    <svg class="ml-svg" viewBox="0 0 120 120" aria-hidden="true">
      <circle class="ml-guide" cx="60" cy="60" r="54" fill="none" stroke="currentColor" stroke-opacity="0.55"/>
      <path class="ml-secondary" d="M22 88 A48 48 0 1 1 98 88" fill="none" stroke="currentColor" stroke-opacity="0.8"/>
      <g class="ml-dial-knob">
        <circle class="ml-secondary" cx="60" cy="60" r="28" fill="var(--ds-bg)" stroke="currentColor"/>
        <line class="ml-primary" x1="60" y1="60" x2="60" y2="38" stroke="currentColor"/>
      </g>
    </svg>
    <input type="range" min="0" max="100" step="${detent ? 10 : 1}" aria-label="Dial" />
    <div class="ml-slider-readout ml-dial-out" style="position:absolute;inset:auto 0 4px;pointer-events:none"></div>`;
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
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'ml-key';
  b.textContent = '⌘';
  return b;
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

function demoCompass(): HTMLElement {
  const el = document.createElement('div');
  el.innerHTML = `
    <svg class="ml-svg" viewBox="0 0 160 160" aria-label="Compass">
      <circle class="ml-guide" cx="80" cy="80" r="68" fill="none" stroke="currentColor" stroke-opacity="0.7"/>
      <circle class="ml-secondary" cx="80" cy="80" r="52" fill="none" stroke="currentColor" stroke-opacity="0.85"/>
      <g class="ml-guide" stroke="currentColor">
        ${Array.from({ length: 36 }, (_, i) => {
          const a = (i / 36) * Math.PI * 2;
          const inner = i % 3 === 0 ? 58 : 62;
          const x1 = 80 + Math.cos(a) * inner;
          const y1 = 80 + Math.sin(a) * inner;
          const x2 = 80 + Math.cos(a) * 68;
          const y2 = 80 + Math.sin(a) * 68;
          return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke-opacity="${i % 3 === 0 ? 0.7 : 0.25}"/>`;
        }).join('')}
      </g>
      <path class="ml-primary" d="M80 30 C82 52 83 68 81 80 C79 66 78 50 80 30" fill="none" stroke="currentColor"/>
      <circle class="ml-mark" cx="80" cy="80" r="2" fill="currentColor"/>
      <text x="80" y="18" text-anchor="middle">N</text>
    </svg>`;
  return el.firstElementChild as HTMLElement;
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

function demoSvgInstrument(_kind: string): HTMLElement {
  const el = document.createElement('div');
  el.innerHTML = `
    <svg class="ml-svg" viewBox="0 0 200 100" aria-hidden="true">
      <path class="ml-primary ml-draw" pathLength="1" d="M8 72 C40 72 36 28 70 40 S110 88 140 52 S170 20 192 36" fill="none" stroke="currentColor"/>
      <line class="ml-guide" x1="8" y1="88" x2="192" y2="88" stroke="currentColor" stroke-opacity="0.85"/>
      <text x="8" y="14">TRAÇO · 1.5</text>
    </svg>`;
  return el.firstElementChild as HTMLElement;
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
  el.innerHTML = Array.from({ length: 6 }, (_, i) => {
    const on = i % 2 === 0;
    return `<button type="button" class="ml-console-key" data-on="${on}" aria-pressed="${on}">
      <span class="ml-console-led"></span><span class="ds-mono">CH${i + 1}</span>
    </button>`;
  }).join('');
  el.querySelectorAll('button').forEach((b) =>
    b.addEventListener('click', () => {
      const next = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(next));
      b.dataset.on = String(next);
    }),
  );
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
      return demoDial(item.id === 'detent-dial');
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
      return demoCompass();
    case 'audio-meter':
      return demoAudioMeter();
    case 'steps':
      return demoSteps();
    case 'gallery':
      return demoGallery();
    case 'filmstrip':
      return demoFilmstrip();
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
      <p style="color:var(--ds-fg-muted);font-size:14px;line-height:1.5;margin:0 0 16px">sheet sheet · drag handle visual · Esc closes.</p>
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
      document.getElementById(`card-${row.dataset.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

function filtered(): CatalogItem[] {
  return COMPONENT_CATALOG.filter((c) => {
    if (activeCategory !== 'all' && c.category !== activeCategory) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.id.includes(q) || c.blurb.toLowerCase().includes(q);
  });
}

function renderGrid(): void {
  const grid = qs<HTMLElement>(document, '#lab-grid');
  const count = qs<HTMLElement>(document, '#lab-count');
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
    meta.innerHTML = `
      <div class="ds-eyebrow">${CATEGORY_LABELS[item.category]}${item.interactive ? ' · live' : ''}</div>
      <h3>${item.name}</h3>
      <p>${item.blurb}</p>
      <div class="lab-card-actions">
        <button type="button" class="ml-btn" data-copy="${cmd.replace(/"/g, '&quot;')}">Copy install</button>
        <code title="${cmd}">${cmd}</code>
      </div>`;
    meta.querySelector('[data-copy]')!.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(cmd);
        pushToast(`Copied · ${item.install}`);
      } catch {
        pushToast('Clipboard unavailable');
      }
    });
    card.append(stage, meta);
    grid.append(card);
  }
}

function renderSidebar(): void {
  const nav = qs<HTMLElement>(document, '#lab-cats');
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
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'lab-cat-btn';
    b.dataset.active = String(c === activeCategory);
    b.textContent = c === 'all' ? 'All components' : CATEGORY_LABELS[c];
    b.addEventListener('click', () => {
      activeCategory = c;
      renderSidebar();
      renderGrid();
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
  initI18n();
  mountPaperGrain({ seed: 20261120 });
  bootPaperGrainExtras();
  markPageReady();
  ensureHosts();
  initChrome();
  renderSidebar();
  renderGrid();

  const search = document.getElementById('lab-search-input') as HTMLInputElement | null;
  search?.addEventListener('input', () => {
    searchQuery = search.value;
    renderGrid();
  });

  const banner = document.getElementById('lab-registry-cmd');
  if (banner) banner.textContent = `npx shadcn@latest add ${REGISTRY_BASE}/registry.json`;
}

init();
