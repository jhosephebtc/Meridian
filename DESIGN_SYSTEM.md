# 08 — MERIDIAN Design System (`v1.3.0`)

**Sistema Visual, Editorial, Navegacional, de Motion, Blueprints SVG (Plotter) e Arte Generativa para o ecossistema _Lunar + Earth AI + Gemini Studio_ (42 projetos em 100% TypeScript · React Native + Web · CSS Puro · SVG 1:1).**

> **Linhagem de Referência:** síntese deliberada dos 4 arquivos de referência (*Anthropic Research*, *Deimos Paper White*, *Deimos Signature Aqua* e *Deimos Warm Terracotta*), das animações de aquarela & pincéis de **Anthropic Economic Scenarios** (`anthropic.com/institute/econ-scenarios`), do globo editorial pontilhado de **What 81,000 People Want from AI** (`anthropic.com/features/81k-interviews`), da gramática vetorial **Plotter** (`pasqualevitiello/plotter`) e dos princípios de navegação e motion de **Emil Kowalski** (`emilkowalski/skills`).

---

## 1. Identidade & Proposta Estratégica

### Por que "Meridian"?
O ecossistema atende dois públicos opostos sobre o mesmo motor TypeScript:
1. **Modo Invisível (B2C Cotidiano — Blocos 1 e 2):** apps de clima, qualidade do ar, saúde da família, imóveis e voz que precisam transmitir **calma editorial, clareza humana e zero jargão técnico/astrológico**.
2. **Modo Técnico Auditável (Pro / Ciclos / B2B — Blocos 3, 4 e 5):** terminais Gann–Jenkins, efemérides em 4 camadas, backtests BigQuery e dossiês territoriais que exigem **rigor científico, rastreabilidade de fonte e precisão geométrica 1:1**.

**Meridian** une os dois mundos sob uma estética **Swiss Archival Editorial + Modern Research Product**:
- **Editorial e confiável** (como *Anthropic Research* e *Deimos*): sem neon, sem roxo-no-escuro, sem cards hiper-aninhados, sem brilho artificial.
- **Tátil e impresso**: superfícies com **ruído orgânico de papel algodão (`PaperGrain`)** sobre toda a viewport, fotografia arquivística com `mix-blend-mode: multiply` e linhas finas (*hairlines*) derivadas de uma única tinta.
- **Fluido e sem latência** (como *Linear*, *Vercel* e *Apple Fluid Interfaces*): navegação nítida, `clip-path` tabs sem dessincronia, resposta instantânea no pointer-down (`scale(0.97)`), atalhos de teclado sem atraso (`0ms`) e física de gestos 1:1.

---

## 2. Motor Multi-Superfície "Single-Ink" (5 Atmosferas)

Inspirado na arquitetura de *Deimos* (`color-mix(in srgb, var(--fg) X%, var(--bg))`) somada à escada tonal quente da *Anthropic*, toda a hierarquia de bordas, divisórias, textos secundários e estados de hover deriva de **uma única cor de tinta (`--ds-fg`)** interagindo com a cor do papel (`--ds-bg`).

