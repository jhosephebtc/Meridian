/**
 * MERIDIAN DESIGN SYSTEM — plotter-svg.ts (v1.3.0)
 * Gramática Visual de Blueprints SVG & Globo Ortográfico 81k (100% TypeScript · Zero Deps)
 *
 * Linhagem:
 *  • Plotter (`gramática plotter`) — 1 tinta (`currentColor`), 1 espessura (`1`),
 *    hierarquia estrita por opacidade e tracejado semântico (`data-plotter-role`),
 *    formas transparentes (`fill="none"`), setas de 6 unidades a 45°, hachura a -45° (pitch 12),
 *    rótulos discretos sem stroke (0.72 nomes / 0.50 valores).
 *  • globo pontilhado Meridian (`anthropic.com/features/81k-interviews`) — globo editorial
 *    pontilhado em projeção ortográfica com rotas/transferências e leitura limpa sobre papel.
 *
 * Portabilidade: retorna strings SVG editáveis puras (Web) ou estruturas de geometria tipadas
 * prontas para `react-native-svg` no iOS/Android.
 */

export type PlotterRole =
  | 'primary'
  | 'secondary'
  | 'dimension'
  | 'leader'
  | 'guide'
  | 'grid'
  | 'hatch'
  | 'section'
  | 'centerline'
  | 'hidden'
  | 'absent'
  | 'proposed'
  | 'transfer';

export interface PlotterRoleSpec {
  readonly strokeWidth: number;
  readonly opacity: number;
  readonly dash: string;
  readonly description: string;
}

export interface Point2D {
  readonly x: number;
  readonly y: number;
}

export interface ProjectedPoint3D {
  readonly x: number;
  readonly y: number;
  readonly z: number; // > 0 = hemisfério visível
  readonly visible: boolean;
}

export const PLOTTER_STANDARDS = {
  canonicalCanvas: { width: 560, height: 440 },
  strokeUnit: 1,
  highlightFillOpacity: 0.055,
  guideClearance: 8,
  arrow: { legLength: 6, angleDeg: 45 },
  dimension: { slashExtent: 8, labelClearance: 3 },
  hatch: { edgePitch: 12, angleDeg: -45 },
  label: {
    sizeMin: 10,
    sizeMax: 12,
    weight: 400,
    nameOpacity: 0.72,
    valueOpacity: 0.50,
  },
} as const;

/** Tabela oficial de 13 papéis semânticos do Plotter (`standard.json`) */
export const PLOTTER_ROLES: Record<PlotterRole, PlotterRoleSpec> = {
  primary:    { strokeWidth: 1, opacity: 1.00, dash: 'none',      description: 'Forma principal ou rota funcional selecionada' },
  section:    { strokeWidth: 1, opacity: 1.00, dash: 'none',      description: 'Corte de seção atravessado pelo plano' },
  secondary:  { strokeWidth: 1, opacity: 0.32, dash: 'none',      description: 'Detalhe subordinado real' },
  dimension:  { strokeWidth: 1, opacity: 0.32, dash: 'none',      description: 'Cota dimensional e linhas de chamada' },
  leader:     { strokeWidth: 1, opacity: 0.32, dash: 'none',      description: 'Linha de chamada (callout) ligando rótulo ao elemento' },
  hatch:      { strokeWidth: 1, opacity: 0.18, dash: 'none',      description: 'Hachura diagonal -45° (pitch 12) dentro de região delimitada' },
  guide:      { strokeWidth: 1, opacity: 0.14, dash: 'none',      description: 'Projeção de alinhamento e referência (para 8u antes do contorno)' },
  grid:       { strokeWidth: 1, opacity: 0.06, dash: 'none',      description: 'Malha modular de coordenadas' },
  centerline: { strokeWidth: 1, opacity: 0.14, dash: '8 3 1 3',   description: 'Eixo de simetria, equador, meridiano central ou locus' },
  hidden:     { strokeWidth: 1, opacity: 0.32, dash: '3 5',       description: 'Geometria oculta (hemisfério posterior / canal interno)' },
  absent:     { strokeWidth: 1, opacity: 0.32, dash: '3 5',       description: 'Elemento ausente no estado atual' },
  proposed:   { strokeWidth: 1, opacity: 0.32, dash: '3 5',       description: 'Forma proposta ou projeção futura' },
  transfer:   { strokeWidth: 1, opacity: 0.32, dash: '4 6',       description: 'Movimento, órbita ou transferência (com seta aberta sólida)' },
} as const;

