/**
 * Catálogo Meridian Components Lab
 * Origem gestual: Meridian · Visual: SVG line / single-ink
 */

export type ComponentCategory =
  | 'controls'
  | 'inputs'
  | 'surfaces'
  | 'navigation'
  | 'feedback'
  | 'instruments'
  | 'finance'
  | 'astronomy'
  | 'weather'
  | 'charts'
  | 'tables'
  | 'overlays';

export type DemoKind =
  | 'button'
  | 'slider'
  | 'switch'
  | 'dial'
  | 'bar-slider'
  | 'radio'
  | 'segmented'
  | 'tactile-key'
  | 'tactile-keypad'
  | 'tactile-lever'
  | 'tactile-console'
  | 'progress'
  | 'metric'
  | 'tabs'
  | 'accordion'
  | 'input'
  | 'search'
  | 'toast'
  | 'dialog'
  | 'sheet'
  | 'drawer'
  | 'menu'
  | 'context-menu'
  | 'select'
  | 'picker'
  | 'color-picker'
  | 'combobox'
  | 'date-picker'
  | 'time-picker'
  | 'file-drop'
  | 'command'
  | 'scroll'
  | 'calendar'
  | 'compass'
  | 'audio-meter'
  | 'steps'
  | 'gallery'
  | 'filmstrip'
  | 'timeline'
  | 'image-frame'
  | 'image-inspector'
  | 'data-table'
  | 'info-table'
  | 'ledger-table'
  | 'kpi-strip'
  | 'chart-line'
  | 'chart-area'
  | 'chart-bar'
  | 'chart-hbar'
  | 'chart-candles'
  | 'chart-donut'
  | 'chart-spark'
  | 'chart-scatter'
  | 'chart-radar'
  | 'chart-histo'
  | 'svg-instrument'
  | 'hairline-iso'
  | 'plate';

export interface CatalogItem {
  readonly id: string;
  readonly name: string;
  readonly category: ComponentCategory;
  readonly blurb: string;
  readonly demo: DemoKind;
  readonly install: string;
  readonly interactive: boolean;
}

export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  controls: 'Controls',
  inputs: 'Inputs',
  surfaces: 'Surfaces',
  overlays: 'Menus & Modals',
  navigation: 'Navigation',
  feedback: 'Feedback',
  tables: 'Tables',
  charts: 'Charts',
  instruments: 'Instruments',
  finance: 'Finance',
  astronomy: 'Astronomy',
  weather: 'Weather',
};

