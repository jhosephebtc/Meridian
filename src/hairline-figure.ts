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

export type HairlinePreset = 'wave' | 'strata' | 'beacon' | 'octaves' | 'switches';

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
  code?: string;
}

const PRESET_LABEL: Record<HairlinePreset, string> = {
  wave: 'crest 4×4',
  strata: 'strata 5×1',
  beacon: 'beacon 2:1',
  octaves: 'octaves h8',
  switches: 'buttons 3×2',
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
): string {
  const topPts = ringAt(outerRing, z1, scale, baseY);
  const botPts = ringAt(outerRing, z0, scale, baseY);
  const sil = pathClosed(hull2d(topPts.concat(botPts)));
  const creasePts = ringAt(frontRun(innerRing), z1, scale, baseY);
  const crease = pathOpen(creasePts);
  return (
    `<path data-plotter-role="primary" d="${sil}" fill="var(--ds-bg)" stroke="currentColor" stroke-width="${strokeW}" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/>` +
    (crease
      ? `<path data-plotter-role="secondary" d="${crease}" fill="none" stroke="currentColor" stroke-width="0.4" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" opacity="${creaseOp}"/>`
      : '')
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
    const scale = 32;
    const baseY = 178;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const cx = c - 1.5;
        const cy = r - 1.5;
        const zRest =
          0.32 +
          0.42 * Math.exp(-((cx + 0.45) ** 2 + (cy + 0.35) ** 2) / 2.2) +
          0.12 * Math.cos(cx * 0.85 - cy * 0.7);
        const rc = isoProj(cx, cy, zRest, scale, baseY);
        solids.push({
          r, c, cx, cy, order: r + c, z0: 0, zRest, z: zRest, v: 0, target: zRest,
          restX: rc[0], restY: rc[1],
          outerRing: rrectRing(cx - 0.41, cy - 0.41, cx + 0.41, cy + 0.41, 0.14, 4),
          innerRing: rrectRing(cx - 0.31, cy - 0.31, cx + 0.31, cy + 0.31, 0.08, 3),
        });
      }
    }
    const baseCorners = [
      isoProj(-2.05, -2.05, 0, scale, baseY),
      isoProj(2.05, -2.05, 0, scale, baseY),
      isoProj(2.05, 2.05, 0, scale, baseY),
      isoProj(-2.05, 2.05, 0, scale, baseY),
    ];
    const axisH = [isoProj(-2.25, 0, 0, scale, baseY), isoProj(2.25, 0, 0, scale, baseY)];
    const axisV = [isoProj(0, -2.25, 0, scale, baseY), isoProj(0, 2.25, 0, scale, baseY)];
    const guideMarkup =
      `<g data-plotter-role="guide" fill="none" stroke="currentColor" stroke-width="0.4" vector-effect="non-scaling-stroke" stroke-dasharray="2 3.5" opacity="0.18">` +
      `<path d="${pathClosed(baseCorners)}"/>` +
      `<line x1="${axisH[0][0].toFixed(1)}" y1="${axisH[0][1].toFixed(1)}" x2="${axisH[1][0].toFixed(1)}" y2="${axisH[1][1].toFixed(1)}"/>` +
      `<line x1="${axisV[0][0].toFixed(1)}" y1="${axisV[0][1].toFixed(1)}" x2="${axisV[1][0].toFixed(1)}" y2="${axisV[1][1].toFixed(1)}"/>` +
      `</g>`;
    return { solids, restLead: 5, maxReach: 1.85, scale, baseY, guideMarkup };
  }

  if (preset === 'strata') {
    const scale = 30;
    const baseY = 212;
    for (let i = 0; i < 5; i++) {
      const zRest = 0.26 + i * 0.46;
      const half = 1.65 - i * 0.18;
      const rc = isoProj(0, 0, zRest, scale, baseY);
      solids.push({
        r: i, c: 0, cx: 0, cy: 0, order: i, z0: Math.max(0, zRest - 0.22), zRest, z: zRest, v: 0, target: zRest,
        restX: rc[0], restY: rc[1],
        outerRing: rrectRing(-half, -half, half, half, half * 0.24, 4),
        innerRing: rrectRing(-(half - 0.14), -(half - 0.14), half - 0.14, half - 0.14, Math.max(0.06, half * 0.24 - 0.08), 3),
      });
    }
    const base = [
      isoProj(-2.1, -2.1, 0, scale, baseY),
      isoProj(2.1, -2.1, 0, scale, baseY),
      isoProj(2.1, 2.1, 0, scale, baseY),
      isoProj(-2.1, 2.1, 0, scale, baseY),
    ];
    const guideMarkup =
      `<g data-plotter-role="guide" fill="none" stroke="currentColor" stroke-width="0.4" vector-effect="non-scaling-stroke" stroke-dasharray="2 3.5" opacity="0.18">` +
      `<path d="${pathClosed(base)}"/>` +
      `<line x1="200" y1="68" x2="200" y2="254"/>` +
      `</g>`;
    return { solids, restLead: 2, maxReach: 2.9, scale, baseY, guideMarkup };
  }

  if (preset === 'beacon') {
    // True circular 3D cylindrical tower tiers (circRing) tapering upward
    const scale = 31;
    const baseY = 204;
    const tiers: Array<[number, number]> = [
      [0.36, 1.62],
      [0.88, 1.18],
      [1.42, 0.78],
      [1.98, 0.44],
    ];
    tiers.forEach(([zRest, rad], i) => {
      const rc = isoProj(0, 0, zRest, scale, baseY);
      solids.push({
        r: i, c: 0, cx: 0, cy: 0, order: i, z0: Math.max(0, zRest - 0.34), zRest, z: zRest, v: 0, target: zRest,
        restX: rc[0], restY: rc[1],
        outerRing: circRing(0, 0, rad, 56),
        innerRing: circRing(0, 0, Math.max(0.18, rad - 0.13), 48),
      });
    });
    const baseOrbit = ringAt(circRing(0, 0, 2.05, 56), 0, scale, baseY);
    const r0 = isoProj(-2.2, -2.2, 0, scale, baseY);
    const r1 = isoProj(2.2, 2.2, 0, scale, baseY);
    const l0 = isoProj(-2.2, 2.2, 0, scale, baseY);
    const l1 = isoProj(2.2, -2.2, 0, scale, baseY);
    const guideMarkup =
      `<g data-plotter-role="guide" fill="none" stroke="currentColor" stroke-width="0.4" vector-effect="non-scaling-stroke" stroke-dasharray="2 3.5" opacity="0.18">` +
      `<path d="${pathClosed(baseOrbit)}"/>` +
      `<line x1="${r0[0].toFixed(1)}" y1="${r0[1].toFixed(1)}" x2="${r1[0].toFixed(1)}" y2="${r1[1].toFixed(1)}"/>` +
      `<line x1="${l0[0].toFixed(1)}" y1="${l0[1].toFixed(1)}" x2="${l1[0].toFixed(1)}" y2="${l1[1].toFixed(1)}"/>` +
      `<line x1="200" y1="62" x2="200" y2="262"/>` +
      `</g>`;
    return { solids, restLead: 3, maxReach: 2.95, scale, baseY, guideMarkup };
  }

  if (preset === 'switches') {
    // 3D hardware deck tray + 6 ROUND cylindrical tactile buttons (circRing)
    const scale = 33;
    const baseY = 186;
    const trayZ = 0.28;
    let idx = 0;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const cx = (c - 1) * 1.14;
        const cy = (r - 0.5) * 1.16;
        // Rest pose: button 3 sits latched deeper, others stand proud as cylindrical plungers
        const zRest = idx === 2 ? 0.48 : 0.72 + ((r + c) % 2) * 0.08;
        const rc = isoProj(cx, cy, zRest, scale, baseY);
        solids.push({
          r, c, cx, cy, order: r * 3 + c, z0: trayZ, zRest, z: zRest, v: 0, target: zRest,
          restX: rc[0], restY: rc[1],
          outerRing: circRing(cx, cy, 0.42, 48),
          innerRing: circRing(cx, cy, 0.31, 40),
          code: SWITCH_TAGS[idx],
        });
        idx++;
      }
    }
    const trayOuter = rrectRing(-1.82, -1.24, 1.82, 1.24, 0.28, 5);
    const trayInner = rrectRing(-1.68, -1.1, 1.68, 1.1, 0.2, 4);
    const trayMarkup =
      `<g opacity="0.38">` +
      prismMarkup(trayOuter, trayInner, 0, trayZ, scale, baseY, '0.45', '0.22') +
      `</g>`;
    const mid = [isoProj(-2.05, 0, 0, scale, baseY), isoProj(2.05, 0, 0, scale, baseY)];
    const guideMarkup =
      `<g data-plotter-role="guide" fill="none" stroke="currentColor" stroke-width="0.4" vector-effect="non-scaling-stroke" stroke-dasharray="2 3.5" opacity="0.18">` +
      `<line x1="${mid[0][0].toFixed(1)}" y1="${mid[0][1].toFixed(1)}" x2="${mid[1][0].toFixed(1)}" y2="${mid[1][1].toFixed(1)}"/>` +
      `</g>`;
    return { solids, restLead: 2, maxReach: 1.45, scale, baseY, guideMarkup, trayMarkup };
  }

  // 'octaves': stepped 5-octave Gann harmonic bars
  const scale = 30;
  const baseY = 188;
  for (let i = 0; i < 5; i++) {
    const cx = (i - 2) * 0.66;
    const cy = -(i - 2) * 0.28;
    const zRest = 0.34 + Math.abs(Math.sin((i + 1) * 0.72)) * 0.96;
    const rc = isoProj(cx, cy, zRest, scale, baseY);
    solids.push({
      r: 0, c: i, cx, cy, order: 10 + i, z0: 0, zRest, z: zRest, v: 0, target: zRest,
      restX: rc[0], restY: rc[1],
      outerRing: rrectRing(cx - 0.3, cy - 0.9, cx + 0.3, cy + 0.9, 0.12, 4),
      innerRing: rrectRing(cx - 0.21, cy - 0.78, cx + 0.21, cy + 0.78, 0.06, 3),
    });
  }
  const d0 = isoProj(-2.05, 1.35, 0, scale, baseY);
  const d1 = isoProj(2.05, -1.35, 0, scale, baseY);
  const guideMarkup =
    `<g data-plotter-role="guide" fill="none" stroke="currentColor" stroke-width="0.4" vector-effect="non-scaling-stroke" stroke-dasharray="2 3.5" opacity="0.18">` +
    `<line x1="${d0[0].toFixed(1)}" y1="${d0[1].toFixed(1)}" x2="${d1[0].toFixed(1)}" y2="${d1[1].toFixed(1)}"/>` +
    `<line x1="48" y1="188" x2="352" y2="188"/>` +
    `</g>`;
  return { solids, restLead: 2, maxReach: 2.35, scale, baseY, guideMarkup };
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
      const zBot = preset === 'strata' || preset === 'beacon' ? Math.max(0, s.z - 0.26) : s.z0;
      const pip = isoProj(s.cx, s.cy, s.z, scale, baseY);
      const gOp = isActive ? '0.92' : '0.32';
      const primaryW = isActive ? '0.65' : '0.45';

      html += `<g opacity="${gOp}">`;
      html += prismMarkup(s.outerRing, s.innerRing, zBot, s.z, scale, baseY, primaryW, isActive ? '0.32' : '0.22');
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
      preset === 'wave'
        ? `cell ${ft.r + 1}·${ft.c + 1}`
        : ft.code
          ? `key 0${focusIdx + 1} · ${ft.code}`
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
        t.target = i === focusIdx ? 0.36 : Math.min(maxReach, 0.72 + 0.14 / (1 + d * 0.9));
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
    let bestD = preset === 'wave' ? 32 : preset === 'switches' ? 38 : 44;
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
