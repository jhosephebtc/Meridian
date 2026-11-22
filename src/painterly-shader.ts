/**
 * MERIDIAN PAINTERLY SHADER ENGINE — painterly-shader.ts (v1.5.0)
 * Multi-Pass WebGL Anisotropic Kuwahara & Paper Materiality Engine in 100% strict TypeScript.
 *
 * Inspired by Maxime Heckel's "On Crafting Painterly Shaders"
 * (https://blog.maximeheckel.com/posts/on-crafting-painterly-shaders/)
 * and Jan Eric Kyprianidis's Generalized Anisotropic Kuwahara Filter (2009).
 *
 * 4-Pass GPU Pipeline (Zero Three.js / Zero p5.js dependencies):
 *  Pass 1 (tensorPass)     — 3×3 Sobel Structure Tensor (E, F, G)
 *  Pass 2 (tensorBlurPass) — Gaussian Tensor Smoothing + Eigenvalues (angle φ, anisotropy A, edge magnitude)
 *  Pass 3 (kuwaharaPass)   — 8-Sector Generalized Anisotropic Kuwahara rotated & stretched along φ
 *  Pass 4 (finalPass)      — Wet-edge pigment pooling, saturation/contrast, procedural cold-press cotton paper,
 *                            Meridian Single-Ink duotone mode, Structure Tensor flow debug & 1:1 split curtain.
 */

export type PainterlyPresetId =
  | 'gouache'
  | 'oil'
  | 'watercolor'
  | 'pastel'
  | 'sumie'
  | 'fresco'
  | 'fauve'
  | 'ink';
export type PainterlyDebugMode =
  | 'final'
  | 'kuwahara'
  | 'tensor'
  | 'halftone'
  | 'engraving'
  | 'stipple'
  | 'woodblock'
  | 'risograph'
  | 'original';

export interface PainterlyParams {
  /** Brush stroke kernel radius in pixels (2..10). */
  radius: number;
  /** Directional stroke stretching along Structure Tensor contours (0..2.2). */
  anisotropy: number;
  /** Inverse-variance sector sharpness q (2..16). */
  sharpness: number;
  /** Structure Tensor Gaussian smoothing sigma (0.6..3.5). */
  tensorSigma: number;
  /** Procedural cold-press cotton paper & canvas weave grain (0..1). */
  paper: number;
  /** Pigment saturation multiplier (0..1.8). */
  saturation: number;
  /** Watercolor capillary wet-edge / gouache outline pooling (0..1). */
  edge: number;
  /** Single-Ink duotone mix matching Meridian's active --ds-bg / --ds-fg (0..1). */
  inkMix: number;
  /** Interactive before/after split curtain x in [0, 1]. Set <= 0 to show full shader. */
  split: number;
  /** Debug pass selector. */
  debug: PainterlyDebugMode;
}

export const PAINTERLY_PRESETS: Record<PainterlyPresetId, Omit<PainterlyParams, 'split' | 'debug'>> = {
  gouache: {
    radius: 8,
    anisotropy: 1.2,
    sharpness: 6.5,
    tensorSigma: 2.1,
    paper: 0.78,
    saturation: 1.18,
    edge: 0.46,
    inkMix: 0,
  },
  oil: {
    radius: 10,
    anisotropy: 1.85,
    sharpness: 9,
    tensorSigma: 2.6,
    paper: 0.58,
    saturation: 1.28,
    edge: 0.32,
    inkMix: 0,
  },
  watercolor: {
    radius: 9,
    anisotropy: 0.9,
    sharpness: 3.5,
    tensorSigma: 2.2,
    paper: 0.92,
    saturation: 1.05,
    edge: 0.82,
    inkMix: 0,
  },
  pastel: {
    radius: 6,
    anisotropy: 0.55,
    sharpness: 4.5,
    tensorSigma: 1.4,
    paper: 0.98,
    saturation: 1.34,
    edge: 0.22,
    inkMix: 0,
  },
  sumie: {
    radius: 8,
    anisotropy: 1.95,
    sharpness: 7.5,
    tensorSigma: 2.4,
    paper: 0.88,
    saturation: 0.15,
    edge: 0.68,
    inkMix: 0.92,
  },
  fresco: {
    radius: 7,
    anisotropy: 0.85,
    sharpness: 5.5,
    tensorSigma: 1.9,
    paper: 0.95,
    saturation: 0.9,
    edge: 0.38,
    inkMix: 0.14,
  },
  fauve: {
    radius: 9,
    anisotropy: 1.55,
    sharpness: 11.5,
    tensorSigma: 1.7,
    paper: 0.52,
    saturation: 1.62,
    edge: 0.54,
    inkMix: 0,
  },
  ink: {
    radius: 7,
    anisotropy: 1.45,
    sharpness: 8,
    tensorSigma: 2.0,
    paper: 0.74,
    saturation: 0.72,
    edge: 0.58,
    inkMix: 1,
  },
};

export interface PainterlyRenderer {
  readonly supported: boolean;
  readonly canvas: HTMLCanvasElement;
  setSource(source: HTMLImageElement | HTMLCanvasElement): void;
  updateSource(): void;
  setSurfaceColors(bgHex: string, fgHex: string): void;
  setParams(next: Partial<PainterlyParams>): void;
  getParams(): PainterlyParams;
  render(): number;
  exportPng(filename?: string): string;
  dispose(): void;
}

const VERT_SRC = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

