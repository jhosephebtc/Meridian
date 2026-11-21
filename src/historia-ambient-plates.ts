/**
 * Ambient HalfTone plates around the home História essay.
 * Monochrome · reduced opacity · reveal in shuffled order while scrolling.
 */
import { mountHalftone, HALFTONE_MEDIUM } from './halftone-mount';
import type { ShaderMount } from '@paper-design/shaders';

type PlateSpec = {
  src: string;
  label: string;
  /** Prefer left / right / mid slots around the prose column */
  slot: 'left' | 'right' | 'mid';
  size: number;
  top: string;
  rotate: number;
};

const PLATES: PlateSpec[] = [
  { src: './plates/constellation-orion.jpg', label: 'Orion', slot: 'left', size: 200, top: '6%', rotate: -5 },
  { src: './plates/lighthouse.jpg', label: 'Farol', slot: 'right', size: 220, top: '14%', rotate: 4 },
  { src: './plates/constellation-ursa.jpg', label: 'Ursa', slot: 'left', size: 168, top: '32%', rotate: 3 },
  { src: './plates/sextant.jpg', label: 'Sextante', slot: 'mid', size: 150, top: '42%', rotate: -3 },
  { src: './plates/compass-rose.png', label: 'Rosa', slot: 'right', size: 180, top: '52%', rotate: 6 },
  { src: './plates/constellation-argo.jpg', label: 'Argo', slot: 'left', size: 190, top: '68%', rotate: -4 },
  { src: './plates/hurricane.jpg', label: 'Tempestade', slot: 'right', size: 160, top: '78%', rotate: 2 },
];

const SECTION_SEL = '#historia';
const LAYOUT_SEL = '#historia .historia-layout';
const FIELD_ID = 'historia-ambient';
const MAX_MOBILE = 3;

type PlateNode = {
  el: HTMLElement;
  mount: ShaderMount | null;
  threshold: number;
  revealed: boolean;
};

let nodes: PlateNode[] = [];
let raf = 0;
let listening = false;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 1; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isNarrow(): boolean {
  return window.matchMedia('(max-width: 860px)').matches;
}

function sideStyle(slot: PlateSpec['slot']): string {
  if (slot === 'left') return 'left: clamp(-40px, -4vw, 4px);';
  if (slot === 'right') {
    /* Prefer the gap between essay and sticky aside; fall back to right edge */
    return 'left: auto; right: clamp(-24px, 2vw, 28px);';
  }
  /* mid — ghosted behind the prose column */
  return 'left: clamp(8%, 18%, 28%);';
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

async function mountPlate(host: HTMLElement, src: string): Promise<ShaderMount | null> {
  return mountHalftone(host, src, {
    ...HALFTONE_MEDIUM,
    type: 'classic',
    size: 0.17,
    radius: 0.94,
    contrast: 0.88,
    grainMixer: 0.05,
    grainOverlay: 0.04,
  });
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

async function build(): Promise<void> {
  const section = document.querySelector<HTMLElement>(SECTION_SEL);
  if (!section) return;

  // Tear down previous mounts
  for (const n of nodes) {
    n.mount?.dispose?.();
  }
  nodes = [];

  const field = ensureField();
  if (!field) return;
  field.replaceChildren();

  const pool = shuffle(PLATES);
  const count = isNarrow() ? Math.min(MAX_MOBILE, pool.length) : pool.length;
  const chosen = pool.slice(0, count);

  // Staggered random thresholds across the section scroll
  const thresholds = shuffle(
    chosen.map((_, i) => 0.08 + (i / Math.max(1, chosen.length - 1)) * 0.72 + (Math.random() * 0.06 - 0.03)),
  ).map((t) => Math.min(0.88, Math.max(0.05, t)));

  const mounts: Promise<void>[] = [];

  chosen.forEach((spec, i) => {
    const plate = document.createElement('div');
    plate.className = 'historia-ambient-plate';
    plate.dataset.slot = spec.slot;
    plate.dataset.visible = 'false';
    plate.dataset.label = spec.label;
    const jitterX = (Math.random() * 18 - 9).toFixed(1);
    const jitterY = (Math.random() * 12 - 6).toFixed(1);
    const size = Math.round(spec.size * (isNarrow() ? 0.78 : 1));
    plate.style.cssText = [
      `top: calc(${spec.top} + ${jitterY}px)`,
      sideStyle(spec.slot),
      `width: ${size}px`,
      `transform: translateX(${jitterX}px) rotate(${spec.rotate + (Math.random() * 2 - 1)}deg)`,
    ].join(';');

    const host = document.createElement('div');
    host.className = 'historia-ambient-host';
    plate.appendChild(host);
    field.appendChild(plate);

    const node: PlateNode = {
      el: plate,
      mount: null,
      threshold: thresholds[i] ?? 0.2 + i * 0.1,
      revealed: false,
    };
    nodes.push(node);

    mounts.push(
      mountPlate(host, spec.src).then((m) => {
        node.mount = m;
      }),
    );
  });

  await Promise.all(mounts);

  if (!listening) {
    listening = true;
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }
  syncReveal();
}

void build();

window.addEventListener('meridian:surface', () => {
  void build();
});

window.addEventListener('meridian:lang', () => {
  /* layout unchanged — keep ambient mounts */
});
