/**
 * MERIDIAN DESIGN SYSTEM — paper-grain.ts (v1.1.0)
 * Gerador Procedural de Textura de Papel Arquivístico (Linhagem Deimos PaperGrain)
 *
 * Produz um tile 512×512 orgânico em Canvas (grão fino + variação suave de celulose
 * + microfibras de papel algodão) sem nenhum asset externo, injetado via
 * `--ds-paper-texture` com `mix-blend-mode: multiply` (temas claros/tingidos)
 * e `screen + invert(1)` (Obsidian Dark).
 */

export interface PaperGrainOptions {
  /** Tamanho do tile quadrado em px (padrão: 512, igual ao Deimos) */
  size?: number;
  /** Semente determinística para evitar flash diferente entre recarregamentos */
  seed?: number;
  /** Intensidade do micro-grão (0..1, padrão: 0.42) */
  speckleStrength?: number;
  /** Quantidade de microfibras orgânicas de papel algodão (padrão: 110) */
  fiberCount?: number;
}

/** PRNG determinístico rápido (Mulberry32) */
function createRng(seed: number) {
  let a = seed >>> 0;
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Gera um Data URL PNG do tile de papel algodão e aplica no `document.documentElement`.
 * Retorna função de limpeza (caso queira revogar/desmontar).
 */
export function mountPaperGrain(options: PaperGrainOptions = {}): () => void {
  if (typeof document === 'undefined') return () => {};

  const size = options.size ?? 512;
  const seed = options.seed ?? 20261120;
  const speckleStrength = options.speckleStrength ?? 0.42;
  const fiberCount = options.fiberCount ?? 110;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const rng = createRng(seed);
  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  // 1. Base de papel quase branco (248..255) com grão orgânico de alta frequência
  //    Como o blend mode é `multiply`, branco puro (255) = transparente e tons 212..252 = dente do papel.
  for (let i = 0; i < data.length; i += 4) {
    // Distribuição triangular (mais natural que uniforme, sem ruído digital agressivo)
    const tri = (rng() + rng()) * 0.5;
    // Grão principal + micro-pontos esporádicos de fibra mineral
    let shade = 255 - tri * 26 * speckleStrength;
    if (rng() > 0.992) {
      shade -= 24 * speckleStrength;
    }
    const v = Math.max(198, Math.min(255, Math.round(shade)));
    // Levíssimo calor arquivístico (R=v, G=v-1, B=v-2) para parecer papel algodão real
    data[i] = v;
    data[i + 1] = Math.max(0, v - 1);
    data[i + 2] = Math.max(0, v - 2);
    data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  // 2. Micro-mottling suave (variação orgânica de prensa tipográfica)
  for (let i = 0; i < 42; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 24 + rng() * 68;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    const alpha = 0.012 + rng() * 0.018;
    grad.addColorStop(0, `rgba(24, 22, 18, ${alpha.toFixed(4)})`);
    grad.addColorStop(1, 'rgba(24, 22, 18, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Microfibras de celulose sutis (o charme tátil das edições Aqua, Terracotta e Paper)
  ctx.lineCap = 'round';
  for (let i = 0; i < fiberCount; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const len = 5 + rng() * 14;
    const angle = rng() * Math.PI * 2;
    const bend = (rng() - 0.5) * 4;
    const ex = x + Math.cos(angle) * len;
    const ey = y + Math.sin(angle) * len;
    const cx = (x + ex) * 0.5 - Math.sin(angle) * bend;
    const cy = (y + ey) * 0.5 + Math.cos(angle) * bend;

    ctx.strokeStyle = `rgba(23, 22, 20, ${(0.025 + rng() * 0.045).toFixed(4)})`;
    ctx.lineWidth = 0.45 + rng() * 0.55;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(cx, cy, ex, ey);
    ctx.stroke();
  }

  const dataUrl = canvas.toDataURL('image/png');
  const root = document.documentElement;
  const offsetX = Math.round(rng() * 180);
  const offsetY = Math.round(rng() * 180);

  root.style.setProperty('--ds-paper-texture', `url("${dataUrl}")`);
  root.style.setProperty('--ds-paper-size', `${size}px ${size}px`);
  root.style.setProperty('--ds-paper-offset', `${offsetX}px ${offsetY}px`);

  return () => {
    root.style.removeProperty('--ds-paper-texture');
    root.style.removeProperty('--ds-paper-size');
    root.style.removeProperty('--ds-paper-offset');
  };
}
