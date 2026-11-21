/**
 * MERIDIAN DESIGN SYSTEM — atelier-engine.ts (v1.3.0)
 * Motor Generativo de Animação & Mídias Analógicas 100% TypeScript (Zero p5.js / Zero JS solto)
 *
 * Simula a ergonomia criativa do p5.js (`setup`, `draw`, `noise2D`, `fbm2D`, `random`, `lerp`, `map`)
 * combinada à estética de aquarela & pincéis de `anthropic.com/institute/econ-scenarios` e `p5.brush`:
 *  1. Aquarela Hobbs (`watercolorWash`) — subdivisão gaussiana + dezenas de camadas alpha 2–8 + multiply
 *  2. Dry-brush chalk (`dryBrushChalk`) — dashes com cerdas duplas e decay de opacidade
 *  3. Grid paper erodido (`erodedGraphPaper`) — máscara Perlin multi-oitava (patches somem)
 *  4. Fan trajectories Econ (`paintFanTrajectories`) — faixas cerulean / olive / coral
 *  5. Lápis / giz / sumi-e — grafite, wax crayon, ink brush kasure
 *
 * Arquitetura Portável:
 *  - Web: `createCanvasBackend(canvas, dpr)` (Canvas 2D nativo)
 *  - React Native / Expo: implemente `AtelierDrawingBackend` sobre `@shopify/react-native-skia`
 *  - Acessibilidade: respeita `prefers-reduced-motion` (desenha quadro final estático sem loop)
 *    e pausa automaticamente fora da viewport via `IntersectionObserver`.
 */

import { getSurfaceTheme, type SurfaceId, type SignalStyle } from './tokens.ts';

/* ==========================================================================
   1. TIPOS ESTRITOS & INTERFACE DE BACKEND PORTÁVEL (Web Canvas / RN Skia)
   ========================================================================== */

export type BrushMedium = 'watercolor' | 'pencil' | 'crayon' | 'ink';
export type SketchPreset =
  | 'econ-watercolor-blocks'
  | 'botanical-watercolor'
  | 'celestial-pencil'
  | 'terracotta-crayon';

export interface Vec2 {
  readonly x: number;
  readonly y: number;
}

export interface RGB {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

export interface AtelierDrawingBackend {
  readonly width: number;
  readonly height: number;
  clear(bgColor?: string): void;
  setCompositeMode(mode: 'source-over' | 'multiply' | 'screen'): void;
  fillPolygon(points: readonly Vec2[], fillStyle: string, alpha: number): void;
  strokePolyline(points: readonly Vec2[], strokeStyle: string, lineWidth: number, alpha: number): void;
  fillDot(x: number, y: number, radius: number, fillStyle: string, alpha: number): void;
  fillEllipse(x: number, y: number, rx: number, ry: number, rotation: number, fillStyle: string, alpha: number): void;
}

export interface WatercolorOptions {
  layers?: number;
  subdivisions?: number;
  bleed?: number;
  layerAlpha?: number;
  wetEdgeRing?: boolean;
}

export interface PencilOptions {
  grade?: '2H' | 'HB' | '4B';
  weight?: number;
  pressure?: number;
  wobble?: number;
}

export interface CrayonOptions {
  thickness?: number;
  tooth?: number;
  density?: number;
}

export interface InkBrushOptions {
  width?: number;
  bristles?: number;
  dryness?: number;
}

export interface DryBrushOptions {
  length?: number;
  thickness?: number;
  grain?: number;
  bristles?: number;
  decay?: number;
}

export interface GraphPaperOptions {
  cell?: number;
  erosion?: number;
  noiseScale?: number;
  fadeRight?: boolean;
  alpha?: number;
}

export interface SketchDefinition {
  setup(atelier: MeridianAtelier): void;
  draw(atelier: MeridianAtelier, frameCount: number, elapsedSec: number): void;
}

/* ==========================================================================
   2. UTILITÁRIOS MATEMÁTICOS ESTILO p5.js (100% Determinísticos)
   ========================================================================== */

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export function lerp(start: number, stop: number, amount: number): number {
  return start + (stop - start) * amount;
}

export function easeOutCubic(t: number): number {
  const c = clamp(t, 0, 1);
  return 1 - Math.pow(1 - c, 3);
}

export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
  withinBounds = false
): number {
  const mapped = ((value - inMin) / (inMax - inMin || 1)) * (outMax - outMin) + outMin;
  if (!withinBounds) return mapped;
  return outMin < outMax ? clamp(mapped, outMin, outMax) : clamp(mapped, outMax, outMin);
}

export function dist2D(a: Vec2, b: Vec2): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '').trim();
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean.slice(0, 6);
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return { r: 20, g: 20, b: 19 };
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

