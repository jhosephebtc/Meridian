/**
 * MERIDIAN HAIRLINE FIGURES — hairline-figure.ts
 * Interactive 2:1 isometric rounded-solid SVG figures built to work in concert
 * with Meridian's Plotter grammar (src/plotter-svg.ts) and Single-Ink surfaces.
 *
 * Follows Lucas Marques's Hairline 10 rules (github.com/lucasmarkes/hairline, MIT):
 *  01. hit      — Hit testing strictly on static rest centers (zero hover flicker)
 *  02. order    — Distance-staggered wave settle outward from focus
 *  03. reach    — Clamped elevation within the 400x320 2:1 viewBox frame
 *  04. accent   — Ultra-thin foreground stroke highlight (0.65 / 0.45 / 0.4 non-scaling-stroke)
 *  05. rest     — Designed asymmetric rest composition (never flat)
 *  06. honesty  — Back-to-front painter occlusion with opaque var(--ds-bg) plates
 *  07. cost     — Sleeps idle / offscreen via IntersectionObserver + reduced-motion snap
 *  08. clock    — Spring k=100, c=18, m=1 for continuous pointer response
 *  09. radius   — Rounded ring hull without vertical box corners + 1 dim inner crease
 *  10. quiet    — Wordless SVG canvas; concise external Geist Mono telemetry only
 */

export type HairlinePreset =
  | 'wave'
  | 'strata'
  | 'beacon'
  | 'octaves'
  | 'switches'
  | 'attitude'
  | 'ephemeris'
  | 'telemetry';

interface IsoTile {
  r: number;
  c: number;
  cx: number;
  cy: number;
  order: number;
  zRest: number;
  z: number;
  v: number;
  target: number;
  restX: number;
  restY: number;
  outerPts: Array<[number, number]>;
  innerPts: Array<[number, number]>;
  code?: string;
}

const PRESET_LABEL: Record<HairlinePreset, string> = {
  wave: 'crest 4×4',
  strata: 'strata 5×1',
  beacon: 'beacon 2:1',
  octaves: 'octaves h8',
  switches: 'keys 3×2',
  attitude: 'gimbal 3:1',
  ephemeris: 'orbit 5:1',
  telemetry: 'vane 5:1',
};

const SWITCH_TAGS = ['tokens', 'grain', 'motion', 'plotter', 'hairline', 'gridlines'] as const;
const ATTITUDE_TAGS = ['datum', 'horizon', 'index'] as const;
const EPHEMERIS_TAGS = ['new', 'wax', 'full', 'wan', 'node'] as const;
const TELEMETRY_TAGS = ['N', 'W', 'CORE', 'E', 'S'] as const;

function isoProj(x: number, y: number, z: number, scale = 32, baseY = 178): [number, number] {
  return [200 + (x - y) * scale, baseY + (x + y) * (scale * 0.5) - z * 22];
}

function isoRingPts(rx: number, ry: number, z: number, steps: number, scale: number, baseY: number): Array<[number, number]> {
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    pts.push(isoProj(Math.cos(a) * rx, Math.sin(a) * ry, z, scale, baseY));
  }
  return pts;
}

function roundedTile(cx: number, cy: number, halfX: number, halfY: number, rad: number, steps = 3): Array<[number, number]> {
  const r = Math.min(rad, halfX * 0.65, halfY * 0.65);
  const pts: Array<[number, number]> = [];
  const corners: Array<[number, number, number, number]> = [
    [cx + halfX - r, cy - halfY + r, -Math.PI / 2, 0],
    [cx + halfX - r, cy + halfY - r, 0, Math.PI / 2],
    [cx - halfX + r, cy + halfY - r, Math.PI / 2, Math.PI],
    [cx - halfX + r, cy - halfY + r, Math.PI, Math.PI * 1.5],
  ];
  for (const [ox, oy, a0, a1] of corners) {
    for (let s = 0; s <= steps; s++) {
      const a = a0 + ((a1 - a0) * s) / steps;
      pts.push([ox + Math.cos(a) * r, oy + Math.sin(a) * r]);
    }
  }
  return pts;
}