export const COMPONENT_CATALOG: readonly CatalogItem[] = [
  // Controls
  { id: 'button', name: 'Line Button', category: 'controls', blurb: 'Pressão local no ponteiro, scale 0.97, ripple seco.', demo: 'button', install: 'button', interactive: true },
  { id: 'slider', name: 'Line Slider', category: 'controls', blurb: 'Trilha hairline + thumb circular, captura 1:1.', demo: 'slider', install: 'slider', interactive: true },
  { id: 'switch', name: 'Line Switch', category: 'controls', blurb: 'Rocker de baixo relevo com estado aria-checked.', demo: 'switch', install: 'switch', interactive: true },
  { id: 'dial', name: 'Tactile Dial', category: 'controls', blurb: 'Ângulo absoluto −135°→135° com knob SVG.', demo: 'dial', install: 'dial', interactive: true },
  { id: 'bar-slider', name: 'Bar Slider', category: 'controls', blurb: 'Células em série para nível discreto.', demo: 'bar-slider', install: 'bar-slider', interactive: true },
  { id: 'radio-group', name: 'Radio Group', category: 'controls', blurb: 'Anéis SVG, seleção exclusiva e foco visível.', demo: 'radio', install: 'radio-group', interactive: true },
  { id: 'tactile-key', name: 'Tactile Key', category: 'controls', blurb: 'Tecla isolada com depressão.', demo: 'tactile-key', install: 'tactile-key', interactive: true },
  { id: 'tactile-keypad', name: 'Tactile Keypad', category: 'controls', blurb: 'Grade 3×4 + readout tabular.', demo: 'tactile-keypad', install: 'tactile-keypad', interactive: true },
  { id: 'tactile-console', name: 'Tactile Console', category: 'controls', blurb: 'Chaves + LEDs plotter em linha.', demo: 'tactile-console', install: 'tactile-console', interactive: true },
  { id: 'camera-wheel', name: 'Camera Wheel', category: 'controls', blurb: 'Roda óptica com ticks e arraste.', demo: 'dial', install: 'camera-wheel', interactive: true },
  { id: 'camera-dial', name: 'Camera Dial', category: 'controls', blurb: 'Dial vernier de abertura/velocidade.', demo: 'dial', install: 'camera-dial', interactive: true },
  { id: 'spectrum-control', name: 'Spectrum Control', category: 'controls', blurb: 'Canal espectral single-ink.', demo: 'slider', install: 'spectrum-control', interactive: true },
  { id: 'oklch-palette', name: 'OKLCH Palette', category: 'controls', blurb: 'Swatches + sliders L/C/H sobre papel neutro.', demo: 'color-picker', install: 'oklch-palette', interactive: true },
  { id: 'color-picker', name: 'Color Picker', category: 'controls', blurb: 'Picker de cor com preview e grid tátil.', demo: 'color-picker', install: 'color-picker', interactive: true },
  { id: 'detent-dial', name: 'Detent Dial', category: 'controls', blurb: 'Degraus discretos com snap.', demo: 'dial', install: 'detent-dial', interactive: true },
  { id: 'tactile-lever', name: 'Tactile Lever', category: 'controls', blurb: 'Alavanca vertical com curso limitado.', demo: 'tactile-lever', install: 'tactile-lever', interactive: true },

  // Inputs
  { id: 'calendar', name: 'Calendar', category: 'inputs', blurb: 'Grade mensal tabular com seleção.', demo: 'calendar', install: 'calendar', interactive: true },
  { id: 'date-picker', name: 'Date Picker', category: 'inputs', blurb: 'Campo + popover de calendário.', demo: 'date-picker', install: 'date-picker', interactive: true },
  { id: 'input', name: 'Soft Input', category: 'inputs', blurb: 'Campo 16px mobile, borda hairline.', demo: 'input', install: 'input', interactive: true },
  { id: 'search-input', name: 'Search Field', category: 'inputs', blurb: 'Busca com limpar e atalho ⌘K.', demo: 'search', install: 'search-input', interactive: true },
  { id: 'data-form', name: 'Details Form', category: 'inputs', blurb: 'Ficha com labels mono empilhados.', demo: 'input', install: 'data-form', interactive: true },
  { id: 'date-time-picker', name: 'Date & Time', category: 'inputs', blurb: 'Data + hora em leitura tabular.', demo: 'time-picker', install: 'date-time-picker', interactive: true },
  { id: 'file-transfer', name: 'File Transfer', category: 'inputs', blurb: 'Drop zone em placa editorial.', demo: 'file-drop', install: 'file-transfer', interactive: true },
  { id: 'combobox', name: 'Combobox', category: 'inputs', blurb: 'Lista filtrável com teclado.', demo: 'combobox', install: 'combobox', interactive: true },
  { id: 'select', name: 'Select', category: 'inputs', blurb: 'Select nativo estilizado + lista custom.', demo: 'select', install: 'select', interactive: true },
  { id: 'time-picker', name: 'Time Picker', category: 'inputs', blurb: 'Horas/minutos tabulares com setas.', demo: 'time-picker', install: 'time-picker', interactive: true },
  { id: 'range-picker', name: 'Range Picker', category: 'inputs', blurb: 'Intervalo A→B com dois thumbs.', demo: 'slider', install: 'range-picker', interactive: true },

  // Surfaces
  { id: 'smooth-shape', name: 'Smooth Corners', category: 'surfaces', blurb: 'Dual-radius: pill / 8px / plate 4px.', demo: 'plate', install: 'smooth-shape', interactive: false },
  { id: 'shader-surface', name: 'Paper Surface', category: 'surfaces', blurb: 'PaperGrain canvas de página inteira.', demo: 'plate', install: 'shader-surface', interactive: false },
  { id: 'scroll-area', name: 'Vertical Scroll', category: 'surfaces', blurb: 'Frame + scrollbar hairline 2px.', demo: 'scroll', install: 'scroll-area', interactive: true },
  { id: 'simple-scroll', name: 'Simple Scroll', category: 'surfaces', blurb: 'Scroll mínimo com itens revelados.', demo: 'scroll', install: 'simple-scroll', interactive: true },
  { id: 'accordion-scroll', name: 'Accordion Scroll', category: 'surfaces', blurb: 'Scroll + seções expansíveis.', demo: 'accordion', install: 'accordion-scroll', interactive: true },
  { id: 'vertical-gallery', name: 'Vertical Gallery', category: 'surfaces', blurb: 'Tiles com seletor de proporção.', demo: 'gallery', install: 'vertical-gallery', interactive: true },
  { id: 'filmstrip-gallery', name: 'Filmstrip', category: 'surfaces', blurb: 'Tira horizontal arrastável 1:1.', demo: 'filmstrip', install: 'filmstrip-gallery', interactive: true },
  { id: 'timeline', name: 'Timeline', category: 'navigation', blurb: 'Eixo horizontal 1:1 + momentum + reveal editorial.', demo: 'timeline', install: 'timeline', interactive: true },
  { id: 'image-frame', name: 'Image Frame', category: 'surfaces', blurb: 'Placa 4px + caption mono + padding interno.', demo: 'image-frame', install: 'image-frame', interactive: true },
  { id: 'image-tile', name: 'Image Tile', category: 'surfaces', blurb: 'Tile editorial com bleed e gutter.', demo: 'image-frame', install: 'image-tile', interactive: true },

  // Overlays — menus & modals
  { id: 'dialog', name: 'Line Dialog', category: 'overlays', blurb: 'Modal centrado, dim seco, Esc fecha.', demo: 'dialog', install: 'dialog', interactive: true },
  { id: 'sheet-modal', name: 'Sheet Modal', category: 'overlays', blurb: 'Bottom sheet tátil com alça e fechamento por Esc.', demo: 'sheet', install: 'sheet-modal', interactive: true },
  { id: 'drawer-modal', name: 'Drawer', category: 'overlays', blurb: 'Painel lateral com backdrop dim.', demo: 'drawer', install: 'drawer-modal', interactive: true },
  { id: 'confirm-modal', name: 'Confirm Modal', category: 'overlays', blurb: 'Confirmação destrutiva / primária.', demo: 'dialog', install: 'confirm-modal', interactive: true },
  { id: 'menu', name: 'Dropdown Menu', category: 'overlays', blurb: 'Menu ancorado no gatilho, itens + atalhos.', demo: 'menu', install: 'menu', interactive: true },
  { id: 'context-menu', name: 'Context Menu', category: 'overlays', blurb: 'Abre no right-click / long-press.', demo: 'context-menu', install: 'context-menu', interactive: true },
  { id: 'popover-menu', name: 'Popover Menu', category: 'overlays', blurb: 'Popover com ações e descrição.', demo: 'menu', install: 'popover-menu', interactive: true },
  { id: 'market-picker', name: 'Market Picker', category: 'overlays', blurb: 'Picker de ativo com busca e tickers.', demo: 'picker', install: 'market-picker', interactive: true },
  { id: 'currency-picker', name: 'Currency Picker', category: 'overlays', blurb: 'Moedas ISO com códigos mono.', demo: 'picker', install: 'currency-picker', interactive: true },
  { id: 'ephemeris-picker', name: 'Ephemeris Picker', category: 'overlays', blurb: 'Corpos celestes filtráveis.', demo: 'picker', install: 'ephemeris-picker', interactive: true },
  { id: 'financial-order-modal', name: 'Order Modal', category: 'overlays', blurb: 'Buy/Sell com campos tabulares.', demo: 'dialog', install: 'financial-order-modal', interactive: true },

  // Navigation
  { id: 'gallery', name: 'Gallery Slider', category: 'navigation', blurb: 'Carrossel com setas e dots.', demo: 'gallery', install: 'gallery', interactive: true },
  { id: 'segmented-control', name: 'Segmented Control', category: 'navigation', blurb: 'Clip-path tabs Meridian.', demo: 'segmented', install: 'segmented-control', interactive: true },
  { id: 'step-navigation', name: 'Step Navigation', category: 'navigation', blurb: 'Passos numerados com estado atual.', demo: 'steps', install: 'step-navigation', interactive: true },
  { id: 'accordion', name: 'Accordion', category: 'navigation', blurb: 'Seções colapsáveis com chevron.', demo: 'accordion', install: 'accordion', interactive: true },
  { id: 'finance-navigation', name: 'Finance Nav', category: 'navigation', blurb: 'Mercados / ordem / histórico.', demo: 'segmented', install: 'finance-navigation', interactive: true },
  { id: 'tabs', name: 'Tabs', category: 'navigation', blurb: 'Abas com painel curto.', demo: 'tabs', install: 'tabs', interactive: true },
  { id: 'command-palette', name: 'Command Palette', category: 'navigation', blurb: '⌘K em 0ms — Frequency Gate.', demo: 'command', install: 'command-palette', interactive: true },

  // Feedback
  { id: 'toast', name: 'Line Toast', category: 'feedback', blurb: 'Stack 400ms ease-out.', demo: 'toast', install: 'toast', interactive: true },
  { id: 'progress-bar', name: 'Progress Bar', category: 'feedback', blurb: 'Progresso determinado = valor real.', demo: 'progress', install: 'progress-bar', interactive: true },
  { id: 'metric-card', name: 'Metric Card', category: 'feedback', blurb: 'Serif tabular + eyebrow mono.', demo: 'metric', install: 'metric-card', interactive: true },
  { id: 'kpi-strip', name: 'KPI Strip', category: 'feedback', blurb: 'Faixa de KPIs com deltas.', demo: 'kpi-strip', install: 'kpi-strip', interactive: true },

  // Tables
  { id: 'data-table', name: 'Data Table', category: 'tables', blurb: 'Colunas sortáveis, hover de linha, tabular-nums.', demo: 'data-table', install: 'data-table', interactive: true },
  { id: 'info-table', name: 'Info Table', category: 'tables', blurb: 'Pares label/valor para dossiês.', demo: 'info-table', install: 'info-table', interactive: true },
  { id: 'ledger-table', name: 'Ledger Table', category: 'tables', blurb: 'Razão contábil com débitos/créditos.', demo: 'ledger-table', install: 'ledger-table', interactive: true },
  { id: 'comparison-table', name: 'Comparison Table', category: 'tables', blurb: 'Comparativo de planos / tiers.', demo: 'data-table', install: 'comparison-table', interactive: true },
  { id: 'source-table', name: 'Source Table', category: 'tables', blurb: 'Fontes Tier A/B/C com links.', demo: 'info-table', install: 'source-table', interactive: true },

  // Charts
  { id: 'chart-line', name: 'Line Chart', category: 'charts', blurb: 'Série curva em traço 1.5, pontos 2 e guias 0.7.', demo: 'chart-line', install: 'chart-line', interactive: true },
  { id: 'chart-area', name: 'Area Chart', category: 'charts', blurb: 'Área preenchida sutil sob a linha.', demo: 'chart-area', install: 'chart-area', interactive: true },
  { id: 'chart-bar', name: 'Bar Chart', category: 'charts', blurb: 'Barras verticais plotter.', demo: 'chart-bar', install: 'chart-bar', interactive: true },
  { id: 'chart-hbar', name: 'Horizontal Bars', category: 'charts', blurb: 'Barras horizontais para ranking.', demo: 'chart-hbar', install: 'chart-hbar', interactive: true },
  { id: 'chart-candles', name: 'Candlestick', category: 'charts', blurb: 'OHLC em linhas (sem fill neon).', demo: 'chart-candles', install: 'chart-candles', interactive: true },
  { id: 'chart-donut', name: 'Donut Chart', category: 'charts', blurb: 'Anéis segmentados + total central.', demo: 'chart-donut', install: 'chart-donut', interactive: true },
  { id: 'chart-sparkline', name: 'Sparkline', category: 'charts', blurb: 'Mini série inline para KPIs.', demo: 'chart-spark', install: 'chart-sparkline', interactive: true },
  { id: 'chart-scatter', name: 'Scatter Plot', category: 'charts', blurb: 'Pontos + eixos para correlação.', demo: 'chart-scatter', install: 'chart-scatter', interactive: true },
  { id: 'chart-radar', name: 'Radar Chart', category: 'charts', blurb: 'Polígono multi-eixo.', demo: 'chart-radar', install: 'chart-radar', interactive: true },
  { id: 'chart-histogram', name: 'Histogram', category: 'charts', blurb: 'Distribuição em bins.', demo: 'chart-histo', install: 'chart-histogram', interactive: true },
  { id: 'financial-chart', name: 'Financial Chart', category: 'charts', blurb: 'Combo candles + volume.', demo: 'chart-candles', install: 'financial-chart', interactive: true },

  // Instruments
  { id: 'instrument', name: 'Instrument Bars', category: 'instruments', blurb: 'Barras plotter com roles de opacidade.', demo: 'svg-instrument', install: 'instrument', interactive: true },
  { id: 'image-inspector', name: 'Image Inspector', category: 'instruments', blurb: 'Crosshair, coords e zoom de moldura.', demo: 'image-inspector', install: 'image-inspector', interactive: true },
  { id: 'compass', name: 'Compass', category: 'instruments', blurb: 'Rosa com anel 1.15, guias 0.7 e agulha 1.5.', demo: 'compass', install: 'compass', interactive: true },
  { id: 'audio-meter', name: 'Audio Meter', category: 'instruments', blurb: 'VU em colunas SVG.', demo: 'audio-meter', install: 'audio-meter', interactive: true },
  { id: 'weather-instrument', name: 'Weather Instrument', category: 'instruments', blurb: 'AQI / temp em bússola editorial.', demo: 'compass', install: 'weather-instrument', interactive: true },
  { id: 'attitude-indicator', name: 'Attitude Indicator', category: 'instruments', blurb: 'Horizonte artificial em linhas.', demo: 'svg-instrument', install: 'attitude-indicator', interactive: true },
  { id: 'navigation-instrument', name: 'Nav Instrument', category: 'instruments', blurb: 'Bearing tabular + rosa.', demo: 'compass', install: 'navigation-instrument', interactive: true },
  { id: 'race-telemetry', name: 'Race Telemetry', category: 'instruments', blurb: 'Telemetria com sparkline.', demo: 'chart-spark', install: 'race-telemetry', interactive: true },
  { id: 'hairline-isometric', name: 'Hairline Isometric', category: 'instruments', blurb: 'Figura isométrica 2:1 em sólidos arredondados com hit em repouso (Hairline × Plotter).', demo: 'hairline-iso', install: 'hairline-isometric', interactive: true },

  // Astronomy
  { id: 'astronomy-instrument', name: 'Solar Ephemeris', category: 'astronomy', blurb: 'Arcos solares plotter.', demo: 'svg-instrument', install: 'astronomy-instrument', interactive: true },
  { id: 'astrology-wheel', name: 'Astrology Wheel', category: 'astronomy', blurb: 'Roda de casas em traço.', demo: 'compass', install: 'astrology-wheel', interactive: true },
  { id: 'lunar-ephemeris', name: 'Moon Ephemeris', category: 'astronomy', blurb: 'Fases e elongação.', demo: 'svg-instrument', install: 'lunar-ephemeris', interactive: true },

  // Weather
  { id: 'weather-conditions', name: 'Weather Conditions', category: 'weather', blurb: 'Condições + métricas line.', demo: 'metric', install: 'weather-conditions', interactive: true },
  { id: 'wind-instrument', name: 'Wind Vector', category: 'weather', blurb: 'Direção e velocidade SVG.', demo: 'compass', install: 'wind-instrument', interactive: true },
  { id: 'tide-instrument', name: 'Tide Curve', category: 'weather', blurb: 'Curva de maré contínua.', demo: 'chart-area', install: 'tide-instrument', interactive: true },
] as const;

