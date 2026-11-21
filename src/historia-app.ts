/**
 * MERIDIAN — O Farol e o Meridiano
 * Plotter D2 · stroke-draw + ambient loops · dual chrome
 */
import { PAPER_SHADER } from './tokens';
import { mountPaperGrain } from './paper-grain';
import { markPageReady } from './page-enter';
import { initI18n } from './i18n';
import './i18n.css';

type LayoutMode = 'masthead' | 'rail';

const NAV = [
  { id: 'oceano', label: 'Oceano' },
  { id: 'desvio', label: 'Desvio' },
  { id: 'meridianos', label: 'Meridianos' },
  { id: 'farol', label: 'Farol' },
  { id: 'placa', label: 'Placa' },
  { id: 'identidade', label: 'Identidade' },
  { id: 'marca', label: 'Marca' },
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

/** Prepara stroke-draw com comprimento real do path */
function armStrokeDraw(root: HTMLElement): void {
  const svg = root.querySelector('svg');
  if (!svg) return;
  const draws = svg.querySelectorAll<SVGGeometryElement>('.ht-draw');
  draws.forEach((el, i) => {
    let len = 600;
    try {
      len = Math.max(1, el.getTotalLength());
    } catch {
      /* text/fill-only */
    }
    el.style.setProperty('--ht-len', `${Math.ceil(len + 8)}`);
    el.style.setProperty('--ht-delay', `${i * 70}ms`);
    el.style.setProperty('--ht-dur', `${1.55 + Math.min(i, 8) * 0.05}s`);
  });
  root.dataset.htLive = 'true';
}

function observePlots(hosts: HTMLElement[]): void {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    hosts.forEach((h) => {
      h.dataset.htInview = 'true';
    });
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          // Retrigger: remove → reflow → set
          el.dataset.htInview = 'false';
          void el.offsetWidth;
          el.dataset.htInview = 'true';
          io.unobserve(el);
        }
      }
    },
    { threshold: 0.28, rootMargin: '0px 0px -8% 0px' },
  );

  hosts.forEach((h) => {
    h.dataset.htInview = 'false';
    io.observe(h);
  });
}

function renderHorizonte(host: HTMLElement): void {
  const W = 560;
  const H = 300;
  const y = H * 0.52;
  host.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" data-plotter="true" fill="none"
      aria-label="Horizonte: céu e mar indistintos">
      <rect x="24" y="24" width="${W - 48}" height="${H - 48}" data-plotter-role="guide" rx="0"/>
      <line class="ht-draw" x1="48" y1="${y}" x2="${W - 48}" y2="${y}" data-plotter-role="primary"/>
      <line class="ht-draw ht-wave ht-ambient" style="--ht-delay:0.9s" x1="48" y1="${y + 18}" x2="${W - 48}" y2="${y + 18}" data-plotter-role="guide"/>
      <line class="ht-draw ht-wave ht-ambient" style="--ht-delay:1.3s" x1="48" y1="${y + 36}" x2="${W - 48}" y2="${y + 36}" data-plotter-role="guide"/>
      <circle class="ht-draw ht-sun ht-ambient" style="--ht-delay:1s" cx="${W * 0.72}" cy="${y - 52}" r="18" data-plotter-role="secondary"/>
      <g class="ht-fade" style="--ht-delay:1.4s;--ht-opacity:0.7">
        <text x="40" y="48" stroke="none" fill="currentColor" font-size="12"
          font-family="Geist Serif, Georgia, serif" data-plotter-role="leader">Horizonte · sem referência</text>
      </g>
    </svg>
    ${badge('plotter D2 · stroke 1u')}`;
}

function renderDesvio(host: HTMLElement): void {
  const W = 560;
  const H = 340;
  const cx = 120;
  const cy = H - 56;
  const intended = { x: W - 72, y: 72 };
  const drifted = { x: W - 96, y: 168 };
  const ticks = [0, 30, 60, 90, 120, 150, 180]
    .map((deg, i) => {
      const r = ((deg - 90) * Math.PI) / 180;
      const x2 = cx + Math.cos(r) * 56;
      const y2 = cy + Math.sin(r) * 56;
      return `<line class="ht-draw" style="--ht-delay:${i * 40}ms" x1="${cx}" y1="${cy}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" data-plotter-role="guide"/>`;
    })
    .join('');

  host.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" data-plotter="true" fill="none"
      aria-label="Rosa dos ventos com desvio de rota">
      <rect x="24" y="24" width="${W - 48}" height="${H - 48}" data-plotter-role="guide" rx="0"/>
      <g class="ht-compass ht-ambient" style="--ht-delay:1.2s;transform-origin:${cx}px ${cy}px;transform-box:view-box">
        <circle class="ht-draw" cx="${cx}" cy="${cy}" r="58" data-plotter-role="secondary" fill="none"/>
        ${ticks}
      </g>
      <line class="ht-draw" x1="${cx}" y1="${cy}" x2="${intended.x}" y2="${intended.y}" data-plotter-role="proposed"/>
      <line class="ht-draw ht-route-drift ht-ambient" style="--ht-delay:1.8s;transform-origin:${cx}px ${cy}px;transform-box:view-box"
        x1="${cx}" y1="${cy}" x2="${drifted.x}" y2="${drifted.y}" data-plotter-role="primary"/>
      <circle class="ht-fade ht-pulse ht-ambient" style="--ht-delay:1.5s;--ht-opacity:1" cx="${cx}" cy="${cy}" r="4"
        fill="currentColor" stroke="none" data-plotter-role="primary"/>
      <g class="ht-fade" style="--ht-delay:1.6s;--ht-opacity:0.55">
        <text x="${intended.x - 8}" y="${intended.y - 8}" stroke="none" fill="currentColor" font-size="10"
          font-family="Geist Mono, ui-monospace, monospace" data-plotter-role="leader">rota</text>
        <text x="${drifted.x - 4}" y="${drifted.y + 16}" stroke="none" fill="currentColor" font-size="10"
          font-family="Geist Mono, ui-monospace, monospace" data-plotter-role="leader">+alguns °</text>
        <text x="40" y="48" stroke="none" fill="currentColor" fill-opacity="0.7" font-size="12"
          font-family="Geist Serif, Georgia, serif" data-plotter-role="leader">Desvio · graus acumulados</text>
      </g>
    </svg>
    ${badge('plotter D2 · graus')}`;
}

