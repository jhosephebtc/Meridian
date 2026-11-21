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
  const birds = [0, 1, 2, 3, 4, 5].map((i) => {
    const x = 22 + i * 58 + ((seed + i * 17) % 12);
    const y = 38 + ((i * 31 + seed) % 58);
    const delay = (i * 0.32 + (seed % 5) * 0.08).toFixed(2);
    const dur = (4.6 + (i % 4) * 0.65).toFixed(1);
    const scale = (0.78 + (i % 3) * 0.14).toFixed(2);
    const flip = i % 2 === 0 ? 1 : -1;
    const bow = i % 3 === 0 ? -2 : 2;
    return `
      <g transform="translate(${x} ${y}) scale(${flip} 1)">
        <g class="ha-bird" style="--ha-delay:${delay}s;--ha-dur:${dur}s;--ha-scale:${scale}">
        <g class="ha-bird-body" style="--ha-delay:${delay}s">
          <path class="ha-stroke" d="M-6 1 C-2 -3 6 -3.5 12 -0.5 C7 2.5 0 3 -6 1"/>
          <path class="ha-stroke ha-wing" d="M0 0 C-8 -11 -20 -14 -32 -6 C-24 -2 -12 1 0 0"/>
          <path class="ha-stroke ha-fine ha-wing" d="M-1 -0.5 C-10 -7 -20 -8 -28 -3"/>
          <path class="ha-stroke ha-wing ha-wing-r" d="M1 0 C8 -8 16 -9 24 -3 C16 0 8 1.5 1 0"/>
          <path class="ha-stroke ha-fine ha-wing ha-wing-r" d="M2 -0.4 C9 -5 16 -5 21 -1.5"/>
          <path class="ha-stroke" d="M-6 1.5 C-14 ${bow} -22 4 -28 1"/>
          <path class="ha-stroke ha-fine" d="M-5 2.4 C-12 4 -18 6 -24 4"/>
          <path class="ha-stroke" d="M11 -0.4 C14 -1.6 17 -0.6 18.5 0.6"/>
          <circle cx="8.5" cy="-1.3" r="0.45" fill="currentColor"/>
        </g>
        </g>
      </g>`;
  }).join('');
  return `<svg class="ha-svg ha-birds" viewBox="0 0 380 150" fill="none" aria-hidden="true">${birds}</svg>`;
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
      const bend = i % 2 === 0 ? 14 : -12;
      const mx = (x1 + x2) / 2 + bend;
      const my = (y1 + y2) / 2 - bend * 0.45;
      return `<path class="ha-stroke ha-star-line" style="--ha-delay:${(0.15 + i * 0.1).toFixed(2)}s" d="M${x1} ${y1} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x2} ${y2}"/>`;
    })
    .join('');
  const stars = pts
    .map(([x, y], i) => {
      const r = i % 4 === 0 ? 1.7 : i % 2 === 0 ? 1.15 : 0.7;
      const cross = i % 3 === 0
        ? `<path class="ha-stroke" d="M${x - 3.2} ${y} H${x + 3.2} M${x} ${y - 3.2} V${y + 3.2}" opacity="0.45"/>`
        : '';
      return `${cross}<circle class="ha-star" style="--ha-delay:${(0.3 + i * 0.16).toFixed(2)}s" cx="${x}" cy="${y}" r="${r}"/>`;
    })
    .join('');
  return `<svg class="ha-svg ha-constellation ha-constellation-spin" viewBox="0 0 280 180" fill="none" aria-hidden="true">
    <g class="ha-constellation-drift">${lines}${stars}</g>
  </svg>`;
}