// Pass 1: 3x3 Sobel Structure Tensor (E, G, F packed into RGBA8 with safe dynamic scale)
const TENSOR_FRAG_SRC = `
precision highp float;
uniform sampler2D u_image;
uniform vec2 u_texel;
varying vec2 v_uv;

void main() {
  vec3 tl = texture2D(u_image, v_uv + vec2(-u_texel.x, -u_texel.y)).rgb;
  vec3 tc = texture2D(u_image, v_uv + vec2( 0.0,       -u_texel.y)).rgb;
  vec3 tr = texture2D(u_image, v_uv + vec2( u_texel.x, -u_texel.y)).rgb;
  vec3 ml = texture2D(u_image, v_uv + vec2(-u_texel.x,  0.0      )).rgb;
  vec3 mr = texture2D(u_image, v_uv + vec2( u_texel.x,  0.0      )).rgb;
  vec3 bl = texture2D(u_image, v_uv + vec2(-u_texel.x,  u_texel.y)).rgb;
  vec3 bc = texture2D(u_image, v_uv + vec2( 0.0,        u_texel.y)).rgb;
  vec3 br = texture2D(u_image, v_uv + vec2( u_texel.x,  u_texel.y)).rgb;

  vec3 sx = (tr + 2.0 * mr + br - tl - 2.0 * ml - bl) * 0.25;
  vec3 sy = (bl + 2.0 * bc + br - tl - 2.0 * tc - tr) * 0.25;

  float E = dot(sx, sx);
  float G = dot(sy, sy);
  float F = dot(sx, sy);

  // Boost moderate gradients into RGBA8 [0,1] range while preserving sign of F around 0.5
  float scale = 4.0;
  gl_FragColor = vec4(
    clamp(E * scale, 0.0, 1.0),
    clamp(G * scale, 0.0, 1.0),
    clamp(F * scale * 0.5 + 0.5, 0.0, 1.0),
    1.0
  );
}
`;

// Pass 2: Gaussian Tensor Smoothing + Eigenvalue / Eigenvector extraction
// Outputs: R = orientation phi / PI in [0,1], G = anisotropy A in [0,1], B = edge magnitude in [0,1]
const TENSOR_BLUR_FRAG_SRC = `
precision highp float;
uniform sampler2D u_tensor;
uniform vec2 u_texel;
uniform float u_sigma;
varying vec2 v_uv;

void main() {
  float sigma = max(0.5, u_sigma);
  float twoSigma2 = 2.0 * sigma * sigma;
  vec3 acc = vec3(0.0);
  float wSum = 0.0;

  for (int y = -3; y <= 3; y++) {
    for (int x = -3; x <= 3; x++) {
      vec2 off = vec2(float(x), float(y));
      float d2 = dot(off, off);
      float w = exp(-d2 / twoSigma2);
      vec3 t = texture2D(u_tensor, v_uv + off * u_texel * max(1.0, sigma * 0.65)).rgb;
      float E = t.r;
      float G = t.g;
      float F = (t.b - 0.5) * 2.0;
      acc += vec3(E, G, F) * w;
      wSum += w;
    }
  }

  vec3 s = acc / max(wSum, 0.0001);
  float E = s.x;
  float G = s.y;
  float F = s.z;

  float disc = sqrt(max(0.0, (E - G) * (E - G) + 4.0 * F * F));
  float lambda1 = 0.5 * (E + G + disc);
  float lambda2 = 0.5 * (E + G - disc);

  // Eigenvector aligned along the local edge tangent
  vec2 v = vec2(lambda1 - E, -F);
  float phi = (dot(v, v) > 1e-7) ? atan(v.y, v.x) : 0.0;
  // Normalize orientation angle into [0, PI)
  if (phi < 0.0) phi += 3.14159265;
  if (phi >= 3.14159265) phi -= 3.14159265;

  float aniso = (lambda1 + lambda2 > 1e-5) ? (lambda1 - lambda2) / (lambda1 + lambda2) : 0.0;
  float edgeMag = clamp(sqrt(max(0.0, lambda1)) * 1.45, 0.0, 1.0);

  gl_FragColor = vec4(phi / 3.14159265, clamp(aniso, 0.0, 1.0), edgeMag, 1.0);
}
`;

