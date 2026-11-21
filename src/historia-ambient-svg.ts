/**
 * Ambient animated SVGs behind the home História essay.
 * Birds · constellations · navigator · boats · compass · lighthouse — Single-Ink.
 */
type MotifKind = 'birds' | 'constellation' | 'navigator' | 'boat' | 'compass' | 'lighthouse';

type MotifSpec = {
  kind: MotifKind;
  slot: 'left' | 'right' | 'mid';
  top: string;
  size: number;
  rotate?: number;
};

const MOTIFS: MotifSpec[] = [
  { kind: 'birds', slot: 'left', top: '2%', size: 380, rotate: -4 },
  { kind: 'constellation', slot: 'right', top: '3%', size: 340, rotate: 6 },
  { kind: 'boat', slot: 'mid', top: '18%', size: 400, rotate: -2 },
  { kind: 'navigator', slot: 'right', top: '28%', size: 320, rotate: 3 },
  { kind: 'compass', slot: 'left', top: '36%', size: 300, rotate: -8 },
  { kind: 'birds', slot: 'right', top: '48%', size: 360, rotate: 5 },
  { kind: 'lighthouse', slot: 'mid', top: '55%', size: 280, rotate: 2 },
  { kind: 'constellation', slot: 'left', top: '62%', size: 320, rotate: -5 },
  { kind: 'boat', slot: 'right', top: '72%', size: 380, rotate: 4 },
  { kind: 'navigator', slot: 'left', top: '80%', size: 300, rotate: -3 },
  { kind: 'birds', slot: 'mid', top: '88%', size: 340, rotate: 2 },
];

const SECTION_SEL = '#historia';
const LAYOUT_SEL = '#historia .historia-layout';
const FIELD_ID = 'historia-ambient';
const MAX_MOBILE = 6;

type MotifNode = {
  el: HTMLElement;
  threshold: number;
  revealed: boolean;
};

let nodes: MotifNode[] = [];
let raf = 0;
let listening = false;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isNarrow(): boolean {
  return window.matchMedia('(max-width: 860px)').matches;
}

function sideStyle(slot: MotifSpec['slot']): string {
  if (slot === 'left') return 'left: clamp(-48px, -4vw, 0px);';
  if (slot === 'right') return 'left: auto; right: clamp(-32px, 0vw, 16px);';
  return 'left: clamp(6%, 16%, 28%);';
}

function svgBirds(seed: number): string {
  const birds = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
    const x = 18 + i * 42 + ((seed + i * 17) % 16);
    const y = 36 + ((i * 29 + seed) % 70);
    const delay = (i * 0.28 + (seed % 5) * 0.08).toFixed(2);
    const dur = (4.5 + (i % 4) * 0.7).toFixed(1);
    const scale = (0.85 + (i % 3) * 0.2).toFixed(2);
    return `
      <g class="ha-bird" style="--ha-delay:${delay}s;--ha-dur:${dur}s;--ha-scale:${scale}" transform="translate(${x} ${y})">
        <g class="ha-bird-body" style="--ha-delay:${delay}s">
          <path class="ha-stroke ha-wing" d="M0 0 C-14 -9 -26 -4 -32 6" fill="none"/>
          <path class="ha-stroke ha-wing ha-wing-r" d="M0 0 C14 -9 26 -4 32 6" fill="none"/>
          <circle class="ha-stroke" cx="0" cy="0" r="1.6" fill="currentColor"/>
        </g>
      </g>`;
  }).join('');
  return `<svg class="ha-svg ha-birds" viewBox="0 0 360 140" fill="none" aria-hidden="true">${birds}</svg>`;
}

