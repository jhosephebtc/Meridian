/**
 * HalfTone Dots — @paper-design/shaders (malha; size ≥ 0.4 derrete a imagem).
 * Pontos médios: u_size ≈ 0.16–0.20.
 */
import {
  ShaderMount,
  halftoneDotsFragmentShader,
  HalftoneDotsTypes,
  HalftoneDotsGrids,
  ShaderFitOptions,
  getShaderColorFromString,
} from '@paper-design/shaders';
import { HALFTONE } from './tokens';

export type HalftoneMountOpts = {
  type?: keyof typeof HalftoneDotsTypes;
  size?: number;
  radius?: number;
  contrast?: number;
  grainMixer?: number;
  grainOverlay?: number;
  grid?: keyof typeof HalftoneDotsGrids;
};

function cssVar(name: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    // Same-origin assets: avoid crossOrigin so decode never taints/fails on local files.
    img.onload = () => {
      if (!img.naturalWidth) {
        reject(new Error(`Imagem inválida (0×0): ${src}`));
        return;
      }
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Falha ao carregar ${src}`));
    img.src = src;
  });
}

/** Defaults Meridian — pontos médios Paper Halftone Dots */
export const HALFTONE_MEDIUM = {
  type: 'classic' as const,
  grid: 'hex' as const,
  size: 0.18,
  radius: 0.92,
  contrast: 0.72,
  grainMixer: 0.06,
  grainOverlay: 0.05,
};

export async function mountHalftone(
  el: HTMLElement,
  imageSrc: string,
  opts: HalftoneMountOpts = {},
): Promise<ShaderMount | null> {
  try {
    const img = await loadImage(imageSrc);
    const colorBack = getShaderColorFromString(cssVar('--ds-bg', '#FAF9F5'));
    const colorFront = getShaderColorFromString(cssVar('--ds-fg', '#141413'));
    const type = opts.type ?? HALFTONE_MEDIUM.type;
    const grid = opts.grid ?? HALFTONE_MEDIUM.grid;

    el.replaceChildren();
    return new ShaderMount(
      el,
      halftoneDotsFragmentShader,
      {
        u_image: img,
        u_imageAspectRatio: img.naturalWidth / Math.max(1, img.naturalHeight),
        u_colorBack: colorBack,
        u_colorFront: colorFront,
        u_originalColors: false,
        u_type: HalftoneDotsTypes[type],
        u_inverted: false,
        u_grid: HalftoneDotsGrids[grid],
        u_size: opts.size ?? HALFTONE_MEDIUM.size,
        u_radius: opts.radius ?? HALFTONE_MEDIUM.radius,
        u_contrast: opts.contrast ?? HALFTONE_MEDIUM.contrast,
        u_grainMixer: opts.grainMixer ?? HALFTONE_MEDIUM.grainMixer,
        u_grainOverlay: opts.grainOverlay ?? HALFTONE_MEDIUM.grainOverlay,
        u_grainSize: HALFTONE.grainSize,
        u_fit: ShaderFitOptions[HALFTONE.fit],
        u_scale: 1,
        u_rotation: 0,
        u_originX: 0.5,
        u_originY: 0.5,
        u_offsetX: 0,
        u_offsetY: 0,
        u_worldWidth: 0,
        u_worldHeight: 0,
      },
      undefined,
      0,
    );
  } catch (err) {
    console.warn('[halftone]', err);
    el.innerHTML = `<img src="${imageSrc}" alt="" style="width:100%;height:100%;object-fit:cover;opacity:.85;filter:grayscale(.35) contrast(1.05);" />`;
    return null;
  }
}
