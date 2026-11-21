# -*- coding: utf-8 -*-
from pathlib import Path

p = Path(__file__).with_name("index.html")
text = p.read_text(encoding="utf-8")

# --- Historia stack ---
start = text.find('    <!-- ================= 00. HISTÓRIA ================= -->')
end = text.find('    <!-- ================= 01. SUPERFÍCIES')
assert start != -1 and end != -1, (start, end)

historia = '''    <!-- ================= 00. HISTÓRIA ================= -->
    <section class="section-block" id="historia">
      <div class="container-wide">
        <div class="historia-stack">
          <div>
            <div class="eyebrow">00 · Origem &amp; Propósito</div>
            <h2 class="serif" style="font-size:clamp(28px, 4vw, 42px); letter-spacing:-0.025em; margin:8px 0 18px; max-width:18ch;">Por que Meridian existe</h2>
            <p class="hero-lead" style="margin:0; max-width:38rem;">
              O ecossistema Lunar + Earth AI + Gemini Studio atende dois públicos opostos no mesmo motor TypeScript. Meridian é a linha que os une sem forçar um a falar a língua do outro.
            </p>
          </div>
          <div class="historia-dual">
            <article style="padding:18px 18px 16px; border:1px solid var(--ds-border); border-radius:var(--ds-radius-card); background:var(--ds-surface-1);">
              <div class="eyebrow" style="margin-bottom:8px;">Modo Invisível · B2C</div>
              <h3 class="serif" style="font-size:22px; margin:0 0 8px; letter-spacing:-0.02em;">Calma editorial</h3>
              <p style="margin:0; font-size:14px; line-height:1.55; color:var(--ds-fg-secondary);">
                Clima, ar, família, bairro e voz — sem jargão técnico, sem neon, sem cards hiper-aninhados. A interface some; a decisão fica.
              </p>
            </article>
            <article style="padding:18px 18px 16px; border:1px solid var(--ds-border); border-radius:var(--ds-radius-card); background:var(--ds-surface-1);">
              <div class="eyebrow" style="margin-bottom:8px;">Modo Técnico · Pro / B2B</div>
              <h3 class="serif" style="font-size:22px; margin:0 0 8px; letter-spacing:-0.02em;">Rigor auditável</h3>
              <p style="margin:0; font-size:14px; line-height:1.55; color:var(--ds-fg-secondary);">
                Terminais Gann–Jenkins, efemérides, dossiês territoriais e backtests — fonte rastreável, geometria 1:1 e contraste AAA.
              </p>
            </article>
          </div>
          <div class="pull-quote" style="margin:0;">
            <blockquote>
              “Quando um sistema mostra exatamente de onde veio cada dado, a confiança nasce da arquitetura — não do marketing.”
            </blockquote>
            <div class="mono" style="font-size:11px; color:var(--ds-fg-muted);">Princípio Editorial Meridian · Swiss Archival + Modern Research</div>
          </div>
          <div class="historia-pillars">
            <div class="eyebrow">Três pilares da linhagem</div>
            <ol style="margin:0; padding:0; list-style:none; display:flex; flex-direction:column; gap:10px;">
              <li style="display:grid; grid-template-columns:36px 1fr; gap:12px; padding:12px 14px; border:1px solid var(--ds-rule); border-radius:var(--ds-radius-squircle);">
                <span class="mono tabular" style="font-size:12px; color:var(--ds-fg-muted); padding-top:2px;">01</span>
                <div>
                  <div style="font-weight:500; font-size:14px; margin-bottom:2px;">Anthropic Research</div>
                  <div style="font-size:13px; color:var(--ds-fg-muted); line-height:1.45;">Ivory quente, dual-radius, masonry assimétrico e paleta orgânica contida.</div>
                </div>
              </li>
              <li style="display:grid; grid-template-columns:36px 1fr; gap:12px; padding:12px 14px; border:1px solid var(--ds-rule); border-radius:var(--ds-radius-squircle);">
                <span class="mono tabular" style="font-size:12px; color:var(--ds-fg-muted); padding-top:2px;">02</span>
                <div>
                  <div style="font-weight:500; font-size:14px; margin-bottom:2px;">Deimos Archival</div>
                  <div style="font-size:13px; color:var(--ds-fg-muted); line-height:1.45;">Single-Ink, paper shader de página inteira, leitor empilhado e dossiês 3D.</div>
                </div>
              </li>
              <li style="display:grid; grid-template-columns:36px 1fr; gap:12px; padding:12px 14px; border:1px solid var(--ds-rule); border-radius:var(--ds-radius-squircle);">
                <span class="mono tabular" style="font-size:12px; color:var(--ds-fg-muted); padding-top:2px;">03</span>
                <div>
                  <div style="font-weight:500; font-size:14px; margin-bottom:2px;">Emil Kowalski</div>
                  <div style="font-size:13px; color:var(--ds-fg-muted); line-height:1.45;">Frequency Gate (⌘K em 0ms), clip-path tabs, Vaul drawer e física 1:1.</div>
                </div>
              </li>
            </ol>
            <p style="margin:4px 0 0; font-size:13px; line-height:1.5; color:var(--ds-fg-muted);">
              Materialidade impressa — não plástico digital. Uma tinta deriva bordas, hovers e hierarquia. O papel cobre a viewport como shader contínuo; o ruído do atelier no canvas permanece independente.
            </p>
          </div>
        </div>
      </div>
    </section>

'''