function renderMeridianos(host: HTMLElement): void {
  const W = 560;
  const H = 360;
  const cx = W / 2;
  const cy = H / 2 + 8;
  const r = 118;
  const meridians = [-60, -30, 0, 30, 60]
    .map((lon, i) => {
      const k = Math.sin((lon * Math.PI) / 180);
      const rx = Math.abs(k) * r * 0.92 + 8;
      const role = lon === 0 ? 'primary' : 'transfer';
      const flow = lon === 0 ? '' : 'ht-dash-flow ht-ambient';
      return `<ellipse class="ht-draw ${flow}" style="--ht-delay:${i * 80}ms"
        cx="${cx}" cy="${cy}" rx="${rx.toFixed(1)}" ry="${r}"
        data-plotter-role="${role}" fill="none"/>`;
    })
    .join('');
  const parallels = [-45, 0, 45]
    .map((lat, i) => {
      const y = cy - Math.sin((lat * Math.PI) / 180) * r;
      const half = Math.cos((lat * Math.PI) / 180) * r;
      return `<line class="ht-draw" style="--ht-delay:${400 + i * 60}ms"
        x1="${cx - half}" y1="${y}" x2="${cx + half}" y2="${y}" data-plotter-role="guide"/>`;
    })
    .join('');

  host.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" data-plotter="true" fill="none"
      aria-label="Globo com meridianos">
      <rect x="24" y="24" width="${W - 48}" height="${H - 48}" data-plotter-role="guide" rx="0"/>
      <g class="ht-spin ht-ambient" style="--ht-delay:1.2s;transform-origin:${cx}px ${cy}px;transform-box:view-box">
        <circle class="ht-draw" cx="${cx}" cy="${cy}" r="${r}" data-plotter-role="secondary" fill="none"/>
        ${meridians}
        ${parallels}
      </g>
      <line class="ht-draw" style="--ht-delay:700ms" x1="${cx}" y1="${cy - r}" x2="${cx}" y2="${cy + r}" data-plotter-role="primary"/>
      <circle class="ht-fade ht-pulse ht-ambient" style="--ht-delay:1.6s;--ht-opacity:1" cx="${cx}" cy="${cy}" r="3"
        fill="currentColor" stroke="none" data-plotter-role="primary"/>
      <g class="ht-fade" style="--ht-delay:1.5s;--ht-opacity:0.7">
        <text x="40" y="48" stroke="none" fill="currentColor" font-size="12"
          font-family="Geist Serif, Georgia, serif" data-plotter-role="leader">Meridianos · linhas invisíveis</text>
      </g>
    </svg>
    ${badge('plotter D2 · ortográfico')}`;
}

function renderFarol(host: HTMLElement, compact = false): void {
  const W = compact ? 320 : 560;
  const H = compact ? 320 : 380;
  const baseX = W / 2;
  const ground = H - (compact ? 48 : 56);
  const towerW = compact ? 28 : 36;
  const towerH = compact ? 110 : 150;
  const top = ground - towerH;
  const lampY = top + 14;
  const beamLen = compact ? 100 : 180;

  host.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" data-plotter="true" fill="none"
      aria-label="Elevação de farol com feixe animado">
      <rect x="16" y="16" width="${W - 32}" height="${H - 32}" data-plotter-role="guide" rx="0"/>
      <line class="ht-draw" x1="${compact ? 28 : 48}" y1="${ground}" x2="${W - (compact ? 28 : 48)}" y2="${ground}" data-plotter-role="centerline"/>
      <path class="ht-draw" style="--ht-delay:80ms"
        d="M ${baseX - towerW} ${ground} L ${baseX - towerW * 0.72} ${top + 28} L ${baseX + towerW * 0.72} ${top + 28} L ${baseX + towerW} ${ground} Z"
        data-plotter-role="secondary"/>
      <rect class="ht-draw" style="--ht-delay:160ms"
        x="${baseX - towerW * 0.55}" y="${top}" width="${towerW * 1.1}" height="28" data-plotter-role="primary"/>
      <circle class="ht-fade ht-pulse ht-ambient" style="--ht-delay:1.2s;--ht-opacity:1"
        cx="${baseX}" cy="${lampY}" r="5" fill="currentColor" stroke="none" data-plotter-role="primary"/>
      <g class="ht-beam ht-ambient" style="--ht-ox:${baseX}px;--ht-oy:${lampY}px;--ht-delay:1.4s;transform-origin:${baseX}px ${lampY}px;transform-box:view-box">
        <line class="ht-draw" style="--ht-delay:280ms"
          x1="${baseX + 8}" y1="${lampY}" x2="${baseX + beamLen}" y2="${lampY - 28}" data-plotter-role="primary"/>
      </g>
      <g class="ht-beam-soft ht-ambient" style="--ht-delay:1.7s;transform-origin:${baseX}px ${lampY}px;transform-box:view-box">
        <line class="ht-draw" style="--ht-delay:320ms"
          x1="${baseX + 8}" y1="${lampY}" x2="${baseX + beamLen * 0.92}" y2="${lampY + 36}" data-plotter-role="transfer"/>
      </g>
      ${
        compact
          ? ''
          : `<g class="ht-fade" style="--ht-delay:1.5s;--ht-opacity:0.7">
        <text x="40" y="48" stroke="none" fill="currentColor" font-size="12"
          font-family="Geist Serif, Georgia, serif" data-plotter-role="leader">Farol · elevação</text>
      </g>`
      }
    </svg>
    ${badge(compact ? 'plotter · farol' : 'plotter D2 · elevação')}`;
}