function hull2d(pts: Array<[number, number]>): Array<[number, number]> {
  const sorted = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: [number, number], a: [number, number], b: [number, number]) =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const low: Array<[number, number]> = [];
  for (const p of sorted) {
    while (low.length >= 2 && cross(low[low.length - 2], low[low.length - 1], p) <= 0) low.pop();
    low.push(p);
  }
  const up: Array<[number, number]> = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop();
    up.push(p);
  }
  low.pop();
  up.pop();
  return low.concat(up);
}

function pathFromPts(pts: Array<[number, number]>): string {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z';
}

function buildPresetTiles(preset: HairlinePreset): {
  tiles: IsoTile[];
  restLead: number;
  maxReach: number;
  scale: number;
  baseY: number;
  guideMarkup: string;
} {
  const tiles: IsoTile[] = [];

  if (preset === 'wave') {
    const scale = 32;
    const baseY = 178;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const cx = c - 1.5;
        const cy = r - 1.5;
        const zRest =
          0.28 +
          0.38 * Math.exp(-((cx + 0.45) ** 2 + (cy + 0.35) ** 2) / 2.2) +
          0.12 * Math.cos(cx * 0.85 - cy * 0.7);
        const rc = isoProj(cx, cy, zRest, scale, baseY);
        tiles.push({
          r, c, cx, cy, order: r + c, zRest, z: zRest, v: 0, target: zRest,
          restX: rc[0], restY: rc[1],
          outerPts: roundedTile(cx, cy, 0.42, 0.42, 0.13, 3),
          innerPts: roundedTile(cx, cy, 0.28, 0.28, 0.08, 2),
        });
      }
    }
    const baseCorners = [isoProj(-2.05, -2.05, 0, scale, baseY), isoProj(2.05, -2.05, 0, scale, baseY), isoProj(2.05, 2.05, 0, scale, baseY), isoProj(-2.05, 2.05, 0, scale, baseY)];
    const axisH = [isoProj(-2.25, 0, 0, scale, baseY), isoProj(2.25, 0, 0, scale, baseY)];
    const axisV = [isoProj(0, -2.25, 0, scale, baseY), isoProj(0, 2.25, 0, scale, baseY)];
    const guideMarkup =
      `<g data-plotter-role="guide" fill="none" stroke="currentColor" stroke-width="0.4" vector-effect="non-scaling-stroke" stroke-dasharray="2 3.5" opacity="0.18">` +
      `<path d="${pathFromPts(baseCorners)}"/>` +
      `<line x1="${axisH[0][0].toFixed(1)}" y1="${axisH[0][1].toFixed(1)}" x2="${axisH[1][0].toFixed(1)}" y2="${axisH[1][1].toFixed(1)}"/>` +
      `<line x1="${axisV[0][0].toFixed(1)}" y1="${axisV[0][1].toFixed(1)}" x2="${axisV[1][0].toFixed(1)}" y2="${axisV[1][1].toFixed(1)}"/>` +
      `</g>`;
    return { tiles, restLead: 5, maxReach: 1.85, scale, baseY, guideMarkup };
  }

  if (preset === 'strata') {
    const scale = 30;
    const baseY = 212;
    for (let i = 0; i < 5; i++) {
      const zRest = 0.24 + i * 0.46;
      const half = 1.65 - i * 0.18;
      const rc = isoProj(0, 0, zRest, scale, baseY);
      tiles.push({
        r: i, c: 0, cx: 0, cy: 0, order: i, zRest, z: zRest, v: 0, target: zRest,
        restX: rc[0], restY: rc[1],
        outerPts: roundedTile(0, 0, half, half, half * 0.24, 3),
        innerPts: roundedTile(0, 0, half * 0.72, half * 0.72, half * 0.16, 2),
      });
    }
    const base = [isoProj(-2.1, -2.1, 0, scale, baseY), isoProj(2.1, -2.1, 0, scale, baseY), isoProj(2.1, 2.1, 0, scale, baseY), isoProj(-2.1, 2.1, 0, scale, baseY)];
    const guideMarkup =
      `<g data-plotter-role="guide" fill="none" stroke="currentColor" stroke-width="0.4" vector-effect="non-scaling-stroke" stroke-dasharray="2 3.5" opacity="0.18">` +
      `<path d="${pathFromPts(base)}"/>` +
      `<line x1="200" y1="68" x2="200" y2="254"/>` +
      `</g>`;
    return { tiles, restLead: 2, maxReach: 2.9, scale, baseY, guideMarkup };
  }

  if (preset === 'beacon') {
    const scale = 31;
    const baseY = 206;
    const coords: Array<[number, number, number, number]> = [
      [0, 0, 0.34, 1.55],
      [0, 0, 0.88, 1.15],
      [0, 0, 1.44, 0.76],
      [0, 0, 2.02, 0.42],
    ];
    coords.forEach(([cx, cy, zRest, half], i) => {
      const rc = isoProj(cx, cy, zRest, scale, baseY);
      tiles.push({
        r: i, c: 0, cx, cy, order: i, zRest, z: zRest, v: 0, target: zRest,
        restX: rc[0], restY: rc[1],
        outerPts: roundedTile(cx, cy, half, half, half * 0.34, 4),
        innerPts: roundedTile(cx, cy, half * 0.68, half * 0.68, half * 0.22, 3),
      });
    });
    const r0 = isoProj(-2.2, -2.2, 0, scale, baseY);
    const r1 = isoProj(2.2, 2.2, 0, scale, baseY);
    const l0 = isoProj(-2.2, 2.2, 0, scale, baseY);
    const l1 = isoProj(2.2, -2.2, 0, scale, baseY);
    const axisX0 = isoProj(-2.25, 0, 0, scale, baseY);
    const axisX1 = isoProj(2.25, 0, 0, scale, baseY);
    const guideMarkup =
      `<g data-plotter-role="guide" fill="none" stroke="currentColor" stroke-width="0.4" vector-effect="non-scaling-stroke" stroke-dasharray="2 3.5" opacity="0.18">` +
      `<line x1="${r0[0].toFixed(1)}" y1="${r0[1].toFixed(1)}" x2="${r1[0].toFixed(1)}" y2="${r1[1].toFixed(1)}"/>` +
      `<line x1="${l0[0].toFixed(1)}" y1="${l0[1].toFixed(1)}" x2="${l1[0].toFixed(1)}" y2="${l1[1].toFixed(1)}"/>` +
      `<line x1="${axisX0[0].toFixed(1)}" y1="${axisX0[1].toFixed(1)}" x2="${axisX1[0].toFixed(1)}" y2="${axisX1[1].toFixed(1)}"/>` +
      `<line x1="200" y1="62" x2="200" y2="262"/>` +
      `</g>`;
    return { tiles, restLead: 3, maxReach: 2.95, scale, baseY, guideMarkup };
  }

  if (preset === 'switches') {
    const scale = 33;
    const baseY = 184;
    let idx = 0;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const cx = (c - 1) * 1.12;
        const cy = (r - 0.5) * 1.18;
        const zRest = idx === 2 ? 0.88 : 0.34 + ((r + c) % 2) * 0.22;
        const rc = isoProj(cx, cy, zRest, scale, baseY);
        tiles.push({
          r, c, cx, cy, order: r * 3 + c, zRest, z: zRest, v: 0, target: zRest,
          restX: rc[0], restY: rc[1],
          outerPts: roundedTile(cx, cy, 0.44, 0.46, 0.14, 3),
          innerPts: roundedTile(cx, cy, 0.29, 0.31, 0.08, 2),
          code: SWITCH_TAGS[idx],
        });
        idx++;
      }
    }
    const tray = [isoProj(-1.78, -1.25, 0, scale, baseY), isoProj(1.78, -1.25, 0, scale, baseY), isoProj(1.78, 1.25, 0, scale, baseY), isoProj(-1.78, 1.25, 0, scale, baseY)];
    const mid = [isoProj(-1.95, 0, 0, scale, baseY), isoProj(1.95, 0, 0, scale, baseY)];
    const guideMarkup =
      `<g data-plotter-role="guide" fill="none" stroke="currentColor" stroke-width="0.4" vector-effect="non-scaling-stroke" stroke-dasharray="2 3.5" opacity="0.18">` +
      `<path d="${pathFromPts(tray)}"/>` +
      `<line x1="${mid[0][0].toFixed(1)}" y1="${mid[0][1].toFixed(1)}" x2="${mid[1][0].toFixed(1)}" y2="${mid[1][1].toFixed(1)}"/>` +
      `</g>`;
    return { tiles, restLead: 2, maxReach: 1.75, scale, baseY, guideMarkup };
  }

  if (preset === 'attitude') {
    const scale = 31;
    const baseY = 192;
    const planes: Array<[number, number, number, number, number]> = [
      [-0.25, -0.25, 0.34, 1.32, 0.36],
      [0.05, 0.05, 0.92, 1.56, 0.24],
      [0.32, 0.32, 1.52, 0.88, 0.34],
    ];
    planes.forEach(([cx, cy, zRest, hx, hy], i) => {
      const rc = isoProj(cx, cy, zRest, scale, baseY);
      tiles.push({
        r: i, c: 0, cx, cy, order: i, zRest, z: zRest, v: 0, target: zRest,
        restX: rc[0], restY: rc[1],
        outerPts: roundedTile(cx, cy, hx, hy, Math.min(hx, hy) * 0.36, 3),
        innerPts: roundedTile(cx, cy, hx * 0.72, hy * 0.56, Math.min(hx, hy) * 0.18, 2),
        code: ATTITUDE_TAGS[i],
      });
    });
    const ring = isoRingPts(2.05, 2.05, 0, 48, scale, baseY);
    const crossA = [isoProj(-2.15, 0, 0, scale, baseY), isoProj(2.15, 0, 0, scale, baseY)];
    const crossB = [isoProj(0, -2.15, 0, scale, baseY), isoProj(0, 2.15, 0, scale, baseY)];
    const guideMarkup =
      `<g data-plotter-role="guide" fill="none" stroke="currentColor" stroke-width="0.4" vector-effect="non-scaling-stroke" stroke-dasharray="2 3.5" opacity="0.18">` +
      `<path d="${pathFromPts(ring)}"/>` +
      `<line x1="${crossA[0][0].toFixed(1)}" y1="${crossA[0][1].toFixed(1)}" x2="${crossA[1][0].toFixed(1)}" y2="${crossA[1][1].toFixed(1)}"/>` +
      `<line x1="${crossB[0][0].toFixed(1)}" y1="${crossB[0][1].toFixed(1)}" x2="${crossB[1][0].toFixed(1)}" y2="${crossB[1][1].toFixed(1)}"/>` +
      `</g>`;
    return { tiles, restLead: 1, maxReach: 2.35, scale, baseY, guideMarkup };
  }

  if (preset === 'ephemeris') {
    const scale = 30;
    const baseY = 186;
    const orbitR = 1.48;
    for (let i = 0; i < 5; i++) {
      const ang = -Math.PI * 0.75 + (i / 5) * Math.PI * 2;
      const cx = Math.cos(ang) * orbitR;
      const cy = Math.sin(ang) * orbitR;
      const zRest = 0.36 + ((i === 2 ? 1.15 : (i % 2) * 0.34));
      const half = i === 2 ? 0.46 : 0.36;
      const rc = isoProj(cx, cy, zRest, scale, baseY);
      tiles.push({
        r: i, c: 0, cx, cy, order: Math.round((cx + cy) * 100), zRest, z: zRest, v: 0, target: zRest,
        restX: rc[0], restY: rc[1],
        outerPts: roundedTile(cx, cy, half, half, half * 0.48, 4),
        innerPts: roundedTile(cx, cy, half * 0.6, half * 0.6, half * 0.3, 3),
        code: EPHEMERIS_TAGS[i],
      });
    }
    const orbitPts = isoRingPts(orbitR, orbitR, 0, 48, scale, baseY);
    const axis = [isoProj(-1.9, -1.9, 0, scale, baseY), isoProj(1.9, 1.9, 0, scale, baseY)];
    const guideMarkup =
      `<g data-plotter-role="guide" fill="none" stroke="currentColor" stroke-width="0.4" vector-effect="non-scaling-stroke" stroke-dasharray="2 3.5" opacity="0.18">` +
      `<path d="${pathFromPts(orbitPts)}"/>` +
      `<line x1="${axis[0][0].toFixed(1)}" y1="${axis[0][1].toFixed(1)}" x2="${axis[1][0].toFixed(1)}" y2="${axis[1][1].toFixed(1)}"/>` +
      `</g>`;
    return { tiles, restLead: 2, maxReach: 2.25, scale, baseY, guideMarkup };
  }

  if (preset === 'telemetry') {
    const scale = 31;
    const baseY = 186;
    const nodes: Array<[number, number, number, number, number]> = [
      [0, -1.35, 0.56, 0.42, 0.38],
      [-1.35, 0, 0.42, 0.38, 0.42],
      [0, 0, 1.08, 0.52, 0.52],
      [1.35, 0, 0.46, 0.38, 0.42],
      [0, 1.35, 0.38, 0.42, 0.38],
    ];
    nodes.forEach(([cx, cy, zRest, hx, hy], i) => {
      const rc = isoProj(cx, cy, zRest, scale, baseY);
      tiles.push({
        r: i, c: 0, cx, cy, order: Math.round((cx + cy) * 100), zRest, z: zRest, v: 0, target: zRest,
        restX: rc[0], restY: rc[1],
        outerPts: roundedTile(cx, cy, hx, hy, Math.min(hx, hy) * 0.32, 3),
        innerPts: roundedTile(cx, cy, hx * 0.64, hy * 0.64, Math.min(hx, hy) * 0.2, 2),
        code: TELEMETRY_TAGS[i],
      });
    });
    const ring = isoRingPts(1.85, 1.85, 0, 48, scale, baseY);
    const ns = [isoProj(0, -1.95, 0, scale, baseY), isoProj(0, 1.95, 0, scale, baseY)];
    const ew = [isoProj(-1.95, 0, 0, scale, baseY), isoProj(1.95, 0, 0, scale, baseY)];
    const guideMarkup =
      `<g data-plotter-role="guide" fill="none" stroke="currentColor" stroke-width="0.4" vector-effect="non-scaling-stroke" stroke-dasharray="2 3.5" opacity="0.18">` +
      `<path d="${pathFromPts(ring)}"/>` +
      `<line x1="${ns[0][0].toFixed(1)}" y1="${ns[0][1].toFixed(1)}" x2="${ns[1][0].toFixed(1)}" y2="${ns[1][1].toFixed(1)}"/>` +
      `<line x1="${ew[0][0].toFixed(1)}" y1="${ew[0][1].toFixed(1)}" x2="${ew[1][0].toFixed(1)}" y2="${ew[1][1].toFixed(1)}"/>` +
      `</g>`;
    return { tiles, restLead: 2, maxReach: 2.15, scale, baseY, guideMarkup };
  }

  // 'octaves': stepped 5-octave Gann harmonic bars
  const scale = 30;
  const baseY = 188;
  for (let i = 0; i < 5; i++) {
    const cx = (i - 2) * 0.66;
    const cy = -(i - 2) * 0.28;
    const zRest = 0.32 + Math.abs(Math.sin((i + 1) * 0.72)) * 0.96;
    const rc = isoProj(cx, cy, zRest, scale, baseY);
    tiles.push({
      r: 0, c: i, cx, cy, order: 10 + i, zRest, z: zRest, v: 0, target: zRest,
      restX: rc[0], restY: rc[1],
      outerPts: roundedTile(cx, cy, 0.31, 0.92, 0.11, 3),
      innerPts: roundedTile(cx, cy, 0.19, 0.72, 0.06, 2),
    });
  }
  const d0 = isoProj(-2.05, 1.35, 0, scale, baseY);
  const d1 = isoProj(2.05, -1.35, 0, scale, baseY);
  const guideMarkup =
    `<g data-plotter-role="guide" fill="none" stroke="currentColor" stroke-width="0.5" vector-effect="non-scaling-stroke" stroke-dasharray="2 3.5" opacity="0.22">` +
    `<line x1="${d0[0].toFixed(1)}" y1="${d0[1].toFixed(1)}" x2="${d1[0].toFixed(1)}" y2="${d1[1].toFixed(1)}"/>` +
    `<line x1="48" y1="188" x2="352" y2="188"/>` +
    `</g>`;
  return { tiles, restLead: 2, maxReach: 2.35, scale, baseY, guideMarkup };
}