// Pass 3: Generalized Anisotropic Kuwahara Filter (8 polynomial-weighted elliptical sectors)
const KUWAHARA_FRAG_SRC = `
precision highp float;
uniform sampler2D u_image;
uniform sampler2D u_tensor;
uniform vec2 u_texel;
uniform float u_radius;
uniform float u_anisotropy;
uniform float u_sharpness;
varying vec2 v_uv;

const float PI = 3.14159265;

void main() {
  vec3 t = texture2D(u_tensor, v_uv).rgb;
  float phi = t.r * PI;
  float A = t.g;

  float r = clamp(u_radius, 2.0, 10.0);
  float stretch = 1.0 + A * clamp(u_anisotropy, 0.0, 2.5) * 1.15;
  float a = min(10.0, r * stretch);
  float b = max(1.35, r / stretch);

  float cosPhi = cos(phi);
  float sinPhi = sin(phi);

  int maxX = int(min(10.0, ceil(sqrt(a * a * cosPhi * cosPhi + b * b * sinPhi * sinPhi))));
  int maxY = int(min(10.0, ceil(sqrt(a * a * sinPhi * sinPhi + b * b * cosPhi * cosPhi))));

  float zeta = 2.0 / r;
  float zeroCross = 0.58;
  float sinZeroCross = sin(zeroCross);
  float eta = (zeta + cos(zeroCross)) / (sinZeroCross * sinZeroCross);

  vec4 m0 = vec4(0.0); vec4 m1 = vec4(0.0); vec4 m2 = vec4(0.0); vec4 m3 = vec4(0.0);
  vec4 m4 = vec4(0.0); vec4 m5 = vec4(0.0); vec4 m6 = vec4(0.0); vec4 m7 = vec4(0.0);
  vec3 s0 = vec3(0.0); vec3 s1 = vec3(0.0); vec3 s2 = vec3(0.0); vec3 s3 = vec3(0.0);
  vec3 s4 = vec3(0.0); vec3 s5 = vec3(0.0); vec3 s6 = vec3(0.0); vec3 s7 = vec3(0.0);

  for (int y = -10; y <= 10; y++) {
    if (y < -maxY || y > maxY) continue;
    for (int x = -10; x <= 10; x++) {
      if (x < -maxX || x > maxX) continue;
      vec2 p = vec2(float(x), float(y));
      vec2 v = vec2(
        ( cosPhi * p.x + sinPhi * p.y) / a,
        (-sinPhi * p.x + cosPhi * p.y) / b
      );
      float d2 = dot(v, v);
      if (d2 > 1.0) continue;

      vec3 c = texture2D(u_image, v_uv + p * u_texel).rgb;
      vec3 c2 = c * c;

      float vxx = zeta - eta * v.x * v.x;
      float vyy = zeta - eta * v.y * v.y;
      float z0 = max(0.0,  v.y + vxx); float w0 = z0 * z0;
      float z2 = max(0.0, -v.x + vyy); float w2 = z2 * z2;
      float z4 = max(0.0, -v.y + vxx); float w4 = z4 * z4;
      float z6 = max(0.0,  v.x + vyy); float w6 = z6 * z6;

      vec2 vr = 0.70710678 * vec2(v.x - v.y, v.x + v.y);
      float rxx = zeta - eta * vr.x * vr.x;
      float ryy = zeta - eta * vr.y * vr.y;
      float z1 = max(0.0,  vr.y + rxx); float w1 = z1 * z1;
      float z3 = max(0.0, -vr.x + ryy); float w3 = z3 * z3;
      float z5 = max(0.0, -vr.y + rxx); float w5 = z5 * z5;
      float z7 = max(0.0,  vr.x + ryy); float w7 = z7 * z7;

      float sumW = w0 + w1 + w2 + w3 + w4 + w5 + w6 + w7;
      if (sumW > 0.0001) {
        float g = exp(-3.125 * d2) / sumW;
        float k0 = w0 * g; m0 += vec4(c * k0, k0); s0 += c2 * k0;
        float k1 = w1 * g; m1 += vec4(c * k1, k1); s1 += c2 * k1;
        float k2 = w2 * g; m2 += vec4(c * k2, k2); s2 += c2 * k2;
        float k3 = w3 * g; m3 += vec4(c * k3, k3); s3 += c2 * k3;
        float k4 = w4 * g; m4 += vec4(c * k4, k4); s4 += c2 * k4;
        float k5 = w5 * g; m5 += vec4(c * k5, k5); s5 += c2 * k5;
        float k6 = w6 * g; m6 += vec4(c * k6, k6); s6 += c2 * k6;
        float k7 = w7 * g; m7 += vec4(c * k7, k7); s7 += c2 * k7;
      }
    }
  }

  vec4 outCol = vec4(0.0);
  float q = clamp(u_sharpness, 1.5, 16.0);

  #define ACCUM(M, S) { \
    if (M.w > 0.0001) { \
      vec3 mean = M.rgb / M.w; \
      vec3 var = abs(S / M.w - mean * mean); \
      float sigma2 = var.r + var.g + var.b; \
      float wk = 1.0 / (1.0 + pow(max(0.0, 255.0 * sigma2), 0.5 * q)); \
      outCol += vec4(mean * wk, wk); \
    } \
  }

  ACCUM(m0, s0);
  ACCUM(m1, s1);
  ACCUM(m2, s2);
  ACCUM(m3, s3);
  ACCUM(m4, s4);
  ACCUM(m5, s5);
  ACCUM(m6, s6);
  ACCUM(m7, s7);

  vec3 col = outCol.w > 0.0001 ? (outCol.rgb / outCol.w) : texture2D(u_image, v_uv).rgb;
  gl_FragColor = vec4(col, 1.0);
}
`;