function renderPlaca(host: HTMLElement): void {
  const W = 560;
  const H = 280;
  host.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" data-plotter="true" fill="none"
      aria-label="Placa de metal com a pergunta do farol">
      <rect x="24" y="24" width="${W - 48}" height="${H - 48}" data-plotter-role="guide" rx="0"/>
      <rect class="ht-draw" x="72" y="64" width="${W - 144}" height="${H - 128}" data-plotter-role="secondary"/>
      <rect class="ht-draw" style="--ht-delay:120ms" x="88" y="80" width="${W - 176}" height="${H - 160}" data-plotter-role="primary"/>
      <circle class="ht-fade ht-twinkle ht-ambient" style="--ht-delay:0.2s;--ht-opacity:0.5" cx="100" cy="92" r="3" fill="currentColor" stroke="none" data-plotter-role="guide"/>
      <circle class="ht-fade ht-twinkle ht-ambient" style="--ht-delay:0.8s;--ht-opacity:0.5" cx="${W - 100}" cy="92" r="3" fill="currentColor" stroke="none" data-plotter-role="guide"/>
      <circle class="ht-fade ht-twinkle ht-ambient" style="--ht-delay:1.2s;--ht-opacity:0.5" cx="100" cy="${H - 92}" r="3" fill="currentColor" stroke="none" data-plotter-role="guide"/>
      <circle class="ht-fade ht-twinkle ht-ambient" style="--ht-delay:1.6s;--ht-opacity:0.5" cx="${W - 100}" cy="${H - 92}" r="3" fill="currentColor" stroke="none" data-plotter-role="guide"/>
      <g class="ht-fade" style="--ht-delay:1.1s;--ht-opacity:0.9">
        <text x="${W / 2}" y="${H / 2 - 6}" text-anchor="middle" stroke="none" fill="currentColor"
          font-size="15" font-family="Geist Serif, Georgia, serif" data-plotter-role="leader">
          “Isso ajuda os navegadores
        </text>
        <text x="${W / 2}" y="${H / 2 + 18}" text-anchor="middle" stroke="none" fill="currentColor"
          font-size="15" font-family="Geist Serif, Georgia, serif" data-plotter-role="leader">
          a encontrar seu caminho?”
        </text>
      </g>
    </svg>
    ${badge('plotter D2 · placa')}`;
}

function renderIdentidade(host: HTMLElement): void {
  const W = 560;
  const H = 300;
  const y = H / 2 + 10;
  const pts = [80, 160, 240, 320, 400, 480];
  const circles = pts
    .map(
      (x, i) => `
      <circle class="ht-fade ht-twinkle ht-ambient" style="--ht-delay:${0.9 + i * 0.18}s;--ht-opacity:1"
        cx="${x}" cy="${y}" r="5" fill="currentColor" stroke="none" data-plotter-role="primary"/>`,
    )
    .join('');
  const labels = ['d1', 'd2', 'd3', 'd4', 'd5', 'd∞']
    .map(
      (lab, i) => `
      <text class="ht-fade" style="--ht-delay:${1.2 + i * 0.1}s;--ht-opacity:0.45" x="${pts[i]}" y="${y + 28}" text-anchor="middle"
        stroke="none" fill="currentColor" font-size="10" font-family="Geist Mono, ui-monospace, monospace" data-plotter-role="leader">${lab}</text>`,
    )
    .join('');

  host.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" data-plotter="true" fill="none"
      aria-label="Cadeia de decisões formando uma linha">
      <rect x="24" y="24" width="${W - 48}" height="${H - 48}" data-plotter-role="guide" rx="0"/>
      <line class="ht-draw ht-dash-flow ht-ambient" style="--ht-delay:1.4s" x1="${pts[0]}" y1="${y}" x2="${pts[pts.length - 1]}" y2="${y}" data-plotter-role="primary"/>
      ${circles}
      ${labels}
      <g class="ht-fade" style="--ht-delay:1.3s;--ht-opacity:0.7">
        <text x="40" y="48" stroke="none" fill="currentColor" font-size="12"
          font-family="Geist Serif, Georgia, serif" data-plotter-role="leader">Identidade · decisão + decisão</text>
      </g>
    </svg>
    ${badge('plotter D2 · cadeia')}`;
}

