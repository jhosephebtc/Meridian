# 08 — MERIDIAN Design System (`v1.4.0`)

**Sistema Visual, Editorial, Navegacional, de Motion, Blueprints SVG (Plotter), HalfTone Paper Shaders e Arte Generativa para o ecossistema _Meridian_ (42 projetos em 100% TypeScript · React Native + Web · CSS Puro · SVG 1:1).**

> **Linhagem de Referência:** síntese deliberada dos arquivos *Meridian Editorial*, *Arquival* (White / Aqua / Terracotta / Dark), espectro **Soft Chromatic** (Blush / Butter / Mist / Lilac), aquarelas de **cenários aquarela Meridian**, globo **81k**, gramática **Plotter**, **HalfTone Dots** (`shaders.paper.design`), e motion de **Meridian Motion**.

---

## 1. Identidade & Proposta Estratégica

### Por que "Meridian"?
O ecossistema atende dois públicos opostos sobre o mesmo motor TypeScript:
1. **Modo Invisível (B2C Cotidiano — Blocos 1 e 2):** apps de clima, qualidade do ar, saúde da família, imóveis e voz que precisam transmitir **calma editorial, clareza humana e zero jargão técnico/astrológico**.
2. **Modo Técnico Auditável (Pro / Ciclos / B2B — Blocos 3, 4 e 5):** terminais Gann–Jenkins, efemérides em 4 camadas, backtests ledger analítico e dossiês territoriais que exigem **rigor científico, rastreabilidade de fonte e precisão geométrica 1:1**.

**Meridian** une os dois mundos sob uma estética **Swiss Archival Editorial + Modern Research Product**:
- **Editorial e confiável** (como *Meridian Editorial* e *Arquival*): sem neon, sem roxo-no-escuro, sem cards hiper-aninhados, sem brilho artificial.
- **Tátil e impresso**: superfícies com **PaperGrain em canvas overlay** (`#ds-paper-grain` — nunca data-URL em CSS var), fotografia arquivística com `mix-blend-mode: multiply` e **scrollbars hairline** (2px, track transparente).
- **Fluido e sem latência** (como *Linear*, *Vercel* e *interfaces fluidas*): navegação nítida, `clip-path` tabs sem dessincronia, resposta instantânea no pointer-down (`scale(0.97)`), atalhos de teclado sem atraso (`0ms`) e física de gestos 1:1.

---

## 2. Motor Multi-Superfície "Single-Ink" + Soft Chromatic (9 atmosferas)

Inspirado na arquitetura de *Arquival* (`color-mix(in srgb, var(--fg) X%, var(--bg))`) somada à escada tonal quente Meridian, toda a hierarquia de bordas, divisórias, textos secundários e estados de hover deriva de **uma única cor de tinta (`--ds-fg`)** interagindo com a cor do papel (`--ds-bg`).

Ordem do espectro (`SURFACE_SPECTRUM` em `tokens.ts`):  
`ivory → blush → butter → mist → aqua → lilac → terracotta → obsidian` (+ `paper` para dossiês).

| Superfície (`data-surface`) | Linhagem | Fundo `--ds-bg` | Tinta `--ds-fg` | Contraste | Uso |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`ivory`** *(Padrão)* | Meridian Editorial | `#FAF9F5` | `#141413` | **17.6:1** | Home B2C, pesquisa |
| **`paper`** | Paper Archive | `#FFFFFF` | `#0A0A0A` | **19.8:1** | Dossiês PDF, B2B |
| **`blush`** | Soft Chromatic | `#E8C4C0` | `#1A1414` | **9.8:1** | Capas HalfTone, cultura |
| **`butter`** | Soft Chromatic | `#E8D9A8` | `#1A1710` | AAA | Editorial quente suave |
| **`mist`** | Soft Chromatic | `#C5D4CE` | `#141816` | AAA | Clima / natureza suave |
| **`aqua`** | Aqua Archive | `#A4CED0` | `#171614` | **10.4:1** | Ambiente, AQI, Agro |
| **`lilac`** | Soft Chromatic | `#C9C0D8` | `#16141A` | AAA | Narrativa / voz |
| **`terracotta`** | Terracotta Archive | `#EDBB99` | `#171614` | **10.4:1** | Cultura, Solar, Gann |
| **`obsidian`** | Obsidian Archive | `#0E0E0D` | `#FAF9F5` | **18.4:1** | Terminal Pro noturno |