export function mountHairlineFigure(
  svg: SVGSVGElement | null,
  readout?: HTMLElement | null,
  preset: HairlinePreset = 'wave',
): () => void {
  if (!svg) return () => {};
  svg.setAttribute('data-hairline', '');

  const { tiles, restLead, maxReach, scale, baseY, guideMarkup } = buildPresetTiles(preset);
  const drawOrder = tiles
    .map((_, i) => i)
    .sort((a, b) => tiles[a].order - tiles[b].order || tiles[a].r - tiles[b].r || tiles[a].c - tiles[b].c);

  let activeIdx = -1;
  let pinnedIdx = -1;
  let raf = 0;
  let visible = true;
  let lastT = 0;
  let disposed = false;

  function render(): void {
    if (!svg) return;
    const lead = activeIdx >= 0 ? activeIdx : pinnedIdx >= 0 ? pinnedIdx : restLead;
    let html = guideMarkup;
    for (const idx of drawOrder) {
      const tile = tiles[idx];
      const isActive = idx === lead;
      const zBot = preset === 'strata' || preset === 'beacon' || preset === 'attitude' ? Math.max(0, tile.z - 0.24) : 0;
      const botPts = tile.outerPts.map(([x, y]) => isoProj(x, y, zBot, scale, baseY));
      const topPts = tile.outerPts.map(([x, y]) => isoProj(x, y, tile.z, scale, baseY));
      const hull = hull2d(topPts.concat(botPts));
      const creasePts = tile.innerPts.map(([x, y]) => isoProj(x, y, tile.z, scale, baseY));
      const pip = isoProj(tile.cx, tile.cy + (preset === 'wave' || preset === 'switches' ? 0.14 : 0), tile.z, scale, baseY);
      const gOp = isActive ? '0.92' : '0.32';
      const primaryW = isActive ? '0.65' : '0.45';

      html += `<g opacity="${gOp}">`;
      html += `<path data-plotter-role="primary" d="${pathFromPts(hull)}" fill="var(--ds-bg)" stroke="currentColor" stroke-width="${primaryW}" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/>`;
      html += `<path data-plotter-role="secondary" d="${pathFromPts(creasePts)}" fill="none" stroke="currentColor" stroke-width="0.4" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" opacity="0.24"/>`;
      if (isActive) {
        html += `<circle data-plotter-role="primary" cx="${pip[0].toFixed(1)}" cy="${pip[1].toFixed(1)}" r="1.15" fill="currentColor" stroke="none"/>`;
      }
      html += `</g>`;
    }
    svg.innerHTML = html;
  }

  function updateReadout(focusIdx: number): void {
    if (!readout) return;
    if (focusIdx < 0) {
      readout.textContent = `rest · ${PRESET_LABEL[preset]} · z +${tiles[restLead].zRest.toFixed(2)}`;
      return;
    }
    const ft = tiles[focusIdx];
    const idLabel =
      preset === 'wave'
        ? `cell ${ft.r + 1}·${ft.c + 1}`
        : ft.code
          ? `${preset === 'switches' ? 'key' : preset === 'telemetry' ? 'vane' : 'node'} 0${focusIdx + 1} · ${ft.code}`
          : `tier 0${focusIdx + 1}`;
    readout.textContent = `${idLabel} · z +${ft.target.toFixed(2)}`;
  }

  function setTargets(focusIdx: number): void {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ft = focusIdx >= 0 ? tiles[focusIdx] : null;
    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[i];
      if (!ft) {
        t.target = t.zRest;
      } else if (preset === 'switches') {
        const d = Math.hypot(t.c - ft.c, t.r - ft.r);
        t.target = i === focusIdx ? Math.max(0.14, t.zRest - 0.14) : Math.min(maxReach, t.zRest + Math.max(0.06, 0.34 / (1 + d * 0.9)));
      } else {
        const d = preset === 'wave' ? Math.hypot(t.c - ft.c, t.r - ft.r) : Math.abs(i - focusIdx);
        const lift = Math.min(0.92, 0.92 / (1 + d * d * 0.72));
        t.target = Math.min(maxReach, t.zRest + lift);
      }
      if (reduced) {
        t.z = t.target;
        t.v = 0;
      }
    }
    updateReadout(focusIdx);
    if (reduced) {
      render();
      return;
    }
    wake();
  }

  function tick(now: number): void {
    raf = 0;
    if (disposed || !visible) return;
    const dt = Math.min(0.025, lastT ? (now - lastT) / 1000 : 0.016);
    lastT = now;
    let moving = false;
    for (const t of tiles) {
      const force = -100 * (t.z - t.target) - 18 * t.v;
      t.v += force * dt;
      t.z += t.v * dt;
      if (Math.abs(t.z - t.target) > 0.002 || Math.abs(t.v) > 0.002) {
        moving = true;
      } else {
        t.z = t.target;
        t.v = 0;
      }
    }
    render();
    if (moving) raf = requestAnimationFrame(tick);
    else lastT = 0;
  }

  function wake(): void {
    if (!disposed && !raf && visible) {
      lastT = 0;
      raf = requestAnimationFrame(tick);
    }
  }

  function pickRestTile(clientX: number, clientY: number): number {
    if (!svg) return -1;
    const ctm = svg.getScreenCTM();
    if (!ctm) return -1;
    const inv = ctm.inverse();
    const vx = clientX * inv.a + clientY * inv.c + inv.e;
    const vy = clientX * inv.b + clientY * inv.d + inv.f;
    let best = -1;
    let bestD = preset === 'wave' ? 32 : preset === 'switches' ? 38 : 44;
    for (let i = 0; i < tiles.length; i++) {
      const d = Math.hypot(vx - tiles[i].restX, vy - tiles[i].restY);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  }

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    const next = pickRestTile(e.clientX, e.clientY);
    if (next !== activeIdx) {
      activeIdx = next;
      setTargets(activeIdx >= 0 ? activeIdx : pinnedIdx);
    }
  };
  const onLeave = () => {
    if (activeIdx !== -1) {
      activeIdx = -1;
      setTargets(pinnedIdx);
    }
  };
  const onClick = (e: MouseEvent) => {
    const picked = pickRestTile(e.clientX, e.clientY);
    if (picked < 0) return;
    pinnedIdx = pinnedIdx === picked ? -1 : picked;
    activeIdx = -1;
    setTargets(pinnedIdx);
  };

  svg.addEventListener('pointermove', onMove);
  svg.addEventListener('pointerleave', onLeave);
  svg.addEventListener('click', onClick);

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? true;
      if (!visible && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
        lastT = 0;
      }
    },
    { threshold: 0.05 },
  );
  io.observe(svg);

  updateReadout(-1);
  render();

  return () => {
    disposed = true;
    if (raf) cancelAnimationFrame(raf);
    io.disconnect();
    svg.removeEventListener('pointermove', onMove);
    svg.removeEventListener('pointerleave', onLeave);
    svg.removeEventListener('click', onClick);
    svg.innerHTML = '';
  };
}
