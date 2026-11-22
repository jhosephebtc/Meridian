/**
 * MERIDIAN HAIRLINE FIGURES — hairline-figure.ts
 * Interactive 2:1 rounded-solid SVG figures built on Lucas Marques's Hairline
 * kernel geometry (github.com/lucasmarkes/hairline, MIT) paired with Meridian's
 * Plotter Single-Ink grammar (src/plotter-svg.ts).
 *
 * Implements the 10 Hairline rules:
 *  01. hit      — Hit testing strictly on static rest centers (zero hover flicker)
 *  02. order    — Distance-staggered wave settle outward from focus
 *  03. reach    — Clamped elevation within the 400x320 viewBox frame
 *  04. accent   — Ultra-thin foreground stroke highlight (0.65 / 0.45 / 0.4 non-scaling-stroke)
 *  05. rest     — Designed asymmetric rest composition (never flat)
 *  06. honesty  — Back-to-front painter occlusion with opaque var(--ds-bg) solids
 *  07. cost     — Sleeps idle / offscreen via IntersectionObserver + reduced-motion snap
 *  08. clock    — Spring k=100, c=18, m=1 for continuous pointer response
 *  09. radius   — Silhouette hull of top+base rings + open front-facing inner crease arc
 *  10. quiet    — Wordless SVG canvas; concise external Geist Mono telemetry only
 */

export type HairlinePreset = 'wave' | 'strata' | 'beacon' | 'octaves' | 'switches' | 'riffle' | 'phosphor';

interface RingSample {
  u: number;
  v: number;
  nu: number;
  nv: number;
}

interface IsoSolid {
  r: number;
  c: number;
  cx: number;
  cy: number;
  order: number;
  z0: number;
  zRest: number;
  z: number;
  v: number;
  target: number;
  restX: number;
  restY: number;
  outerRing: RingSample[];
  innerRing: RingSample[];
  coreRing?: RingSample[];
  thickness?: number;
  code?: string;
}

const PRESET_LABEL: Record<HairlinePreset, string> = {
  wave: 'terrain 7×7',
  strata: 'strata 7×1',
  beacon: 'beacon 2:1',
  octaves: 'octaves h7',
  switches: 'buttons 3×2',
  riffle: 'riffle 8×1',
  phosphor: 'phosphor 7×7',
};

const SWITCH_TAGS = ['tokens', 'grain', 'motion', 'plotter', 'hairline', 'gridlines'] as const;

function isoProj(x: number, y: number, z: number, scale = 32, baseY = 178): [number, number] {
  return [200 + (x - y) * scale, baseY + (x + y) * (scale * 0.5) - z * 22];
}

/** Rounded rectangle ring with outward normals (nu, nv) for front-crease extraction. */
function rrectRing(u0: number, v0: number, u1: number, v1: number, r: number, steps = 4): RingSample[] {
  const rad = Math.max(0, Math.min(r, (u1 - u0) / 2, (v1 - v0) / 2));
  const out: RingSample[] = [];
  const corners: Array<[number, number, number]> = [
    [u1 - rad, v1 - rad, 0],
    [u0 + rad, v1 - rad, 90],
    [u0 + rad, v0 + rad, 180],
    [u1 - rad, v0 + rad, 270],
  ];
  for (const [cu, cv, a0] of corners) {
    for (let k = 0; k <= steps; k++) {
      const a = ((a0 + (90 * k) / steps) * Math.PI) / 180;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      out.push({ u: cu + rad * ca, v: cv + rad * sa, nu: ca, nv: sa });
    }
  }
  return out;
}

/** True circular ring with outward normals (nu, nv) — projects to a 3D cylinder under prism. */
function circRing(cx: number, cy: number, R: number, steps = 48): RingSample[] {
  const out: RingSample[] = [];
  for (let k = 0; k < steps; k++) {
    const a = (k / steps) * Math.PI * 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    out.push({ u: cx + R * ca, v: cy + R * sa, nu: ca, nv: sa });
  }
  return out;
}

/** Whether a ring sample faces the viewer in the 2:1 camera (+u/+v toward bottom of screen). */
function isFrontSample(q: RingSample): boolean {
  return (q.nu + q.nv) * Math.SQRT1_2 >= -1e-5;
}