text = text[:start] + historia + text[end:]

# --- Reader view: wrap article + aside in reader-main-col ---
old_reader = '''          <div class="reader-grid">
            <aside class="reader-toc" aria-label="Sumário do dossiê">
              <div class="eyebrow" style="padding:0 10px 8px;">Conteúdo</div>
              <button class="toc-item" aria-current="true" data-toc-jump="rd-overview">Visão geral</button>
              <button class="toc-item" aria-current="false" data-toc-jump="rd-method">Verificação &amp; Fontes</button>
              <button class="toc-item" aria-current="false" data-toc-jump="rd-sources">Referências (Tier A–C)</button>
            </aside>

            <article class="reader-article">'''

new_reader = '''          <div class="reader-grid">
            <aside class="reader-toc" aria-label="Sumário do dossiê">
              <div class="eyebrow" style="padding:0 10px 8px;">Conteúdo</div>
              <button class="toc-item" aria-current="true" data-toc-jump="rd-overview">Visão geral</button>
              <button class="toc-item" aria-current="false" data-toc-jump="rd-method">Verificação &amp; Fontes</button>
              <button class="toc-item" aria-current="false" data-toc-jump="rd-sources">Referências (Tier A–C)</button>
            </aside>

            <div class="reader-main-col">
            <article class="reader-article">'''

assert old_reader in text, "reader start not found"
text = text.replace(old_reader, new_reader, 1)

# Close reader-main-col after aside-glance
old_close = '''            </aside>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= 05. LIFELINE'''

new_close = '''            </aside>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= 05. LIFELINE'''

assert old_close in text, "reader close not found"
text = text.replace(old_close, new_close, 1)

# --- Body veil + page enter ---
if '<div class="ds-page-veil"' not in text:
    text = text.replace("<body>\n", '<body>\n  <div class="ds-page-veil" aria-hidden="false"></div>\n', 1)

if 'class="ds-page-enter"' not in text and 'id="topo"' in text:
    text = text.replace('<main id="topo">', '<main id="topo" class="ds-page-enter">', 1)

# --- SURFACE_META + ORDER ---
old_meta = """      const SURFACE_META = {
        ivory:      { name: 'Ivory Editorial',  bg: '#FAF9F5', s1: '#F5F4ED', s2: '#E8E6DC', s3: '#DEDCD1', fg: '#141413', muted: '#5E5D59', contrast: '17.6:1 (AAA)', blend: 'multiply' },
        paper:      { name: 'Paper White',      bg: '#FFFFFF', s1: '#F8F8F6', s2: '#EDEDEA', s3: '#E0E0DC', fg: '#0A0A0A', muted: '#595959', contrast: '19.8:1 (AAA)', blend: 'multiply' },
        aqua:       { name: 'Signature Aqua',   bg: '#A4CED0', s1: '#99C4C6', s2: '#90B6B7', s3: '#82A8AA', fg: '#171614', muted: '#3A4949', contrast: '10.4:1 (AAA)', blend: 'multiply' },
        terracotta: { name: 'Warm Terracotta',  bg: '#EDBB99', s1: '#E4B18F', s2: '#D5A382', s3: '#C59373', fg: '#171614', muted: '#513F33', contrast: '10.4:1 (AAA)', blend: 'multiply' },
        obsidian:   { name: 'Obsidian Dark',    bg: '#0E0E0D', s1: '#161614', s2: '#222220', s3: '#30302E', fg: '#FAF9F5', muted: '#A4A39B', contrast: '18.4:1 (AAA)', blend: 'screen + invert(1)' },
      };

      const SURFACE_ORDER = ['ivory', 'paper', 'aqua', 'terracotta', 'obsidian'];"""