function svgNavigator(): string {
  return `<svg class="ha-svg ha-navigator" viewBox="0 0 200 220" fill="none" aria-hidden="true">
    <g class="ha-nav-sway">
      <path class="ha-stroke ha-draw" style="--ha-delay:0.04s" d="M70 34 C86 40 112 40 128 32"/>
      <path class="ha-stroke ha-draw" style="--ha-delay:0.1s" d="M82 32 C80 14 114 12 116 30 C110 36 88 38 82 32"/>
      <path class="ha-stroke ha-draw" style="--ha-delay:0.16s" d="M90 36 C88 46 92 54 100 56 C110 54 114 44 110 36"/>
      <path class="ha-stroke ha-draw" style="--ha-delay:0.24s" d="M74 68 C80 60 118 58 124 70 C128 98 126 122 116 130 C100 138 84 134 76 126 C68 108 68 84 74 68"/>
      <path class="ha-stroke ha-fine ha-draw" style="--ha-delay:0.32s" d="M98 64 C94 86 96 108 100 128"/>
      <path class="ha-stroke ha-fine ha-draw" style="--ha-delay:0.36s" d="M86 78 C96 84 108 82 116 74"/>
      <path class="ha-stroke ha-draw" style="--ha-delay:0.42s" d="M80 76 C66 92 54 108 62 120 C70 116 78 104 84 92"/>
      <path class="ha-stroke ha-draw" style="--ha-delay:0.5s" d="M116 74 C130 84 144 94 154 102"/>
      <path class="ha-stroke ha-draw" style="--ha-delay:0.58s" d="M90 128 C84 152 78 172 72 188"/>
      <path class="ha-stroke ha-draw" style="--ha-delay:0.64s" d="M106 128 C112 154 120 174 126 188"/>
      <path class="ha-stroke ha-draw" style="--ha-delay:0.7s" d="M64 188 C70 186 76 188 84 186"/>
      <path class="ha-stroke ha-draw" style="--ha-delay:0.74s" d="M116 188 C122 186 130 188 136 186"/>
      <g class="ha-sextant-scan">
        <path class="ha-stroke ha-draw" style="--ha-delay:0.82s" d="M138 114 C154 112 170 98 178 78"/>
        <path class="ha-stroke ha-fine ha-draw" style="--ha-delay:0.88s" d="M144 110 C156 106 168 96 174 84"/>
        <path class="ha-stroke ha-draw" style="--ha-delay:0.94s" d="M154 104 C164 92 172 82 176 72"/>
        <circle class="ha-stroke" cx="176" cy="74" r="1.6"/>
        <path class="ha-stroke ha-sight" d="M176 74 C184 58 190 46 196 34"/>
      </g>
    </g>
    <path class="ha-stroke ha-horizon" d="M12 198 C60 194 140 202 188 196"/>
    <circle class="ha-star" style="--ha-delay:1.15s" cx="32" cy="26" r="0.8"/>
    <circle class="ha-star" style="--ha-delay:1.3s" cx="164" cy="38" r="0.55"/>
    <circle class="ha-star" style="--ha-delay:1.45s" cx="46" cy="50" r="0.45"/>
  </svg>`;
}