### Derivados Dinâmicos (`color-mix` no CSS / RGBA pré-resolvido em `tokens.ts`)
- `--ds-bg-tint-subtle`: `4.5%` de `--ds-fg` sobre `--ds-bg` (hover suave, molduras de gráficos)
- `--ds-bg-tint-muted`: `8.5%` de `--ds-fg` sobre `--ds-bg` (item ativo no TOC, destaque de citação)
- `--ds-rule`: `10%` de `--ds-fg` transparente (hairline Arquival — seções, captions, listas)
- `--ds-rule-strong`: `16%` de `--ds-fg` transparente (trilho Lifeline, ênfase leve)
- `--ds-border`: `10%` de `--ds-fg` transparente (cards, inputs, tabs — mesma sutileza da rule)
- `--ds-border-strong`: `18%` de `--ds-fg` transparente (popovers, foco; nunca pesado)
- Leitor 3 colunas Arquival: `--ds-toc-width: 152px` · fluid · `--ds-aside-width: 264px` · `--ds-reader-gap: 32px`

### Paleta Orgânica Contida & Sinais Semânticos
Herdada da estratégia Meridian (tons terrosos usados **exclusivamente** em tags de categoria, séries de gráficos SVG e pontos de status — nunca como fundos saturados de página):
- **Olive** `#5E6E47` *(Earth / Agro / Pólen)* · **Sky** `#477085` *(Clima / Atmosfera)* · **Coral** `#B55A42` *(Social / Hype / Térmico)* · **Ochre** `#9A7134` *(Solar / Ciclos)* · **Slate** `#56606E` *(Finanças / Dados)*.
- **Sinais de Verificação:** `support`, `caution`, `refute`, `info` com calibração automática de contraste AAA/AA em `aqua`, `terracotta` e `obsidian`. Também suporta `[data-signals="monochrome"]` (estilo arquivístico puro do Arquival, onde forma geométrica + tinta única distinguem o estado sem depender de cor).

---

## 3. Ruído de Fundo & Materialidade (`PaperGrain` canvas · v1.4)

**Problema resolvido:** PNG full-viewport como `data:` em `--ds-paper-texture` era **descartado em silêncio** por Chrome/Edge (style attribute / limite de CSS). O grão “só aparecia” em alguns ambientes.

### Implementação oficial (`paper-grain.ts` + `.ds-paper-grain-layer`)
1. **`mountPaperGrain()`** cria `<canvas id="ds-paper-grain" class="ds-paper-grain-layer">` fixo sobre a página.
2. Pinta **speckles escuros com alpha** + microfibras (source-over) — visível em ivory sem depender de `multiply` frágil.
3. `html[data-paper-shader="canvas"]` desliga o legado `body::after`.
4. Intensidade: `data-grain="off | subtle | editorial | tactile"` → `--ds-grain-multiplier` × `--ds-paper-opacity` (ivory ≈ `0.88`).
5. **Tamanho espacial:** `data-grain-size="fine | medium | coarse | chunky"` → repaint do canvas (`GRAIN_SIZES` / `setPaperGrainSize`). Fino = pó; Grumoso = grão grosso.
6. Constantes: `PAPER_SHADER`, `GRAIN_SIZES`, `GRAIN_SIZE_ORDER` em `tokens.ts`.

```ts
import { mountPaperGrain } from '@meridian/design-system';
mountPaperGrain({ seed: 20261120, speckleStrength: 0.58, fiberDensity: 1.05 });
```