new_meta = """      const SURFACE_META = {
        ivory:      { name: 'Ivory Editorial',  bg: '#FAF9F5', s1: '#F5F4ED', s2: '#E8E6DC', s3: '#DEDCD1', fg: '#141413', muted: '#5E5D59', contrast: '17.6:1 (AAA)', blend: 'multiply' },
        blush:      { name: 'Soft Blush',       bg: '#E8C4C0', s1: '#E0B9B5', s2: '#D2AAA6', s3: '#C29A96', fg: '#1A1414', muted: '#5A4544', contrast: '9.8:1 (AAA)', blend: 'multiply' },
        butter:     { name: 'Soft Butter',      bg: '#E8D9A8', s1: '#E0D09C', s2: '#D2C28C', s3: '#C2B27C', fg: '#1A1810', muted: '#5A5238', contrast: '10.1:1 (AAA)', blend: 'multiply' },
        mist:       { name: 'Soft Mist',        bg: '#C5D4CE', s1: '#B9C9C2', s2: '#A8B9B2', s3: '#96A8A0', fg: '#141816', muted: '#3E4E48', contrast: '9.6:1 (AAA)', blend: 'multiply' },
        aqua:       { name: 'Signature Aqua',   bg: '#A4CED0', s1: '#99C4C6', s2: '#90B6B7', s3: '#82A8AA', fg: '#171614', muted: '#3A4949', contrast: '10.4:1 (AAA)', blend: 'multiply' },
        lilac:      { name: 'Soft Lilac',       bg: '#C9C0D8', s1: '#BDB4CE', s2: '#ADA2C0', s3: '#9C90B0', fg: '#16141A', muted: '#4A4458', contrast: '9.7:1 (AAA)', blend: 'multiply' },
        terracotta: { name: 'Warm Terracotta',  bg: '#EDBB99', s1: '#E4B18F', s2: '#D5A382', s3: '#C59373', fg: '#171614', muted: '#513F33', contrast: '10.4:1 (AAA)', blend: 'multiply' },
        obsidian:   { name: 'Obsidian Dark',    bg: '#0E0E0D', s1: '#161614', s2: '#222220', s3: '#30302E', fg: '#FAF9F5', muted: '#A4A39B', contrast: '18.4:1 (AAA)', blend: 'screen + invert(1)' },
        paper:      { name: 'Paper White',      bg: '#FFFFFF', s1: '#F8F8F6', s2: '#EDEDEA', s3: '#E0E0DC', fg: '#0A0A0A', muted: '#595959', contrast: '19.8:1 (AAA)', blend: 'multiply' },
      };

      const SURFACE_ORDER = ['ivory', 'blush', 'butter', 'mist', 'aqua', 'lilac', 'terracotta', 'obsidian'];"""

assert old_meta in text, "SURFACE_META not found"
text = text.replace(old_meta, new_meta, 1)

# --- markPageReady after mountPaperGrain ---
if "dataset.pageReady" not in text:
    text = text.replace(
        "      mountPaperGrain();\n",
        """      mountPaperGrain();

      /* Page enter reveal */
      (function markPageReady() {
        const go = () => {
          window.setTimeout(() => {
            document.documentElement.dataset.pageReady = 'true';
            const veil = document.querySelector('.ds-page-veil');
            if (veil) {
              const done = () => veil.setAttribute('aria-hidden', 'true');
              veil.addEventListener('transitionend', done, { once: true });
              window.setTimeout(done, 800);
            }
          }, 40);
        };
        const kick = () => requestAnimationFrame(() => requestAnimationFrame(go));
        if (document.readyState === 'complete') kick();
        else window.addEventListener('load', kick, { once: true });
      })();

""",
        1,
    )

# Fix keyboard surface shortcuts for 8 surfaces
text = text.replace(
    "else if (['1','2','3','4','5'].includes(e.key)) { applySurface(SURFACE_ORDER[Number(e.key) - 1]); }",
    "else if (/^[1-8]$/.test(e.key)) { applySurface(SURFACE_ORDER[Number(e.key) - 1]); }",
)

p.write_text(text, encoding="utf-8")
print("patched ok")