/** Contiguous cyclic run of samples facing the viewer (Rule 09 open front crease). */
function frontRun(ring: RingSample[]): RingSample[] {
  const n = ring.length;
  let start = -1;
  for (let i = 0; i < n; i++) {
    if (isFrontSample(ring[i]) && !isFrontSample(ring[(i + n - 1) % n])) {
      start = i;
      break;
    }
  }
  if (start < 0) return isFrontSample(ring[0]) ? ring.slice() : [];
  const out: RingSample[] = [];
  for (let k = 0; k < n && isFrontSample(ring[(start + k) % n]); k++) {
    out.push(ring[(start + k) % n]);
  }
  return out;
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

function pathClosed(pts: Array<[number, number]>): string {
  if (!pts.length) return '';
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ') + ' Z';
}

function pathOpen(pts: Array<[number, number]>): string {
  if (pts.length < 2) return '';
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
}

function ringAt(ring: RingSample[], z: number, scale: number, baseY: number): Array<[number, number]> {
  return ring.map((q) => isoProj(q.u, q.v, z, scale, baseY));
}

function prismMarkup(
  outerRing: RingSample[],
  innerRing: RingSample[],
  z0: number,
  z1: number,
  scale: number,
  baseY: number,
  strokeW: string,
  creaseOp = '0.26',
  coreRing?: RingSample[],
): string {
  const topPts = ringAt(outerRing, z1, scale, baseY);
  const botPts = ringAt(outerRing, z0, scale, baseY);
  const sil = pathClosed(hull2d(topPts.concat(botPts)));
  const creasePts = ringAt(frontRun(innerRing), z1, scale, baseY);
  const crease = pathOpen(creasePts);
  const core = coreRing ? pathClosed(ringAt(coreRing, z1, scale, baseY)) : '';
  return (
    `<path data-plotter-role="primary" d="${sil}" fill="var(--ds-bg)" stroke="currentColor" stroke-width="${strokeW}" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/>` +
    (crease
      ? `<path data-plotter-role="secondary" d="${crease}" fill="none" stroke="currentColor" stroke-width="0.4" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" opacity="${creaseOp}"/>`
      : '') +
    (core
      ? `<path data-plotter-role="secondary" d="${core}" fill="none" stroke="currentColor" stroke-width="0.4" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" opacity="${creaseOp}"/>`
      : '')
  );
}

function buildSteppedPlinth(
  uHalf: number,
  vHalf: number,
  rad: number,
  zStep1: number,
  zStep2: number,
  scale: number,
  baseY: number,
  extraInnerMarkup = '',
): string {
  const outer1 = rrectRing(-uHalf, -vHalf, uHalf, vHalf, rad, 5);
  const inner1 = rrectRing(-(uHalf - 0.14), -(vHalf - 0.14), uHalf - 0.14, vHalf - 0.14, Math.max(0.08, rad - 0.06), 4);
  const u2 = uHalf - 0.22;
  const v2 = vHalf - 0.22;
  const r2 = Math.max(0.1, rad - 0.08);
  const outer2 = rrectRing(-u2, -v2, u2, v2, r2, 5);
  const inner2 = rrectRing(-(u2 - 0.12), -(v2 - 0.12), u2 - 0.12, v2 - 0.12, Math.max(0.06, r2 - 0.05), 4);
  const well = pathClosed(ringAt(inner2, zStep2, scale, baseY));
  return (
    `<g opacity="0.34">` +
    prismMarkup(outer1, inner1, 0, zStep1, scale, baseY, '0.45', '0.22') +
    `</g>` +
    `<g opacity="0.42">` +
    prismMarkup(outer2, inner2, zStep1, zStep2, scale, baseY, '0.45', '0.24') +
    `<path data-plotter-role="secondary" d="${well}" fill="none" stroke="currentColor" stroke-width="0.4" vector-effect="non-scaling-stroke" opacity="0.18"/>` +
    extraInnerMarkup +
    `</g>`
  );
}

function buildPresetSolids(preset: HairlinePreset): {
  solids: IsoSolid[];
  restLead: number;
  maxReach: number;
  scale: number;
  baseY: number;
  guideMarkup: string;
  trayMarkup?: string;
} {
  const solids: IsoSolid[] = [];

  if (preset === 'wave') {
    // 7x7 (49-pillar) 3D Terrain dune field standing inside a 2-tier stepped 3D architectural plinth
    const N = 7;
    const step = 0.56;
    const scale = 31;
    const baseY = 186;
    const plinthZ = 0.28;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const cx = (c - (N - 1) / 2) * step;
        const cy = (r - (N - 1) / 2) * step;
        const ridge = Math.exp(-((cx + 0.35) ** 2 + (cy + 0.25) ** 2) / 1.65);
        const ripple = Math.cos(cx * 1.35 - cy * 1.15) * 0.16;
        const zRest = plinthZ + 0.18 + 0.68 * ridge + ripple;
        const rc = isoProj(cx, cy, zRest, scale, baseY);
        solids.push({
          r,
          c,
          cx,
          cy,
          order: r + c,
          z0: plinthZ,
          zRest,
          z: zRest,
          v: 0,
          target: zRest,
          restX: rc[0],
          restY: rc[1],
          outerRing: rrectRing(cx - 0.22, cy - 0.22, cx + 0.22, cy + 0.22, 0.085, 3),
          innerRing: rrectRing(cx - 0.15, cy - 0.15, cx + 0.15, cy + 0.15, 0.05, 2),
        });
      }
    }
    const trayMarkup = buildSteppedPlinth(2.34, 2.34, 0.34, 0.15, plinthZ, scale, baseY);
    const axisH = [isoProj(-2.65, 0, 0, scale, baseY), isoProj(2.65, 0, 0, scale, baseY)];
    const axisV = [isoProj(0, -2.65, 0, scale, baseY), isoProj(0, 2.65, 0, scale, baseY)];
    const guideMarkup =
      `<g data-plotter-role="guide" fill="none" stroke="currentColor" stroke-width="0.4" vector-effect="non-scaling-stroke" stroke-dasharray="2 3.5" opacity="0.18">` +
      `<line x1="${axisH[0][0].toFixed(1)}" y1="${axisH[0][1].toFixed(1)}" x2="${axisH[1][0].toFixed(1)}" y2="${axisH[1][1].toFixed(1)}"/>` +
      `<line x1="${axisV[0][0].toFixed(1)}" y1="${axisV[0][1].toFixed(1)}" x2="${axisV[1][0].toFixed(1)}" y2="${axisV[1][1].toFixed(1)}"/>` +
      `</g>`;
    return { solids, restLead: 16, maxReach: 2.15, scale, baseY, guideMarkup, trayMarkup };
  }

  if (preset === 'strata') {
    // 7 terraced architectural plates with concentric core wells over a 3D stepped plinth
    const scale = 30;
    const baseY = 216;
    const plinthZ = 0.24;
    for (let i = 0; i < 7; i++) {
      const zRest = plinthZ + 0.22 + i * 0.34;
      const half = 1.72 - i * 0.14;
      const rad = half * 0.24;
      const rc = isoProj(0, 0, zRest, scale, baseY);
      solids.push({
        r: i,
        c: 0,
        cx: 0,
        cy: 0,
        order: i,
        z0: Math.max(plinthZ, zRest - 0.19),
        zRest,
        z: zRest,
        v: 0,
        target: zRest,
        restX: rc[0],
        restY: rc[1],
        thickness: 0.19,
        outerRing: rrectRing(-half, -half, half, half, rad, 4),
        innerRing: rrectRing(-(half - 0.13), -(half - 0.13), half - 0.13, half - 0.13, Math.max(0.06, rad - 0.06), 3),
        coreRing: circRing(0, 0, Math.max(0.2, half * 0.36), 32),
      });
    }
    const trayMarkup = buildSteppedPlinth(2.22, 2.22, 0.32, 0.12, plinthZ, scale, baseY);
    const axisH = [isoProj(-2.55, 0, 0, scale, baseY), isoProj(2.55, 0, 0, scale, baseY)];
    const axisV = [isoProj(0, -2.55, 0, scale, baseY), isoProj(0, 2.55, 0, scale, baseY)];
    const guideMarkup =
      `<g data-plotter-role="guide" fill="none" stroke="currentColor" stroke-width="0.4" vector-effect="non-scaling-stroke" stroke-dasharray="2 3.5" opacity="0.18">` +
      `<line x1="${axisH[0][0].toFixed(1)}" y1="${axisH[0][1].toFixed(1)}" x2="${axisH[1][0].toFixed(1)}" y2="${axisH[1][1].toFixed(1)}"/>` +
      `<line x1="${axisV[0][0].toFixed(1)}" y1="${axisV[0][1].toFixed(1)}" x2="${axisV[1][0].toFixed(1)}" y2="${axisV[1][1].toFixed(1)}"/>` +
      `<line x1="200" y1="54" x2="200" y2="262"/>` +
      `</g>`;
    return { solids, restLead: 4, maxReach: 3.35, scale, baseY, guideMarkup, trayMarkup };
  }

  if (preset === 'beacon') {
    // 3D plinth deck + 16 radial encoder ticks + 5 concentric 3D cylindrical tower tiers (circRing)
    const scale = 30;
    const baseY = 208;
    const plinthZ = 0.24;
    const tiers: Array<[number, number, number]> = [
      [0.54, 1.56, 0.26],
      [0.96, 1.22, 0.25],
      [1.38, 0.9, 0.24],
      [1.8, 0.6, 0.24],
      [2.24, 0.32, 0.26],
    ];
    tiers.forEach(([zRest, rad, th], i) => {
      const rc = isoProj(0, 0, zRest, scale, baseY);
      solids.push({
        r: i,
        c: 0,
        cx: 0,
        cy: 0,
        order: i,
        z0: Math.max(plinthZ, zRest - th),
        zRest,
        z: zRest,
        v: 0,
        target: zRest,
        restX: rc[0],
        restY: rc[1],
        thickness: th,
        outerRing: circRing(0, 0, rad, 56),
        innerRing: circRing(0, 0, Math.max(0.14, rad - 0.11), 48),
        coreRing: i < 4 ? circRing(0, 0, Math.max(0.12, rad - 0.26), 36) : undefined,
      });
    });
    const dialTicks = Array.from({ length: 16 }, (_, k) => {
      const a = (k / 16) * Math.PI * 2;
      const p0 = isoProj(Math.cos(a) * 1.66, Math.sin(a) * 1.66, plinthZ, scale, baseY);
      const p1 = isoProj(Math.cos(a) * 1.84, Math.sin(a) * 1.84, plinthZ, scale, baseY);
      return `<line data-plotter-role="secondary" x1="${p0[0].toFixed(1)}" y1="${p0[1].toFixed(1)}" x2="${p1[0].toFixed(1)}" y2="${p1[1].toFixed(1)}" stroke="currentColor" stroke-width="0.4" vector-effect="non-scaling-stroke" opacity="0.28"/>`;
    }).join('');
    const trayMarkup = buildSteppedPlinth(2.22, 2.22, 0.36, 0.12, plinthZ, scale, baseY, dialTicks);
    const r0 = isoProj(-2.55, -2.55, 0, scale, baseY);
    const r1 = isoProj(2.55, 2.55, 0, scale, baseY);
    const l0 = isoProj(-2.55, 2.55, 0, scale, baseY);
    const l1 = isoProj(2.55, -2.55, 0, scale, baseY);
    const guideMarkup =
      `<g data-plotter-role="guide" fill="none" stroke="currentColor" stroke-width="0.4" vector-effect="non-scaling-stroke" stroke-dasharray="2 3.5" opacity="0.18">` +
      `<line x1="${r0[0].toFixed(1)}" y1="${r0[1].toFixed(1)}" x2="${r1[0].toFixed(1)}" y2="${r1[1].toFixed(1)}"/>` +
      `<line x1="${l0[0].toFixed(1)}" y1="${l0[1].toFixed(1)}" x2="${l1[0].toFixed(1)}" y2="${l1[1].toFixed(1)}"/>` +
      `<line x1="200" y1="54" x2="200" y2="264"/>` +
      `</g>`;
    return { solids, restLead: 4, maxReach: 3.25, scale, baseY, guideMarkup, trayMarkup };
  }

  if (preset === 'switches') {
    // 2-tier 3D hardware deck + 6 3D cylindrical socket collars + 6 round 3D cylindrical buttons
    const scale = 33;
    const baseY = 188;
    const trayZ = 0.32;
    const collarZ = 0.42;
    let idx = 0;
    const collars: string[] = [];
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const cx = (c - 1) * 1.14;
        const cy = (r - 0.5) * 1.16;
        // 3D cylindrical socket collar surrounding each button well
        collars.push(
          prismMarkup(
            circRing(cx, cy, 0.49, 40),
            circRing(cx, cy, 0.44, 36),
            trayZ,
            collarZ,
            scale,
            baseY,
            '0.45',
            '0.22',
          ),
        );
        const zRest = idx === 2 ? 0.56 : 0.84 + ((r + c) % 2) * 0.08;
        const rc = isoProj(cx, cy, zRest, scale, baseY);
        solids.push({
          r,
          c,
          cx,
          cy,
          order: r * 3 + c,
          z0: collarZ,
          zRest,
          z: zRest,
          v: 0,
          target: zRest,
          restX: rc[0],
          restY: rc[1],
          outerRing: circRing(cx, cy, 0.4, 48),
          innerRing: circRing(cx, cy, 0.3, 40),
          coreRing: circRing(cx, cy, 0.14, 24),
          code: SWITCH_TAGS[idx],
        });
        idx++;
      }
    }
    const trayMarkup = buildSteppedPlinth(2.04, 1.48, 0.32, 0.16, trayZ, scale, baseY, collars.join(''));
    const mid = [isoProj(-2.35, 0, 0, scale, baseY), isoProj(2.35, 0, 0, scale, baseY)];
    const guideMarkup =
      `<g data-plotter-role="guide" fill="none" stroke="currentColor" stroke-width="0.4" vector-effect="non-scaling-stroke" stroke-dasharray="2 3.5" opacity="0.18">` +
      `<line x1="${mid[0][0].toFixed(1)}" y1="${mid[0][1].toFixed(1)}" x2="${mid[1][0].toFixed(1)}" y2="${mid[1][1].toFixed(1)}"/>` +
      `</g>`;
    return { solids, restLead: 2, maxReach: 1.55, scale, baseY, guideMarkup, trayMarkup };
  }

  if (preset === 'riffle') {
    // 8 upright archival dossier cards standing in a slotted 3D plinth tray (Riffle)
    const scale = 31;
    const baseY = 194;
    const plinthZ = 0.28;
    const count = 8;
    const slots: string[] = [];
    for (let i = 0; i < count; i++) {
      const cx = (i - (count - 1) / 2) * 0.48;
      const cy = 0;
      const slotPts = ringAt(rrectRing(cx - 0.14, -1.24, cx + 0.14, 1.24, 0.05, 2), plinthZ, scale, baseY);
      slots.push(
        `<path data-plotter-role="secondary" d="${pathClosed(slotPts)}" fill="none" stroke="currentColor" stroke-width="0.4" vector-effect="non-scaling-stroke" opacity="0.2"/>`,
      );
      const zRest = plinthZ + 0.62 + (i === 3 ? 0.42 : Math.sin(i * 0.7) * 0.14);
      const rc = isoProj(cx, cy, zRest, scale, baseY);
      solids.push({
        r: 0,
        c: i,
        cx,
        cy,
        order: i,
        z0: plinthZ,
        zRest,
        z: zRest,
        v: 0,
        target: zRest,
        restX: rc[0],
        restY: rc[1],
        outerRing: rrectRing(cx - 0.12, -1.16, cx + 0.12, 1.16, 0.06, 3),
        innerRing: rrectRing(cx - 0.07, -1.04, cx + 0.07, 1.04, 0.03, 2),
        code: `vol·0${i + 1}`,
      });
    }
    const trayMarkup = buildSteppedPlinth(2.26, 1.66, 0.3, 0.14, plinthZ, scale, baseY, slots.join(''));
    const axis = [isoProj(-2.55, 0, 0, scale, baseY), isoProj(2.55, 0, 0, scale, baseY)];
    const guideMarkup =
      `<g data-plotter-role="guide" fill="none" stroke="currentColor" stroke-width="0.4" vector-effect="non-scaling-stroke" stroke-dasharray="2 3.5" opacity="0.18">` +
      `<line x1="${axis[0][0].toFixed(1)}" y1="${axis[0][1].toFixed(1)}" x2="${axis[1][0].toFixed(1)}" y2="${axis[1][1].toFixed(1)}"/>` +
      `</g>`;
    return { solids, restLead: 3, maxReach: 2.15, scale, baseY, guideMarkup, trayMarkup };
  }

  if (preset === 'phosphor') {
    // 7x7 (49) 3D cylindrical CRT phosphor emitters seated in a 2-tier 3D screen bezel
    const N = 7;
    const step = 0.54;
    const scale = 31;
    const baseY = 186;
    const plinthZ = 0.28;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const cx = (c - (N - 1) / 2) * step;
        const cy = (r - (N - 1) / 2) * step;
        const dist = Math.hypot(cx, cy);
        const ringWave = Math.cos(dist * 2.1) * 0.22;
        const zRest = plinthZ + 0.24 + Math.max(0, 0.42 - dist * 0.12) + ringWave;
        const rc = isoProj(cx, cy, zRest, scale, baseY);
        solids.push({
          r,
          c,
          cx,
          cy,
          order: r + c,
          z0: plinthZ,
          zRest,
          z: zRest,
          v: 0,
          target: zRest,
          restX: rc[0],
          restY: rc[1],
          outerRing: circRing(cx, cy, 0.2, 28),
          innerRing: circRing(cx, cy, 0.13, 20),
          code: `px ${r + 1}·${c + 1}`,
        });
      }
    }
    const trayMarkup = buildSteppedPlinth(2.28, 2.28, 0.36, 0.14, plinthZ, scale, baseY);
    const d0 = isoProj(-2.55, -2.55, 0, scale, baseY);
    const d1 = isoProj(2.55, 2.55, 0, scale, baseY);
    const guideMarkup =
      `<g data-plotter-role="guide" fill="none" stroke="currentColor" stroke-width="0.4" vector-effect="non-scaling-stroke" stroke-dasharray="2 3.5" opacity="0.18">` +
      `<line x1="${d0[0].toFixed(1)}" y1="${d0[1].toFixed(1)}" x2="${d1[0].toFixed(1)}" y2="${d1[1].toFixed(1)}"/>` +
      `</g>`;
    return { solids, restLead: 24, maxReach: 1.95, scale, baseY, guideMarkup, trayMarkup };
  }

  // 'octaves': stepped 7-octave Gann harmonic resonator bars on a 3D stepped plinth
  const scale = 30;
  const baseY = 192;
  const plinthZ = 0.26;
  for (let i = 0; i < 7; i++) {
    const cx = (i - 3) * 0.52;
    const cy = 0;
    const zRest = plinthZ + 0.28 + Math.abs(Math.sin((i + 1) * 0.68)) * 0.92;
    const rc = isoProj(cx, cy, zRest, scale, baseY);
    solids.push({
      r: 0,
      c: i,
      cx,
      cy,
      order: 10 + i,
      z0: plinthZ,
      zRest,
      z: zRest,
      v: 0,
      target: zRest,
      restX: rc[0],
      restY: rc[1],
      outerRing: rrectRing(cx - 0.21, -1.1, cx + 0.21, 1.1, 0.09, 4),
      innerRing: rrectRing(cx - 0.14, -0.96, cx + 0.14, 0.96, 0.05, 3),
    });
  }
  const trayMarkup = buildSteppedPlinth(2.24, 1.56, 0.28, 0.13, plinthZ, scale, baseY);
  const d0 = isoProj(-2.45, 0, 0, scale, baseY);
  const d1 = isoProj(2.45, 0, 0, scale, baseY);
  const guideMarkup =
    `<g data-plotter-role="guide" fill="none" stroke="currentColor" stroke-width="0.4" vector-effect="non-scaling-stroke" stroke-dasharray="2 3.5" opacity="0.18">` +
    `<line x1="${d0[0].toFixed(1)}" y1="${d0[1].toFixed(1)}" x2="${d1[0].toFixed(1)}" y2="${d1[1].toFixed(1)}"/>` +
    `</g>`;
  return { solids, restLead: 3, maxReach: 2.35, scale, baseY, guideMarkup, trayMarkup };
}