// Pass 4: Final Materiality Pass (Wet-edge pigment pooling, cotton paper tooth, saturation, Single-Ink, Tensor debug & Split)
const FINAL_FRAG_SRC = `
precision highp float;
uniform sampler2D u_kuwahara;
uniform sampler2D u_original;
uniform sampler2D u_tensor;
uniform vec2 u_resolution;
uniform float u_radius;
uniform float u_paper;
uniform float u_saturation;
uniform float u_edge;
uniform float u_inkMix;
uniform float u_split;
uniform int u_debug;
uniform vec3 u_bgColor;
uniform vec3 u_fgColor;
varying vec2 v_uv;

const float PI = 3.14159265;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float paperGrain(vec2 px) {
  // Cold-press tooth coarse enough to survive CSS downscale of the stage canvas.
  // Sub-pixel frequencies were averaging back into a flat tint.
  float tooth = vnoise(px * 0.07) * 0.52 + vnoise(px * 0.18) * 0.32 + vnoise(px * 0.46) * 0.16;
  float weaveX = sin(px.x * 0.38 + vnoise(px * 0.025) * 3.2) * 0.5 + 0.5;
  float weaveY = sin(px.y * 0.38 + vnoise(px * 0.025 + 7.3) * 3.2) * 0.5 + 0.5;
  float weave = mix(weaveX, weaveY, 0.5);
  float speck = hash21(floor(px * 0.28));
  return (tooth * 0.58 + weave * 0.28 + speck * 0.14) - 0.5;
}

void main() {
  vec3 orig = texture2D(u_original, v_uv).rgb;
  vec3 kuw = texture2D(u_kuwahara, v_uv).rgb;
  vec3 ten = texture2D(u_tensor, v_uv).rgb;
  vec2 px = v_uv * u_resolution;
  float grain = paperGrain(px);

  // Before/After vertical split curtain (left = original, right = active process)
  if (u_split > 0.002 && u_split < 0.998 && v_uv.x < u_split) {
    gl_FragColor = vec4(orig, 1.0);
    return;
  }

  if (u_debug == 3) {
    gl_FragColor = vec4(orig, 1.0);
    return;
  }
  if (u_debug == 1) {
    gl_FragColor = vec4(kuw, 1.0);
    return;
  }
  if (u_debug == 2) {
    // Structure Tensor Flow: directional streamlines aligned with phi + anisotropy luminance
    float phi = ten.r * PI;
    float A = ten.g;
    float edge = ten.b;
    vec2 dir = vec2(cos(phi), sin(phi));
    vec2 perp = vec2(-dir.y, dir.x);
    float pitch = max(0.32, 1.15 - u_radius * 0.075);
    float linePattern = sin(dot(px, perp) * pitch + vnoise(px * 0.03) * 2.8);
    float hatch = smoothstep(0.62, 0.95, abs(linePattern)) * (0.28 + 0.72 * A);
    vec3 col = mix(u_bgColor, u_fgColor, clamp(hatch * 0.72 + edge * (0.35 + u_edge * 0.45), 0.0, 1.0));
    col = clamp(col + vec3(grain * u_paper * 0.14), 0.0, 1.0);
    gl_FragColor = vec4(col, 1.0);
    return;
  }
  if (u_debug == 4) {
    // Hexagonal Halftone Dot Screen (Paper Design inspired)
    float cell = max(4.5, 3.2 + u_radius * 1.15);
    vec2 r = vec2(cell, cell * 1.7320508);
    vec2 h = r * 0.5;
    vec2 a = mod(px, r) - h;
    vec2 b = mod(px - h, r) - h;
    vec2 gv = dot(a, a) < dot(b, b) ? a : b;
    vec2 id = px - gv;
    vec2 cellUv = clamp(id / u_resolution, 0.0, 1.0);
    vec3 sampleCol = texture2D(u_original, cellUv).rgb;
    float lum = clamp(dot(sampleCol, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0);
    lum = clamp((lum - 0.5) * (0.95 + u_saturation * 0.25) + 0.5, 0.0, 1.0);
    float dotR = sqrt(clamp(1.0 - lum, 0.0, 1.0)) * (cell * 0.49);
    float d = length(gv);
    float dotMask = 1.0 - smoothstep(dotR - 0.8, dotR + 0.8, d);
    float contour = smoothstep(0.2, 0.72, ten.b) * u_edge * 0.65;
    float inkAmt = clamp(max(dotMask * 0.92, contour), 0.0, 1.0);
    vec3 chromaDot = mix(u_bgColor, clamp(sampleCol * (0.65 + u_saturation * 0.35), 0.0, 1.0), dotMask);
    vec3 inkPlate = mix(u_bgColor, u_fgColor, inkAmt);
    vec3 col = mix(chromaDot, inkPlate, clamp(0.35 + u_inkMix * 0.65, 0.0, 1.0));
    col = clamp(col + vec3(grain * u_paper * 0.16), 0.0, 1.0);
    gl_FragColor = vec4(col, 1.0);
    return;
  }
  if (u_debug == 5) {
    // Copperplate Engraving / Tensor-Aligned Cross-Hatching
    float phi = ten.r * PI;
    vec2 dir = vec2(cos(phi), sin(phi));
    vec2 perp = vec2(-dir.y, dir.x);
    float lum = clamp(dot(orig, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0);
    float darkness = clamp(1.0 - lum, 0.0, 1.0);
    float freq = max(0.35, 1.45 - u_radius * 0.1);
    float h1 = smoothstep(1.0 - darkness * 1.15, 1.05 - darkness * 0.85, sin(dot(px, perp) * freq) * 0.5 + 0.5);
    float h2 = smoothstep(1.05 - max(0.0, darkness - 0.35) * 1.4, 1.1 - max(0.0, darkness - 0.35) * 1.1, sin(dot(px, dir + perp * 0.35) * (freq * 0.88)) * 0.5 + 0.5);
    float h3 = step(0.72, darkness) * (0.5 + 0.5 * sin((px.x - px.y) * freq * 0.75));
    float contour = smoothstep(0.16, 0.62, ten.b) * (0.35 + u_edge * 0.65);
    float ink = clamp(max(max(h1 * 0.72, h2 * 0.82), max(h3 * 0.75, contour)), 0.0, 1.0);
    vec3 mono = mix(u_bgColor, u_fgColor, ink);
    vec3 tinted = mix(mix(u_bgColor, orig, 0.75 * clamp(u_saturation, 0.0, 1.2)), u_fgColor, ink * 0.85);
    vec3 col = mix(tinted, mono, clamp(0.65 + u_inkMix * 0.35, 0.0, 1.0));
    col = clamp(col + vec3(grain * u_paper * 0.2), 0.0, 1.0);
    gl_FragColor = vec4(col, 1.0);
    return;
  }
  if (u_debug == 6) {
    // Stochastic Jittered Pointillism / Stipple
    float stepPx = max(4.0, 2.8 + u_radius * 1.05);
    vec2 cellId = floor(px / stepPx);
    vec2 jitter = vec2(hash21(cellId), hash21(cellId + 17.3)) - 0.5;
    vec2 center = (cellId + 0.5 + jitter * 0.55) * stepPx;
    vec3 sampleCol = texture2D(u_original, clamp(center / u_resolution, 0.0, 1.0)).rgb;
    float lum = clamp(dot(sampleCol, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0);
    float rad = pow(clamp(1.0 - lum, 0.05, 1.0), 0.85) * (stepPx * 0.46);
    float dotMask = 1.0 - smoothstep(rad - 0.7, rad + 0.7, length(px - center));
    float contour = smoothstep(0.24, 0.74, ten.b) * u_edge * 0.45;
    vec3 pigmentDot = mix(vec3(dot(sampleCol, vec3(0.2126, 0.7152, 0.0722))), sampleCol, u_saturation);
    vec3 colorOut = mix(u_bgColor, clamp(pigmentDot * 0.92, 0.0, 1.0), clamp(max(dotMask, contour), 0.0, 1.0));
    vec3 monoOut = mix(u_bgColor, u_fgColor, clamp(max(dotMask, contour), 0.0, 1.0));
    vec3 col = mix(colorOut, monoOut, u_inkMix);
    col = clamp(col + vec3(grain * u_paper * 0.18), 0.0, 1.0);
    gl_FragColor = vec4(col, 1.0);
    return;
  }
  if (u_debug == 7) {
    // Woodblock / Screenprint Posterization with Tensor-Smoothed Zones & Variable-Weight Ink Contour
    float levels = clamp(7.5 - u_radius * 0.35, 3.0, 7.0);
    float lumaK = dot(kuw, vec3(0.2126, 0.7152, 0.0722));
    float banded = floor(lumaK * levels + 0.5) / levels;
    vec3 qCol = kuw * (banded / max(lumaK, 0.04));
    qCol = mix(vec3(banded), clamp(qCol, 0.0, 1.0), u_saturation);
    float outline = smoothstep(0.14, 0.55, ten.b) * clamp(0.35 + u_edge * 0.85, 0.0, 1.0);
    vec3 col = mix(qCol, u_fgColor, outline * 0.88);
    if (u_inkMix > 0.01) {
      vec3 mono = mix(u_fgColor, u_bgColor, clamp(banded, 0.0, 1.0));
      col = mix(col, mix(mono, u_fgColor, outline * 0.9), u_inkMix);
    }
    col = clamp(col + vec3(grain * u_paper * 0.22), 0.0, 1.0);
    gl_FragColor = vec4(col, 1.0);
    return;
  }
  if (u_debug == 8) {
    // Dual-Plate Risograph (Misregistered Warm Coral & Deep Teal/Ink halftone plates)
    float off = 1.5 + u_radius * 0.65;
    vec3 sA = texture2D(u_original, clamp(v_uv + vec2(off, -off * 0.5) / u_resolution, 0.0, 1.0)).rgb;
    vec3 sB = texture2D(u_original, clamp(v_uv - vec2(off, -off * 0.5) / u_resolution, 0.0, 1.0)).rgb;
    float noiseDither = (hash21(floor(px * 0.65)) - 0.5) * (0.14 + u_paper * 0.2);
    float darkPlate = clamp(1.0 - dot(sA, vec3(0.2126, 0.7152, 0.0722)) + noiseDither, 0.0, 1.0);
    float warmPlate = clamp((sB.r - sB.b * 0.45) * 1.15 + (1.0 - dot(sB, vec3(0.333))) * 0.35 + noiseDither, 0.0, 1.0);
    vec3 risoWarm = mix(vec3(0.85, 0.46, 0.34), u_fgColor, u_inkMix * 0.75);
    vec3 risoDeep = mix(vec3(0.14, 0.31, 0.38), u_fgColor, 0.45 + u_inkMix * 0.55);
    vec3 col = mix(u_bgColor, risoWarm, smoothstep(0.18, 0.82, warmPlate) * clamp(u_saturation * 0.72, 0.25, 0.95));
    col = mix(col, risoDeep, smoothstep(0.28, 0.88, darkPlate) * 0.86);
    float contour = smoothstep(0.22, 0.68, ten.b) * u_edge * 0.45;
    col = mix(col, u_fgColor, contour);
    col = clamp(col + vec3(grain * u_paper * 0.2), 0.0, 1.0);
    gl_FragColor = vec4(col, 1.0);
    return;
  }

  vec3 col = kuw;

  // 1. Perceptual pigment saturation & a little more separation between dabs
  float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = mix(vec3(luma), col, u_saturation);
  col = clamp((col - 0.5) * 1.08 + 0.5, 0.0, 1.0);

  // 2. Watercolor wet-edge pigment pooling along Sobel contours
  float edgeMask = smoothstep(0.08, 0.62, ten.b) * (0.78 + 0.4 * (grain + 0.5));
  float wetDarken = 1.0 - edgeMask * u_edge * 0.7;
  col *= wetDarken;

  // 3. Cotton tooth + directional wash. Amplitudes sit on u_paper so the
  // existing slider still drives them; features are large enough to read
  // after the stage scales the canvas down.
  float phi = ten.r * PI;
  vec2 dir = vec2(cos(phi), sin(phi));
  vec2 across = vec2(-dir.y, dir.x);
  float band = sin(dot(px, across) * 0.1 + vnoise(px * 0.012) * 5.0);
  float gap = step(0.42, vnoise(floor(px * 0.035) + 2.7));
  float wash = (vnoise(px * 0.03) - 0.5) * 0.62 + band * 0.55 * gap;
  float pigment = (grain * 0.26 + wash * 0.1) * u_paper;
  col = clamp(col + vec3(pigment * 1.05, pigment, pigment * 0.9), 0.0, 1.0);

  // 4. Optional Meridian Single-Ink duotone plate mode
  if (u_inkMix > 0.001) {
    float inkLuma = dot(col, vec3(0.299, 0.587, 0.114));
    float curved = smoothstep(0.08, 0.94, inkLuma);
    vec3 mono = mix(u_fgColor, u_bgColor, curved);
    mono = clamp(mono + vec3(grain * u_paper * 0.32), 0.0, 1.0);
    col = mix(col, mono, clamp(u_inkMix, 0.0, 1.0));
  }

  gl_FragColor = vec4(col, 1.0);
}
`;

