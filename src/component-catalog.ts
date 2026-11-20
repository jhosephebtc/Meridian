/**
 * Catálogo dos 64 componentes (origem: jhosephe) reexpressos no Meridian DS.
 * Gestos/interação seguem a física tátil do lab jhosephe; visual = linhas SVG / single-ink.
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
  | 'weather';

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
  | 'progress'
  | 'metric'
  | 'tabs'
  | 'accordion'
  | 'input'
  | 'search'
  | 'toast'
  | 'dialog'
  | 'compass'
  | 'audio-meter'
  | 'calendar'
  | 'command'
  | 'scroll'
  | 'svg-instrument'
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
  navigation: 'Navigation',
  feedback: 'Feedback',
  instruments: 'Instruments',
  finance: 'Finance',
  astronomy: 'Astronomy',
  weather: 'Weather',
};

export const COMPONENT_CATALOG: readonly CatalogItem[] = [
  // Controls (15)
  { id: 'button', name: 'Line Button', category: 'controls', blurb: 'Pressão local no ponteiro, scale 0.97, sem troca brusca de tinta.', demo: 'button', install: 'button', interactive: true },
  { id: 'slider', name: 'Line Slider', category: 'controls', blurb: 'Trilha hairline e thumb circular com captura de ponteiro 1:1.', demo: 'slider', install: 'slider', interactive: true },
  { id: 'switch', name: 'Line Switch', category: 'controls', blurb: 'Rocker de baixo relevo com estado claro e teclado nativo.', demo: 'switch', install: 'switch', interactive: true },
  { id: 'dial', name: 'Tactile Dial', category: 'controls', blurb: 'Mapeamento absoluto de ângulo (−135°→135°) com detents opcionais.', demo: 'dial', install: 'dial', interactive: true },
  { id: 'bar-slider', name: 'Bar Slider', category: 'controls', blurb: 'Células em série — leitura rápida de nível sem glow.', demo: 'bar-slider', install: 'bar-slider', interactive: true },
  { id: 'radio-group', name: 'Radio Group', category: 'controls', blurb: 'Seleção exclusiva com anéis SVG e foco visível.', demo: 'radio', install: 'radio-group', interactive: true },
  { id: 'tactile-key', name: 'Tactile Key', category: 'controls', blurb: 'Tecla isolada com depressão e feedback de hold.', demo: 'tactile-key', install: 'tactile-key', interactive: true },
  { id: 'tactile-keypad', name: 'Tactile Keypad', category: 'controls', blurb: 'Grade 3×4 com pressão e readout tabular.', demo: 'tactile-keypad', install: 'tactile-keypad', interactive: true },
  { id: 'tactile-console', name: 'Tactile Console', category: 'controls', blurb: 'Console de chaves e LEDs em gramática plotter.', demo: 'plate', install: 'tactile-console', interactive: false },
  { id: 'camera-wheel', name: 'Camera Wheel', category: 'controls', blurb: 'Roda óptica com ticks e arraste circunferencial.', demo: 'dial', install: 'camera-wheel', interactive: true },
  { id: 'camera-dial', name: 'Camera Dial', category: 'controls', blurb: 'Dial de abertura/velocidade com escala vernier.', demo: 'dial', install: 'camera-dial', interactive: true },
  { id: 'spectrum-control', name: 'Spectrum Control', category: 'controls', blurb: 'Canal espectral single-ink com cursor rígido.', demo: 'slider', install: 'spectrum-control', interactive: true },
  { id: 'oklch-palette', name: 'OKLCH Palette', category: 'controls', blurb: 'Emissão cromática confinada (opcional) sobre papel neutro.', demo: 'plate', install: 'oklch-palette', interactive: false },
  { id: 'detent-dial', name: 'Detent Dial', category: 'controls', blurb: 'Dial com degraus discretos e snap ao soltar.', demo: 'dial', install: 'detent-dial', interactive: true },
  { id: 'tactile-lever', name: 'Tactile Lever', category: 'controls', blurb: 'Alavanca vertical com curso limitado e mola amortecida.', demo: 'tactile-lever', install: 'tactile-lever', interactive: true },

  // Inputs (8)
  { id: 'calendar', name: 'Calendar', category: 'inputs', blurb: 'Grade mensal tabular com seleção de dia.', demo: 'calendar', install: 'calendar', interactive: true },
  { id: 'date-picker', name: 'Date Picker', category: 'inputs', blurb: 'Campo + popover de calendário.', demo: 'calendar', install: 'date-picker', interactive: true },
  { id: 'input', name: 'Soft Input', category: 'inputs', blurb: 'Campo 16px no mobile, borda hairline, foco seco.', demo: 'input', install: 'input', interactive: true },
  { id: 'search-input', name: 'Search Field', category: 'inputs', blurb: 'Busca com ⌘K e limpar instantâneo.', demo: 'search', install: 'search-input', interactive: true },
  { id: 'data-form', name: 'Details Card', category: 'inputs', blurb: 'Formulário de ficha com labels mono.', demo: 'input', install: 'data-form', interactive: true },
  { id: 'date-time-picker', name: 'Date & Time', category: 'inputs', blurb: 'Data + hora em leitura tabular.', demo: 'calendar', install: 'date-time-picker', interactive: true },
  { id: 'file-transfer', name: 'File Transfer', category: 'inputs', blurb: 'Drop zone em placa editorial.', demo: 'plate', install: 'file-transfer', interactive: false },
  { id: 'combobox', name: 'Combobox', category: 'inputs', blurb: 'Lista filtrável com teclado.', demo: 'search', install: 'combobox', interactive: true },

  // Surfaces (10)
  { id: 'dialog', name: 'Line Dialog', category: 'surfaces', blurb: 'Modal centrado, dim sem blur excessivo.', demo: 'dialog', install: 'dialog', interactive: true },
  { id: 'smooth-shape', name: 'Smooth Corners', category: 'surfaces', blurb: 'Squircle dual-radius (pill / 8px / plate).', demo: 'plate', install: 'smooth-shape', interactive: false },
  { id: 'shader-surface', name: 'Paper Surface', category: 'surfaces', blurb: 'PaperGrain canvas — textura contínua de página.', demo: 'plate', install: 'shader-surface', interactive: false },
  { id: 'scroll-area', name: 'Vertical Scroll', category: 'surfaces', blurb: 'Frame + scrollbar hairline 2px.', demo: 'scroll', install: 'scroll-area', interactive: true },
  { id: 'simple-scroll', name: 'Simple Scroll', category: 'surfaces', blurb: 'Scroll mínimo com revelação de itens.', demo: 'scroll', install: 'simple-scroll', interactive: true },
  { id: 'accordion-scroll', name: 'Accordion Scroll', category: 'surfaces', blurb: 'Scroll + seções expansíveis.', demo: 'accordion', install: 'accordion-scroll', interactive: true },
  { id: 'vertical-gallery', name: 'Vertical Gallery', category: 'surfaces', blurb: 'Tiles elevados com seletor de proporção.', demo: 'plate', install: 'vertical-gallery', interactive: false },
  { id: 'filmstrip-gallery', name: 'Filmstrip Gallery', category: 'surfaces', blurb: 'Tira horizontal 1:1 arrastável.', demo: 'plate', install: 'filmstrip-gallery', interactive: false },
  { id: 'image-frame', name: 'Image Frame', category: 'surfaces', blurb: 'Placa 4px com caption mono.', demo: 'plate', install: 'image-frame', interactive: false },
  { id: 'data-table', name: 'Data Table', category: 'surfaces', blurb: 'Tabela tabular-nums, rules hairline.', demo: 'plate', install: 'data-table', interactive: false },

  // Navigation (9)
  { id: 'menu', name: 'Line Menu', category: 'navigation', blurb: 'Menu de ações com origem no gatilho.', demo: 'plate', install: 'menu', interactive: false },
  { id: 'gallery', name: 'Gallery Slider', category: 'navigation', blurb: 'Carrossel com arrasto 1:1.', demo: 'plate', install: 'gallery', interactive: false },
  { id: 'segmented-control', name: 'Segmented Control', category: 'navigation', blurb: 'Clip-path tabs Emil — troca sem dessincronia.', demo: 'segmented', install: 'segmented-control', interactive: true },
  { id: 'context-menu', name: 'Action Menu', category: 'navigation', blurb: 'Menu contextual por long-press / right-click.', demo: 'plate', install: 'context-menu', interactive: false },
  { id: 'step-navigation', name: 'Step Navigation', category: 'navigation', blurb: 'Passos numerados com estado atual.', demo: 'plate', install: 'step-navigation', interactive: false },
  { id: 'accordion', name: 'Accordion', category: 'navigation', blurb: 'Seções colapsáveis com chevron seco.', demo: 'accordion', install: 'accordion', interactive: true },
  { id: 'finance-navigation', name: 'Finance Navigation', category: 'navigation', blurb: 'Nav de mercados / ordem.', demo: 'segmented', install: 'finance-navigation', interactive: true },
  { id: 'tabs', name: 'Tabs', category: 'navigation', blurb: 'Abas com painel translateY curto.', demo: 'tabs', install: 'tabs', interactive: true },
  { id: 'command-palette', name: 'Command Palette', category: 'navigation', blurb: '⌘K em 0ms — Frequency Gate.', demo: 'command', install: 'command-palette', interactive: true },

  // Feedback (3)
  { id: 'toast', name: 'Line Toast', category: 'feedback', blurb: 'Stack Sonner-like, 400ms ease-out.', demo: 'toast', install: 'toast', interactive: true },
  { id: 'progress-bar', name: 'Progress Bar', category: 'feedback', blurb: 'Progresso determinado espelhando o valor.', demo: 'progress', install: 'progress-bar', interactive: true },
  { id: 'metric-card', name: 'Metric Card', category: 'feedback', blurb: 'Métrica serifada tabular + eyebrow mono.', demo: 'metric', install: 'metric-card', interactive: true },

  // Instruments (8)
  { id: 'instrument', name: 'Instrument Bars', category: 'instruments', blurb: 'Barras plotter com roles de opacidade.', demo: 'svg-instrument', install: 'instrument', interactive: true },
  { id: 'image-inspector', name: 'Image Inspector', category: 'instruments', blurb: 'Lupa / crop em moldura SVG.', demo: 'plate', install: 'image-inspector', interactive: false },
  { id: 'compass', name: 'Compass', category: 'instruments', blurb: 'Rosa dos ventos em traço 1u.', demo: 'compass', install: 'compass', interactive: true },
  { id: 'audio-meter', name: 'Audio Meter', category: 'instruments', blurb: 'VU em colunas SVG animadas no ponteiro.', demo: 'audio-meter', install: 'audio-meter', interactive: true },
  { id: 'weather-instrument', name: 'Weather Instrument', category: 'instruments', blurb: 'AQI / temp em bússola editorial.', demo: 'compass', install: 'weather-instrument', interactive: true },
  { id: 'attitude-indicator', name: 'Attitude Indicator', category: 'instruments', blurb: 'Horizonte artificial em linhas.', demo: 'svg-instrument', install: 'attitude-indicator', interactive: true },
  { id: 'navigation-instrument', name: 'Navigation Instrument', category: 'instruments', blurb: 'Rumos e bearing tabulares.', demo: 'compass', install: 'navigation-instrument', interactive: true },
  { id: 'race-telemetry', name: 'Race Telemetry', category: 'instruments', blurb: 'Telemetria de volta com sparkline.', demo: 'svg-instrument', install: 'race-telemetry', interactive: true },

  // Finance (4)
  { id: 'financial-chart', name: 'Financial Chart', category: 'finance', blurb: 'Candles / linha em currentColor.', demo: 'svg-instrument', install: 'financial-chart', interactive: true },
  { id: 'market-picker', name: 'Market Picker', category: 'finance', blurb: 'Seletor de ativo com busca.', demo: 'search', install: 'market-picker', interactive: true },
  { id: 'currency-picker', name: 'Currency Picker', category: 'finance', blurb: 'Moedas com códigos mono.', demo: 'search', install: 'currency-picker', interactive: true },
  { id: 'financial-order-modal', name: 'Order Modal', category: 'finance', blurb: 'Dialog de ordem buy/sell.', demo: 'dialog', install: 'financial-order-modal', interactive: true },

  // Astronomy (4)
  { id: 'astronomy-instrument', name: 'Solar Ephemeris', category: 'astronomy', blurb: 'Arcos solares em plotter SVG.', demo: 'svg-instrument', install: 'astronomy-instrument', interactive: true },
  { id: 'ephemeris-picker', name: 'Ephemeris Picker', category: 'astronomy', blurb: 'Picker de corpo celeste.', demo: 'search', install: 'ephemeris-picker', interactive: true },
  { id: 'astrology-wheel', name: 'Astrology Wheel', category: 'astronomy', blurb: 'Roda de casas / signos em traço.', demo: 'compass', install: 'astrology-wheel', interactive: true },
  { id: 'lunar-ephemeris', name: 'Lunar Ephemeris', category: 'astronomy', blurb: 'Fases lunares e elongação.', demo: 'svg-instrument', install: 'lunar-ephemeris', interactive: true },

  // Weather (3)
  { id: 'weather-conditions', name: 'Weather Conditions', category: 'weather', blurb: 'Condições + ícones line.', demo: 'metric', install: 'weather-conditions', interactive: true },
  { id: 'wind-instrument', name: 'Wind Vector', category: 'weather', blurb: 'Vetor de vento com direção SVG.', demo: 'compass', install: 'wind-instrument', interactive: true },
  { id: 'tide-instrument', name: 'Tide Curve', category: 'weather', blurb: 'Curva de maré em path contínuo.', demo: 'svg-instrument', install: 'tide-instrument', interactive: true },
] as const;

export function installCommand(id: string, baseUrl = 'https://meridian.local/r'): string {
  return `npx shadcn@latest add ${baseUrl}/${id}.json`;
}
