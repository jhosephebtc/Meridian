import { mountPaperGrain } from './paper-grain.ts';
import { markPageReady } from './page-enter.ts';
import {
  CATEGORY_LABELS,
  COMPONENT_CATALOG,
  type CatalogItem,
  type ComponentCategory,
  type DemoKind,
  installCommand,
} from './component-catalog.ts';

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
    btn.addEventListener('pointerdown', (e) => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--ml-press-x', `${e.clientX - r.left}px`);
      btn.style.setProperty('--ml-press-y', `${e.clientY - r.top}px`);
    });
    wrap.append(btn);
  }
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
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" stroke-opacity="0.18" stroke-width="1"/>
      <path d="M22 88 A48 48 0 1 1 98 88" fill="none" stroke="currentColor" stroke-opacity="0.28" stroke-width="1"/>
      <g class="ml-dial-knob">
        <circle cx="60" cy="60" r="28" fill="var(--ds-bg)" stroke="currentColor" stroke-width="1.5"/>
        <line x1="60" y1="60" x2="60" y2="38" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
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
  let value = 5;
  const cells: HTMLButtonElement[] = [];
  const paint = () => {
    cells.forEach((c, i) => {
      c.dataset.on = String(i <= value);
    });
    el.setAttribute('aria-valuenow', String(value));
  };
  for (let i = 0; i < 12; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ml-bar-cell';
    b.setAttribute('aria-label', `Level ${i}`);
    b.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      value = i;
      paint();
      b.setPointerCapture(e.pointerId);
    });
    b.addEventListener('pointerenter', (e) => {
      if (e.buttons === 1) {
        value = i;
        paint();
      }
    });
    cells.push(b);
    el.append(b);
  }
  paint();
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
    ['Paper grain', 'Canvas overlay with size + intensity controls.'],
    ['Hairline scroll', '2px thumb, transparent track — Chromium + Firefox.'],
    ['Frequency Gate', '⌘K and root tabs animate at 0ms.'],
  ] as const;
  items.forEach(([t, b], i) => {
    const item = document.createElement('div');
    item.className = 'ml-acc-item';
    if (i === 0) item.dataset.open = 'true';
    item.innerHTML = `<button type="button" class="ml-acc-trigger"><span>${t}</span><span>+</span></button>
      <div class="ml-acc-panel">${b}</div>`;
    item.querySelector('button')!.addEventListener('click', () => {
      const open = item.dataset.open === 'true';
      el.querySelectorAll('.ml-acc-item').forEach((n) => delete (n as HTMLElement).dataset.open);
      if (!open) item.dataset.open = 'true';
    });
    el.append(item);
  });
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
      <circle cx="80" cy="80" r="68" fill="none" stroke="currentColor" stroke-width="1" stroke-opacity="0.25"/>
      <circle cx="80" cy="80" r="52" fill="none" stroke="currentColor" stroke-width="1" stroke-opacity="0.4"/>
      <g stroke="currentColor" stroke-width="1" stroke-linecap="round">
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
      <polygon points="80,28 84,80 80,76 76,80" fill="currentColor"/>
      <text x="80" y="22" text-anchor="middle">N</text>
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

function demoSvgInstrument(kind: string): HTMLElement {
  const el = document.createElement('div');
  if (kind.includes('financial') || kind.includes('tide') || kind.includes('race') || kind.includes('lunar') || kind.includes('astronomy') || kind.includes('attitude') || kind.includes('instrument') || kind.includes('telemetry')) {
    el.innerHTML = `
      <svg class="ml-svg" viewBox="0 0 200 100" aria-hidden="true">
        <path d="M8 72 C40 72 36 28 70 40 S110 88 140 52 S170 20 192 36" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/>
        <line x1="8" y1="88" x2="192" y2="88" stroke="currentColor" stroke-opacity="0.2" stroke-width="1"/>
        <text x="8" y="14">PLOT · 1u</text>
      </svg>`;
    return el.firstElementChild as HTMLElement;
  }
  return demoCompass();
}

function demoPlate(item: CatalogItem): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ml-plate-empty';
  el.textContent = `Line plate · install via shadcn · ${item.install}`;
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
    'surfaces',
    'navigation',
    'feedback',
    'instruments',
    'finance',
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
      setRail(false);
    }
  });
}

function init(): void {
  mountPaperGrain({ seed: 20261120 });
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