export function rgbaString(rgb: RGB, alpha: number): string {
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clamp(alpha, 0, 1).toFixed(4)})`;
}

/** PRNG determinístico (Mulberry32) + Ruído Perlin 2D + FBM (estilo p5.js `noise`) */
export class DeterministicNoise {
  private state: number;
  private readonly perm: Uint8Array;

  constructor(seed = 20261120) {
    this.state = seed >>> 0;
    this.perm = new Uint8Array(512);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      const tmp = p[i];
      p[i] = p[j];
      p[j] = tmp;
    }
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }

  public random(min = 0, max = 1): number {
    this.state |= 0;
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    const u = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return min + u * (max - min);
  }

  public randomGaussian(mean = 0, sd = 1): number {
    const u1 = Math.max(1e-7, this.random());
    const u2 = this.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * sd + mean;
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -2.0 * v : 2.0 * v);
  }

  public noise2D(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = this.fade(xf);
    const v = this.fade(yf);

    const aa = this.perm[this.perm[X] + Y];
    const ab = this.perm[this.perm[X] + Y + 1];
    const ba = this.perm[this.perm[X + 1] + Y];
    const bb = this.perm[this.perm[X + 1] + Y + 1];

    const x1 = lerp(this.grad(aa, xf, yf), this.grad(ba, xf - 1, yf), u);
    const x2 = lerp(this.grad(ab, xf, yf - 1), this.grad(bb, xf - 1, yf - 1), u);
    return clamp((lerp(x1, x2, v) + 1.5) / 3.0, 0, 1);
  }

  public fbm2D(x: number, y: number, octaves = 3): number {
    let total = 0;
    let amp = 0.5;
    let freq = 1;
    let maxAmp = 0;
    for (let i = 0; i < octaves; i++) {
      total += this.noise2D(x * freq, y * freq) * amp;
      maxAmp += amp;
      amp *= 0.5;
      freq *= 2.03;
    }
    return total / (maxAmp || 1);
  }
}

/* ==========================================================================
   3. BACKEND WEB CANVAS 2D (Plugável — RN Skia implementa a mesma interface)
   ========================================================================== */

export function createCanvasBackend(canvas: HTMLCanvasElement, dpr = 2): AtelierDrawingBackend {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('MeridianAtelier: contexto 2D indisponível.');

  const logicalW = canvas.width / dpr;
  const logicalH = canvas.height / dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  return {
    width: logicalW,
    height: logicalH,
    clear(bgColor?: string): void {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      if (bgColor) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, logicalW, logicalH);
      } else {
        ctx.clearRect(0, 0, logicalW, logicalH);
      }
      ctx.restore();
    },
    setCompositeMode(mode): void {
      ctx.globalCompositeOperation = mode;
    },
    fillPolygon(points, fillStyle, alpha): void {
      if (points.length < 3) return;
      ctx.save();
      ctx.globalAlpha = clamp(alpha, 0, 1);
      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },
    strokePolyline(points, strokeStyle, lineWidth, alpha): void {
      if (points.length < 2) return;
      ctx.save();
      ctx.globalAlpha = clamp(alpha, 0, 1);
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
      ctx.stroke();
      ctx.restore();
    },
    fillDot(x, y, radius, fillStyle, alpha): void {
      ctx.save();
      ctx.globalAlpha = clamp(alpha, 0, 1);
      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
    fillEllipse(x, y, rx, ry, rotation, fillStyle, alpha): void {
      ctx.save();
      ctx.globalAlpha = clamp(alpha, 0, 1);
      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      ctx.ellipse(x, y, Math.max(0.3, rx), Math.max(0.3, ry), rotation, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    },
  };
}

/* ==========================================================================
   4. MOTOR DE MÍDIAS ANALÓGICAS MERIDIAN ATELIER
   ========================================================================== */

export class MeridianAtelier {
  public readonly backend: AtelierDrawingBackend;
  public readonly noise: DeterministicNoise;
  public readonly surface: SurfaceId;
  public readonly signalStyle: SignalStyle;

  constructor(
    backend: AtelierDrawingBackend,
    options: { seed?: number; surface?: SurfaceId; signalStyle?: SignalStyle } = {}
  ) {
    this.backend = backend;
    this.noise = new DeterministicNoise(options.seed ?? 20261120);
    this.surface = options.surface ?? 'ivory';
    this.signalStyle = options.signalStyle ?? 'chromatic';
  }

  get width(): number {
    return this.backend.width;
  }

  get height(): number {
    return this.backend.height;
  }

  get theme() {
    return getSurfaceTheme(this.surface, this.signalStyle);
  }

  private get pigmentComposite(): 'multiply' | 'screen' {
    return this.theme.scheme === 'dark' ? 'screen' : 'multiply';
  }

  /**
   * 1. AQUARELA (Tyler Hobbs) — subdivisão gaussiana + camadas alpha baixíssimo + multiply
   */
  public watercolorWash(
    basePolygon: readonly Vec2[],
    hexColor: string,
    opts: WatercolorOptions = {}
  ): void {
    if (basePolygon.length < 3) return;
    // Hobbs: dezenas de camadas com alpha ~2–8/255
    const layers = opts.layers ?? 32;
    const subdivisions = opts.subdivisions ?? 5;
    const bleed = opts.bleed ?? 0.38;
    const layerAlpha =
      opts.layerAlpha ?? (this.theme.scheme === 'dark' ? 0.028 : 0.018);
    const wetEdgeRing = opts.wetEdgeRing ?? true;

    const rgb = hexToRgb(hexColor);
    const fillHex = rgbaString(rgb, 1);
    const baseDeformed = this.deformPolygon(basePolygon, Math.max(3, subdivisions - 1), bleed * 0.78);

    this.backend.setCompositeMode(this.pigmentComposite);

    for (let i = 0; i < layers; i++) {
      const t = i / Math.max(1, layers - 1);
      const variance = bleed * (0.28 + 0.72 * t);
      // re-subdivide a cada coat com gaussiano fresco (aresta úmida)
      const coat = this.deformPolygon(baseDeformed, 2 + (i % 2), variance);
      const alpha = layerAlpha * (0.75 + 0.55 * this.noise.random());
      this.backend.fillPolygon(coat, fillHex, alpha);
    }

    if (wetEdgeRing) {
      const edgeRing = this.deformPolygon(baseDeformed, 3, bleed * 0.2);
      const closed = [...edgeRing, edgeRing[0]!];
      this.backend.strokePolyline(closed, fillHex, 1.15, Math.min(0.22, layerAlpha * 6));
      const pigmentEdge = this.deformPolygon(baseDeformed, 2, bleed * 0.12);
      this.backend.strokePolyline(
        [...pigmentEdge, pigmentEdge[0]!],
        fillHex,
        0.7,
        Math.min(0.16, layerAlpha * 4.5),
      );
    }

    this.backend.setCompositeMode('source-over');
  }

  /**
   * Grão de papel algodão (overlay tátil, pré-bake no setup)
   */
  public paperGrainOverlay(density = 0.35, alpha = 0.045): void {
    const { width: w, height: h } = this.backend;
    const rgb = hexToRgb(this.theme.fg);
    const dots = Math.floor(w * h * density * 0.012);
    this.backend.setCompositeMode(this.pigmentComposite);
    for (let i = 0; i < dots; i++) {
      const x = this.noise.random(0, w);
      const y = this.noise.random(0, h);
      const n = this.noise.noise2D(x * 0.08, y * 0.08);
      if (n < 0.42) continue;
      this.backend.fillDot(x, y, this.noise.random(0.25, 0.85), rgbaString(rgb, 1), alpha * n);
    }
    this.backend.setCompositeMode('source-over');
  }

  /**
   * Grid engineering paper com erosão Perlin multi-oitava (patches somem juntos)
   */
  public erodedGraphPaper(opts: GraphPaperOptions = {}): void {
    const cell = opts.cell ?? 26;
    const erosion = opts.erosion ?? 0.42;
    const noiseScale = opts.noiseScale ?? 0.018;
    const fadeRight = opts.fadeRight ?? true;
    const baseAlpha = opts.alpha ?? (this.theme.scheme === 'dark' ? 0.14 : 0.1);
    const { width: w, height: h } = this.backend;
    const rgb = hexToRgb(this.theme.fg);
    const stroke = rgbaString(rgb, 1);

    const mask = (x: number, y: number): number => {
      const n = this.noise.fbm2D(x * noiseScale, y * noiseScale, 2);
      let a = clamp((n - erosion) / (1 - erosion + 1e-6), 0, 1);
      a = a * a * (3 - 2 * a); // smoothstep
      if (fadeRight) a *= 1 - Math.pow(x / w, 1.35) * 0.85;
      return a * baseAlpha;
    };

    this.backend.setCompositeMode(this.pigmentComposite);

    // Verticais
    for (let x = 0; x <= w; x += cell) {
      for (let y = 0; y < h; y += 4) {
        const a = mask(x, y + 2);
        if (a < 0.012) continue;
        this.backend.strokePolyline(
          [
            { x, y },
            { x, y: Math.min(h, y + 5) },
          ],
          stroke,
          0.7,
          a,
        );
      }
    }
    // Horizontais
    for (let y = 0; y <= h; y += cell) {
      for (let x = 0; x < w; x += 4) {
        const a = mask(x + 2, y);
        if (a < 0.012) continue;
        this.backend.strokePolyline(
          [
            { x, y },
            { x: Math.min(w, x + 5), y },
          ],
          stroke,
          0.7,
          a,
        );
      }
    }

    this.backend.setCompositeMode('source-over');
  }

  /**
   * Dry-brush / chalk dash — cerdas dual + grain + decay (cenários aquarela)
   */
  public dryBrushChalk(
    path: readonly Vec2[],
    hexColor: string,
    opts: DryBrushOptions = {}
  ): void {
    if (path.length < 2) return;
    const thickness = opts.thickness ?? 2.4;
    const grain = opts.grain ?? 0.55;
    const bristles = opts.bristles ?? 5;
    const decay = opts.decay ?? 0.0;
    const rgb = hexToRgb(hexColor);
    const stroke = rgbaString(rgb, 1);
    const sampled = this.resamplePath(path, 2.2);

    this.backend.setCompositeMode(this.pigmentComposite);

    for (let b = 0; b < bristles; b++) {
      const frac = bristles === 1 ? 0 : (b / (bristles - 1)) * 2 - 1;
      const dash: Vec2[] = [];
      for (let i = 0; i < sampled.length; i++) {
        const t = i / Math.max(1, sampled.length - 1);
        const p = sampled[i]!;
        const prev = sampled[Math.max(0, i - 1)]!;
        const next = sampled[Math.min(sampled.length - 1, i + 1)]!;
        const mag = Math.hypot(next.x - prev.x, next.y - prev.y) || 1;
        const nx = -(next.y - prev.y) / mag;
        const ny = (next.x - prev.x) / mag;
        const g = this.noise.noise2D(p.x * 0.22 + b * 4.1, p.y * 0.22);
        if (g < grain * (0.35 + 0.5 * Math.abs(frac))) {
          if (dash.length >= 2) {
            const alpha = (0.22 + 0.28 * (1 - Math.abs(frac))) * (1 - decay * t);
            this.backend.strokePolyline(dash, stroke, thickness * (0.45 + 0.4 * (1 - Math.abs(frac))), alpha);
          }
          dash.length = 0;
          continue;
        }
        const jitter = (g - 0.5) * thickness * 0.8;
        dash.push({
          x: p.x + nx * (frac * thickness * 0.55 + jitter),
          y: p.y + ny * (frac * thickness * 0.55 + jitter),
        });
      }
      if (dash.length >= 2) {
        this.backend.strokePolyline(dash, stroke, thickness * 0.55, 0.28);
      }
    }

    // micro-bristle texture layer
    for (let i = 0; i < sampled.length; i += 2) {
      const t = i / Math.max(1, sampled.length - 1);
      const p = sampled[i]!;
      if (this.noise.noise2D(p.x * 0.4, p.y * 0.4) < 0.55) continue;
      this.backend.fillDot(
        p.x + this.noise.randomGaussian(0, thickness * 0.4),
        p.y + this.noise.randomGaussian(0, thickness * 0.4),
        this.noise.random(0.35, 0.9),
        stroke,
        (0.12 + 0.18 * this.noise.random()) * (1 - decay * t),
      );
    }

    this.backend.setCompositeMode('source-over');
  }

  /**
   * Fan de trajetórias estilo cenários aquarela Meridian (faixas + chalk)
   */
  public paintFanTrajectories(
    origin: Vec2,
    count: number,
    spread: number,
    length: number,
    colors: readonly string[],
    progress = 1,
    wind = 0,
  ): void {
    const p = clamp(progress, 0, 1);
    for (let i = 0; i < count; i++) {
      const u = i / Math.max(1, count - 1);
      const angle = -spread / 2 + u * spread + wind * 0.08 * Math.sin(u * Math.PI);
      const band = colors[Math.min(colors.length - 1, Math.floor(u * colors.length))]!;
      const pts: Vec2[] = [];
      const segs = 14;
      for (let s = 0; s <= segs; s++) {
        const t = (s / segs) * p;
        if (t <= 0) {
          pts.push({ ...origin });
          continue;
        }
        const exp = 1 - Math.pow(1 - t, 1.65);
        const n =
          (this.noise.fbm2D(i * 0.17 + t * 2.4, origin.y * 0.01, 2) - 0.5) * length * 0.08;
        pts.push({
          x: origin.x + Math.cos(angle) * length * exp + n * Math.cos(angle + Math.PI / 2),
          y: origin.y + Math.sin(angle) * length * exp + n * Math.sin(angle + Math.PI / 2) + wind * t * 6,
        });
      }
      if (pts.length < 2) continue;
      // wash suave sob o chalk
      if (i % 3 === 0 && p > 0.2) {
        const mid = pts[Math.floor(pts.length * 0.55)]!;
        this.watercolorWash(this.organicBlob(mid.x, mid.y, 10 + u * 8, 7 + u * 5, 8), band, {
          layers: 10,
          bleed: 0.28,
          layerAlpha: 0.014,
          wetEdgeRing: false,
          subdivisions: 3,
        });
      }
      this.dryBrushChalk(pts, band, {
        thickness: 1.6 + (1 - Math.abs(u - 0.5) * 2) * 1.2,
        grain: 0.48,
        bristles: 4,
        decay: 0.55,
      });
    }
  }

  /**
   * Faixa de Aquarela entre duas curvas (para cenários tipo cenários aquarela)
   */
  public watercolorBand(
    upper: readonly Vec2[],
    lower: readonly Vec2[],
    hexColor: string,
    opts: WatercolorOptions = {}
  ): void {
    if (upper.length < 2 || lower.length < 2) return;
    const polygon = [...upper, ...lower.slice().reverse()];
    this.watercolorWash(polygon, hexColor, {
      layers: opts.layers ?? 16,
      subdivisions: opts.subdivisions ?? 3,
      bleed: opts.bleed ?? 0.16,
      layerAlpha: opts.layerAlpha ?? (this.theme.scheme === 'dark' ? 0.05 : 0.036),
      wetEdgeRing: opts.wetEdgeRing ?? true,
    });
  }

  /**
   * Preenchimento de Bloco/Cubo lado a lado a pincel/aquarela (assinatura cenários aquarela!)
   */
  public brushFillRect(
    x: number,
    y: number,
    w: number,
    h: number,
    progress: number,
    hexColor: string,
    medium: 'watercolor' | 'crayon' = 'watercolor'
  ): void {
    const p = clamp(progress, 0, 1);
    if (p > 0.01) {
      const fillW = Math.max(4, w * p);
      if (medium === 'watercolor') {
        const poly: Vec2[] = [
          { x, y },
          { x: x + fillW, y },
          { x: x + fillW, y: y + h },
          { x, y: y + h },
        ];
        this.watercolorWash(poly, hexColor, {
          layers: 14,
          subdivisions: 3,
          bleed: 0.18,
          layerAlpha: this.theme.scheme === 'dark' ? 0.075 : 0.055,
          wetEdgeRing: true,
        });
        // Pincelada úmida horizontal reforçando a direção do preenchimento
        const rows = Math.max(2, Math.round(h / 12));
        for (let r = 0; r < rows; r++) {
          const ry = y + ((r + 0.5) / rows) * h;
          const wave = (this.noise.noise2D(x * 0.05 + r, y * 0.05) - 0.5) * 3;
          this.inkBrush(
            [
              { x: x + 2, y: ry + wave },
              { x: x + fillW * 0.5, y: ry - wave * 0.6 },
              { x: x + fillW - 1, y: ry + wave * 0.4 },
            ],
            hexColor,
            { width: h / rows, bristles: 5, dryness: 0.48 }
          );
        }
      } else {
        const rows = Math.max(2, Math.round(h / 9));
        for (let r = 0; r < rows; r++) {
          const ry = y + ((r + 0.5) / rows) * h;
          this.waxCrayon(
            [{ x: x + 2, y: ry }, { x: x + fillW - 2, y: ry }],
            hexColor,
            { thickness: Math.max(6, h / rows + 2), tooth: 0.5, density: 0.9 }
          );
        }
      }
    }

    // Contorno esboçado a lápis grafite levemente ultrapassado nos cantos
    this.handDrawnRect(x, y, w, h, this.theme.fg, { grade: '2H', pressure: 0.62, wobble: 0.9 });
  }

  /** Retângulo arquitetônico desenhado à mão com leve overshoot nos cantos */
  public handDrawnRect(
    x: number,
    y: number,
    w: number,
    h: number,
    hexColor?: string,
    opts: PencilOptions = { grade: 'HB', pressure: 0.85 }
  ): void {
    const ov = 2.4;
    this.graphitePencil([{ x: x - ov, y }, { x: x + w + ov, y }], hexColor, opts);
    this.graphitePencil([{ x: x + w, y: y - ov }, { x: x + w, y: y + h + ov }], hexColor, opts);
    this.graphitePencil([{ x: x + w + ov, y: y + h }, { x: x - ov, y: y + h }], hexColor, opts);
    this.graphitePencil([{ x, y: y + h + ov }, { x, y: y - ov }], hexColor, opts);
  }

  public organicBlob(cx: number, cy: number, rx: number, ry: number, sides = 10): Vec2[] {
    const pts: Vec2[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const wobble = 0.82 + this.noise.noise2D(Math.cos(angle) + cx * 0.01, Math.sin(angle) + cy * 0.01) * 0.36;
      pts.push({
        x: cx + Math.cos(angle) * rx * wobble,
        y: cy + Math.sin(angle) * ry * wobble,
      });
    }
    return pts;
  }

  private deformPolygon(points: readonly Vec2[], depth: number, variance: number): Vec2[] {
    let current: Vec2[] = points.slice();
    for (let d = 0; d < depth; d++) {
      const next: Vec2[] = [];
      const len = current.length;
      for (let i = 0; i < len; i++) {
        const p1 = current[i];
        const p2 = current[(i + 1) % len];
        next.push(p1);
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const edgeLen = Math.hypot(dx, dy);
        if (edgeLen < 1.5) continue;
        const nx = -dy / edgeLen;
        const ny = dx / edgeLen;
        const offset = this.noise.randomGaussian(0, edgeLen * variance * 0.3);
        const t = clamp(0.5 + this.noise.randomGaussian(0, 0.08), 0.25, 0.75);
        next.push({ x: p1.x + dx * t + nx * offset, y: p1.y + dy * t + ny * offset });
      }
      current = next;
    }
    return current;
  }

  /**
   * 2. LÁPIS GRAFITE (Graphite Pencil — 2H / HB / 4B)
   */
  public graphitePencil(
    path: readonly Vec2[],
    hexColor?: string,
    opts: PencilOptions = {}
  ): void {
    if (path.length < 2) return;
    const grade = opts.grade ?? 'HB';
    const weight = opts.weight ?? (grade === '2H' ? 1.0 : grade === '4B' ? 2.4 : 1.5);
    const pressure = opts.pressure ?? 1.0;
    const wobble = opts.wobble ?? 1.1;

    const strands = grade === '2H' ? 4 : grade === '4B' ? 8 : 6;
    const baseOpacity = (grade === '2H' ? 0.22 : grade === '4B' ? 0.42 : 0.31) * clamp(pressure, 0.25, 1.4);
    const rgb = hexToRgb(hexColor ?? this.theme.fg);
    const sampled = this.resamplePath(path, 3.2);

    this.backend.setCompositeMode(this.pigmentComposite);

    for (let s = 0; s < strands; s++) {
      const lateralOffset = ((s / Math.max(1, strands - 1)) - 0.5) * weight * 1.45;
      const fiberPts: Vec2[] = [];

      for (let i = 0; i < sampled.length; i++) {
        const p = sampled[i];
        const prev = sampled[Math.max(0, i - 1)];
        const next = sampled[Math.min(sampled.length - 1, i + 1)];
        const mag = Math.hypot(next.x - prev.x, next.y - prev.y) || 1;
        const nx = -(next.y - prev.y) / mag;
        const ny = (next.x - prev.x) / mag;

        const n = (this.noise.fbm2D(p.x * 0.045 + s * 3.1, p.y * 0.045, 2) - 0.5) * 2;
        const grain = this.noise.noise2D(p.x * 0.35 + s, p.y * 0.35);
        const taper = Math.sin((i / Math.max(1, sampled.length - 1)) * Math.PI);
        const jitter = n * wobble + (grain - 0.5) * 0.7;

        fiberPts.push({
          x: p.x + nx * (lateralOffset * (0.45 + 0.55 * taper) + jitter),
          y: p.y + ny * (lateralOffset * (0.45 + 0.55 * taper) + jitter),
        });

        if (grain > 0.62) {
          this.backend.fillDot(
            p.x + nx * lateralOffset + this.noise.randomGaussian(0, 0.6),
            p.y + ny * lateralOffset + this.noise.randomGaussian(0, 0.6),
            0.45 + weight * 0.22,
            rgbaString(rgb, 1),
            baseOpacity * (0.55 + 0.45 * taper)
          );
        }
      }

      this.backend.strokePolyline(
        fiberPts,
        rgbaString(rgb, 1),
        Math.max(0.45, weight * 0.34),
        baseOpacity * (0.7 + this.noise.random(0, 0.35))
      );
    }

    this.backend.setCompositeMode('source-over');
  }

  public hatchArea(
    x: number,
    y: number,
    w: number,
    h: number,
    angleDeg = -38,
    spacing = 7,
    hexColor?: string,
    opts: PencilOptions = { grade: '2H', pressure: 0.72 }
  ): void {
    const rad = (angleDeg * Math.PI) / 180;
    const dx = Math.cos(rad);
    const dy = Math.sin(rad);
    const diag = Math.hypot(w, h);
    const cx = x + w * 0.5;
    const cy = y + h * 0.5;

    for (let offset = -diag * 0.55; offset <= diag * 0.55; offset += spacing) {
      const px = cx - dy * offset;
      const py = cy + dx * offset;
      const a: Vec2 = { x: px - dx * diag * 0.5, y: py - dy * diag * 0.5 };
      const b: Vec2 = { x: px + dx * diag * 0.5, y: py + dy * diag * 0.5 };
      const clipped = this.clipLineToRect(a, b, x, y, x + w, y + h);
      if (clipped) {
        const mid: Vec2 = {
          x: (clipped[0].x + clipped[1].x) * 0.5 + this.noise.randomGaussian(0, 0.8),
          y: (clipped[0].y + clipped[1].y) * 0.5 + this.noise.randomGaussian(0, 0.8),
        };
        this.graphitePencil([clipped[0], mid, clipped[1]], hexColor, opts);
      }
    }
  }

  /**
   * 3. GIZ DE CERA / PASTEL SECO (Wax Crayon)
   */
  public waxCrayon(
    path: readonly Vec2[],
    hexColor: string,
    opts: CrayonOptions = {}
  ): void {
    if (path.length < 2) return;
    const thickness = opts.thickness ?? 11;
    const tooth = clamp(opts.tooth ?? 0.52, 0.15, 0.85);
    const density = opts.density ?? 1.0;

    const rgb = hexToRgb(hexColor);
    const fillHex = rgbaString(rgb, 1);
    const sampled = this.resamplePath(path, 2.4);

    this.backend.setCompositeMode(this.pigmentComposite);

    for (let i = 0; i < sampled.length; i++) {
      const p = sampled[i];
      const prev = sampled[Math.max(0, i - 1)];
      const next = sampled[Math.min(sampled.length - 1, i + 1)];
      const angle = Math.atan2(next.y - prev.y, next.x - prev.x);
      const t = i / Math.max(1, sampled.length - 1);
      const env = 0.72 + 0.28 * Math.sin(t * Math.PI);
      const grains = Math.round(thickness * 1.9 * density);

      for (let g = 0; g < grains; g++) {
        const across = this.noise.randomGaussian(0, thickness * 0.34 * env);
        const along = this.noise.randomGaussian(0, 1.4);
        const gx = p.x + Math.cos(angle) * along - Math.sin(angle) * across;
        const gy = p.y + Math.sin(angle) * along + Math.cos(angle) * across;

        const paperPeak = this.noise.noise2D(gx * 0.36, gy * 0.36);
        const edgeFalloff = clamp(1 - Math.abs(across) / (thickness * 0.72), 0.12, 1);
        if (paperPeak < tooth * (1.15 - 0.35 * edgeFalloff)) continue;

        const rx = this.noise.random(0.65, 1.95);
        const ry = this.noise.random(0.45, 1.35);
        const alpha = (0.28 + 0.44 * (paperPeak - tooth * 0.5)) * edgeFalloff;
        this.backend.fillEllipse(gx, gy, rx, ry, angle + this.noise.random(-0.5, 0.5), fillHex, alpha);
      }
    }

    this.backend.setCompositeMode('source-over');
  }

  /**
   * 4. PINCEL TINTA SUMI-E / CALIGRÁFICO (Split-Bristle Ink Brush)
   */
  public inkBrush(
    path: readonly Vec2[],
    hexColor?: string,
    opts: InkBrushOptions = {}
  ): void {
    if (path.length < 2) return;
    const width = opts.width ?? 7.5;
    const bristles = opts.bristles ?? 9;
    const dryness = opts.dryness ?? 0.32;

    const rgb = hexToRgb(hexColor ?? this.theme.fg);
    const strokeHex = rgbaString(rgb, 1);
    const sampled = this.resamplePath(path, 2.8);

    this.backend.setCompositeMode(this.pigmentComposite);

    for (let b = 0; b < bristles; b++) {
      const frac = bristles === 1 ? 0 : (b / (bristles - 1)) * 2 - 1;
      const segment: Vec2[] = [];

      for (let i = 0; i < sampled.length; i++) {
        const t = i / Math.max(1, sampled.length - 1);
        const pressure = Math.pow(Math.sin(t * Math.PI), 0.65);
        const dryChance = dryness * (0.2 + 0.8 * t) * Math.abs(frac);
        if (this.noise.noise2D(i * 0.45 + b * 7, b * 2.1) < dryChance) {
          if (segment.length >= 2) {
            this.backend.strokePolyline(segment, strokeHex, Math.max(0.6, (width / bristles) * 1.45 * (0.4 + 0.6 * pressure)), 0.72);
          }
          segment.length = 0;
          continue;
        }
        const p = sampled[i];
        const prev = sampled[Math.max(0, i - 1)];
        const next = sampled[Math.min(sampled.length - 1, i + 1)];
        const mag = Math.hypot(next.x - prev.x, next.y - prev.y) || 1;
        const nx = -(next.y - prev.y) / mag;
        const ny = (next.x - prev.x) / mag;
        const spread = frac * width * 0.5 * (0.3 + 0.85 * pressure);
        segment.push({ x: p.x + nx * spread, y: p.y + ny * spread });
      }

      if (segment.length >= 2) {
        this.backend.strokePolyline(segment, strokeHex, Math.max(0.7, (width / bristles) * 1.65), 0.78);
      }
    }

    this.backend.setCompositeMode('source-over');
  }

  private resamplePath(path: readonly Vec2[], stepPx: number): Vec2[] {
    const out: Vec2[] = [path[0]];
    for (let i = 1; i < path.length; i++) {
      const a = path[i - 1];
      const b = path[i];
      const steps = Math.max(1, Math.ceil(dist2D(a, b) / stepPx));
      for (let s = 1; s <= steps; s++) {
        out.push({ x: lerp(a.x, b.x, s / steps), y: lerp(a.y, b.y, s / steps) });
      }
    }
    return out;
  }

  private clipLineToRect(
    p0: Vec2, p1: Vec2, xmin: number, ymin: number, xmax: number, ymax: number
  ): [Vec2, Vec2] | null {
    const code = (x: number, y: number) =>
      (x < xmin ? 1 : x > xmax ? 2 : 0) | (y < ymin ? 4 : y > ymax ? 8 : 0);
    let x0 = p0.x, y0 = p0.y, x1 = p1.x, y1 = p1.y;
    let c0 = code(x0, y0), c1 = code(x1, y1);
    while (true) {
      if ((c0 | c1) === 0) return [{ x: x0, y: y0 }, { x: x1, y: y1 }];
      if ((c0 & c1) !== 0) return null;
      const out = c0 !== 0 ? c0 : c1;
      let x = 0, y = 0;
      if (out & 8) { x = x0 + ((x1 - x0) * (ymax - y0)) / (y1 - y0); y = ymax; }
      else if (out & 4) { x = x0 + ((x1 - x0) * (ymin - y0)) / (y1 - y0); y = ymin; }
      else if (out & 2) { y = y0 + ((y1 - y0) * (xmax - x0)) / (x1 - x0); x = xmax; }
      else { y = y0 + ((y1 - y0) * (xmin - x0)) / (x1 - x0); x = xmin; }
      if (out === c0) { x0 = x; y0 = y; c0 = code(x0, y0); }
      else { x1 = x; y1 = y; c1 = code(x1, y1); }
    }
  }
}

/* ==========================================================================
   5. SKETCHES PRONTOS (Estilo cenários aquarela + Editorial Studio)
   ========================================================================== */

/**
 * Preset 1 — cenários aquarela Meridian (fan + chalk + grid erodido + blocos aquarela)
 * Referência: share.gemini / econ-scenarios — dry-brush, Perlin grid erosion, exponential fan.
 */
export function createEconWatercolorSketch(): SketchDefinition {
  const cols = 4;
  const rows = 3;
  const totalCells = cols * rows;
  const stepsPerCell = 4;
  const cellsEndFrame = totalCells * stepsPerCell; // 48
  const fanFrames = 36;
  const totalFrames = cellsEndFrame + fanFrames + 8;

  return {
    setup(a) {
      a.backend.clear(a.theme.bg);
      a.paperGrainOverlay(0.4, a.theme.scheme === 'dark' ? 0.06 : 0.04);
      a.erodedGraphPaper({
        cell: 26,
        erosion: 0.4,
        noiseScale: 0.016,
        fadeRight: true,
        alpha: a.theme.scheme === 'dark' ? 0.16 : 0.11,
      });

      const { fg } = a.theme;
      const w = a.width;
      const h = a.height;
      const padX = w * 0.07;
      const padY = h * 0.14;
      const gridW = w * 0.42;
      const gridH = h * 0.64;
      const gap = 10;
      const cellW = (gridW - gap * (cols - 1)) / cols;
      const cellH = (gridH - gap * (rows - 1)) / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = padX + c * (cellW + gap);
          const y = padY + r * (cellH + gap);
          a.handDrawnRect(x, y, cellW, cellH, fg, { grade: '2H', pressure: 0.5, wobble: 0.75 });
        }
      }
    },
    draw(a, frame) {
      if (frame > totalFrames) return;
      const { organic, fg } = a.theme;
      const w = a.width;
      const h = a.height;
      const palette = [organic.olive, organic.sky, organic.coral, organic.ochre];

      if (frame <= cellsEndFrame) {
        const cellIdx = Math.floor((frame - 1) / stepsPerCell);
        const step = (frame - 1) % stepsPerCell;
        const r = Math.floor(cellIdx / cols);
        const c = cellIdx % cols;
        const padX = w * 0.07;
        const padY = h * 0.14;
        const gridW = w * 0.42;
        const gridH = h * 0.64;
        const gap = 10;
        const cellW = (gridW - gap * (cols - 1)) / cols;
        const cellH = (gridH - gap * (rows - 1)) / rows;
        const x = padX + c * (cellW + gap);
        const y = padY + r * (cellH + gap);
        const x0 = x + (step / stepsPerCell) * cellW;
        const x1 = x + ((step + 1) / stepsPerCell) * cellW;
        const color = palette[(cellIdx + r) % palette.length]!;

        a.watercolorWash(
          [
            { x: x0, y: y + 1 },
            { x: x1 + 2, y: y + 1 },
            { x: x1 + 2, y: y + cellH - 1 },
            { x: x0, y: y + cellH - 1 },
          ],
          color,
          {
            layers: 18,
            subdivisions: 3,
            bleed: 0.24,
            layerAlpha: a.theme.scheme === 'dark' ? 0.03 : 0.02,
            wetEdgeRing: step === stepsPerCell - 1,
          },
        );

        const midY = y + cellH * (0.3 + ((step * 37) % 10) * 0.04);
        a.dryBrushChalk(
          [
            { x: x0, y: midY },
            { x: x1, y: midY + a.noise.randomGaussian(0, 1.6) },
          ],
          color,
          { thickness: cellH * 0.22, grain: 0.5, bristles: 4, decay: 0.2 },
        );
        return;
      }

      const f2 = frame - cellsEndFrame;
      if (f2 <= fanFrames) {
        const progress = f2 / fanFrames;
        const origin = { x: w * 0.52, y: h * 0.78 };
        const wind = Math.sin(progress * Math.PI) * 0.35;
        // desenha fatias incrementais do fan (evita repaint total)
        const batch = 4;
        const start = Math.floor(((f2 - 1) / fanFrames) * 48);
        const end = Math.min(48, start + batch);
        for (let i = start; i < end; i++) {
          const u = i / 47;
          const angle = -0.55 + u * 1.05 + wind * 0.08 * Math.sin(u * Math.PI);
          const band = [organic.sky, organic.olive, organic.coral][Math.min(2, Math.floor(u * 3))]!;
          const len = Math.min(w, h) * (0.42 + u * 0.12) * progress;
          const pts: Vec2[] = [];
          for (let s = 0; s <= 12; s++) {
            const t = s / 12;
            const exp = 1 - Math.pow(1 - t, 1.7);
            const n = (a.noise.fbm2D(i * 0.2 + t * 2, 1.4, 2) - 0.5) * len * 0.07;
            pts.push({
              x: origin.x + Math.cos(angle) * len * exp + n * Math.cos(angle + Math.PI / 2),
              y: origin.y + Math.sin(angle) * len * exp + n * Math.sin(angle + Math.PI / 2) + wind * t * 8,
            });
          }
          if (i % 4 === 0) {
            const mid = pts[Math.floor(pts.length * 0.6)]!;
            a.watercolorWash(a.organicBlob(mid.x, mid.y, 9 + u * 7, 6 + u * 4, 8), band, {
              layers: 12,
              bleed: 0.26,
              layerAlpha: 0.012,
              wetEdgeRing: false,
              subdivisions: 3,
            });
          }
          a.dryBrushChalk(pts, band, {
            thickness: 1.5 + (1 - Math.abs(u - 0.5) * 2) * 1.4,
            grain: 0.46,
            bristles: 5,
            decay: 0.62,
          });
        }

        if (f2 === fanFrames) {
          a.graphitePencil(
            [
              { x: origin.x, y: origin.y },
              { x: origin.x + w * 0.28, y: origin.y - h * 0.42 },
            ],
            fg,
            { grade: '4B', pressure: 0.85, wobble: 0.55 },
          );
          a.waxCrayon(
            [
              { x: origin.x + w * 0.22, y: origin.y - h * 0.36 },
              { x: origin.x + w * 0.34, y: origin.y - h * 0.44 },
            ],
            organic.ochre,
            { thickness: 7, tooth: 0.48, density: 0.9 },
          );
        }
      }
    },
  };
}

/**
 * Preset 2 — Paisagem Botânica & Atmosfera (Aquarela Wet-on-Wet + Lápis 2H)
 */
export function createBotanicalWatercolorSketch(): SketchDefinition {
  return {
    setup(a) {
      a.backend.clear();
      const { organic } = a.theme;
      const w = a.width, h = a.height;
      a.watercolorWash(a.organicBlob(w * 0.30, h * 0.44, w * 0.24, h * 0.32, 11), organic.sky, { layers: 22, bleed: 0.36 });
      a.watercolorWash(a.organicBlob(w * 0.62, h * 0.56, w * 0.26, h * 0.28, 11), organic.olive, { layers: 22, bleed: 0.34 });
      a.watercolorWash(a.organicBlob(w * 0.74, h * 0.30, w * 0.13, h * 0.16, 10), organic.ochre, { layers: 18, bleed: 0.3 });
    },
    draw(a, frame) {
      if (frame > 28) return;
      const w = a.width, h = a.height;
      const row = frame - 1;
      const yBase = h * (0.28 + (row / 28) * 0.56);
      const pts: Vec2[] = [];
      for (let x = w * 0.08; x <= w * 0.92; x += 14) {
        const elev = (a.noise.fbm2D(x * 0.008, row * 0.14, 3) - 0.5) * 46;
        pts.push({ x, y: yBase + elev });
      }
      if (row % 3 === 0) {
        a.graphitePencil(pts, a.theme.fg, { grade: row % 6 === 0 ? 'HB' : '2H', pressure: 0.65, wobble: 0.9 });
      }
    },
  };
}

/**
 * Preset 3 — Caderno Celestial & Gann (Lápis Grafite + Hachura + Pincel Sumi-e)
 */
export function createCelestialPencilSketch(): SketchDefinition {
  return {
    setup(a) {
      a.backend.clear();
      const w = a.width, h = a.height;
      a.hatchArea(w * 0.08, h * 0.14, w * 0.26, h * 0.72, -42, 9, a.theme.fg, { grade: '2H', pressure: 0.55 });
    },
    draw(a, frame) {
      if (frame > 30) return;
      const w = a.width, h = a.height;
      const cx = w * 0.58, cy = h * 0.50;
      const maxR = Math.min(w, h) * 0.38;

      if (frame <= 18) {
        const angle = ((frame - 1) / 18) * Math.PI * 2;
        const nextAngle = (frame / 18) * Math.PI * 2;
        const arcPts: Vec2[] = [];
        for (let s = 0; s <= 6; s++) {
          const ang = lerp(angle, nextAngle, s / 6);
          arcPts.push({ x: cx + Math.cos(ang) * maxR, y: cy + Math.sin(ang) * maxR });
        }
        a.graphitePencil(arcPts, a.theme.fg, { grade: '4B', pressure: 0.95, wobble: 1.0 });
      } else if (frame <= 26) {
        const idx = frame - 19;
        const deg = idx * 45;
        const rad = (deg * Math.PI) / 180;
        a.graphitePencil(
          [{ x: cx, y: cy }, { x: cx + Math.cos(rad) * maxR, y: cy + Math.sin(rad) * maxR }],
          a.theme.fg,
          { grade: 'HB', pressure: 0.8 }
        );
      } else if (frame === 28) {
        // Espiral Square-of-Nine a pincel caligráfico sumi-e
        const spiral: Vec2[] = [];
        for (let i = 0; i <= 48; i++) {
          const t = i / 48;
          const ang = t * Math.PI * 4.2;
          const r = t * maxR * 0.88;
          spiral.push({ x: cx + Math.cos(ang) * r, y: cy + Math.sin(ang) * r });
        }
        a.inkBrush(spiral, a.theme.organic.coral, { width: 6.5, bristles: 8, dryness: 0.36 });
      }
    },
  };
}

/**
 * Preset 4 — Colagem em Giz de Cera & Pastel Seco (Estilo Editorial Terracotta/Meridian)
 */
export function createCrayonCollageSketch(): SketchDefinition {
  return {
    setup(a) {
      a.backend.clear();
    },
    draw(a, frame) {
      if (frame > 24) return;
      const { organic, fg } = a.theme;
      const w = a.width, h = a.height;
      const palette = [organic.coral, organic.ochre, organic.sky, organic.olive];

      if (frame <= 14) {
        const y = h * 0.20 + (frame - 1) * (h * 0.044);
        const x0 = w * 0.12 + a.noise.random(-8, 12);
        const x1 = w * 0.52 + a.noise.random(-14, 16);
        a.waxCrayon(
          [{ x: x0, y }, { x: (x0 + x1) * 0.5, y: y + a.noise.random(-4, 4) }, { x: x1, y }],
          palette[frame % 2 === 0 ? 0 : 1],
          { thickness: 14, tooth: 0.54, density: 1.05 }
        );
      } else if (frame <= 22) {
        const i = frame - 15;
        const cx = w * 0.72, cy = h * 0.52;
        const r = Math.min(w, h) * (0.10 + i * 0.032);
        const ring: Vec2[] = [];
        for (let s = 0; s <= 18; s++) {
          const ang = (s / 18) * Math.PI * 1.45 + i * 0.4;
          ring.push({ x: cx + Math.cos(ang) * r, y: cy + Math.sin(ang) * r });
        }
        a.waxCrayon(ring, palette[(i + 2) % palette.length], { thickness: 9, tooth: 0.52 });
      } else if (frame === 24) {
        a.handDrawnRect(w * 0.10, h * 0.15, w * 0.44, h * 0.68, fg, { grade: '4B', pressure: 0.85 });
      }
    },
  };
}

/* ==========================================================================
   6. LOOP RUNTIME ESTILO p5.js (Com Reduced-Motion & Viewport Pause)
   ========================================================================== */

export interface SketchController {
  pause(): void;
  resume(): void;
  restart(newSeed?: number): void;
  destroy(): void;
}

export function runMeridianSketch(
  canvas: HTMLCanvasElement,
  sketch: SketchDefinition,
  options: {
    surface?: SurfaceId;
    signalStyle?: SignalStyle;
    seed?: number;
    maxFrames?: number;
    respectReducedMotion?: boolean;
  } = {}
): SketchController {
  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
  const reducedMotion =
    (options.respectReducedMotion ?? true) &&
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let seed = options.seed ?? 20261120;
  let frameCount = 0;
  let rafId = 0;
  let running = true;
  let inView = true;
  const startTime = performance.now();

  const buildAtelier = () =>
    new MeridianAtelier(createCanvasBackend(canvas, dpr), {
      seed,
      surface: options.surface ?? 'ivory',
      signalStyle: options.signalStyle ?? 'chromatic',
    });

  let atelier = buildAtelier();

  const tick = (now: number) => {
    if (!running || !inView) return;
    frameCount += 1;
    sketch.draw(atelier, frameCount, (now - startTime) / 1000);
    if (!options.maxFrames || frameCount < options.maxFrames) {
      rafId = requestAnimationFrame(tick);
    }
  };

  const start = () => {
    cancelAnimationFrame(rafId);
    frameCount = 0;
    atelier = buildAtelier();
    sketch.setup(atelier);

    if (reducedMotion) {
      const staticSteps = Math.min(options.maxFrames ?? 44, 48);
      for (let f = 1; f <= staticSteps; f++) sketch.draw(atelier, f, f / 60);
      return;
    }

    rafId = requestAnimationFrame(tick);
  };

  let observer: IntersectionObserver | null = null;
  if (typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver(
      (entries) => {
        inView = entries[0]?.isIntersecting ?? true;
        if (inView && running && !reducedMotion && (!options.maxFrames || frameCount < options.maxFrames)) {
          cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);
  }

  start();

  return {
    pause() { running = false; cancelAnimationFrame(rafId); },
    resume() { if (!running) { running = true; rafId = requestAnimationFrame(tick); } },
    restart(newSeed?: number) { if (newSeed !== undefined) seed = newSeed; running = true; start(); },
    destroy() { running = false; cancelAnimationFrame(rafId); observer?.disconnect(); },
  };
}