function hexToRgb01(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim();
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean.slice(0, 6);
  const n = parseInt(full, 16);
  if (Number.isNaN(n)) return [0.98, 0.976, 0.96];
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type);
  if (!s) throw new Error('PainterlyShader: createShader failed');
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(s) || 'compile error';
    gl.deleteShader(s);
    throw new Error(`PainterlyShader: ${log}`);
  }
  return s;
}

function linkProgram(gl: WebGLRenderingContext, vertSrc: string, fragSrc: string): WebGLProgram {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
  const prog = gl.createProgram();
  if (!prog) throw new Error('PainterlyShader: createProgram failed');
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(prog) || 'link error';
    gl.deleteProgram(prog);
    throw new Error(`PainterlyShader: ${log}`);
  }
  return prog;
}

interface FBO {
  fbo: WebGLFramebuffer;
  tex: WebGLTexture;
  w: number;
  h: number;
}

function createFbo(gl: WebGLRenderingContext, w: number, h: number): FBO {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  const fbo = gl.createFramebuffer()!;
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return { fbo, tex, w, h };
}

function destroyFbo(gl: WebGLRenderingContext, target: FBO | null): void {
  if (!target) return;
  gl.deleteFramebuffer(target.fbo);
  gl.deleteTexture(target.tex);
}

/** Coarser Kuwahara grid so a radius of 8 reads as paint dabs, not an 8px blur. */
function brushScale(radius: number): number {
  return Math.max(3.15, Math.min(4.5, 1.45 + radius * 0.36));
}

const DEBUG_INT: Record<PainterlyDebugMode, number> = {
  final: 0,
  kuwahara: 1,
  tensor: 2,
  original: 3,
  halftone: 4,
  engraving: 5,
  stipple: 6,
  woodblock: 7,
  risograph: 8,
};

/**
 * Generates a vibrant, high-contrast procedural landscape canvas (Coastal Lighthouse at Dusk)
 * so the Painterly Shader Studio has rich chromatic brushstrokes immediately on load without network latency.
 */