| Superfície (`data-surface`) | Linhagem | Fundo `--ds-bg` | Superfícies `1 / 2 / 3` | Tinta `--ds-fg` | Contraste | Uso Recomendado no Ecossistema |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`ivory`** *(Padrão)* | Anthropic Research | `#FAF9F5` | `#F5F4ED` / `#E8E6DC` / `#DEDCD1` | `#141413` | **17.6:1 (AAA)** | Home editorial, apps B2C cotidianos (#1, #2, #3, #4, #9), pesquisa |
| **`paper`** | Deimos White | `#FFFFFF` | `#F8F8F6` / `#EDEDEA` / `#E0E0DC` | `#0A0A0A` | **19.8:1 (AAA)** | Dossiês PDF, Raio-X do Endereço (#11), B2B Imobiliário/RI (#33, #40) |
| **`aqua`** | Deimos Blue | `#A4CED0` | `#99C4C6` / `#90B6B7` / `#82A8AA` | `#171614` | **10.4:1 (AAA)** | Earth AI, Clima, Qualidade do Ar, AgroCiclos (#27, #28, #29, #31) |
| **`terracotta`** | Deimos Orange | `#EDBB99` | `#E4B18F` / `#D5A382` / `#C59373` | `#171614` | **10.4:1 (AAA)** | Cultura Pop, Social/Voz, Jornal 3 Min, Solar 3D (#19–#24, #36) |
| **`obsidian`** | Anthropic Hero + Deimos Dark | `#0E0E0D` | `#161614` / `#222220` / `#30302E` | `#FAF9F5` | **18.4:1 (AAA)** | Terminal Gann–Jenkins (#26), Pulse & DNA (#30), uso noturno Pro |

### Derivados Dinâmicos (`color-mix` no CSS / RGBA pré-resolvido em `tokens.ts`)
- `--ds-bg-tint-subtle`: `4.5%` de `--ds-fg` sobre `--ds-bg` (hover suave, molduras de gráficos)
- `--ds-bg-tint-muted`: `8.5%` de `--ds-fg` sobre `--ds-bg` (item ativo no TOC, destaque de citação)
- `--ds-rule`: `11%` de `--ds-fg` transparente (divisórias de seção e listas)
- `--ds-rule-strong`: `22%` de `--ds-fg` transparente (trilho tracejado da *Lifeline*, botões circulares)
- `--ds-border`: `12%` de `--ds-fg` transparente (cards, inputs, tabs)
- `--ds-border-strong`: `26%` de `--ds-fg` transparente (popovers, dossiês 3D, bordas em foco)

### Paleta Orgânica Contida & Sinais Semânticos
Herdada da estratégia *Anthropic* (tons terrosos usados **exclusivamente** em tags de categoria, séries de gráficos SVG e pontos de status — nunca como fundos saturados de página):
- **Olive** `#5E6E47` *(Earth / Agro / Pólen)* · **Sky** `#477085` *(Clima / Atmosfera)* · **Coral** `#B55A42` *(Social / Hype / Térmico)* · **Ochre** `#9A7134` *(Solar / Ciclos)* · **Slate** `#56606E` *(Finanças / Dados)*.
- **Sinais de Verificação:** `support`, `caution`, `refute`, `info` com calibração automática de contraste AAA/AA em `aqua`, `terracotta` e `obsidian`. Também suporta `[data-signals="monochrome"]` (estilo arquivístico puro do Deimos, onde forma geométrica + tinta única distinguem o estado sem depender de cor).

---

## 3. Ruído de Fundo & Materialidade Arquivística (`PaperGrain`)

O charme tátil dos arquivos *Deimos White*, *Blue* e *Orange* vem da camada global de **papel algodão sobreposta via `mix-blend-mode`**, eliminando o aspecto "plástico digital" de fundos chapados:

```css
body::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 2147483640;
  pointer-events: none;
  background-image: var(--ds-paper-texture);
  background-position: var(--ds-paper-offset);
  background-size: var(--ds-paper-size);
  mix-blend-mode: var(--ds-paper-blend); /* multiply (claro/tingido) | screen (obsidian) */
  filter: var(--ds-paper-filter);        /* none (claro/tingido) | invert(1) (obsidian) */
  opacity: var(--ds-paper-opacity);
}
```

### Duas Camadas de Implementação (Zero CDN Externa)
1. **Fallback Puro em CSS (`tokens.css`):** `feTurbulence` SVG inline (`fractalNoise`, `baseFrequency="0.82"`, `numOctaves="4"`, `stitchTiles="stitch"`) já funciona instantaneamente sem JS.
2. **Gerador Procedural Canvas 512×512 (`paper-grain.ts`):** reproduz fielmente o `PaperGrain` do Deimos — gera um tile seamless `512×512` combinando **grão de distribuição triangular** + **manchas sutis de prensa tipográfica** + **110 microfibras curvas de celulose**, aplicado com offset pseudo-aleatório e 4 intensidades (`data-grain="off | subtle | editorial | tactile"`).
3. **Fotografia Arquivística:** imagens dentro de `.ds-plate-frame` aplicam `mix-blend-mode: multiply` sobre papéis claros/tingidos (`ivory`, `paper`, `aqua`, `terracotta`), fazendo fotografias P&B e diagramas se fundirem fisicamente ao papel.

---

## 4. Arquitetura Dual-Mode (`data-mode`)

| Dimensão | `data-mode="invisible"` *(B2C Cotidiano)* | `data-mode="technical"` *(Pro / Ciclos / B2B)* |
| :--- | :--- | :--- |
| **Superfície padrão** | `ivory` *(ou `aqua` / `terracotta` por vertical)* | `obsidian` *(ou `paper` para dossiês/impressão)* |
| **Densidade & padding** | `--ds-density: 1`, cards `24px`, prosa `17px` | `--ds-density: 0.88`, cards `18px`, prosa `15px` |
| **Hierarquia de dados** | Dados físicos Google (Clima/AQI/Pólen/Rua) em 1º plano; conselhos em linguagem natural | 4 Camadas expostas (Astronomia, Casas/Dignidades, Gann/Jenkins, Backtest BigQuery) |
| **Proveniência** | Selo limpo de fonte confiável ("Google Weather · Atualizado 14:10") | Sobrescritos clicáveis `¹²³` + classificação `Tier A / B / C` + graus tabulares |

---

## 5. Tipografia em 3 Vozes & Disciplina Ótica

Hierarquia construída por **contraste extremo de escala e troca de família** (mantendo peso `400` nos títulos serifados como no *Deimos*), nunca por excesso de negritos ou cores chamativas:

| Voz | Família CSS (`tokens.css`) | Papéis | Regras Óticas (Apple / Emil / Deimos) |
| :--- | :--- | :--- | :--- |
| **Display Serif** | `Instrument Serif` / `Geist Serif` / `Newsreader` / `Georgia` | `mega`, `h1`, `h2`, `h3`, `lead`, `metric` | Peso `400`, escala fluida `clamp()`, leading apertado (`0.92–1.15`), **tracking negativo específico por tamanho** (`-0.035em` a `-0.015em`) |
| **Functional Sans** | `Geist` / `Inter` / `system-ui` | `body-lg (17px)`, `body-md (15px)`, `body-sm (13.5px)`, `ui-md (13px)` | Leading respirável (`1.52–1.62`), **largura máxima de prosa `65ch`** (Emil UI Cheatsheet), tracking `0` |
| **Technical Mono** | `Geist Mono` / `JetBrains Mono` / `ui-monospace` | `mono-md (13px)` até `mono-micro (10px)` | **`font-variant-numeric: tabular-nums` obrigatório** para preços, graus planetários, datas, AQI, contadores e citações (zero trepidação ao atualizar) |

---

## 6. Sistema Dual-Radius & Botões

Herdado da gramática *Anthropic* com resposta tátil de *Emil Kowalski*:
- **Pills (`9999px`)** → navegação, tabs segmentadas, seletores de tema/modo, tags de categoria e setas circulares de carrossel.
- **Squircles (`8px`)** → ações utilitárias (`Filtrar`, `Exportar`, `Ver mais`), campos de busca, controles de toolbar e toasts.
- **Plates (`4px`) / Cards (`12px`)** → placas editoriais de imagem (`4px`) e containers estruturais / molduras SVG (`12px`).
- **Progressão tonal:** `Tertiary (#F5F4ED)` → `Secondary (#E8E6DC)` → `Primary Ink (#141413)`.
- **Feedback imediato:** todo elemento clicável aplica `transform: scale(0.97)` no `:active` em `120ms var(--ds-ease-out)` — feedback nasce no *pointer-down*, nunca só no *click*.

---

## 7. Navegação, Motion & Design Engineering (`emilkowalski/skills`)

### 7.1 The Frequency Gate — Quando NÃO Animar
Regra #1 de Emil Kowalski aplicada rigorosamente ao Meridian:

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
| `--ds-ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | Drawers e Bottom Sheets estilo iOS / Vaul |
| `--ds-ease-snappy` | `cubic-bezier(0.85, 0, 0, 1)` | Indicadores rápidos de seleção (Anthropic) |
| `--ds-ease-editorial` | `cubic-bezier(0.22, 1, 0.36, 1)` | Revelação de placas e zoom suave `1.018` em imagens (Deimos) |
| `--ds-ease-volume` | `cubic-bezier(0.22, 0.8, 0.25, 1)` | Abertura 3D de dossiês na estante |

### 7.3 Padrões de Navegação & Micro-Interação Implementados
1. **Topbar Translúcida com Scroll-Edge:** `backdrop-filter: blur(18px) saturate(135%)` sem divisória dura no topo da página; a linha `1px` + barra de progresso de leitura surgem suavemente ao rolar.
2. **Clip-Path Seamless Segmented Tabs:** duas camadas sobrepostas onde a camada ativa (fundo escuro + texto claro) desliza via `clip-path: inset(0 R% 0 L% round 9999px)`, invertendo o contraste letra por letra com precisão de subpixel.
3. **Paleta de Comando `⌘K` Instantânea:** navegação rápida entre seções, superfícies e modos em `0ms` de atraso.
4. **Popovers Origin-Aware:** crescem de `scale(0.96)` a partir do gatilho (`transform-origin` ancorado ao botão — nunca `scale(0)` e nunca do centro, exceto modais centrados).
5. **Tooltips com Skip-Delay (`[data-instant]`):** o 1º tooltip aguarda `320ms` para evitar disparos acidentais; ao deslizar o cursor para botões irmãos na mesma barra, os tooltips seguintes trocam em **`0ms`**!
6. **Blur Crossfade (`filter: blur(2px)`):** ponte sutil durante trocas de texto/estado em botões e badges para fundir os dois estados num único objeto contínuo.
7. **Hold-to-Confirm Assimétrico:** ações sensíveis/destrutivas preenchem `clip-path` em **`linear 1.4s`** enquanto pressionadas (percepção honesta do tempo) e recuam em **`180ms ease-out`** se soltas antes do fim.
8. **Sonner Toast Stack Interruptível:** construído com **CSS transitions** (nunca `@keyframes`, para poder ser interrompido/retomado no meio do trajeto), entrando e saindo pelo mesmo eixo vertical (`translateY(100%)`).
9. **Gestos 1:1 com Projeção de Momentum & Rubber-Band:** fase *Track* sem easing (1:1 com o ponteiro via `setPointerCapture` e escrita direta em `transform`/scroll, sem atualizar CSS variables no pai!); fase *Release* projeta o destino com `projectMomentum(v, 0.998)` e amortece bordas com `rubberband(overshoot, dim, 0.55)`.

### 7.4 Paridade React Native / Expo (`tokens.ts` + `animate-expo`)
- **UI Thread sempre:** usar `react-native-reanimated` (Reanimated 4) + `react-native-gesture-handler`, nunca `PanResponder` e nunca `setState` dentro de `onUpdate`/scroll.
- **Springs com parâmetros Apple:** `settle: { duration: 400, dampingRatio: 1.0, overshootClamping: true }` (sem bounce), `momentum: { duration: 400, dampingRatio: 0.8 }` (bounce apenas após arremesso/gesto).
- **Haptics sincronizados no mesmo frame:** `Haptics.selectionAsync()` (detent/slider), `ImpactFeedbackStyle.Light` (snap de sheet), `ImpactFeedbackStyle.Medium` (commit/hold), sempre acompanhados de feedback visual.
- **Baseline Mobile-Native Web:** `100dvh` em shells/drawers, `100svh` em heroes, `-webkit-tap-highlight-color: transparent`, `touch-action: manipulation` em botões, `touch-action: pan-y` em carrosséis/Lifeline, `font-size: 16px` em inputs sob `(pointer: coarse)` (evita zoom involuntário no iOS Safari sem bloquear acessibilidade), e `env(safe-area-inset-*)` com `viewport-fit=cover`.

---

## 8. Padrões Estruturais & Componentes Editoriais

1. **Grid Assimétrico Editorial (12 colunas — Anthropic):** alterna ritmos assimétricos (`3+8`, `6+3`, `8+3`) sem repetir o mesmo padrão em duas linhas seguidas. Ao passar o ponteiro fino sobre um card, os cards irmãos recuam suavemente para `opacity: 0.54`, criando foco de galeria de revista.
2. **Leitor Enciclopédico em 3 Colunas (Deimos):** `172px` TOC fixo à esquerda (indicador de borda esquerda + fundo tint `8.5%`) | coluna central de prosa `65ch` com **sentenças clicáveis e sobrescritos de citação** `¹²³` | `276px` sidebar *At a Glance* à direita com fatos verificados expansíveis e selos `Tier A / B / C`.
3. **Cronologia Horizontal `Lifeline` (Deimos):** trilho horizontal arrastável 1:1 com eixo tracejado (`1px dashed var(--ds-rule-strong)`), marcadores de ciclo/ano e cartões interativos — funciona tanto para *Cronologia Climática/Urbana* (B2C) quanto para *Janelas de Confluência & Ciclos* (Técnico).
4. **Estante Tátil 3D de Dossiês (Deimos):** lombadas verticais em `preserve-3d` com brilho especular e borda de páginas caneladas (`--ds-pattern-page-ribs`), abrindo em `800ms` para revelar relatórios PDF gerados (*Raio-X Endereço #11*, *Atlas Gann-Jenkins #26*, *Simulador Solar #36*, *Observatório Pulse #30*).

---

## 9. Gramática SVG Blueprint (Plotter) & Globo Ortográfico 81k (`plotter-svg.ts`)

Para elevar todos os desenhos técnicos, ilustrações explicativas, globos e instrumentos geométricos do ecossistema (atendendo à Seção 5 da `00-arquitetura-global.md`), o Meridian adota a gramática vetorial de **[Plotter](https://github.com/pasqualevitiello/plotter)** (*Pasquale Vitiello*) combinada ao estilo de globo pontilhado de **[What 81,000 people want from AI](https://www.anthropic.com/features/81k-interviews)**.

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

Inspirado diretamente nas animações de aquarela e pincéis de **[Scenarios for our Economic Future — Anthropic Institute](https://www.anthropic.com/institute/econ-scenarios)** e nos algoritmos de mídia física do `p5.brush`, o Meridian inclui um **motor criativo completo em 100% TypeScript estrito** — simulando a ergonomia de `p5.js` (`setup`, `draw`, `noise2D`, `fbm2D`, `randomGaussian`, `lerp`, `mapRange`), mas **sem depender de `p5.js` nem de JavaScript não tipado**.

### 10.1 As 5 Primitivas de Mídia Física (`MeridianAtelier`)

| Mídia / Método | Algoritmo Físico em TypeScript | Uso Ideal no Ecossistema |
| :--- | :--- | :--- |
| **Aquarela (`watercolorWash` / `watercolorBand`)** | Subdivisão recursiva de polígonos com deslocamento normal gaussiano (`deformPolygon`), camadas translúcidas em `multiply` (ou `screen` no `obsidian`) + anel de acúmulo capilar na borda úmida (*wet-edge pigment pooling*). | Faixas de cenários econômicos/climáticos, nuvens atmosféricas, manchas editoriais de abertura. |
| **Blocos Preenchidos a Pincel (`brushFillRect`)** | Inspirado nos cubos lado a lado da Anthropic (`econ-scenarios`): pintura incremental sobre canvas persistente com tiras de aquarela + cerdas úmidas horizontais + contorno esboçado a lápis `2H`. | Matrizes de tarefas/sinais, barras de progresso orgânicas, status de confluência e cenários interativos. |
| **Lápis Grafite (`graphitePencil`, `handDrawnRect`, `hatchArea`)** | `4–8` microfibras paralelas (`2H / HB / 4B`) moduladas por `fbm2D` (tremor orgânico manual) e micro-grãos depositados sobre os picos do papel + hachura por recorte Cohen–Sutherland. | Rascunhos arquitetônicos, contornos de gráficos, cadernos Gann–Jenkins, diagramas de endereço. |
| **Giz de Cera / Pastel Seco (`waxCrayon`)** | Stippling anisotrópico de elipses cerosas filtradas pela máscara do dente do papel (`noise2D(x*0.36, y*0.36) > tooth`), deixando falhas orgânicas de papel algodão. | Colagens editoriais quentes (Terracotta / Ivory), destaques em Cultura Pop, Solar 3D e cards compartilháveis. |
| **Pincel Tinta Sumi-e (`inkBrush`)** | Cerdas divididas com largura modulada por curva de pressão senoidal e efeito *dry-brush* (`kasure`) progressivo nas pontas. | Traços caligráficos de ênfase, espirais *Square of Nine*, assinaturas visuais de capítulo. |

### 10.2 Portabilidade Web + React Native & Performance 120fps
- **Interface `AtelierDrawingBackend` agnóstica:** na Web usa `createCanvasBackend(canvas, dpr)` (Canvas 2D nativo); em React Native / Expo conecta o mesmo motor ao `@shopify/react-native-skia` implementando apenas 6 primitivas (`clear`, `setCompositeMode`, `fillPolygon`, `strokePolyline`, `fillDot`, `fillEllipse`).
- **Pintura Incremental (< 1ms/frame):** diferentemente de loops que apagam e redesenham toda a cena a cada frame, os sketches pintam **incrementalmente sobre papel persistente** — mantendo custo médio abaixo de `0.7ms/frame` (folga total para 120Hz ProMotion!).
- **Disciplina Emil Kowalski + Acessibilidade:** `runMeridianSketch()` pausa automaticamente fora da viewport (`IntersectionObserver`) e, sob `prefers-reduced-motion: reduce`, sintetiza instantaneamente a ilustração final estática sem rodar `requestAnimationFrame`.

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
| Fundo liso sem alma nos temas claros/tingidos | Manter `PaperGrain` ativo (`data-grain="editorial"` padrão) |
| Importar `p5.js` (bundle > 800KB JS) para efeitos editoriais | Usar `atelier-engine.ts` (zero dependências, 100% TypeScript estrito, < 1ms/frame) |
| Gráfico Gann/Mandala esticado (`preserveAspectRatio="none"`) | `viewBox="0 0 400 400"` + `aspect-ratio: 1 / 1` travado |

### Integração no Monorepo (`packages/design-system`)
```text
packages/design-system/
├── DESIGN_SYSTEM.md   # Esta especificação oficial (também em 08-design-system.md no Drive)
├── tokens.css         # Primitivos, 5 atmosferas Single-Ink, PaperGrain, Motion & Mobile-Native
├── tokens.ts          # 100% TypeScript estrito p/ React Native, Web, Reanimated 4 e SVG 1:1
├── components.css     # Biblioteca CSS pura de componentes editoriais e interativos
├── paper-grain.ts     # Gerador procedural Canvas 512×512 de papel algodão arquivístico
├── plotter-svg.ts     # Gramática SVG Plotter (13 papéis) + Globo Ortográfico 81k editável
├── atelier-engine.ts  # Motor generativo 100% TS estilo p5.js (Aquarela, Lápis, Giz, Pincel)
├── meridian-globe-81k.svg # Exportação SVG autônoma do globo (padrão Plotter editável)
└── showcase.html      # Vitrine interativa autônoma (funciona 100% offline)
```