function svgConstellation(seed: number): string {
  const pts = [
    [40, 120], [90, 48], [150, 70], [200, 32], [250, 88], [210, 150], [120, 140], [70, 90], [180, 100],
  ].map(([x, y], i) => {
    const jx = ((seed * (i + 3)) % 13) - 6;
    const jy = ((seed * (i + 7)) % 11) - 5;
    return [x + jx, y + jy] as const;
  });
  const links = [
    [0, 1], [1, 2], [2, 3], [2, 4], [4, 5], [5, 6], [6, 0], [1, 7], [7, 0], [2, 8], [8, 5], [3, 8],
  ];
  const lines = links
    .map(([a, b], i) => {
      const [x1, y1] = pts[a];
      const [x2, y2] = pts[b];
      return `<line class="ha-stroke ha-star-line" style="--ha-delay:${(0.15 + i * 0.1).toFixed(2)}s" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    })
    .join('');
  const stars = pts
    .map(([x, y], i) => {
      const r = i % 3 === 0 ? 3.2 : i % 2 === 0 ? 2.4 : 1.8;
      return `<circle class="ha-star" style="--ha-delay:${(0.3 + i * 0.16).toFixed(2)}s" cx="${x}" cy="${y}" r="${r}"/>`;
    })
    .join('');
  return `<svg class="ha-svg ha-constellation ha-constellation-spin" viewBox="0 0 280 180" fill="none" aria-hidden="true">
    <g class="ha-constellation-drift">${lines}${stars}</g>
  </svg>`;
}

function svgNavigator(): string {
  return `<svg class="ha-svg ha-navigator" viewBox="0 0 200 220" fill="none" aria-hidden="true">
    <g class="ha-nav-sway">
      <circle class="ha-stroke ha-draw" style="--ha-delay:0.05s" cx="96" cy="40" r="20"/>
      <path class="ha-stroke ha-draw" style="--ha-delay:0.2s" d="M96 60 L96 118"/>
      <path class="ha-stroke ha-draw" style="--ha-delay:0.35s" d="M96 78 L58 112"/>
      <path class="ha-stroke ha-draw" style="--ha-delay:0.45s" d="M96 78 L148 100"/>
      <path class="ha-stroke ha-draw" style="--ha-delay:0.6s" d="M96 118 L70 188"/>
      <path class="ha-stroke ha-draw" style="--ha-delay:0.7s" d="M96 118 L128 188"/>
      <g class="ha-sextant-scan">
        <path class="ha-stroke ha-draw ha-sextant" style="--ha-delay:0.85s" d="M132 86 L172 52 L166 98 Z"/>
        <path class="ha-stroke ha-draw" style="--ha-delay:1s" d="M148 100 L168 74"/>
        <line class="ha-stroke ha-sight" x1="172" y1="52" x2="196" y2="28"/>
      </g>
    </g>
    <line class="ha-stroke ha-horizon" x1="20" y1="196" x2="180" y2="196"/>
    <circle class="ha-star" style="--ha-delay:1.2s" cx="36" cy="30" r="2"/>
    <circle class="ha-star" style="--ha-delay:1.4s" cx="176" cy="44" r="1.6"/>
    <circle class="ha-star" style="--ha-delay:1.55s" cx="48" cy="56" r="1.3"/>
  </svg>`;
}

function svgBoat(seed: number): string {
  const waveY = 128;
  return `<svg class="ha-svg ha-boat" viewBox="0 0 280 180" fill="none" aria-hidden="true">
    <g class="ha-boat-sail" style="--ha-delay:${(seed % 4) * 0.15}s">
      <g class="ha-boat-bob">
        <path class="ha-stroke ha-draw" style="--ha-delay:0.1s" d="M40 108 L230 108 L200 138 L70 138 Z"/>
        <path class="ha-stroke ha-draw" style="--ha-delay:0.28s" d="M132 108 L132 32"/>
        <path class="ha-stroke ha-draw ha-sail" style="--ha-delay:0.42s" d="M132 34 L198 104 L132 104 Z"/>
        <path class="ha-stroke ha-draw ha-sail" style="--ha-delay:0.55s" d="M132 48 L78 104 L132 104"/>
        <path class="ha-stroke ha-draw" style="--ha-delay:0.68s" d="M132 32 L148 24"/>
      </g>
    </g>
    <path class="ha-stroke ha-wave" style="--ha-delay:0.2s" d="M8 ${waveY} Q36 ${waveY - 12} 64 ${waveY} T120 ${waveY} T176 ${waveY} T232 ${waveY} T272 ${waveY}"/>
    <path class="ha-stroke ha-wave ha-wave-b" style="--ha-delay:0.8s" d="M12 ${waveY + 18} Q48 ${waveY + 6} 84 ${waveY + 18} T156 ${waveY + 18} T228 ${waveY + 18} T272 ${waveY + 18}"/>
    <path class="ha-stroke ha-wave ha-wave-c" style="--ha-delay:1.4s" d="M20 ${waveY + 34} Q56 ${waveY + 24} 92 ${waveY + 34} T164 ${waveY + 34} T236 ${waveY + 34}"/>
  </svg>`;
}

function svgCompass(): string {
  return `<svg class="ha-svg ha-compass" viewBox="0 0 200 200" fill="none" aria-hidden="true">
    <circle class="ha-stroke ha-draw" style="--ha-delay:0.1s" cx="100" cy="100" r="78"/>
    <circle class="ha-stroke ha-draw" style="--ha-delay:0.25s" cx="100" cy="100" r="62"/>
    <g class="ha-compass-spin">
      <path class="ha-stroke ha-draw" style="--ha-delay:0.4s" d="M100 28 L108 100 L100 172 L92 100 Z"/>
      <path class="ha-stroke ha-draw" style="--ha-delay:0.55s" d="M28 100 L100 92 L172 100 L100 108 Z"/>
      <circle class="ha-stroke" cx="100" cy="100" r="5" fill="currentColor"/>
    </g>
    <text class="ha-compass-label" x="100" y="22" text-anchor="middle">N</text>
    <text class="ha-compass-label" x="100" y="192" text-anchor="middle">S</text>
    <text class="ha-compass-label" x="14" y="106" text-anchor="middle">W</text>
    <text class="ha-compass-label" x="186" y="106" text-anchor="middle">E</text>
  </svg>`;
}

function svgLighthouse(): string {
  return `<svg class="ha-svg ha-lighthouse" viewBox="0 0 180 240" fill="none" aria-hidden="true">
    <line class="ha-stroke ha-horizon" x1="8" y1="200" x2="172" y2="200"/>
    <path class="ha-stroke ha-draw" style="--ha-delay:0.15s" d="M58 200 L68 88 L112 88 L122 200 Z"/>
    <rect class="ha-stroke ha-draw" style="--ha-delay:0.3s" x="64" y="68" width="52" height="22"/>
    <path class="ha-stroke ha-draw" style="--ha-delay:0.45s" d="M70 68 L90 42 L110 68 Z"/>
    <g class="ha-beacon">
      <line class="ha-stroke ha-beam" x1="90" y1="56" x2="8" y2="28"/>
      <line class="ha-stroke ha-beam" x1="90" y1="56" x2="172" y2="36"/>
      <line class="ha-stroke ha-beam ha-beam-mid" x1="90" y1="56" x2="20" y2="70"/>
      <circle class="ha-star" style="--ha-delay:0.6s" cx="90" cy="56" r="3.5"/>
    </g>
    <path class="ha-stroke ha-wave" d="M10 214 Q40 206 70 214 T130 214 T170 214"/>
  </svg>`;
}

function renderMotif(kind: MotifKind, seed: number): string {
  if (kind === 'birds') return svgBirds(seed);
  if (kind === 'constellation') return svgConstellation(seed);
  if (kind === 'navigator') return svgNavigator();
  if (kind === 'compass') return svgCompass();
  if (kind === 'lighthouse') return svgLighthouse();
  return svgBoat(seed);
}

function ensureField(): HTMLElement | null {
  const layout = document.querySelector<HTMLElement>(LAYOUT_SEL);
  const section = document.querySelector<HTMLElement>(SECTION_SEL);
  const host = layout ?? section;
  if (!host) return null;

  let field = document.getElementById(FIELD_ID);
  if (field) {
    if (field.parentElement !== host) host.prepend(field);
    return field;
  }
  field = document.createElement('div');
  field.id = FIELD_ID;
  field.className = 'historia-ambient';
  field.setAttribute('aria-hidden', 'true');
  host.prepend(field);
  return field;
}

function sectionProgress(section: HTMLElement): number {
  const rect = section.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  const total = rect.height + vh;
  const traveled = vh - rect.top;
  return Math.min(1, Math.max(0, traveled / total));
}

function syncReveal(): void {
  raf = 0;
  const section = document.querySelector<HTMLElement>(SECTION_SEL);
  if (!section || !nodes.length) return;
  const p = sectionProgress(section);
  for (const node of nodes) {
    const on = p >= node.threshold;
    if (on !== node.revealed) {
      node.revealed = on;
      node.el.dataset.visible = on ? 'true' : 'false';
    }
  }
}

function onScroll(): void {
  if (raf) return;
  raf = requestAnimationFrame(syncReveal);
}

function build(): void {
  const section = document.querySelector<HTMLElement>(SECTION_SEL);
  if (!section) return;

  nodes = [];
  const field = ensureField();
  if (!field) return;
  field.replaceChildren();

  const pool = shuffle(MOTIFS);
  const count = isNarrow() ? Math.min(MAX_MOBILE, pool.length) : pool.length;
  const chosen = pool.slice(0, count);

  const thresholds = shuffle(
    chosen.map((_, i) => 0.04 + (i / Math.max(1, chosen.length - 1)) * 0.78 + (Math.random() * 0.04 - 0.02)),
  ).map((t) => Math.min(0.88, Math.max(0.03, t)));

  chosen.forEach((spec, i) => {
    const plate = document.createElement('div');
    plate.className = `historia-ambient-motif historia-ambient-motif--${spec.kind}`;
    plate.dataset.slot = spec.slot;
    plate.dataset.kind = spec.kind;
    plate.dataset.visible = 'false';
    const jitterX = (Math.random() * 20 - 10).toFixed(1);
    const jitterY = (Math.random() * 14 - 7).toFixed(1);
    const size = Math.round(spec.size * (isNarrow() ? 0.72 : 1));
    const rot = (spec.rotate ?? 0) + (Math.random() * 3 - 1.5);
    plate.style.cssText = [
      `top: calc(${spec.top} + ${jitterY}px)`,
      sideStyle(spec.slot),
      `width: ${size}px`,
      `--ha-rot: ${rot.toFixed(1)}deg`,
      `transform: translateX(${jitterX}px) rotate(var(--ha-rot))`,
    ].join(';');
    plate.innerHTML = renderMotif(spec.kind, Math.floor(Math.random() * 90) + i * 11);
    field.appendChild(plate);
    nodes.push({
      el: plate,
      threshold: thresholds[i] ?? 0.1 + i * 0.08,
      revealed: false,
    });
  });

  if (!listening) {
    listening = true;
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }
  syncReveal();
}

build();
