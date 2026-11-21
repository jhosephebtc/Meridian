/**
 * MERIDIAN — Manifesto
 * Plotter D2 plates · Dual layout chrome (padrão Gann / História)
 */
import { PAPER_SHADER } from './tokens';
import { mountPaperGrain } from './paper-grain';
import { markPageReady } from './page-enter';

type LayoutMode = 'masthead' | 'rail';

const NAV = [
  { id: 'preambulo', label: 'Preâmbulo' },
  { id: 'referencia', label: 'Referência' },
  { id: 'tinta', label: 'Tinta' },
  { id: 'silencio', label: 'Silêncio' },
  { id: 'papel', label: 'Papel' },
  { id: 'rigor', label: 'Rigor' },
  { id: 'util', label: 'Utilidade' },
  { id: 'juramento', label: 'Juramento' },
] as const;

type ChromaId =
  | 'terracotta'
  | 'blush'
  | 'butter'
  | 'mist'
  | 'aqua'
  | 'lilac'
  | 'ivory'
  | 'obsidian';

function cssVar(name: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function badge(label: string): string {
  return `<div class="gann-plot-badge">${label}</div>`;
}

function renderEixo(host: HTMLElement, compact = false): void {
  const W = compact ? 320 : 560;
  const H = compact ? 320 : 300;
  const cx = W / 2;
  const cy = H / 2;
  host.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" data-plotter="true" fill="none"
      aria-label="Eixo vertical atravessando o campo">
      <rect x="${compact ? 16 : 24}" y="${compact ? 16 : 24}" width="${W - (compact ? 32 : 48)}" height="${H - (compact ? 32 : 48)}" data-plotter-role="guide" rx="0"/>
      <line class="gann-plot-draw" x1="${cx}" y1="${compact ? 36 : 48}" x2="${cx}" y2="${H - (compact ? 36 : 48)}" data-plotter-role="primary"/>
      <circle cx="${cx}" cy="${cy}" r="4" fill="currentColor" stroke="none" data-plotter-role="primary"/>
      ${compact ? '' : `<text x="40" y="48" stroke="none" fill="currentColor" fill-opacity="0.7" font-size="12"
        font-family="Geist Serif, Georgia, serif" data-plotter-role="leader">Eixo · meridiano do sistema</text>`}
    </svg>
    ${badge(compact ? 'eixo' : 'plotter D2 · eixo')}`;
}

function renderReferencia(host: HTMLElement): void {
  const W = 560;
  const H = 340;
  const cx = W / 2;
  const cy = H / 2 + 6;
  const r = 110;
  host.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" data-plotter="true" fill="none"
      aria-label="Globo com meridiano central">
      <rect x="24" y="24" width="${W - 48}" height="${H - 48}" data-plotter-role="guide" rx="0"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" data-plotter-role="secondary" fill="none"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${r * 0.4}" ry="${r}" data-plotter-role="transfer" fill="none"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${r * 0.75}" ry="${r}" data-plotter-role="guide" fill="none"/>
      <line class="gann-plot-draw" x1="${cx}" y1="${cy - r}" x2="${cx}" y2="${cy + r}" data-plotter-role="primary"/>
      <line class="gann-plot-draw" style="animation-delay:120ms" x1="${cx - r}" y1="${cy}" x2="${cx + r}" y2="${cy}" data-plotter-role="centerline"/>
      <text x="40" y="48" stroke="none" fill="currentColor" fill-opacity="0.7" font-size="12"
        font-family="Geist Serif, Georgia, serif" data-plotter-role="leader">Referência · estável sob mudança</text>
    </svg>
    ${badge('plotter D2 · referência')}`;
}

function renderTinta(host: HTMLElement): void {
  const W = 560;
  const H = 300;
  const ox = 100;
  const oy = H / 2;
  const nodes = [
    { x: 220, y: oy - 70, label: 'fg' },
    { x: 220, y: oy + 70, label: 'muted' },
    { x: 360, y: oy - 40, label: 'rule' },
    { x: 360, y: oy + 40, label: 'tint' },
    { x: 480, y: oy, label: 'mix' },
  ];
  const lines = nodes
    .map(
      (n, i) => `
      <line class="gann-plot-draw" style="animation-delay:${i * 70}ms"
        x1="${ox}" y1="${oy}" x2="${n.x}" y2="${n.y}" data-plotter-role="secondary"/>`,
    )
    .join('');
  const dots = nodes
    .map(
      (n, i) => `
      <circle class="gann-plot-draw" style="animation-delay:${200 + i * 50}ms"
        cx="${n.x}" cy="${n.y}" r="5" fill="currentColor" stroke="none" data-plotter-role="primary"/>
      <text x="${n.x}" y="${n.y + 22}" text-anchor="middle" stroke="none" fill="currentColor" fill-opacity="0.5"
        font-size="10" font-family="Geist Mono, ui-monospace, monospace" data-plotter-role="leader">${n.label}</text>`,
    )
    .join('');

  host.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" data-plotter="true" fill="none"
      aria-label="Origem Single-Ink e derivadas">
      <rect x="24" y="24" width="${W - 48}" height="${H - 48}" data-plotter-role="guide" rx="0"/>
      ${lines}
      <circle cx="${ox}" cy="${oy}" r="10" fill="currentColor" stroke="none" data-plotter-role="primary"/>
      <text x="${ox}" y="${oy + 32}" text-anchor="middle" stroke="none" fill="currentColor" fill-opacity="0.65"
        font-size="10" font-family="Geist Mono, ui-monospace, monospace" data-plotter-role="leader">ink</text>
      ${dots}
      <text x="40" y="48" stroke="none" fill="currentColor" fill-opacity="0.7" font-size="12"
        font-family="Geist Serif, Georgia, serif" data-plotter-role="leader">Single-Ink · origem → derivadas</text>
    </svg>
    ${badge('plotter D2 · tinta')}`;
}

function renderSilencio(host: HTMLElement): void {
  const W = 560;
  const H = 280;
  host.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" data-plotter="true" fill="none"
      aria-label="Campo limpo com um único ponto">
      <rect x="24" y="24" width="${W - 48}" height="${H - 48}" data-plotter-role="guide" rx="0"/>
      <line x1="48" y1="56" x2="48" y2="${H - 48}" data-plotter-role="guide"/>
      <line x1="48" y1="${H - 48}" x2="${W - 48}" y2="${H - 48}" data-plotter-role="guide"/>
      <circle class="gann-plot-draw" cx="${W / 2}" cy="${H / 2}" r="6" fill="currentColor" stroke="none" data-plotter-role="primary"/>
      <text x="40" y="48" stroke="none" fill="currentColor" fill-opacity="0.7" font-size="12"
        font-family="Geist Serif, Georgia, serif" data-plotter-role="leader">Silêncio · um sinal basta</text>
    </svg>
    ${badge('plotter D2 · silêncio')}`;
}

function renderPapel(host: HTMLElement): void {
  const W = 560;
  const H = 320;
  const cols = [120, 200, 280, 360, 440]
    .map((x, i) => `<line class="gann-plot-draw" style="animation-delay:${i * 50}ms" x1="${x}" y1="64" x2="${x}" y2="268" data-plotter-role="guide"/>`)
    .join('');
  const rows = [100, 140, 180, 220]
    .map((y, i) => `<line class="gann-plot-draw" style="animation-delay:${150 + i * 50}ms" x1="80" y1="${y}" x2="480" y2="${y}" data-plotter-role="guide"/>`)
    .join('');

  host.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" data-plotter="true" fill="none"
      aria-label="Folha com grade e margem">
      <rect x="24" y="24" width="${W - 48}" height="${H - 48}" data-plotter-role="guide" rx="0"/>
      <rect class="gann-plot-draw" x="80" y="64" width="400" height="204" data-plotter-role="secondary"/>
      ${cols}
      ${rows}
      <line class="gann-plot-draw" style="animation-delay:400ms" x1="80" y1="64" x2="200" y2="64" data-plotter-role="primary"/>
      <text x="40" y="48" stroke="none" fill="currentColor" fill-opacity="0.7" font-size="12"
        font-family="Geist Serif, Georgia, serif" data-plotter-role="leader">Papel · grade · stroke 1u</text>
    </svg>
    ${badge('plotter D2 · papel')}`;
}

function renderRigor(host: HTMLElement): void {
  const W = 560;
  const H = 300;
  const boxes = [
    { x: 72, label: 'Web' },
    { x: 232, label: 'RN' },
    { x: 392, label: 'SVG' },
  ];
  const rects = boxes
    .map(
      (b, i) => `
      <rect class="gann-plot-draw" style="animation-delay:${i * 90}ms"
        x="${b.x}" y="100" width="96" height="120" data-plotter-role="secondary"/>
      <text x="${b.x + 48}" y="240" text-anchor="middle" stroke="none" fill="currentColor" fill-opacity="0.55"
        font-size="11" font-family="Geist Mono, ui-monospace, monospace" data-plotter-role="leader">${b.label}</text>`,
    )
    .join('');

  host.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" data-plotter="true" fill="none"
      aria-label="Três plataformas sob o mesmo traço">
      <rect x="24" y="24" width="${W - 48}" height="${H - 48}" data-plotter-role="guide" rx="0"/>
      <line class="gann-plot-draw" x1="72" y1="80" x2="488" y2="80" data-plotter-role="primary"/>
      ${rects}
      <text x="40" y="48" stroke="none" fill="currentColor" fill-opacity="0.7" font-size="12"
        font-family="Geist Serif, Georgia, serif" data-plotter-role="leader">Rigor · uma gramática, três alvos</text>
    </svg>
    ${badge('plotter D2 · rigor')}`;
}

function renderUtil(host: HTMLElement, compact = false): void {
  const W = compact ? 320 : 560;
  const H = compact ? 240 : 280;
  const pad = compact ? 28 : 72;
  host.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" data-plotter="true" fill="none"
      aria-label="Placa com a pergunta do farol">
      <rect x="${compact ? 16 : 24}" y="${compact ? 16 : 24}" width="${W - (compact ? 32 : 48)}" height="${H - (compact ? 32 : 48)}" data-plotter-role="guide" rx="0"/>
      <rect class="gann-plot-draw" x="${pad}" y="${compact ? 48 : 64}" width="${W - pad * 2}" height="${H - (compact ? 96 : 128)}" data-plotter-role="primary"/>
      <text x="${W / 2}" y="${H / 2 - (compact ? 4 : 6)}" text-anchor="middle" stroke="none" fill="currentColor" fill-opacity="0.85"
        font-size="${compact ? 12 : 15}" font-family="Geist Serif, Georgia, serif" data-plotter-role="leader">
        ${compact ? 'Útil à rota?' : '“Isso ajuda os navegadores'}
      </text>
      ${
        compact
          ? ''
          : `<text x="${W / 2}" y="${H / 2 + 18}" text-anchor="middle" stroke="none" fill="currentColor" fill-opacity="0.85"
        font-size="15" font-family="Geist Serif, Georgia, serif" data-plotter-role="leader">
        a encontrar seu caminho?”
      </text>`
      }
    </svg>
    ${badge(compact ? 'critério' : 'plotter D2 · placa')}`;
}

function renderJuramento(host: HTMLElement): void {
  const W = 560;
  const H = 280;
  const y = H / 2;
  const pts = [90, 180, 270, 360, 450];
  const circles = pts
    .map(
      (x, i) => `
      <circle class="gann-plot-draw" style="animation-delay:${i * 80}ms"
        cx="${x}" cy="${y}" r="5" fill="currentColor" stroke="none" data-plotter-role="primary"/>`,
    )
    .join('');

  host.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" data-plotter="true" fill="none"
      aria-label="Cadeia de compromissos">
      <rect x="24" y="24" width="${W - 48}" height="${H - 48}" data-plotter-role="guide" rx="0"/>
      <line class="gann-plot-draw" x1="${pts[0]}" y1="${y}" x2="${pts[pts.length - 1]}" y2="${y}" data-plotter-role="primary"/>
      ${circles}
      <text x="40" y="48" stroke="none" fill="currentColor" fill-opacity="0.7" font-size="12"
        font-family="Geist Serif, Georgia, serif" data-plotter-role="leader">Juramento · repetir até ser linha</text>
    </svg>
    ${badge('plotter D2 · juramento')}`;
}

function setLayout(mode: LayoutMode): void {
  document.documentElement.dataset.layout = mode;
  localStorage.setItem('meridian-manifesto-layout', mode);
  document.querySelectorAll<HTMLButtonElement>('[data-layout-pick]').forEach((btn) => {
    btn.dataset.active = btn.dataset.layoutPick === mode ? 'true' : 'false';
  });
  if (mode === 'masthead') setRail(false);
}

function setRail(open: boolean): void {
  const rail = document.getElementById('gann-rail');
  const backdrop = document.getElementById('gann-rail-backdrop');
  const burger = document.getElementById('gann-burger');
  if (!rail || !backdrop || !burger) return;
  rail.dataset.open = open ? 'true' : 'false';
  backdrop.dataset.open = open ? 'true' : 'false';
  burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  document.body.style.overflow = open ? 'hidden' : '';
}

function syncCurrentNav(): void {
  const sections = NAV.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
  const y = window.scrollY + 96;
  let current: (typeof NAV)[number]['id'] = NAV[0].id;
  for (const sec of sections) {
    const match = NAV.find((n) => n.id === sec.id);
    if (match && sec.offsetTop <= y) current = match.id;
  }
  document.querySelectorAll<HTMLAnchorElement>('[data-nav]').forEach((a) => {
    if (a.getAttribute('href') === `#${current}`) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
}

function setChroma(id: ChromaId): void {
  document.documentElement.dataset.surface = id;
  localStorage.setItem('meridian-manifesto-chroma', id);
  document.querySelectorAll<HTMLButtonElement>('[data-chroma]').forEach((btn) => {
    btn.setAttribute('aria-pressed', btn.dataset.chroma === id ? 'true' : 'false');
  });
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', cssVar('--ds-bg', '#141413'));
}

function mountPlots(): void {
  const map: Record<string, (el: HTMLElement) => void> = {
    'plot-eixo': (el) => renderEixo(el, false),
    'plot-referencia': renderReferencia,
    'plot-tinta': renderTinta,
    'plot-silencio': renderSilencio,
    'plot-papel': renderPapel,
    'plot-rigor': renderRigor,
    'plot-util': (el) => renderUtil(el, false),
    'plot-juramento': renderJuramento,
    'aside-eixo': (el) => renderEixo(el, true),
    'aside-placa': (el) => renderUtil(el, true),
  };
  for (const [id, fn] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (el) fn(el);
  }
}

function init(): void {
  mountPaperGrain({
    seed: 20241121,
    speckleStrength: PAPER_SHADER.defaultSpeckle * 0.9,
    fiberDensity: PAPER_SHADER.defaultFiber,
    size: PAPER_SHADER.defaultSize,
  });

  const saved = (localStorage.getItem('meridian-manifesto-layout') as LayoutMode | null) ?? 'masthead';
  setLayout(saved === 'rail' ? 'rail' : 'masthead');

  const savedChroma = (localStorage.getItem('meridian-manifesto-chroma') as ChromaId | null) ?? 'obsidian';
  document.documentElement.dataset.surface = savedChroma;
  document.querySelectorAll<HTMLButtonElement>('[data-chroma]').forEach((btn) => {
    btn.setAttribute('aria-pressed', btn.dataset.chroma === savedChroma ? 'true' : 'false');
    btn.addEventListener('click', () => setChroma(btn.dataset.chroma as ChromaId));
  });

  document.querySelectorAll<HTMLButtonElement>('[data-layout-pick]').forEach((btn) => {
    btn.addEventListener('click', () => setLayout(btn.dataset.layoutPick as LayoutMode));
  });

  document.getElementById('gann-burger')?.addEventListener('click', () => {
    const rail = document.getElementById('gann-rail');
    setRail(rail?.dataset.open !== 'true');
  });
  document.getElementById('gann-rail-close')?.addEventListener('click', () => setRail(false));
  document.getElementById('gann-rail-backdrop')?.addEventListener('click', () => setRail(false));

  document.querySelectorAll<HTMLAnchorElement>('[data-nav]').forEach((a) => {
    a.addEventListener('click', () => setRail(false));
  });

  window.addEventListener('scroll', syncCurrentNav, { passive: true });
  syncCurrentNav();
  mountPlots();
  markPageReady();
}

init();