/* ==========================================================================
   1. PRIMITIVAS GEOMÉTRICAS PLOTTER (Setas 6u/45°, Cotas Verdadeiras, Hachura)
   ========================================================================== */

/** Gera caminho SVG de seta aberta sólida (2 pernas de 6u a 45° — regra Plotter) */
export function plotterArrowheadPath(tip: Point2D, directionRad: number, leg = 6): string {
  const spread = (45 * Math.PI) / 180;
  const a1 = directionRad + Math.PI - spread;
  const a2 = directionRad + Math.PI + spread;
  const x1 = tip.x + Math.cos(a1) * leg;
  const y1 = tip.y + Math.sin(a1) * leg;
  const x2 = tip.x + Math.cos(a2) * leg;
  const y2 = tip.y + Math.sin(a2) * leg;
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${tip.x.toFixed(1)} ${tip.y.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}`;
}

/** Rótulo discreto padrão Plotter (stroke="none", peso 400, 0.72 nome / 0.50 valor) */
export function plotterLabelSvg(
  x: number,
  y: number,
  text: string,
  kind: 'name' | 'value' = 'name',
  anchor: 'start' | 'middle' | 'end' = 'start'
): string {
  const op = kind === 'name' ? PLOTTER_STANDARDS.label.nameOpacity : PLOTTER_STANDARDS.label.valueOpacity;
  const size = kind === 'name' ? 11 : 10.5;
  return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" stroke="none" fill="currentColor" fill-opacity="${op}" font-family="Geist, var(--ds-font-sans), sans-serif" font-size="${size}" font-weight="400">${text}</text>`;
}

/** Cota dimensional verdadeira com folga limpa ao redor do valor (nunca atravessa o texto!) */
export function plotterHorizontalDimensionSvg(
  x1: number,
  x2: number,
  y: number,
  label: string,
  labelHalfWidth = 22
): string {
  const mid = (x1 + x2) * 0.5;
  const gap = labelHalfWidth + PLOTTER_STANDARDS.dimension.labelClearance;
  const s = PLOTTER_STANDARDS.dimension.slashExtent * 0.5;
  const parts: string[] = [];
  if (mid - gap > x1 + 4) {
    parts.push(`<line x1="${x1.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(mid - gap).toFixed(1)}" y2="${y.toFixed(1)}" data-plotter-role="dimension"/>`);
    parts.push(`<line x1="${(mid + gap).toFixed(1)}" y1="${y.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y.toFixed(1)}" data-plotter-role="dimension"/>`);
  }
  // Traços diagonais de 8u nas extremidades
  parts.push(`<line x1="${(x1 - s).toFixed(1)}" y1="${(y + s).toFixed(1)}" x2="${(x1 + s).toFixed(1)}" y2="${(y - s).toFixed(1)}" data-plotter-role="dimension"/>`);
  parts.push(`<line x1="${(x2 - s).toFixed(1)}" y1="${(y + s).toFixed(1)}" x2="${(x2 + s).toFixed(1)}" y2="${(y - s).toFixed(1)}" data-plotter-role="dimension"/>`);
  parts.push(plotterLabelSvg(mid, y + 3.5, label, 'value', 'middle'));
  return parts.join('');
}

/* ==========================================================================
   2. PROJEÇÃO ORTOGRÁFICA 3D → 2D PARA O GLOBO PONTILHADO (81k + Plotter)
   ========================================================================== */