function svgBoat(seed: number): string {
  const waveY = 136;
  return `<svg class="ha-svg ha-boat" viewBox="0 0 300 190" fill="none" aria-hidden="true">
    <g class="ha-boat-sail" style="--ha-delay:${(seed % 4) * 0.15}s">
      <g class="ha-boat-bob">
        <path class="ha-stroke ha-draw" style="--ha-delay:0.06s" d="M48 116 C86 108 196 106 236 116 C228 132 198 148 150 150 C98 148 64 134 48 116"/>
        <path class="ha-stroke ha-fine ha-draw" style="--ha-delay:0.12s" d="M62 122 C100 116 188 116 220 122"/>
        <path class="ha-stroke ha-fine ha-draw" style="--ha-delay:0.16s" d="M74 130 C108 126 176 126 206 132"/>
        <path class="ha-stroke ha-draw" style="--ha-delay:0.22s" d="M146 116 C146 78 146 46 146 26"/>
        <path class="ha-stroke ha-draw ha-sail" style="--ha-delay:0.32s" d="M148 34 C176 46 204 74 216 110 C190 112 164 112 148 110 C148 84 148 56 148 34"/>
        <path class="ha-stroke ha-fine ha-sail" style="--ha-delay:0.4s" d="M156 58 C176 66 196 84 208 104"/>
        <path class="ha-stroke ha-fine ha-sail" style="--ha-delay:0.44s" d="M152 78 C172 84 188 94 200 108"/>
        <path class="ha-stroke ha-draw ha-sail" style="--ha-delay:0.5s" d="M144 48 C118 62 92 86 74 112 C100 112 124 112 144 110 C144 90 144 68 144 48"/>
        <path class="ha-stroke ha-draw" style="--ha-delay:0.58s" d="M146 26 C158 16 166 18 162 28"/>
        <path class="ha-stroke ha-fine ha-draw" style="--ha-delay:0.62s" d="M162 20 C168 24 170 30 166 32"/>
        <path class="ha-stroke ha-fine ha-draw" style="--ha-delay:0.66s" d="M146 28 C92 48 40 92 22 112"/>
        <path class="ha-stroke ha-fine ha-draw" style="--ha-delay:0.7s" d="M146 28 C188 52 220 86 236 114"/>
      </g>
    </g>
    <path class="ha-stroke ha-wave" style="--ha-delay:0.2s" d="M6 ${waveY} C28 ${waveY - 10} 48 ${waveY + 6} 72 ${waveY} C96 ${waveY - 8} 118 ${waveY + 6} 144 ${waveY} C170 ${waveY - 9} 196 ${waveY + 5} 222 ${waveY} C246 ${waveY - 7} 268 ${waveY + 4} 294 ${waveY}"/>
    <path class="ha-stroke ha-wave ha-wave-b" style="--ha-delay:0.8s" d="M10 ${waveY + 16} C40 ${waveY + 6} 70 ${waveY + 20} 108 ${waveY + 14} C146 ${waveY + 8} 180 ${waveY + 22} 220 ${waveY + 14} C252 ${waveY + 8} 274 ${waveY + 16} 296 ${waveY + 12}"/>
    <path class="ha-stroke ha-wave ha-wave-c" style="--ha-delay:1.4s" d="M24 ${waveY + 30} C60 ${waveY + 22} 96 ${waveY + 34} 140 ${waveY + 26} C184 ${waveY + 18} 220 ${waveY + 32} 268 ${waveY + 24}"/>
  </svg>`;
}

function svgCompass(): string {
  const ticks = Array.from({ length: 36 }, (_, i) => {
    const a = (i * 10 - 90) * Math.PI / 180;
    const outer = 76;
    const inner = i % 9 === 0 ? 64 : i % 3 === 0 ? 70 : 73;
    const x1 = (100 + Math.cos(a) * inner).toFixed(1);
    const y1 = (100 + Math.sin(a) * inner).toFixed(1);
    const x2 = (100 + Math.cos(a) * outer).toFixed(1);
    const y2 = (100 + Math.sin(a) * outer).toFixed(1);
    const opacity = i % 9 === 0 ? 0.65 : i % 3 === 0 ? 0.32 : 0.16;
    return `<line class="ha-stroke ha-fine" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" opacity="${opacity}"/>`;
  }).join('');
  const rose = Array.from({ length: 8 }, (_, i) => {
    const a = (i * 45 - 90) * Math.PI / 180;
    const len = i % 2 === 0 ? 38 : 22;
    const tipX = (100 + Math.cos(a) * len).toFixed(1);
    const tipY = (100 + Math.sin(a) * len).toFixed(1);
    const s1 = a - 0.42;
    const s2 = a + 0.42;
    const c1x = (100 + Math.cos(s1) * len * 0.62).toFixed(1);
    const c1y = (100 + Math.sin(s1) * len * 0.62).toFixed(1);
    const c2x = (100 + Math.cos(s2) * len * 0.62).toFixed(1);
    const c2y = (100 + Math.sin(s2) * len * 0.62).toFixed(1);
    return `<path class="ha-stroke ha-fine" d="M100 100 C${c1x} ${c1y} ${tipX} ${tipY} ${tipX} ${tipY} C${tipX} ${tipY} ${c2x} ${c2y} 100 100"/>`;
  }).join('');
  return `<svg class="ha-svg ha-compass" viewBox="0 0 200 200" fill="none" aria-hidden="true">
    <circle class="ha-stroke ha-draw" style="--ha-delay:0.04s" cx="100" cy="100" r="84"/>
    <circle class="ha-stroke ha-fine ha-draw" style="--ha-delay:0.12s" cx="100" cy="100" r="76"/>
    ${ticks}
    <circle class="ha-stroke ha-draw" style="--ha-delay:0.28s" cx="100" cy="100" r="44"/>
    ${rose}
    <g class="ha-compass-spin">
      <path class="ha-stroke" d="M100 28 C103 62 104 86 102 100 C100 92 98 70 100 28"/>
      <path class="ha-stroke ha-fine" d="M100 172 C103 140 102 118 100 108 C98 124 97 148 100 172" opacity="0.45"/>
      <circle cx="100" cy="100" r="1.5" fill="currentColor"/>
    </g>
    <text class="ha-compass-label" x="100" y="14" text-anchor="middle">N</text>
    <text class="ha-compass-label" x="100" y="196" text-anchor="middle">S</text>
    <text class="ha-compass-label" x="10" y="104" text-anchor="middle">W</text>
    <text class="ha-compass-label" x="190" y="104" text-anchor="middle">E</text>
  </svg>`;
}