function renderTempestade(host: HTMLElement): void {
  const W = 560;
  const H = 340;
  const rain = Array.from({ length: 22 }, (_, i) => {
    const x = 52 + i * 22;
    const y1 = 44 + (i % 4) * 10;
    return `<line class="ht-draw ht-rain ht-ambient" style="--ht-delay:${(i % 7) * 0.12}s"
      x1="${x}" y1="${y1}" x2="${x - 8}" y2="${y1 + 64}" data-plotter-role="guide"/>`;
  }).join('');
  const lx = 180;
  const lampY = 140;

  host.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" data-plotter="true" fill="none"
      aria-label="Farol atravessando tempestade">
      <rect x="24" y="24" width="${W - 48}" height="${H - 48}" data-plotter-role="guide" rx="0"/>
      ${rain}
      <line class="ht-draw" style="--ht-delay:400ms" x1="48" y1="260" x2="${W - 48}" y2="260" data-plotter-role="centerline"/>
      <path class="ht-draw" style="--ht-delay:480ms"
        d="M ${lx - 18} 260 L ${lx - 12} 150 L ${lx + 12} 150 L ${lx + 18} 260 Z" data-plotter-role="secondary"/>
      <rect class="ht-draw" style="--ht-delay:540ms" x="${lx - 14}" y="128" width="28" height="24" data-plotter-role="primary"/>
      <circle class="ht-fade ht-pulse ht-ambient" style="--ht-delay:1.3s;--ht-opacity:1"
        cx="${lx}" cy="${lampY}" r="4" fill="currentColor" stroke="none" data-plotter-role="primary"/>
      <g class="ht-beam ht-ambient" style="--ht-delay:1.5s;transform-origin:${lx}px ${lampY}px;transform-box:view-box">
        <line class="ht-draw" style="--ht-delay:600ms"
          x1="${lx + 14}" y1="${lampY}" x2="480" y2="100" data-plotter-role="primary"/>
      </g>
      <g class="ht-fade" style="--ht-delay:1.5s;--ht-opacity:0.7">
        <text x="40" y="48" stroke="none" fill="currentColor" font-size="12"
          font-family="Geist Serif, Georgia, serif" data-plotter-role="leader">Tempestade · permanece alinhado</text>
      </g>
    </svg>
    ${badge('plotter D2 · coerência')}`;
}

function renderMeridianoAside(host: HTMLElement): void {
  const W = 320;
  const H = 240;
  const cx = W / 2;
  const cy = H / 2;
  const r = 78;
  host.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" data-plotter="true" fill="none"
      aria-label="Meridiano central">
      <g class="ht-spin ht-ambient" style="--ht-delay:0.6s;transform-origin:${cx}px ${cy}px;transform-box:view-box">
        <circle class="ht-draw" cx="${cx}" cy="${cy}" r="${r}" data-plotter-role="secondary" fill="none"/>
        <ellipse class="ht-draw ht-dash-flow ht-ambient" style="--ht-delay:1s" cx="${cx}" cy="${cy}" rx="${r * 0.35}" ry="${r}" data-plotter-role="transfer" fill="none"/>
      </g>
      <line class="ht-draw" x1="${cx}" y1="${cy - r}" x2="${cx}" y2="${cy + r}" data-plotter-role="primary"/>
      <circle class="ht-fade ht-pulse ht-ambient" style="--ht-delay:1s;--ht-opacity:1" cx="${cx}" cy="${cy}" r="3" fill="currentColor" stroke="none" data-plotter-role="primary"/>
    </svg>
    ${badge('meridiano')}`;
}