export function createPainterlySampleCanvas(width = 960, height = 600): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const ctx = c.getContext('2d');
  if (!ctx) return c;

  // Warm Mediterranean sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, height * 0.62);
  sky.addColorStop(0, '#2B4A62');
  sky.addColorStop(0.45, '#598296');
  sky.addColorStop(0.82, '#DFA97B');
  sky.addColorStop(1, '#F3CFA2');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, height * 0.62);

  // Sculptural sunset clouds
  const clouds: Array<[number, number, number, number, string]> = [
    [210, 128, 170, 38, 'rgba(250, 232, 206, 0.78)'],
    [340, 145, 130, 30, 'rgba(232, 165, 118, 0.72)'],
    [660, 108, 195, 42, 'rgba(247, 224, 194, 0.74)'],
    [760, 136, 120, 26, 'rgba(210, 124, 92, 0.68)'],
    [470, 88, 140, 28, 'rgba(235, 218, 200, 0.56)'],
  ];
  for (const [cx, cy, rx, ry, fill] of clouds) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, -0.06, 0, Math.PI * 2);
    ctx.fill();
  }

  // Warm solar disc near horizon
  const sun = ctx.createRadialGradient(width * 0.34, height * 0.5, 10, width * 0.34, height * 0.5, 140);
  sun.addColorStop(0, '#FFF6E0');
  sun.addColorStop(0.28, '#F6C27D');
  sun.addColorStop(1, 'rgba(246, 194, 125, 0)');
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, width, height);

  // Distant coastal mountain range
  ctx.fillStyle = '#3B5668';
  ctx.beginPath();
  ctx.moveTo(0, height * 0.58);
  ctx.bezierCurveTo(160, height * 0.44, 320, height * 0.52, 480, height * 0.56);
  ctx.bezierCurveTo(640, height * 0.48, 800, height * 0.42, width, height * 0.54);
  ctx.lineTo(width, height * 0.64);
  ctx.lineTo(0, height * 0.64);
  ctx.closePath();
  ctx.fill();

  // Ocean plane with reflected sunset ribbons
  const sea = ctx.createLinearGradient(0, height * 0.58, 0, height);
  sea.addColorStop(0, '#3C697C');
  sea.addColorStop(0.45, '#254C5E');
  sea.addColorStop(1, '#162C38');
  ctx.fillStyle = sea;
  ctx.fillRect(0, height * 0.58, width, height * 0.42);

  for (let i = 0; i < 24; i++) {
    const y = height * 0.6 + i * 9.5;
    const w = 180 - i * 3 + Math.sin(i * 1.4) * 45;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(245, 198, 134, 0.44)' : 'rgba(218, 128, 92, 0.32)';
    ctx.fillRect(width * 0.34 - w * 0.5 + Math.sin(i * 2.1) * 18, y, w, 4.2);
  }

  // Terraced basalt & olive headland cliff on the right
  ctx.fillStyle = '#2B3529';
  ctx.beginPath();
  ctx.moveTo(width * 0.48, height);
  ctx.bezierCurveTo(width * 0.54, height * 0.72, width * 0.62, height * 0.58, width * 0.72, height * 0.54);
  ctx.lineTo(width, height * 0.56);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // Ochre/terracotta lit rock facets & olive coastal foliage
  ctx.fillStyle = '#8F6A42';
  ctx.beginPath();
  ctx.moveTo(width * 0.58, height * 0.72);
  ctx.lineTo(width * 0.71, height * 0.55);
  ctx.lineTo(width * 0.84, height * 0.66);
  ctx.lineTo(width * 0.72, height * 0.82);
  ctx.closePath();
  ctx.fill();

  const bushes: Array<[number, number, number, string]> = [
    [605, 420, 48, '#4E623B'],
    [665, 392, 54, '#647849'],
    [775, 412, 62, '#3E5231'],
    [848, 398, 56, '#7C8A52'],
    [560, 480, 68, '#36452B'],
    [720, 472, 74, '#B55A42'],
    [825, 490, 80, '#5E6E47'],
  ];
  for (const [bx, by, br, fill] of bushes) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }

  // Iconic Meridian Lighthouse tower on the cliff
  const lx = width * 0.72;
  const baseY = height * 0.56;
  ctx.fillStyle = '#F6F1E6';
  ctx.beginPath();
  ctx.moveTo(lx - 26, baseY);
  ctx.lineTo(lx - 17, baseY - 142);
  ctx.lineTo(lx + 17, baseY - 142);
  ctx.lineTo(lx + 26, baseY);
  ctx.closePath();
  ctx.fill();

  // Coral-red lighthouse bands
  ctx.fillStyle = '#B84B39';
  ctx.fillRect(lx - 22, baseY - 56, 44, 24);
  ctx.fillRect(lx - 19, baseY - 108, 38, 22);

  // Shaded right half of cylinder for crisp 3D Sobel contour
  ctx.fillStyle = 'rgba(28, 32, 36, 0.24)';
  ctx.beginPath();
  ctx.moveTo(lx + 2, baseY);
  ctx.lineTo(lx + 1, baseY - 142);
  ctx.lineTo(lx + 17, baseY - 142);
  ctx.lineTo(lx + 26, baseY);
  ctx.closePath();
  ctx.fill();

  // Lantern room & warm beacon glow
  ctx.fillStyle = '#1C1E20';
  ctx.fillRect(lx - 21, baseY - 148, 42, 8);
  ctx.fillStyle = '#FFE4A3';
  ctx.fillRect(lx - 13, baseY - 172, 26, 24);
  ctx.fillStyle = '#1C1E20';
  ctx.beginPath();
  ctx.moveTo(lx - 18, baseY - 172);
  ctx.lineTo(lx, baseY - 194);
  ctx.lineTo(lx + 18, baseY - 172);
  ctx.closePath();
  ctx.fill();

  // Diagonal lighthouse beam
  const beam = ctx.createLinearGradient(lx, baseY - 160, lx - 380, baseY - 230);
  beam.addColorStop(0, 'rgba(255, 242, 198, 0.55)');
  beam.addColorStop(1, 'rgba(255, 242, 198, 0)');
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(lx - 10, baseY - 166);
  ctx.lineTo(lx - 420, baseY - 260);
  ctx.lineTo(lx - 420, baseY - 150);
  ctx.lineTo(lx - 10, baseY - 152);
  ctx.closePath();
  ctx.fill();

  // Foreground dark rock silhouette + sailboat for clear sharp edges
  ctx.fillStyle = '#1E2528';
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, height * 0.78);
  ctx.quadraticCurveTo(135, height * 0.72, 240, height);
  ctx.closePath();
  ctx.fill();

  // Small white sailboat on the sunset horizon
  const sx = width * 0.25;
  const sy = height * 0.67;
  ctx.fillStyle = '#FAF6ED';
  ctx.beginPath();
  ctx.moveTo(sx, sy - 46);
  ctx.lineTo(sx + 22, sy - 6);
  ctx.lineTo(sx, sy - 6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#23282C';
  ctx.beginPath();
  ctx.moveTo(sx - 18, sy - 4);
  ctx.lineTo(sx + 26, sy - 4);
  ctx.lineTo(sx + 18, sy + 6);
  ctx.lineTo(sx - 12, sy + 6);
  ctx.closePath();
  ctx.fill();

  return c;
}