### HalfTone (Paper Shaders) — malha fina
Capas/placas usam `@paper-design/shaders` `halftoneDots`. **`u_size` ≥ ~0.4 derrete a imagem** (poucas células). Defaults em `HALFTONE` (`tokens.ts`): `size: 0.12`, `radius: 0.92`, `type: classic|soft`, `grid: hex`. Ver dossiê `gann.html`.

### Scrollbar hairline & overlays
- Scrollbars: **2px**, thumb ~28% da tinta, **track transparente**, **sem setas** (`SCROLLBAR` / `tokens.css`).
- **Chromium:** nunca combinar `scrollbar-width`/`scrollbar-color` com `::-webkit-scrollbar` — o padrão CSS desativa os pseudos e volta a barra nativa do Windows (trilha branca + thumb arredondado). Firefox usa só `@supports (-moz-appearance)`.
- Rails/drawers: **só escurecem** (`OVERLAY_DIM`) — **sem `backdrop-filter: blur`**.
- Burger: **3 linhas iguais 1.5px** → morph para **X** com `aria-expanded` (`.ds-burger`).

---

## 4. Arquitetura Dual-Mode (`data-mode`)

| Dimensão | `data-mode="invisible"` *(B2C Cotidiano)* | `data-mode="technical"` *(Pro / Ciclos / B2B)* |
| :--- | :--- | :--- |
| **Superfície padrão** | `ivory` *(ou `aqua` / `terracotta` por vertical)* | `obsidian` *(ou `paper` para dossiês/impressão)* |
| **Densidade & padding** | `--ds-density: 1`, cards `24px`, prosa `17px` | `--ds-density: 0.88`, cards `18px`, prosa `15px` |
| **Hierarquia de dados** | Dados físicos (Clima/AQI/Pólen/Rua) em 1º plano; conselhos em linguagem natural | 4 Camadas expostas (Astronomia, Casas/Dignidades, Gann/Jenkins, Backtest ledger analítico) |
| **Proveniência** | Selo limpo de fonte confiável ("Clima · Atualizado 14:10") | Sobrescritos clicáveis `¹²³` + classificação `Tier A / B / C` + graus tabulares |

---

## 4.5 Components Lab & shadcn Registry

