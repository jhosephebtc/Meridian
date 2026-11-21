/**
 * Placa HalfTone na seção História — Paper Shaders · pontos médios · furacão.
 */
import { mountHalftone, HALFTONE_MEDIUM } from './halftone-mount';
import type { ShaderMount } from '@paper-design/shaders';

const HOST_ID = 'historia-halftone';
const SRC = './plates/hurricane.jpg';

let mount: ShaderMount | null = null;

async function remount(): Promise<void> {
  const el = document.getElementById(HOST_ID);
  if (!el) return;
  mount?.dispose?.();
  mount = null;
  mount = await mountHalftone(el, SRC, {
    ...HALFTONE_MEDIUM,
    type: 'classic',
    size: 0.18,
    radius: 0.94,
    contrast: 0.74,
  });
}

void remount();

window.addEventListener('meridian:surface', () => {
  void remount();
});