export function installCommand(id: string, baseUrl = 'https://meridian-olive-phi.vercel.app/r'): string {
  return `npx shadcn@latest add ${baseUrl}/${id}.json`;
}

export type PromptLang = 'pt' | 'en' | 'es' | 'fr';

const DIAL_ALIAS_IDS = new Set(['dial', 'detent-dial', 'camera-dial', 'camera-wheel']);

function pascalCase(id: string): string {
  return id
    .split('-')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}

function resolveTarget(id: string): { symbol: string; file: string } {
  if (DIAL_ALIAS_IDS.has(id)) {
    return { symbol: 'Dial', file: 'components/meridian/dial.tsx' };
  }
  return { symbol: pascalCase(id), file: `components/meridian/${id}.tsx` };
}

export function buildInstallPrompt(
  item: CatalogItem,
  baseUrl = 'https://meridian-olive-phi.vercel.app/r',
  lang: PromptLang = 'pt',
): string {
  const cmd = installCommand(item.install, baseUrl);
  const { symbol, file } = resolveTarget(item.install);
  const skillsCmd = 'npx skills add jhosephebtc/Meridian --skill meridian-components --skill meridian-taste';

  if (lang === 'en') {
    return [
      `Install and configure the Meridian component "${item.name}" (${item.id}, category: ${item.category}).`,
      `Behavior: ${item.blurb}`,
      '',
      '1. Install from the Meridian shadcn registry:',
      `   ${cmd}`,
      `   (Optional agent skills: ${skillsCmd})`,
      `2. Verify target files: ${file} (export \`${symbol}\`) and styles/meridian-ui.css, ensuring Meridian Single-Ink CSS tokens (--ds-bg, --ds-fg, --ds-border, --ds-rule, --ds-font-display, --ds-font-sans, --ds-font-mono, --ds-ease-out) are loaded from tokens.css.`,
      '3. Enforce Meridian taste guardrails: single-ink hairline strokes (currentColor), scale(0.97) on :active, @media (hover: hover) and (pointer: fine) for hover, zero `transition: all`, zero `ease-in`, tabular-nums on numeric readouts, and prefers-reduced-motion support.',
      '4. Verify on both `data-surface="ivory"` and `data-surface="obsidian"`, test keyboard/focus-visible navigation, and run `npx tsc --noEmit`.',
    ].join('\n');
  }

  if (lang === 'es') {
    return [
      `Instala y configura el componente Meridian "${item.name}" (${item.id}, categoría: ${item.category}).`,
      `Comportamiento: ${item.blurb}`,
      '',
      '1. Instalar vía registry shadcn de Meridian:',
      `   ${cmd}`,
      `   (Opcional — skills para el agente: ${skillsCmd})`,
      `2. Verifica los archivos generados: ${file} (export \`${symbol}\`) y styles/meridian-ui.css, asegurando los tokens Single-Ink (--ds-bg, --ds-fg, --ds-border, --ds-rule, --ds-font-*, --ds-ease-out) desde tokens.css.`,
      '3. Mantén las reglas de gusto Meridian: trazos finos en una sola tinta (currentColor), scale(0.97) en :active, hover en @media (hover: hover) and (pointer: fine), cero `transition: all`, cero `ease-in`, tabular-nums en números y soporte a prefers-reduced-motion.',
      '4. Valida en `data-surface="ivory"` y `data-surface="obsidian"`, prueba teclado/focus-visible y ejecuta `npx tsc --noEmit`.',
    ].join('\n');
  }

  if (lang === 'fr') {
    return [
      `Installe et configure le composant Meridian "${item.name}" (${item.id}, catégorie : ${item.category}).`,
      `Comportement : ${item.blurb}`,
      '',
      '1. Installer via le registry shadcn Meridian :',
      `   ${cmd}`,
      `   (Optionnel — skills agent : ${skillsCmd})`,
      `2. Vérifie les fichiers cibles : ${file} (export \`${symbol}\`) et styles/meridian-ui.css, avec les tokens Single-Ink (--ds-bg, --ds-fg, --ds-border, --ds-rule, --ds-font-*, --ds-ease-out) chargés depuis tokens.css.`,
      '3. Respecte les règles de goût Meridian : traits fins Single-Ink (currentColor), scale(0.97) au :active, hover sous @media (hover: hover) and (pointer: fine), zéro `transition: all`, zéro `ease-in`, tabular-nums et prefers-reduced-motion.',
      '4. Vérifie sous `data-surface="ivory"` et `data-surface="obsidian"`, teste le focus clavier et lance `npx tsc --noEmit`.',
    ].join('\n');
  }

  return [
    `Instale e integre o componente Meridian "${item.name}" (${item.id}, categoria: ${item.category}).`,
    `Comportamento: ${item.blurb}`,
    '',
    '1. Instalar pelo registry shadcn do Meridian:',
    `   ${cmd}`,
    `   (Opcional — skills de gosto e componentes: ${skillsCmd})`,
    `2. Verifique os arquivos destino: ${file} (export \`${symbol}\`) e styles/meridian-ui.css, garantindo que os tokens Single-Ink (--ds-bg, --ds-fg, --ds-border, --ds-rule, --ds-font-display, --ds-font-sans, --ds-font-mono, --ds-ease-out) estejam importados via tokens.css.`,
    '3. Mantenha as regras de gosto Meridian: traços hairline em tinta única (currentColor), scale(0.97) no :active, hover restrito a @media (hover: hover) and (pointer: fine), zero `transition: all`, zero `ease-in`, tabular-nums em leituras numéricas e suporte a prefers-reduced-motion.',
    '4. Valide em `data-surface="ivory"` e `data-surface="obsidian"`, teste navegação por teclado/focus-visible e rode `npx tsc --noEmit`.',
  ].join('\n');
}