Página interativa: [`components.html`](./components.html) — catálogo dos **64 componentes** do lab [Meridian](https://Meridian.vercel.app/) reexpressos em gramática Meridian (traço SVG / single-ink).

- **Gestos:** física tátil do Meridian (pressão local, dial por ângulo absoluto, captura de ponteiro 1:1, Frequency Gate ⌘K).
- **Visual:** sem glass glow — hairlines, anéis SVG, dual-radius Meridian.
- **Install:** `npx shadcn@latest add <origin>/r/button.json` (índice em `public/r/registry.json`). Fontes React em `registry/meridian/`; build via `npm run registry`.

---

## 5. Tipografia em 3 Vozes & Disciplina Ótica

Hierarquia construída por **contraste extremo de escala e troca de família** (peso `400` nos títulos serifados), com **kerning nativo** (`font-kerning: normal` + `liga`/`calt`) e calibração óptica para a família **Geist**:

| Voz | Família CSS (`tokens.css` / `fonts.css`) | Papéis | Leading · Tracking (Geist) |
| :--- | :--- | :--- | :--- |
| **Display Serif** | `Geist Serif` / `Georgia` | `mega`, `h1`, `h2`, `h3`, `lead`, `metric` | lh `0.96 → 1.34` · ls `-0.03em → -0.011em`; `font-synthesis-weight: none` |
| **Functional Sans** | `Geist` / `system-ui` | `body-lg (17px)`, `body-md (15px)`, `body-sm (13.5px)`, `ui-md (13px)` | lh `1.35 → 1.58` · ls `-0.01em → -0.006em`; prosa máx. **`65ch`** |
| **Technical Mono** | `Geist Mono` / `ui-monospace` | `mono-md` → `mono-micro` | lh `1.45` · ls `+0.01em` (eyebrow `+0.06em`); **`tabular-nums` obrigatório** |

### Ritmo vertical de blocos

Tokens `--ds-stack-*` / `--ds-block-gap` / `--ds-title-gap` / `--ds-section-y` governam folga entre título→corpo, parágrafos e seções (também em `SPACING` no `tokens.ts`). Utilitários: `.ds-stack`, `.ds-section`, `.ds-section-header`.

Arquivos de fonte locais: `assets/fonts/` (`Geist-Variable`, `GeistSerifVF`, `GeistMono-Variable`).

---

## 6. Sistema Dual-Radius & Botões

Herdado da gramática Meridian com resposta tátil Meridian Motion:
- **Pills (`9999px`)** → navegação, tabs segmentadas, seletores de tema/modo, tags de categoria e setas circulares de carrossel.
- **Squircles (`8px`)** → ações utilitárias (`Filtrar`, `Exportar`, `Ver mais`), campos de busca, controles de toolbar e toasts.
- **Plates (`4px`) / Cards (`12px`)** → placas editoriais de imagem (`4px`) e containers estruturais / molduras SVG (`12px`).
- **Progressão tonal:** `Tertiary (#F5F4ED)` → `Secondary (#E8E6DC)` → `Primary Ink (#141413)`.
- **Feedback imediato:** todo elemento clicável aplica `transform: scale(0.97)` no `:active` em `120ms var(--ds-ease-out)` — feedback nasce no *pointer-down*, nunca só no *click*.

---

## 7. Navegação, Motion & Design Engineering (`Motion Lab`)

### 7.1 The Frequency Gate — Quando NÃO Animar
Regra #1 de Meridian Motion aplicada rigorosamente ao Meridian:

| Frequência de Uso | Exemplos no Ecossistema | Decisão de Motion |
| :--- | :--- | :--- |
| **100+ vezes/dia** | Paleta de comando `⌘K` / `/`, atalhos de teclado, troca de abas raiz no app mobile | **ZERO animação (`0ms`).** Instantâneo como Raycast. Abas são pares, nunca deslizam lateralmente no mobile (`animation: 'none'`). |
| **Dezenas de vezes/dia** | `:active` em botões, hover em links/cards, seleção de linhas de tabela | **Quase imperceptível (`100–160ms`).** `scale(0.97)` no press; hover estritamente protegido por `@media (hover: hover) and (pointer: fine)`. |
| **Ocasional** | Popovers, dropdowns, drawers/sheets, toasts, alternância de modo | **Animação funcional (`140–250ms` em UI; exceções: drawer `380ms`, toast `400ms`).** |
| **Raro / 1ª vez** | Onboarding, abertura de dossiê 3D na estante, conclusão de backtest | **Orçamento de deleite** (stagger não-uniforme, revelação editorial `560ms`). |

### 7.2 Curvas & Durações Oficiais (Zero `ease-in` em UI!)

| Token CSS | Valor | Papel |
| :--- | :--- | :--- |
| `--ds-ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Entradas, saídas, press, popovers, dropdowns (sensação imediata) |
| `--ds-ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | Movimento em tela e deslizamento de *Clip-Path Tabs* |
| `--ds-ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | Drawers e Bottom Sheets estilo iOS / Drawer |
| `--ds-ease-snappy` | `cubic-bezier(0.85, 0, 0, 1)` | Indicadores rápidos de seleção (Meridian) |
| `--ds-ease-editorial` | `cubic-bezier(0.22, 1, 0.36, 1)` | Revelação de placas e zoom suave `1.018` em imagens (Arquival) |
| `--ds-ease-volume` | `cubic-bezier(0.22, 0.8, 0.25, 1)` | Abertura 3D de dossiês na estante |

### 7.3 Padrões de Navegação & Micro-Interação Implementados
1. **Topbar Translúcida com Scroll-Edge:** `backdrop-filter: blur(18px) saturate(135%)` sem divisória dura no topo da página; a linha `1px` + barra de progresso de leitura surgem suavemente ao rolar.
2. **Clip-Path Seamless Segmented Tabs:** duas camadas sobrepostas onde a camada ativa (fundo escuro + texto claro) desliza via `clip-path: inset(0 R% 0 L% round 9999px)`, invertendo o contraste letra por letra com precisão de subpixel.
3. **Paleta de Comando `⌘K` Instantânea:** navegação rápida entre seções, superfícies e modos em `0ms` de atraso.
4. **Popovers Origin-Aware:** crescem de `scale(0.96)` a partir do gatilho (`transform-origin` ancorado ao botão — nunca `scale(0)` e nunca do centro, exceto modais centrados).
5. **Tooltips com Skip-Delay (`[data-instant]`):** o 1º tooltip aguarda `320ms` para evitar disparos acidentais; ao deslizar o cursor para botões irmãos na mesma barra, os tooltips seguintes trocam em **`0ms`**!
6. **Blur Crossfade (`filter: blur(2px)`):** ponte sutil durante trocas de texto/estado em botões e badges para fundir os dois estados num único objeto contínuo.
7. **Hold-to-Confirm Assimétrico:** ações sensíveis/destrutivas preenchem `clip-path` em **`linear 1.4s`** enquanto pressionadas (percepção honesta do tempo) e recuam em **`180ms ease-out`** se soltas antes do fim.
8. **Toast Stack Interruptível:** construído com **CSS transitions** (nunca `@keyframes`, para poder ser interrompido/retomado no meio do trajeto), entrando e saindo pelo mesmo eixo vertical (`translateY(100%)`).
9. **Gestos 1:1 com Projeção de Momentum & Rubber-Band:** fase *Track* sem easing (1:1 com o ponteiro via `setPointerCapture` e escrita direta em `transform`/scroll, sem atualizar CSS variables no pai!); fase *Release* projeta o destino com `projectMomentum(v, 0.998)` e amortece bordas com `rubberband(overshoot, dim, 0.55)`.

### 7.4 Paridade React Native / Expo (`tokens.ts` + `animate-expo`)
- **UI Thread sempre:** usar `react-native-reanimated` (Reanimated 4) + `react-native-gesture-handler`, nunca `PanResponder` e nunca `setState` dentro de `onUpdate`/scroll.
- **Springs com parâmetros Apple:** `settle: { duration: 400, dampingRatio: 1.0, overshootClamping: true }` (sem bounce), `momentum: { duration: 400, dampingRatio: 0.8 }` (bounce apenas após arremesso/gesto).
- **Haptics sincronizados no mesmo frame:** `Haptics.selectionAsync()` (detent/slider), `ImpactFeedbackStyle.Light` (snap de sheet), `ImpactFeedbackStyle.Medium` (commit/hold), sempre acompanhados de feedback visual.
- **Baseline Mobile-Native Web:** `100dvh` em shells/drawers, `100svh` em heroes, `-webkit-tap-highlight-color: transparent`, `touch-action: manipulation` em botões, `touch-action: pan-y` em carrosséis/Lifeline, `font-size: 16px` em inputs sob `(pointer: coarse)` (evita zoom involuntário no iOS Safari sem bloquear acessibilidade), e `env(safe-area-inset-*)` com `viewport-fit=cover`.

---

## 8. Padrões Estruturais & Componentes Editoriais

1. **Grid Assimétrico Editorial (12 colunas — Meridian):** alterna ritmos assimétricos (`3+8`, `6+3`, `8+3`) sem repetir o mesmo padrão em duas linhas seguidas. Ao passar o ponteiro fino sobre um card, os cards irmãos recuam suavemente para `opacity: 0.54`, criando foco de galeria de revista.
2. **Leitor Enciclopédico em 3 Colunas (Arquival):** TOC `152px` | prosa `65ch` com **claims** (hover: *dotted underline* + tint, sem blur/glow) e sobrescritos `¹²³` | aside `264px` com placa menor + *At a Glance*. Empilha em mobile (`prosa → placa`).
3b. **Page enter:** `.ds-page-veil` + `markPageReady()` (`page-enter.ts`) — revela com `--ds-enter-scale` (nunca `scale(0)`).
3. **Cronologia Horizontal `Lifeline` (Arquival):** trilho horizontal arrastável 1:1 com eixo tracejado (`1px dashed var(--ds-rule-strong)`), marcadores de ciclo/ano e cartões interativos — funciona tanto para *Cronologia Climática/Urbana* (B2C) quanto para *Janelas de Confluência & Ciclos* (Técnico).
4. **Estante Tátil 3D de Dossiês (Arquival):** lombadas verticais em `preserve-3d` com brilho especular e borda de páginas caneladas (`--ds-pattern-page-ribs`), abrindo em `800ms` para revelar relatórios PDF gerados (*Raio-X Endereço #11*, *Atlas Gann-Jenkins #26*, *Simulador Solar #36*, *Observatório Pulse #30*).
5. **Footer editorial (Meridian):** grade 3 colunas — marca compacta | acordeões `<details>` com hairlines e chevron | bloco “Nossa missão” + links externos `↗`. Um acordeão aberto por vez. Componente `.ds-footer` em `components.css`.

---

## 9. Gramática SVG Blueprint (Plotter) & Globo Ortográfico 81k (`plotter-svg.ts`)

Para elevar todos os desenhos técnicos, ilustrações explicativas, globos e instrumentos geométricos do ecossistema (atendendo à Seção 5 da `00-arquitetura-global.md`), o Meridian adota a gramática vetorial de **[Plotter](https://github.com/gramática plotter)** (*Pasquale Vitiello*) combinada ao estilo de globo pontilhado de **[What 81,000 people want from AI](https://meridian)**.

### 9.1 Regras Absolutas de Desenho Plotter
- **Uma tinta, uma espessura (`1` unidade):** todos os traços usam `--plotter-ink: var(--ds-fg)` (`currentColor`) e `stroke-width: 1`. Nunca engrosse uma linha para dar ênfase — a hierarquia vem exclusivamente da **opacidade** e do **tracejado semântico**.
- **Formas transparentes (`fill="none"`):** o desenho lê perfeitamente sobre todas as 5 superfícies (*Ivory*, *Paper*, *Aqua*, *Terracotta*, *Obsidian*), com exceção única de um realce translúcido (`fill-opacity: 0.055`) pintado uma única vez sobre uma interseção/seleção nomeada.
- **Rótulos discretos e não-contornados:** `<text>` editável em peso `400`, `10–12u`, `stroke="none"`, opacidade `0.72` para nomes e `0.50` para valores/notas — nunca negrito, nunca caixa alta gritada, nunca cortado por cotas (folga mínima de `3u`).
- **Canvas canônico & Escala 1:1:** ilustrações explicativas compõem em `560 × 440` (padrão Plotter); instrumentos angulares (Gann, Michael S. Jenkins, Mandala) usam `viewBox="0 0 400 400"` em `.ds-svg-frame` com `aspect-ratio: 1 / 1` travado para zero distorção de ângulos ($45^{\circ}, 63{,}75^{\circ}, 75^{\circ}$).

### 9.2 Tabela de Papéis Semânticos (`data-plotter-role`)
| Papel (`data-plotter-role`) | Opacidade | Tracejado (`stroke-dasharray`) | Função |
| :--- | :---: | :--- | :--- |
| **`primary`** / **`section`** | `1.00` | Contínuo | Contorno principal da esfera/forma ou rota funcional selecionada |
| **`secondary`** / **`dimension`** / **`leader`** | `0.32` | Contínuo | Pontos continentais 81k, cotas reais com barras de `8u`, callouts |
| **`hatch`** | `0.18` | Contínuo (`-45°`, pitch `12u`) | Hachura contida dentro de região delimitada |
| **`guide`** | `0.14` | Contínuo | Paralelos, meridianos e projeções (para `8u` antes do contorno) |
| **`centerline`** | `0.14` | `8 3 1 3` | Equador, eixos ortogonais, centro de simetria, locus orbital |
| **`hidden`** / **`absent`** / **`proposed`** | `0.32` | `3 5` | Órbita proposta, canal oculto ou geometria ausente |
| **`transfer`** | `0.32` | `4 6` | Arco geodésico / transferência de sinal com **seta aberta sólida** (pernas `6u` a `45°`) |
| **`grid`** | `0.06` | Contínuo | Malha modular de coordenadas |

### 9.3 Globo Editorial Pontilhado 81k (100% TypeScript + SVG Editável)
Em `plotter-svg.ts`, `renderPlottedGlobeSvg()` executa projeção ortográfica 3D → 2D (`projectOrthographic`) gerando um SVG editável puro — zero Three.js pesado, 100% compatível com Web e `react-native-svg` — com arrasto 1:1 de rotação, arcos `transfer`, callouts de estações (`São Paulo`, `S. Francisco`, `Londres`, `Tóquio`, `Lagos`), cota real de diâmetro (`Ø 12 742 km`) e **Isolamento Didático de Papéis** (`data-plotter-isolate`).

---

## 10. Atelier Generativo em 100% TypeScript (`atelier-engine.ts`)

Inspirado diretamente nas animações de aquarela e pincéis de **[Scenarios for our Economic Future — estúdio editorial Meridian

### 10.1 As 5 Primitivas de Mídia Física (`MeridianAtelier`)

| Mídia / Método | Algoritmo Físico em TypeScript | Uso Ideal no Ecossistema |
| :--- | :--- | :--- |
| **Aquarela (`watercolorWash` / `watercolorBand`)** | Subdivisão recursiva de polígonos com deslocamento normal gaussiano (`deformPolygon`), camadas translúcidas em `multiply` (ou `screen` no `obsidian`) + anel de acúmulo capilar na borda úmida (*wet-edge pigment pooling*). | Faixas de cenários econômicos/climáticos, nuvens atmosféricas, manchas editoriais de abertura. |
| **Blocos Preenchidos a Pincel (`brushFillRect`)** | Inspirado nos cubos lado a lado Meridian (`econ-scenarios`): pintura incremental sobre canvas persistente com tiras de aquarela + cerdas úmidas horizontais + contorno esboçado a lápis `2H`. | Matrizes de tarefas/sinais, barras de progresso orgânicas, status de confluência e cenários interativos. |
| **Lápis Grafite (`graphitePencil`, `handDrawnRect`, `hatchArea`)** | `4–8` microfibras paralelas (`2H / HB / 4B`) moduladas por `fbm2D` (tremor orgânico manual) e micro-grãos depositados sobre os picos do papel + hachura por recorte Cohen–Sutherland. | Rascunhos arquitetônicos, contornos de gráficos, cadernos Gann–Jenkins, diagramas de endereço. |
| **Giz de Cera / Pastel Seco (`waxCrayon`)** | Stippling anisotrópico de elipses cerosas filtradas pela máscara do dente do papel (`noise2D(x*0.36, y*0.36) > tooth`), deixando falhas orgânicas de papel algodão. | Colagens editoriais quentes (Terracotta / Ivory), destaques em Cultura Pop, Solar 3D e cards compartilháveis. |
| **Pincel Tinta Sumi-e (`inkBrush`)** | Cerdas divididas com largura modulada por curva de pressão senoidal e efeito *dry-brush* (`kasure`) progressivo nas pontas. | Traços caligráficos de ênfase, espirais *Square of Nine*, assinaturas visuais de capítulo. |

### 10.2 Portabilidade Web + React Native & Performance 120fps
- **Interface `AtelierDrawingBackend` agnóstica:** na Web usa `createCanvasBackend(canvas, dpr)` (Canvas 2D nativo); em React Native / Expo conecta o mesmo motor ao `@shopify/react-native-skia` implementando apenas 6 primitivas (`clear`, `setCompositeMode`, `fillPolygon`, `strokePolyline`, `fillDot`, `fillEllipse`).
- **Pintura Incremental (< 1ms/frame):** diferentemente de loops que apagam e redesenham toda a cena a cada frame, os sketches pintam **incrementalmente sobre papel persistente** — mantendo custo médio abaixo de `0.7ms/frame` (folga total para 120Hz ProMotion!).
- **Disciplina Meridian Motion + Acessibilidade:** `runMeridianSketch()` pausa automaticamente fora da viewport (`IntersectionObserver`) e, sob `prefers-reduced-motion: reduce`, sintetiza instantaneamente a ilustração final estática sem rodar `requestAnimationFrame`.

### 10.3 Os 4 Presets Editoriais Inclusos
1. `createEconWatercolorSketch()` — Matriz 4×3 de blocos preenchendo lado a lado em aquarela + faixas de cenário e curvas 4B (homenagem direta ao `anthropic.com/institute/econ-scenarios`).
2. `createBotanicalWatercolorSketch()` — Manchas *wet-on-wet* Sky/Olive/Ochre + curvas topográficas a lápis `2H`/`HB`.
3. `createCelestialPencilSketch()` — Caderno técnico com hachura `2H`, círculo/diagonais `4B` e espiral *Square of Nine* em pincel sumi-e.
4. `createCrayonCollageSketch()` — Composição modernista em giz de cera/pastel seco Coral/Ochre/Sky com moldura `4B` esboçada à mão.

---

## 11. Checklist "Never Ship" & Estrutura no Monorepo

### Proibições Absolutas (Revisão de PR)
| Nunca Enviar | Padrão Obrigatório Meridian |
| :--- | :--- |
| `transition: all` | Listar propriedades exatas (`transform`, `opacity`, `background-color`, `color`, `clip-path`) |
| `ease-in` em elemento de UI | `--ds-ease-out` (`cubic-bezier(0.23, 1, 0.32, 1)`) |
| `transform: scale(0)` em entrada | `scale(0.96)` + `opacity: 0` |
| Animação em `⌘K` ou atalhos de teclado | `0ms` (instantâneo) |
| `:hover` sem media query | Envolver em `@media (hover: hover) and (pointer: fine)` |
| `width` / `height` / `top` / `left` animados | `transform` e `opacity` (ou `clip-path` para revelações/tabs) |
| `prefers-reduced-motion` ignorado | Remover deslocamentos e manter cross-fade curto (`opacity`) / frame estático no Atelier |
| Fundo liso / PaperGrain via data-URL em CSS var | `mountPaperGrain()` → canvas `#ds-paper-grain` (`data-paper-shader="canvas"`) |
| HalfTone com `size` ≥ 0.4 | `HALFTONE.size` ≈ `0.11–0.13` (malha fina) |
| Scrollbar grossa / track opaco | Hairline 2px, track transparente |
| Overlay de menu com `backdrop-filter: blur` | Só dim (`rgba(20,16,12,0.34)`) |
| Hamburger com ícones SVG irregulares | `.ds-burger` — 3 linhas iguais → X |
| Importar `p5.js` (bundle > 800KB JS) para efeitos editoriais | Usar `atelier-engine.ts` (zero dependências, 100% TypeScript estrito, < 1ms/frame) |
| Gráfico Gann/Mandala esticado (`preserveAspectRatio="none"`) | `viewBox="0 0 400 400"` + `aspect-ratio: 1 / 1` travado |

### Integração no Monorepo (`packages/design-system`)
```text
packages/design-system/
├── DESIGN_SYSTEM.md   # Especificação oficial v1.4.0
├── tokens.css         # 9 atmosferas, PaperGrain canvas, scrollbar hairline, motion
├── tokens.ts          # SURFACES + PAPER_SHADER + HALFTONE + SCROLLBAR + BURGER + SPECTRUM
├── components.css     # Burger→X, claim hover, drawer dim, page veil, reader 3-col
├── paper-grain.ts     # Canvas overlay (#ds-paper-grain) — sem data-URL
├── page-enter.ts      # markPageReady() + veil
├── plotter-svg.ts     # Plotter + Globo 81k
├── atelier-engine.ts  # Aquarela / Lápis / Giz / Sumi-e
├── gann.css|gann-app  # Dossiê W.D. Gann (HalfTone + dual chrome)
├── index.html         # Showcase DS
├── preview.html       # Meridian Studio
└── gann.html          # Página archival Gann
```