export function projectOrthographic(
  latDeg: number,
  lonDeg: number,
  rotLonDeg: number,
  tiltLatDeg: number,
  cx: number,
  cy: number,
  radius: number
): ProjectedPoint3D {
  const lat = (latDeg * Math.PI) / 180;
  const lon = ((lonDeg - rotLonDeg) * Math.PI) / 180;
  const tilt = (tiltLatDeg * Math.PI) / 180;

  const cosLat = Math.cos(lat);
  const sinLat = Math.sin(lat);
  const cosLon = Math.cos(lon);
  const sinLon = Math.sin(lon);

  const x = cx + radius * cosLat * sinLon;
  const y = cy - radius * (Math.cos(tilt) * sinLat - Math.sin(tilt) * cosLat * cosLon);
  const z = Math.sin(tilt) * sinLat + Math.cos(tilt) * cosLat * cosLon;

  return { x, y, z, visible: z >= 0 };
}

/**
 * Aproximação paramétrica refinada dos continentes para pontilhado cartográfico 81k
 * (malha de alta densidade em micro-pontos — 100% procedural, zero GeoJSON pesado).
 */
export function isLandApprox(lat: number, lon: number): boolean {
  // América do Norte + Alasca + México/América Central + Cuba/Caribe
  if (lat > 10 && lat < 72 && lon > -168 && lon < -52) {
    if (lat > 54 && lon > -166 && lon < -130) return true; // Alasca
    if (lat > 49 && lat < 69 && lon >= -130 && lon < -60 && !(lat > 55 && lat < 63 && lon > -94 && lon < -77)) return true; // Canadá (excl. Baía de Hudson)
    if (lat >= 25 && lat <= 49 && lon > -125 && lon < -67 && !(lat < 31 && lon > -82 && lon < -70)) return true; // EUA contínuo
    if (lat >= 15 && lat < 29 && lon > -114 && lon < -87 && lon < -76 - (lat - 14) * 1.15) return true; // México
    if (lat >= 8 && lat < 16 && lon > -92 && lon < -77 && Math.abs(lon - (-90 + (15 - lat) * 1.8)) < 3.5) return true; // Istmo Central
    if (lat > 19.5 && lat < 23.2 && lon > -85 && lon < -74) return true; // Cuba
  }
  // Groenlândia & Islândia
  if (lat > 60 && lat < 83 && lon > -56 && lon < -16 && !(lat > 72 && lon < -44)) return true;
  if (lat > 63.3 && lat < 66.6 && lon > -24.5 && lon < -13.5) return true;
  // América do Sul
  if (lat > -55 && lat < 12.5 && lon > -82 && lon < -34.5) {
    const centerLon = lat > -6 ? -62 - (lat + 6) * 0.45 : -58 + (-6 - lat) * 0.14;
    const halfWidth =
      lat > 0 ? 11 : lat > -16 ? 18 + (lat + 16) * 0.35 : Math.max(2.6, 17.5 - (-16 - lat) * 0.38);
    if (Math.abs(lon - centerLon) < halfWidth) return true;
  }
  // Europa + Reino Unido + Escandinávia + Itália + Ibéria
  if (lat > 36 && lat < 71 && lon > -10 && lon < 44) {
    if (lat < 44 && lon > -9.5 && lon < 3.5) return true; // Ibéria
    if (lat >= 38 && lat < 46.5 && lon > 7.5 && lon < 18.5) return true; // Itália/Bálcãs
    if (lat >= 43 && lat < 55.5 && lon > -5 && lon < 44) return true; // Europa Central/Leste
    if (lat >= 55.5 && lon > 5 && lon < 32) return true; // Escandinávia
  }
  if (lat > 50 && lat < 59 && lon > -10 && lon < 2) return true; // Ilhas Britânicas
  // África + Madagascar
  if (lat > -35 && lat < 37 && lon > -18 && lon < 52) {
    if (lat > 5 && lat < 36 && lon > -17 && lon < 35) return true; // Norte/Sahel
    if (lat >= 2 && lat <= 13 && lon >= 35 && lon < 51 - (13 - lat) * 0.5) return true; // Chifre da África
    if (lat <= 5 && lon > 9 && lon < 41 - (-lat) * 0.42) return true; // África Austral
  }
  if (lat > -25.6 && lat < -12 && lon > 43 && lon < 50.5) return true; // Madagascar
  // Oriente Médio & Ásia + Índia + Sudeste + Japão + Indonésia
  if (lat > -9 && lat < 75 && lon >= 34 && lon < 148) {
    if (lat > 13 && lat < 33 && lon >= 35 && lon < 59 && !(lat < 20 && lon < 41)) return true; // Península Arábica
    if (lat >= 24 && lon >= 44 && lon < 142 && !(lat > 62 && lon > 135)) return true; // Ásia Continental / Sibéria
    if (lat > 8 && lat <= 24 && lon > 68 && lon < 87 && Math.abs(lon - 77.5) < (lat - 5) * 0.62) return true; // Índia
    if (lat > 9 && lat <= 24 && lon > 93 && lon < 109) return true; // Indochina
    if (lat > 31 && lat < 45 && lon > 129 && lon < 145) return true; // Japão
    if (lat > -8.5 && lat < 7 && lon > 96 && lon < 140 && Math.sin(lat * 0.7 + lon * 0.22) > 0.05) return true; // Arquipélago Malaio
  }
  // Austrália + Nova Zelândia
  if (lat > -39 && lat < -11.5 && lon > 113.5 && lon < 153.5 && !(lat < -32 && lon > 126 && lon < 134)) return true;
  if (lat > -46.5 && lat < -34.5 && lon > 166 && lon < 178.5) return true;
  return false;
}