export function buildSystemInstallPrompt(
  baseUrl = 'https://meridian-olive-phi.vercel.app/r',
  lang: PromptLang = 'pt',
): string {
  const reg = `${baseUrl}/registry.json`;
  const skills = 'npx skills add jhosephebtc/Meridian';
  if (lang === 'en') {
    return [
      'Set up the Meridian Design System (v1.5.0) and install its agent skills & component registry:',
      `1. Agent skills + taste rules: ${skills}`,
      `2. Component registry index: npx shadcn@latest add ${reg}`,
      '3. Load src/tokens.css + src/fonts.css + src/components.css (or styles/meridian-ui.css), call mountPaperGrain() + bootPaperGrainExtras() + markPageReady(), and keep Single-Ink, Frequency Gate, and Plotter SVG rules active.',
    ].join('\n');
  }
  if (lang === 'es') {
    return [
      'Configura Meridian Design System (v1.5.0) e instala sus skills y registry de componentes:',
      `1. Skills y taste para el agente: ${skills}`,
      `2. Índice del registry: npx shadcn@latest add ${reg}`,
      '3. Carga src/tokens.css + src/fonts.css + src/components.css, inicia mountPaperGrain() + bootPaperGrainExtras() + markPageReady() y respeta Single-Ink, Frequency Gate y Plotter SVG.',
    ].join('\n');
  }
  if (lang === 'fr') {
    return [
      'Configure Meridian Design System (v1.5.0) et installe ses skills et son registry :',
      `1. Skills & goût pour l’agent : ${skills}`,
      `2. Index du registry : npx shadcn@latest add ${reg}`,
      '3. Charge src/tokens.css + src/fonts.css + src/components.css, lance mountPaperGrain() + bootPaperGrainExtras() + markPageReady() et respecte Single-Ink, Frequency Gate et Plotter SVG.',
    ].join('\n');
  }
  return [
    'Configure o Meridian Design System (v1.5.0) com suas skills de gosto e registry de 89 componentes:',
    `1. Skills & Taste para o agente: ${skills}`,
    `2. Índice completo do registry shadcn: npx shadcn@latest add ${reg}`,
    '3. Carregue src/tokens.css + src/fonts.css + src/components.css, inicialize mountPaperGrain() + bootPaperGrainExtras() + markPageReady() e preserve Single-Ink, Frequency Gate e gramática Plotter SVG.',
  ].join('\n');
}
