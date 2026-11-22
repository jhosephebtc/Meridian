/**
 * MERIDIAN HAIRLINE FIGURES — hairline-figure.ts
 * Interactive 2:1 isometric rounded-solid SVG figures built to work in concert
 * with Meridian's Plotter grammar (src/plotter-svg.ts) and Single-Ink surfaces.
 *
 * Follows Lucas Marques's Hairline 10 rules (github.com/lucasmarkes/hairline, MIT):
 *  01. hit      — Hit testing strictly on static rest centers (zero hover flicker)
 *  02. order    — Distance-staggered wave settle outward from focus
 *  03. reach    — Clamped elevation within the 400x320 2:1 viewBox frame
 *  04. accent   — Single foreground stroke highlight; zero fills/glows/blurs
 *  05. rest     — Designed asymmetric rest composition (never flat)
 *  06. honesty  — Back-to-front painter occlusion with opaque var(--ds-bg) plates
 *  07. cost     — Sleeps idle / offscreen via IntersectionObserver + reduced-motion snap
 *  08. clock    — Spring k=100, c=18, m=1 for continuous pointer response
 *  09. radius   — Rounded ring hull without vertical box corners + 1 dim inner crease
 *  10. quiet    — Wordless SVG canvas; concise external Geist Mono telemetry only
 */

export type HairlinePreset = 'wave' | 'strata' | 'beacon' | 'octaves';

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
}

const PRESET_LABEL: Record<HairlinePreset, string> = {
  wave: 'crest 4×4',
  strata: 'strata 5×1',
  beacon: 'beacon 2:1',
  octaves: 'octaves h8',
};

function isoProj(x: number, y: number, z: number, scale = 32, baseY = 178): [number, number] {
  return [200 + (x - y) * scale, baseY + (x + y) * (scale * 0.5) - z * 22];
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

function buildPresetTiles(preset: HairlinePreset): { tiles: IsoTile[]; restLead: number; maxReach: number; guideMarkup: string } {
  const tiles: IsoTile[] = [];

  if (preset === 'wave') {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const cx = c - 1.5;
        const cy = r - 1.5;
        const zRest =
          0.28 +
          0.38 * Math.exp(-((cx + 0.45) ** 2 + (cy + 0.35) ** 2) / 2.2) +
          0.12 * Math.cos(cx * 0.85 - cy * 0.7);
        const rc = isoProj(cx, cy, zRest);
        tiles.push({
          r, c, cx, cy, order: r + c, zRest, z: zRest, v: 0, target: zRest,
          restX: rc[0], restY: rc[1],
          outerPts: roundedTile(cx, cy, 0.42, 0.42, 0.13, 3),
          innerPts: roundedTile(cx, cy, 0.28, 0.28, 0.08, 2),
        });
      }
    }
    const baseCorners = [isoProj(-2.05, -2.05, 0), isoProj(2.05, -2.05, 0), isoProj(2.05, 2.05, 0), isoProj(-2.05, 2.05, 0)];
    const axisH = [isoProj(-2.25, 0, 0), isoProj(2.25, 0, 0)];
    const axisV = [isoProj(0, -2.25, 0), isoProj(0, 2.25, 0)];
    const guideMarkup =
      `<g data-plotter-role="guide" fill="none" stroke="currentColor" stroke-width="0.9" stroke-dasharray="3 4" opacity="0.24">` +
      `<path d="${pathFromPts(baseCorners)}"/>` +
      `<line x1="${axisH[0][0].toFixed(1)}" y1="${axisH[0][1].toFixed(1)}" x2="${axisH[1][0].toFixed(1)}" y2="${axisH[1][1].toFixed(1)}"/>` +
      `<line x1="${axisV[0][0].toFixed(1)}" y1="${axisV[0][1].toFixed(1)}" x2="${axisV[1][0].toFixed(1)}" y2="${axisV[1][1].toFixed(1)}"/>` +
      `</g>`;
    return { tiles, restLead: 5, maxReach: 1.85, guideMarkup };
  }

  if (preset === 'strata') {
    for (let i = 0; i < 5; i++) {
      const zRest = 0.24 + i * 0.46;
      const half = 1.65 - i * 0.18;
      const rc = isoProj(0, 0, zRest, 30, 212);
      tiles.push({
        r: i, c: 0, cx: 0, cy: 0, order: i, zRest, z: zRest, v: 0, target: zRest,
        restX: rc[0], restY: rc[1],
        outerPts: roundedTile(0, 0, half, half, half * 0.24, 3),
        innerPts: roundedTile(0, 0, half * 0.72, half * 0.72, half * 0.16, 2),
      });
    }
    const base = [isoProj(-2.1, -2.1, 0, 30, 212), isoProj(2.1, -2.1, 0, 30, 212), isoProj(2.1, 2.1, 0, 30, 212), isoProj(-2.1, 2.1, 0, 30, 212)];
    const guideMarkup =
      `<g data-plotter-role="guide" fill="none" stroke="currentColor" stroke-width="0.9" stroke-dasharray="3 4" opacity="0.24">` +
      `<path d="${pathFromPts(base)}"/>` +
      `<line x1="200" y1="68" x2="200" y2="254"/>` +
      `</g>`;
    return { tiles, restLead: 2, maxReach: 2.9, guideMarkup };
  }

  if (preset === 'beacon') {
    const coords: Array<[number, number, number, number]> = [
      [0, 0, 0.34, 1.55],
      [0, 0, 0.88, 1.15],
      [0, 0, 1.44, 0.76],
      [0, 0, 2.02, 0.42],
    ];
    coords.forEach(([cx, cy, zRest, half], i) => {
      const rc = isoProj(cx, cy, zRest, 31, 206);
      tiles.push({
        r: i, c: 0, cx, cy, order: i, zRest, z: zRest, v: 0, target: zRest,
        restX: rc[0], restY: rc[1],
        outerPts: roundedTile(cx, cy, half, half, half * 0.32, 4),
        innerPts: roundedTile(cx, cy, half * 0.68, half * 0.68, half * 0.2, 3),
      });
    });
    const r0 = isoProj(-2.15, -2.15, 0, 31, 206);
    const r1 = isoProj(2.15, 2.15, 0, 31, 206);
    const l0 = isoProj(-2.15, 2.15, 0, 31, 206);
    const l1 = isoProj(2.15, -2.15, 0, 31, 206);
    const guideMarkup =
      `<g data-plotter-role="guide" fill="none" stroke="currentColor" stroke-width="0.9" stroke-dasharray="3 4" opacity="0.24">` +
      `<line x1="${r0[0].toFixed(1)}" y1="${r0[1].toFixed(1)}" x2="${r1[0].toFixed(1)}" y2="${r1[1].toFixed(1)}"/>` +
      `<line x1="${l0[0].toFixed(1)}" y1="${l0[1].toFixed(1)}" x2="${l1[0].toFixed(1)}" y2="${l1[1].toFixed(1)}"/>` +
      `<line x1="200" y1="62" x2="200" y2="262"/>` +
      `</g>`;
    return { tiles, restLead: 3, maxReach: 2.95, guideMarkup };
  }

  // 'octaves': stepped 5-octave Gann harmonic bars
  for (let i = 0; i < 5; i++) {
    const cx = (i - 2) * 0.66;
    const cy = -(i - 2) * 0.28;
    const zRest = 0.32 + Math.abs(Math.sin((i + 1) * 0.72)) * 0.96;
    const rc = isoProj(cx, cy, zRest, 30, 188);
    tiles.push({
      r: 0, c: i, cx, cy, order: 10 + i, zRest, z: zRest, v: 0, target: zRest,
      restX: rc[0], restY: rc[1],
      outerPts: roundedTile(cx, cy, 0.31, 0.92, 0.11, 3),
      innerPts: roundedTile(cx, cy, 0.19, 0.72, 0.06, 2),
    });
  }
  const d0 = isoProj(-2.05, 1.35, 0, 30, 188);
  const d1 = isoProj(2.05, -1.35, 0, 30, 188);
  const guideMarkup =
    `<g data-plotter-role="guide" fill="none" stroke="currentColor" stroke-width="0.9" stroke-dasharray="3 4" opacity="0.24">` +
    `<line x1="${d0[0].toFixed(1)}" y1="${d0[1].toFixed(1)}" x2="${d1[0].toFixed(1)}" y2="${d1[1].toFixed(1)}"/>` +
    `<line x1="48" y1="188" x2="352" y2="188"/>` +
    `</g>`;
  return { tiles, restLead: 2, maxReach: 2.35, guideMarkup };
}