export interface GlobeStation {
  readonly id: string;
  readonly name: string;
  readonly lat: number;
  readonly lon: number;
  readonly metric: string;
}

export const DEFAULT_EARTH_STATIONS: readonly GlobeStation[] = [
  { id: 'sp',  name: 'São Paulo',  lat: -23.55, lon: -46.63, metric: 'AQI 26 · 23°C' },
  { id: 'sf',  name: 'S. Francisco', lat: 37.77, lon: -122.41, metric: 'AQI 19 · 17°C' },
  { id: 'ldn', name: 'Londres',    lat: 51.50,  lon: -0.12,  metric: 'AQI 22 · 11°C' },
  { id: 'tky', name: 'Tóquio',     lat: 35.68,  lon: 139.69, metric: 'AQI 31 · 15°C' },
  { id: 'lag', name: 'Lagos',      lat: 6.52,   lon: 3.37,   metric: 'AQI 44 · 29°C' },
];

export interface PlottedGlobeOptions {
  width?: number;
  height?: number;
  rotLonDeg?: number;
  tiltLatDeg?: number;
  dotStepDeg?: number;
  isolateRole?: PlotterRole | 'all';
  stations?: readonly GlobeStation[];
}

/**
 * Renderiza o Globo Ortográfico Pontilhado (malha pontilhada) seguindo integralmente
 * a gramática visual do Plotter (`data-plotter`, `data-plotter-role`, 1-unit ink).
 */