export function mountHairlineFigure(
  svg: SVGSVGElement | null,
  readout?: HTMLElement | null,
  preset: HairlinePreset = 'wave',
): () => void {
  if (!svg) return () => {};
  svg.setAttribute('data-hairline', '');

  const { solids, restLead, maxReach, scale, baseY, guideMarkup, trayMarkup } = buildPresetSolids(preset);
  const drawOrder = solids
    .map((_, i) => i)
    .sort((a, b) => solids[a].order - solids[b].order || solids[a].r - solids[b].r || solids[a].c - solids[b].c);

  let activeIdx = -1;
  let pinnedIdx = -1;
  let raf = 0;
  let visible = true;
  let lastT = 0;
  let disposed = false;

  function render(): void {
    if (!svg) return;
    const lead = activeIdx >= 0 ? activeIdx : pinnedIdx >= 0 ? pinnedIdx : restLead;
    let html = guideMarkup + (trayMarkup ?? '');
    for (const idx of drawOrder) {
      const s = solids[idx];
      const isActive = idx === lead;
      const zBot = s.thickness != null ? Math.max(0.24, s.z - s.thickness) : s.z0;
      const pip = isoProj(s.cx, s.cy, s.z, scale, baseY);
      const gOp = isActive ? '0.92' : '0.34';
      const primaryW = isActive ? '0.65' : '0.45';

      html += `<g opacity="${gOp}">`;
      html += prismMarkup(s.outerRing, s.innerRing, zBot, s.z, scale, baseY, primaryW, isActive ? '0.32' : '0.22', s.coreRing);
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
      readout.textContent = `rest · ${PRESET_LABEL[preset]} · z +${solids[restLead].zRest.toFixed(2)}`;
      return;
    }
    const ft = solids[focusIdx];
    const idLabel =
      preset === 'wave' || preset === 'phosphor'
        ? `cell ${ft.r + 1}·${ft.c + 1}`
        : preset === 'switches'
          ? `key 0${focusIdx + 1} · ${ft.code ?? ''}`
          : ft.code
            ? `${ft.code}`
            : `tier 0${focusIdx + 1}`;
    readout.textContent = `${idLabel} · z +${ft.target.toFixed(2)}`;
  }

  function setTargets(focusIdx: number): void {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ft = focusIdx >= 0 ? solids[focusIdx] : null;
    for (let i = 0; i < solids.length; i++) {
      const t = solids[i];
      if (!ft) {
        t.target = t.zRest;
      } else if (preset === 'switches') {
        const d = Math.hypot(t.c - ft.c, t.r - ft.r);
        t.target = i === focusIdx ? 0.48 : Math.min(maxReach, 0.84 + 0.16 / (1 + d * 0.9));
      } else {
        const d =
          preset === 'wave' || preset === 'phosphor'
            ? Math.hypot(t.c - ft.c, t.r - ft.r)
            : Math.abs(i - focusIdx);
        const lift = Math.min(0.94, 0.94 / (1 + d * d * 0.68));
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
    for (const t of solids) {
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

  function pickRestSolid(clientX: number, clientY: number): number {
    if (!svg) return -1;
    const ctm = svg.getScreenCTM();
    if (!ctm) return -1;
    const inv = ctm.inverse();
    const vx = clientX * inv.a + clientY * inv.c + inv.e;
    const vy = clientX * inv.b + clientY * inv.d + inv.f;
    let best = -1;
    let bestD = 54;
    for (let i = 0; i < solids.length; i++) {
      const d = Math.hypot(vx - solids[i].restX, vy - solids[i].restY);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  }

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    const next = pickRestSolid(e.clientX, e.clientY);
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
    const picked = pickRestSolid(e.clientX, e.clientY);
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