/**
 * Mounts the 4-pass WebGL Anisotropic Kuwahara Painterly Shader onto a target <canvas>.
 * Falls back cleanly if WebGL is unavailable in the browser environment.
 */
export function createPainterlyRenderer(
  canvas: HTMLCanvasElement,
  initialParams: Partial<PainterlyParams> = {},
): PainterlyRenderer {
  const params: PainterlyParams = {
    ...PAINTERLY_PRESETS.gouache,
    split: 0,
    debug: 'final',
    ...initialParams,
  };

  let bgColor: [number, number, number] = [0.98, 0.976, 0.96];
  let fgColor: [number, number, number] = [0.08, 0.08, 0.075];
  let currentSource: HTMLImageElement | HTMLCanvasElement | null = null;

  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: true,
  });

  if (!gl) {
    // Graceful 2D fallback when WebGL context cannot be created
    const ctx2d = canvas.getContext('2d');
    const renderFallback = () => {
      if (ctx2d && currentSource) {
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);
        ctx2d.drawImage(currentSource, 0, 0, canvas.width, canvas.height);
      }
      return 0;
    };
    return {
      supported: false,
      canvas,
      setSource(src) {
        currentSource = src;
        renderFallback();
      },
      updateSource() {
        renderFallback();
      },
      setSurfaceColors(bg, fg) {
        bgColor = hexToRgb01(bg);
        fgColor = hexToRgb01(fg);
      },
      setParams(next) {
        Object.assign(params, next);
      },
      getParams() {
        return { ...params };
      },
      render: renderFallback,
      exportPng(filename = 'meridian-painterly.png') {
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        return url;
      },
      dispose() {},
    };
  }

  const progTensor = linkProgram(gl, VERT_SRC, TENSOR_FRAG_SRC);
  const progBlur = linkProgram(gl, VERT_SRC, TENSOR_BLUR_FRAG_SRC);
  const progKuwahara = linkProgram(gl, VERT_SRC, KUWAHARA_FRAG_SRC);
  const progFinal = linkProgram(gl, VERT_SRC, FINAL_FRAG_SRC);

  const quadBuf = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

  const sourceTex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, sourceTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([245, 244, 237, 255]));
  gl.bindTexture(gl.TEXTURE_2D, null);

  let fboTensor: FBO | null = null;
  let fboBlur: FBO | null = null;
  let fboKuwahara: FBO | null = null;
  let paintW = 0;
  let paintH = 0;

  function syncPaintTarget(): void {
    const scale = brushScale(params.radius);
    const bw = Math.max(64, Math.round(canvas.width / scale));
    const bh = Math.max(64, Math.round(canvas.height / scale));
    if (!fboKuwahara || fboKuwahara.w !== bw || fboKuwahara.h !== bh) {
      destroyFbo(gl!, fboKuwahara);
      fboKuwahara = createFbo(gl!, bw, bh);
    }
    paintW = bw;
    paintH = bh;
  }

  function ensureFbos(w: number, h: number): void {
    const safeW = Math.max(2, Math.min(1440, Math.round(w)));
    const safeH = Math.max(2, Math.min(1440, Math.round(h)));
    if (canvas.width !== safeW || canvas.height !== safeH) {
      canvas.width = safeW;
      canvas.height = safeH;
    }
    if (!fboTensor || fboTensor.w !== safeW || fboTensor.h !== safeH) {
      destroyFbo(gl!, fboTensor);
      destroyFbo(gl!, fboBlur);
      fboTensor = createFbo(gl!, safeW, safeH);
      fboBlur = createFbo(gl!, safeW, safeH);
    }
    syncPaintTarget();
  }

  function bindQuad(prog: WebGLProgram): void {
    gl!.useProgram(prog);
    gl!.bindBuffer(gl!.ARRAY_BUFFER, quadBuf);
    const loc = gl!.getAttribLocation(prog, 'a_pos');
    gl!.enableVertexAttribArray(loc);
    gl!.vertexAttribPointer(loc, 2, gl!.FLOAT, false, 0, 0);
  }

  function uploadSource(): void {
    if (!currentSource) return;
    const sw = currentSource instanceof HTMLImageElement ? currentSource.naturalWidth || currentSource.width : currentSource.width;
    const sh = currentSource instanceof HTMLImageElement ? currentSource.naturalHeight || currentSource.height : currentSource.height;
    if (!sw || !sh) return;

    // Fit nicely inside 1120px max side for snappy 60fps real-time Kuwahara interaction
    const maxDim = 1080;
    const scale = Math.min(1, maxDim / Math.max(sw, sh));
    ensureFbos(Math.round(sw * scale), Math.round(sh * scale));

    gl!.bindTexture(gl!.TEXTURE_2D, sourceTex);
    gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, 1);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, currentSource);
    gl!.bindTexture(gl!.TEXTURE_2D, null);
  }

  function render(): number {
    if (!currentSource || !fboTensor || !fboBlur) return 0;
    syncPaintTarget();
    if (!fboKuwahara) return 0;
    const t0 = performance.now();
    const w = canvas.width;
    const h = canvas.height;
    const tx = 1 / w;
    const ty = 1 / h;

    gl!.viewport(0, 0, w, h);

    // Pass 1: Structure Tensor
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, fboTensor.fbo);
    bindQuad(progTensor);
    gl!.activeTexture(gl!.TEXTURE0);
    gl!.bindTexture(gl!.TEXTURE_2D, sourceTex);
    gl!.uniform1i(gl!.getUniformLocation(progTensor, 'u_image'), 0);
    gl!.uniform2f(gl!.getUniformLocation(progTensor, 'u_texel'), tx, ty);
    gl!.drawArrays(gl!.TRIANGLES, 0, 6);

    // Pass 2: Gaussian Tensor Smoothing + Eigenvalues
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, fboBlur.fbo);
    bindQuad(progBlur);
    gl!.activeTexture(gl!.TEXTURE0);
    gl!.bindTexture(gl!.TEXTURE_2D, fboTensor.tex);
    gl!.uniform1i(gl!.getUniformLocation(progBlur, 'u_tensor'), 0);
    gl!.uniform2f(gl!.getUniformLocation(progBlur, 'u_texel'), tx, ty);
    gl!.uniform1f(gl!.getUniformLocation(progBlur, 'u_sigma'), params.tensorSigma);
    gl!.drawArrays(gl!.TRIANGLES, 0, 6);

    // Pass 3: Anisotropic Generalized Kuwahara on a coarser grid.
    // Texel steps are 1/paintWidth of the full image, so each kernel tap
    // covers brushScale source pixels and the upscale reads as gouache dabs.
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, fboKuwahara.fbo);
    gl!.viewport(0, 0, paintW, paintH);
    bindQuad(progKuwahara);
    gl!.activeTexture(gl!.TEXTURE0);
    gl!.bindTexture(gl!.TEXTURE_2D, sourceTex);
    gl!.uniform1i(gl!.getUniformLocation(progKuwahara, 'u_image'), 0);
    gl!.activeTexture(gl!.TEXTURE1);
    gl!.bindTexture(gl!.TEXTURE_2D, fboBlur.tex);
    gl!.uniform1i(gl!.getUniformLocation(progKuwahara, 'u_tensor'), 1);
    gl!.uniform2f(gl!.getUniformLocation(progKuwahara, 'u_texel'), 1 / paintW, 1 / paintH);
    gl!.uniform1f(gl!.getUniformLocation(progKuwahara, 'u_radius'), params.radius);
    gl!.uniform1f(gl!.getUniformLocation(progKuwahara, 'u_anisotropy'), params.anisotropy);
    gl!.uniform1f(gl!.getUniformLocation(progKuwahara, 'u_sharpness'), params.sharpness);
    gl!.drawArrays(gl!.TRIANGLES, 0, 6);

    // Pass 4: Final Materiality, Paper Tooth, Wet-Edge & Split Curtain → Screen
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    gl!.viewport(0, 0, w, h);
    bindQuad(progFinal);
    gl!.activeTexture(gl!.TEXTURE0);
    gl!.bindTexture(gl!.TEXTURE_2D, fboKuwahara.tex);
    gl!.uniform1i(gl!.getUniformLocation(progFinal, 'u_kuwahara'), 0);
    gl!.activeTexture(gl!.TEXTURE1);
    gl!.bindTexture(gl!.TEXTURE_2D, sourceTex);
    gl!.uniform1i(gl!.getUniformLocation(progFinal, 'u_original'), 1);
    gl!.activeTexture(gl!.TEXTURE2);
    gl!.bindTexture(gl!.TEXTURE_2D, fboBlur.tex);
    gl!.uniform1i(gl!.getUniformLocation(progFinal, 'u_tensor'), 2);
    gl!.uniform2f(gl!.getUniformLocation(progFinal, 'u_resolution'), w, h);
    gl!.uniform1f(gl!.getUniformLocation(progFinal, 'u_radius'), params.radius);
    gl!.uniform1f(gl!.getUniformLocation(progFinal, 'u_paper'), params.paper);
    gl!.uniform1f(gl!.getUniformLocation(progFinal, 'u_saturation'), params.saturation);
    gl!.uniform1f(gl!.getUniformLocation(progFinal, 'u_edge'), params.edge);
    gl!.uniform1f(gl!.getUniformLocation(progFinal, 'u_inkMix'), params.inkMix);
    gl!.uniform1f(gl!.getUniformLocation(progFinal, 'u_split'), params.split);
    gl!.uniform1i(gl!.getUniformLocation(progFinal, 'u_debug'), DEBUG_INT[params.debug]);
    gl!.uniform3f(gl!.getUniformLocation(progFinal, 'u_bgColor'), bgColor[0], bgColor[1], bgColor[2]);
    gl!.uniform3f(gl!.getUniformLocation(progFinal, 'u_fgColor'), fgColor[0], fgColor[1], fgColor[2]);
    gl!.drawArrays(gl!.TRIANGLES, 0, 6);

    return performance.now() - t0;
  }

  return {
    supported: true,
    canvas,
    setSource(src) {
      currentSource = src;
      uploadSource();
      render();
    },
    updateSource() {
      uploadSource();
      render();
    },
    setSurfaceColors(bgHex, fgHex) {
      bgColor = hexToRgb01(bgHex);
      fgColor = hexToRgb01(fgHex);
      if (currentSource) render();
    },
    setParams(next) {
      Object.assign(params, next);
      if (currentSource) render();
    },
    getParams() {
      return { ...params };
    },
    render,
    exportPng(filename = 'meridian-painterly.png') {
      const prevSplit = params.split;
      if (prevSplit > 0.002 && prevSplit < 0.998) {
        params.split = 0;
        render();
      }
      const url = canvas.toDataURL('image/png');
      if (prevSplit !== params.split) {
        params.split = prevSplit;
        render();
      }
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      return url;
    },
    dispose() {
      destroyFbo(gl, fboTensor);
      destroyFbo(gl, fboBlur);
      destroyFbo(gl, fboKuwahara);
      gl.deleteTexture(sourceTex);
      gl.deleteBuffer(quadBuf);
      gl.deleteProgram(progTensor);
      gl.deleteProgram(progBlur);
      gl.deleteProgram(progKuwahara);
      gl.deleteProgram(progFinal);
    },
  };
}