function svgLighthouse(): string {
  return `<svg class="ha-svg ha-lighthouse" viewBox="0 0 180 240" fill="none" aria-hidden="true">
    <path class="ha-stroke ha-fine" d="M6 208 C36 198 70 214 104 202 C132 194 154 208 174 200" opacity="0.4"/>
    <path class="ha-stroke ha-draw" style="--ha-delay:0.06s" d="M50 206 C58 156 64 112 70 92 C90 88 112 88 114 92 C120 114 128 158 134 206 C112 210 74 210 50 206"/>
    <path class="ha-stroke ha-fine ha-draw" style="--ha-delay:0.14s" d="M62 168 C78 164 104 164 120 170"/>
    <path class="ha-stroke ha-fine ha-draw" style="--ha-delay:0.18s" d="M66 142 C82 138 106 138 118 144"/>
    <path class="ha-stroke ha-fine ha-draw" style="--ha-delay:0.22s" d="M70 118 C84 114 104 114 116 120"/>
    <path class="ha-stroke ha-draw" style="--ha-delay:0.28s" d="M78 176 C82 168 86 168 90 176 C86 180 82 180 78 176"/>
    <path class="ha-stroke ha-draw" style="--ha-delay:0.34s" d="M64 92 C90 88 116 88 122 94 C118 78 74 78 68 94"/>
    <path class="ha-stroke ha-fine ha-draw" style="--ha-delay:0.4s" d="M76 90 C76 82 78 80 80 90"/>
    <path class="ha-stroke ha-fine ha-draw" style="--ha-delay:0.44s" d="M90 88 C90 80 92 78 94 88"/>
    <path class="ha-stroke ha-fine ha-draw" style="--ha-delay:0.48s" d="M104 90 C104 82 106 80 108 90"/>
    <path class="ha-stroke ha-draw" style="--ha-delay:0.54s" d="M72 78 C80 50 104 46 114 78"/>
    <path class="ha-stroke ha-fine ha-draw" style="--ha-delay:0.6s" d="M88 52 C92 46 98 46 100 54"/>
    <g class="ha-beacon">
      <path class="ha-stroke ha-beam" d="M92 62 C60 48 28 36 6 28"/>
      <path class="ha-stroke ha-beam" d="M92 62 C120 50 150 42 174 36"/>
      <path class="ha-stroke ha-beam ha-beam-mid" d="M92 64 C64 70 36 74 14 78"/>
      <circle class="ha-star" style="--ha-delay:0.7s" cx="92" cy="62" r="1.15"/>
    </g>
    <path class="ha-stroke ha-wave" d="M8 220 C36 210 62 226 96 216 C124 208 150 224 174 214"/>
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