function setLayout(mode: LayoutMode): void {
  document.documentElement.dataset.layout = mode;
  localStorage.setItem('meridian-historia-layout', mode);
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
  localStorage.setItem('meridian-historia-chroma', id);
  document.querySelectorAll<HTMLButtonElement>('[data-chroma]').forEach((btn) => {
    btn.setAttribute('aria-pressed', btn.dataset.chroma === id ? 'true' : 'false');
  });
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', cssVar('--ds-bg', '#FAF9F5'));
}

function mountPlots(): void {
  const map: Record<string, (el: HTMLElement) => void> = {
    'plot-horizonte': renderHorizonte,
    'plot-desvio': renderDesvio,
    'plot-meridianos': renderMeridianos,
    'plot-farol': (el) => renderFarol(el, false),
    'plot-placa': renderPlaca,
    'plot-identidade': renderIdentidade,
    'plot-tempestade': renderTempestade,
    'aside-farol': (el) => renderFarol(el, true),
    'aside-meridiano': renderMeridianoAside,
  };
  const hosts: HTMLElement[] = [];
  for (const [id, fn] of Object.entries(map)) {
    const el = document.getElementById(id);
    if (!el) continue;
    fn(el);
    armStrokeDraw(el);
    hosts.push(el);
  }
  observePlots(hosts);
}

function init(): void {
  initI18n();
  mountPaperGrain({
    seed: 20241120,
    speckleStrength: PAPER_SHADER.defaultSpeckle * 0.85,
    fiberDensity: PAPER_SHADER.defaultFiber,
    size: PAPER_SHADER.defaultSize,
  });

  const saved = (localStorage.getItem('meridian-historia-layout') as LayoutMode | null) ?? 'masthead';
  setLayout(saved === 'rail' ? 'rail' : 'masthead');

  const savedChroma = (localStorage.getItem('meridian-historia-chroma') as ChromaId | null) ?? 'ivory';
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