export function mountHairlineFigure(
  svg: SVGSVGElement | null,
  readout?: HTMLElement | null,
  preset: HairlinePreset = 'wave',
): () => void {
  if (!svg) return () => {};
  const scale = preset === 'wave' ? 32 : preset === 'strata' ? 30 : preset === 'beacon' ? 31 : 30;
  const baseY = preset === 'wave' ? 178 : preset === 'strata' ? 212 : preset === 'beacon' ? 206 : 188;

  const { tiles, restLead, maxReach, guideMarkup } = buildPresetTiles(preset);
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
      const zBot = preset === 'strata' || preset === 'beacon' ? Math.max(0, tile.z - 0.24) : 0;
      const botPts = tile.outerPts.map(([x, y]) => isoProj(x, y, zBot, scale, baseY));
      const topPts = tile.outerPts.map(([x, y]) => isoProj(x, y, tile.z, scale, baseY));
      const hull = hull2d(topPts.concat(botPts));
      const creasePts = tile.innerPts.map(([x, y]) => isoProj(x, y, tile.z, scale, baseY));
      const pip = isoProj(tile.cx, tile.cy + (preset === 'wave' ? 0.14 : 0), tile.z, scale, baseY);
      const gOp = isActive ? '1' : '0.44';

      html += `<g opacity="${gOp}">`;
      html += `<path data-plotter-role="primary" d="${pathFromPts(hull)}" fill="var(--ds-bg)" stroke="currentColor" stroke-width="${isActive ? '1.35' : '1.05'}" stroke-linejoin="round"/>`;
      html += `<path data-plotter-role="secondary" d="${pathFromPts(creasePts)}" fill="none" stroke="currentColor" stroke-width="0.9" opacity="0.46"/>`;
      if (isActive) {
        html += `<circle data-plotter-role="primary" cx="${pip[0].toFixed(1)}" cy="${pip[1].toFixed(1)}" r="2" fill="currentColor"/>`;
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
    const idLabel = preset === 'wave' ? `cell ${ft.r + 1}·${ft.c + 1}` : `tier 0${focusIdx + 1}`;
    readout.textContent = `${idLabel} · z +${ft.target.toFixed(2)}`;
  }

  function setTargets(focusIdx: number): void {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ft = focusIdx >= 0 ? tiles[focusIdx] : null;
    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[i];
      if (!ft) {
        t.target = t.zRest;
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
    let bestD = preset === 'wave' ? 32 : 44;
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