export function renderPlottedGlobeSvg(opts: PlottedGlobeOptions = {}): string {
  const W = opts.width ?? 560;
  const H = opts.height ?? 440;
  const cx = W * 0.5;
  const cy = H * 0.49;
  const R = Math.min(W, H) * 0.37;
  const rotLon = opts.rotLonDeg ?? -48;
  const tiltLat = opts.tiltLatDeg ?? 16;
  const step = opts.dotStepDeg ?? 2.8;
  const stations = opts.stations ?? DEFAULT_EARTH_STATIONS;

  const els: string[] = [];

  // 1. Eixos ortogonais externos sólidos + fundo Hairline translúcido da esfera
  const ext = 26;
  const ringR = R + 16;
  els.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${ringR.toFixed(1)}" fill="var(--ds-surface-1)" fill-opacity="0.45" stroke="none"/>`);
  els.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${R.toFixed(1)}" fill="var(--ds-surface-2)" fill-opacity="0.62" stroke="none"/>`);
  els.push(`<circle cx="${(cx - R * 0.14).toFixed(1)}" cy="${(cy - R * 0.14).toFixed(1)}" r="${(R * 0.76).toFixed(1)}" fill="var(--ds-bg)" fill-opacity="0.38" stroke="none"/>`);

  els.push(`<line x1="${(cx - R - ext).toFixed(1)}" y1="${cy.toFixed(1)}" x2="${(cx - R - 5).toFixed(1)}" y2="${cy.toFixed(1)}" data-plotter-role="secondary" stroke-opacity="0.34" fill="none"/>`);
  els.push(`<line x1="${(cx + R + 5).toFixed(1)}" y1="${cy.toFixed(1)}" x2="${(cx + R + ext).toFixed(1)}" y2="${cy.toFixed(1)}" data-plotter-role="secondary" stroke-opacity="0.34" fill="none"/>`);
  els.push(`<line x1="${cx.toFixed(1)}" y1="${(cy - R - ext).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${(cy - R - 5).toFixed(1)}" data-plotter-role="secondary" stroke-opacity="0.34" fill="none"/>`);
  els.push(`<line x1="${cx.toFixed(1)}" y1="${(cy + R + 5).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${(cy + R + ext).toFixed(1)}" data-plotter-role="secondary" stroke-opacity="0.34" fill="none"/>`);

  // 2. Limbo orbital externo sólido + escalas azimutais a cada 15° (Plotter × Hairline)
  els.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${ringR.toFixed(1)}" data-plotter-role="guide" fill="none"/>`);
  for (let deg = 0; deg < 360; deg += 15) {
    const a = (deg * Math.PI) / 180;
    const major = deg % 45 === 0;
    const r0 = ringR - (major ? 4 : 2);
    const r1 = ringR + (major ? 4 : 2);
    els.push(
      `<line x1="${(cx + Math.cos(a) * r0).toFixed(1)}" y1="${(cy + Math.sin(a) * r0).toFixed(1)}" x2="${(cx + Math.cos(a) * r1).toFixed(1)}" y2="${(cy + Math.sin(a) * r1).toFixed(1)}" data-plotter-role="${major ? 'secondary' : 'guide'}" fill="none"/>`,
    );
  }

  // 3. Paralelos e meridianos frontais sólidos (Equador & Greenwich em secondary; grade em guide)
  for (const lat of [-60, -30, 0, 30, 60]) {
    let frontPts: string[] = [];
    const role = lat === 0 ? 'secondary' : 'guide';
    for (let lon = -180; lon <= 180; lon += 5) {
      const p = projectOrthographic(lat, lon, rotLon, tiltLat, cx, cy, R);
      if (p.visible) {
        frontPts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
      } else {
        if (frontPts.length > 1) els.push(`<polyline points="${frontPts.join(' ')}" data-plotter-role="${role}" fill="none"/>`);
        frontPts = [];
      }
    }
    if (frontPts.length > 1) els.push(`<polyline points="${frontPts.join(' ')}" data-plotter-role="${role}" fill="none"/>`);
  }

  for (let lon = -180; lon < 180; lon += 30) {
    let frontPts: string[] = [];
    const prime = lon === 0;
    const role = prime ? 'secondary' : 'guide';
    for (let lat = -84; lat <= 84; lat += 5) {
      const p = projectOrthographic(lat, lon, rotLon, tiltLat, cx, cy, R);
      if (p.visible) {
        frontPts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
      } else {
        if (frontPts.length > 1) els.push(`<polyline points="${frontPts.join(' ')}" data-plotter-role="${role}" fill="none"/>`);
        frontPts = [];
      }
    }
    if (frontPts.length > 1) els.push(`<polyline points="${frontPts.join(' ')}" data-plotter-role="${role}" fill="none"/>`);
  }

  // 4. Pontilhado Continental 81k em micro-pontos densos (0.45px–0.88px em escala Hairline)
  for (let lat = -72; lat <= 78; lat += step) {
    const lonStep = step / Math.max(0.28, Math.cos((lat * Math.PI) / 180));
    for (let lon = -180; lon < 180; lon += lonStep) {
      if (!isLandApprox(lat, lon)) continue;
      const p = projectOrthographic(lat, lon, rotLon, tiltLat, cx, cy, R);
      if (!p.visible) continue;
      const dotR = 0.44 + p.z * 0.42;
      const op = (0.24 + p.z * 0.58).toFixed(2);
      els.push(`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${dotR.toFixed(2)}" fill="currentColor" stroke="none" fill-opacity="${op}" data-plotter-role="secondary"/>`);
    }
  }

  // 5. Arco geodésico real entre estações visíveis (único traço tracejado de transferência 4 6 + seta aberta)
  const visibleStations = stations
    .map((s) => ({ ...s, proj: projectOrthographic(s.lat, s.lon, rotLon, tiltLat, cx, cy, R) }))
    .filter((s) => s.proj.z > 0.14);

  if (visibleStations.length >= 2) {
    const sA = visibleStations[0];
    const sB = visibleStations[1];
    const geoPts: Array<{ x: number; y: number }> = [];
    for (let k = 0; k <= 16; k++) {
      const t = k / 16;
      const la = sA.lat + (sB.lat - sA.lat) * t;
      const lo = sA.lon + (sB.lon - sA.lon) * t;
      const arch = Math.sin(t * Math.PI) * 0.04;
      const pr = projectOrthographic(la, lo, rotLon, tiltLat, cx, cy, R * (1 + arch));
      if (pr.visible) geoPts.push({ x: pr.x, y: pr.y });
    }
    if (geoPts.length >= 2) {
      els.push(`<polyline points="${geoPts.map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ')}" data-plotter-role="transfer" stroke-opacity="0.52" fill="none"/>`);
      const prev = geoPts[geoPts.length - 2];
      const end = geoPts[geoPts.length - 1];
      const ang = Math.atan2(end.y - prev.y, end.x - prev.x);
      els.push(`<path d="${plotterArrowheadPath(end, ang, 5.5)}" data-plotter-role="primary" fill="none"/>`);
    }
  }

  // 6. Contorno duplo Hairline da esfera (borda principal sólida + bisel interno 0.4px)
  els.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${R.toFixed(1)}" data-plotter-role="primary" data-hairline-stroke="active" stroke-opacity="0.82" fill="none"/>`);
  els.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(R - 4.5).toFixed(1)}" data-plotter-role="secondary" stroke-opacity="0.22" fill="none"/>`);

  // 7. Marcadores de estação Hairline (pin sobre papel + alvos concêntricos sólidos)
  visibleStations.slice(0, 2).forEach((s, idx) => {
    const side = s.proj.x >= cx ? 1 : -1;
    const elbowX = cx + side * (R + 30);
    const elbowY = s.proj.y + (idx === 0 ? -18 : 20);
    const tailX = elbowX + side * 26;

    els.push(`<circle cx="${s.proj.x.toFixed(1)}" cy="${s.proj.y.toFixed(1)}" r="5.5" fill="var(--ds-bg)" fill-opacity="0.72" data-plotter-role="secondary" stroke-opacity="0.48"/>`);
    els.push(`<circle cx="${s.proj.x.toFixed(1)}" cy="${s.proj.y.toFixed(1)}" r="1.9" fill="currentColor" fill-opacity="0.82" stroke="none" data-plotter-role="primary"/>`);
    els.push(`<circle cx="${s.proj.x.toFixed(1)}" cy="${s.proj.y.toFixed(1)}" r="9.0" fill="none" data-plotter-role="guide"/>`);
    els.push(`<polyline points="${s.proj.x.toFixed(1)},${s.proj.y.toFixed(1)} ${elbowX.toFixed(1)},${elbowY.toFixed(1)} ${tailX.toFixed(1)},${elbowY.toFixed(1)}" data-plotter-role="leader" fill="none"/>`);
    els.push(plotterLabelSvg(tailX + side * 6, elbowY - 2, s.name, 'name', side > 0 ? 'start' : 'end'));
    els.push(plotterLabelSvg(tailX + side * 6, elbowY + 11, s.metric, 'value', side > 0 ? 'start' : 'end'));
  });

  // 8. Cota dimensional real do diâmetro (verdade geométrica Plotter)
  const dimY = cy + R + 36;
  els.push(plotterHorizontalDimensionSvg(cx - R, cx + R, dimY, `Ø 12 742 km · ${Math.round(rotLon)}°`, 48));

  const isoAttr = opts.isolateRole && opts.isolateRole !== 'all' ? ` data-plotter-isolate="${opts.isolateRole}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" data-plotter="true" data-hairline="true"${isoAttr} fill="none">${els.join('')}</svg>`;
}
